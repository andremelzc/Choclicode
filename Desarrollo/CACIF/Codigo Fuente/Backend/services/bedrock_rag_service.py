"""Pipeline RAG usando AWS Bedrock Knowledge Bases + LangChain.

Retriever : AmazonKnowledgeBasesRetriever  (langchain-aws)
LLM       : ChatBedrockConverse            (Claude via Bedrock)
"""

from __future__ import annotations

from typing import Optional

import boto3
from langchain_aws import AmazonKnowledgeBasesRetriever, ChatBedrockConverse
from langchain_core.messages import HumanMessage, SystemMessage

from app.config import Settings
from prompts.prompts import CACIF_SYSTEM_PROMPT


_INTENT_KEYWORDS: dict[str, list[str]] = {
    "CU01": ["grupo", "investigaci", "matchmaking", "laboratorio", "línea"],
    "CU02": ["convocatoria", "concurso", "vacante", "postular", "premio", "beca"],
    "CU03": ["tesis", "convalidar", "ppp", "título", "titulaci", "graduaci", "bachiller"],
    "CU04": ["normativa", "plagio", "resoluci", "reglamento", "artículo", "directiva", "oficial"],
}


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

        self.llm = ChatBedrockConverse(
            model=settings.BEDROCK_LLM_MODEL,
            client=session.client("bedrock-runtime"),
        )

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
                    "Responde en español académico formal basándote exclusivamente en el contexto."
                )
            ),
        ]

        response = await self.llm.ainvoke(messages)
        answer: str = response.content if hasattr(response, "content") else str(response)

        return {
            "answer": answer,
            "intent": _detect_intent(query),
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
