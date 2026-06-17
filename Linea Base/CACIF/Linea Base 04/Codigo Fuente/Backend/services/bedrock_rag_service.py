"""Pipeline RAG usando AWS Bedrock Knowledge Bases + LangChain.

Retriever : AmazonKnowledgeBasesRetriever  (langchain-aws)
LLM       : ChatBedrockConverse            (Claude via Bedrock)
"""

from __future__ import annotations

from typing import Optional

import boto3
from langchain_aws import AmazonKnowledgeBasesRetriever
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from pydantic import BaseModel, Field, field_validator
import json
from typing import Optional, Dict, Any, List

from app.config import Settings
from prompts.prompts import CACIF_SYSTEM_PROMPT
from services.cache_service import get_cache_service


_INTENT_KEYWORDS: dict[str, list[str]] = {
    "CU01": ["grupo", "investigaci", "matchmaking", "laboratorio", "línea"],
    "CU02": ["convocatoria", "concurso", "vacante", "postular", "premio", "beca"],
    "CU03": ["tesis", "convalidar", "ppp", "título", "titulaci", "graduaci", "bachiller"],
    "CU04": ["normativa", "plagio", "resoluci", "reglamento", "artículo", "directiva", "oficial"],
}

class StructuredAssistantResponse(BaseModel):
    answer: str = Field(description="La respuesta textual principal en formato académico, basándose en el contexto.")
    intent_type: str = Field(description="Clasifica el caso de uso en: CU01 (Grupos), CU02 (Convocatorias), CU03 (Trámites), CU04 (Normativa), o CU00 (Consulta General).")
    ui_type: str = Field(description="Determina la UI. Valores posibles: 'text', 'matchmaking_cards' (si intent_type es CU01), 'convocatoria_cards' (si intent_type es CU02), 'stepper_cards' (si intent_type es CU03), 'citation_cards' (si intent_type es CU04).")
    ui_data: Optional[Dict[str, Any]] = Field(description="Genera el JSON de datos si la UI no es 'text'. Para matchmaking_cards, la llave 'cards_data' con objetos que incluyan 'id', 'name', 'coordinator', 'lines', 'technical_areas', 'description'. Para convocatoria_cards, la llave 'contest_data' debe contener una lista de objetos con: 'id', 'status_badge', 'status_label', 'title', 'contest_type', 'requirements' (lista de strings), 'prize', 'required_documents', 'apply_url', y 'timeline_events' (lista de objetos con 'title', 'date', 'status'). Para stepper_cards (CU03), la llave 'stepper_data' como una lista de objetos que contengan obligatoriamente 'id', 'procedure_name', 'estimated_time', 'cost', 'requirements' (lista de strings), y 'steps' (lista de objetos con 'step_number', 'title', 'description' y 'action_url'). Para citation_cards (CU04), la llave 'citation_data' como una lista de objetos que contengan obligatoriamente 'id', 'document_name', 'article_number', 'exact_quote', 'explanation', 'page' y 'link'.")

    @field_validator('ui_data', mode='before')
    @classmethod
    def parse_ui_data(cls, v):
        if isinstance(v, str):
            try:
                # Limpiar bloques de markdown si el LLM los generó (ej. ```json ... ```)
                clean_v = v.strip()
                if clean_v.startswith("```json"):
                    clean_v = clean_v[7:]
                elif clean_v.startswith("```"):
                    clean_v = clean_v[3:]
                if clean_v.endswith("```"):
                    clean_v = clean_v[:-3]
                return json.loads(clean_v.strip())
            except Exception:
                return {}
        return v



def _detect_intent(query: str) -> str:
    lower = query.lower()
    for intent, keywords in _INTENT_KEYWORDS.items():
        if any(kw in lower for kw in keywords):
            return intent
    return "CU00"


def _extract_source_name(metadata: dict) -> str:
    """Extrae el nombre del documento desde el metadata de Bedrock."""
    # Bedrock retorna la ubicación S3 o el URI de la fuente
    loc = metadata.get("location", {})
    s3 = loc.get("s3Location", {})
    uri: str = s3.get("uri", "")
    if uri:
        return uri.split("/")[-1]  # nombre del archivo
    # Fallback a otros campos
    src = metadata.get("source_metadata", {}).get("source", "")
    return src or "Documento"


class BedrockRAGService:
    """Orquesta recuperación desde Bedrock KB y síntesis con Claude vía Bedrock."""

    def __init__(self, settings: Settings) -> None:
        session = boto3.Session(
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
        )

        self.retriever = AmazonKnowledgeBasesRetriever(
            knowledge_base_id=settings.AWS_BEDROCK_KB_ID,
            retrieval_config={
                "vectorSearchConfiguration": {
                    "numberOfResults": settings.RAG_TOP_K,
                }
            },
            client=session.client("bedrock-agent-runtime"),
        )

        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            api_key=settings.GEMINI_API_KEY,
            temperature=0.0
        ).with_structured_output(StructuredAssistantResponse)

    async def run(self, query: str) -> dict:
        """Ejecuta el pipeline RAG completo: recuperar → sintetizar.

        Antes de ejecutar el pipeline, consulta el cache de Redis.
        Si hay un cache hit, retorna la respuesta cacheada directamente
        sin llamar a Bedrock ni a Gemini.

        Returns:
            dict con claves: answer, intent, confidence, sources, from_cache
        """
        # ── Cache lookup ────────────────────────────────────────────
        cache = get_cache_service()
        if cache is not None:
            cached = cache.get(query)
            if cached is not None:
                cached["from_cache"] = True
                return cached

        # ── Pipeline RAG (solo si no hay cache hit) ─────────────────
        docs = await self.retriever.ainvoke(query)

        if docs:
            context = "\n\n".join(
                f"[{i}] {doc.page_content}" for i, doc in enumerate(docs, 1)
            )
            scores = [
                float(doc.metadata.get("score", doc.metadata.get("_score", 0.0)))
                for doc in docs
            ]
            confidence = sum(scores) / len(scores)
            sources = [
                {
                    "document_name": _extract_source_name(doc.metadata),
                    "score": scores[idx],
                }
                for idx, doc in enumerate(docs)
            ]
        else:
            context = "(No se encontró información relevante en la base de conocimientos)"
            confidence = 0.0
            sources = []

        import datetime
        current_date = datetime.datetime.now().strftime("%Y-%m-%d")

        messages = [
            SystemMessage(
                content=CACIF_SYSTEM_PROMPT + f"\nLa fecha actual del sistema es: {current_date}. Usa esta fecha como referencia absoluta para determinar si las convocatorias del contexto están activas o vencidas."
            ),
            HumanMessage(
                content=(
                    f"Contexto recuperado de la base de conocimientos:\n{context}\n\n"
                    f"Pregunta del estudiante: {query}\n\n"
                    "Por favor, analiza la pregunta y el contexto, clasifica el caso de uso y provee tu respuesta llenando la estructura requerida.\n"
                    "Recuerda:\n"
                    "1. Si la pregunta contiene términos como 'postular', 'inscribirme', 'vacantes', o 'postulación' hacia un grupo específico (ej. GI-01 o nombre del grupo), clasifica el caso obligatoriamente como CU02 (Convocatorias) y NO como CU01.\n"
                    "2. Usa la fecha actual del sistema para evaluar si los cronogramas en el contexto están vigentes o ya cerrados. Si están cerrados, indica explícitamente que la convocatoria venció y no se puede realizar la postulación.\n\n"
                    "Determina cuándo usar una interfaz estructurada o solo texto:\n"
                    "- Si el caso es CU01 y el estudiante busca activamente que le recomiendes/listes grupos de investigación de acuerdo a su perfil, usa ui_type = 'matchmaking_cards' y genera 'ui_data' -> 'cards_data'.\n"
                    "- Si el caso es CU02 y el estudiante pregunta por el cronograma, requisitos o detalles específicos de una o más convocatorias/concursos, usa ui_type = 'convocatoria_cards' y genera 'ui_data' -> 'contest_data'.\n"
                    "- Si el caso es CU03 y el estudiante consulta por los pasos o requisitos de un trámite administrativo específico, usa ui_type = 'stepper_cards' y genera 'ui_data' -> 'stepper_data'.\n"
                    "- Si el caso es CU04 y el estudiante solicita la cita exacta o validez de un artículo, norma o resolución específica, usa ui_type = 'citation_cards' y genera 'ui_data' -> 'citation_data'.\n"
                    "- Para explicaciones conceptuales, preguntas generales, correos de contacto, aclaraciones o si no hay datos específicos en el contexto para llenar las tarjetas, utiliza siempre ui_type = 'text'.\n"
                    "Asegúrate de no inventar datos que no estén en el contexto, pero simula IDs o nombres si es estrictamente necesario para armar la tarjeta visual."
                )
            ),
        ]

        structured_response: StructuredAssistantResponse = await self.llm.ainvoke(messages)

        result = {
            "answer": structured_response.answer,
            "intent": structured_response.intent_type,
            "ui_type": structured_response.ui_type,
            "ui_data": structured_response.ui_data,
            "confidence": confidence,
            "sources": sources,
        }

        # ── Cache store ─────────────────────────────────────────────
        if cache is not None:
            cache.set(query, result)

        result["from_cache"] = False
        return result


# ── Singleton ────────────────────────────────────────────────────────

_instance: Optional[BedrockRAGService] = None


def get_bedrock_rag_service(settings: Settings) -> BedrockRAGService:
    global _instance
    if _instance is None:
        _instance = BedrockRAGService(settings)
    return _instance
