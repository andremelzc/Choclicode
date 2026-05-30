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
    ui_data: Optional[Dict[str, Any]] = Field(description="Genera el JSON de datos si la UI no es 'text'. Por ejemplo, para matchmaking_cards, devuelve una lista en la llave 'cards_data' con objetos que incluyan 'id', 'name', 'coordinator', 'lines', 'technical_areas', 'description'. Para convocatoria_cards, la llave 'contest_data'. Para stepper_cards, la llave 'stepper_data' (con 'procedure_name', 'estimated_time', 'cost', 'requirements', 'steps'). Para citation_cards, la llave 'citation_data' (con 'document_name', 'article_number', 'exact_quote', 'explanation').")

    @field_validator('ui_data', mode='before')
    @classmethod
    def parse_ui_data(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
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

        Returns:
            dict con claves: answer, intent, confidence, sources
        """
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

        messages = [
            SystemMessage(content=CACIF_SYSTEM_PROMPT),
            HumanMessage(
                content=(
                    f"Contexto recuperado de la base de conocimientos:\n{context}\n\n"
                    f"Pregunta del estudiante: {query}\n\n"
                    "Por favor, analiza la pregunta y el contexto, clasifica el caso de uso y provee tu respuesta llenando la estructura requerida. "
                    "Si determinas que es CU01, genera datos estructurados en 'ui_data' -> 'cards_data'. "
                    "Si es CU02, genera datos en 'ui_data' -> 'contest_data'. "
                    "Si es CU03, genera datos en 'ui_data' -> 'stepper_data'. "
                    "Si es CU04, genera datos en 'ui_data' -> 'citation_data'. "
                    "Asegúrate de no inventar datos que no estén en el contexto, pero simula IDs o nombres si es estrictamente necesario para armar la tarjeta visual. "
                )
            ),
        ]

        structured_response: StructuredAssistantResponse = await self.llm.ainvoke(messages)

        return {
            "answer": structured_response.answer,
            "intent": structured_response.intent_type,
            "ui_type": structured_response.ui_type,
            "ui_data": structured_response.ui_data,
            "confidence": confidence,
            "sources": sources,
        }


# ── Singleton ────────────────────────────────────────────────────────

_instance: Optional[BedrockRAGService] = None


def get_bedrock_rag_service(settings: Settings) -> BedrockRAGService:
    global _instance
    if _instance is None:
        _instance = BedrockRAGService(settings)
    return _instance
