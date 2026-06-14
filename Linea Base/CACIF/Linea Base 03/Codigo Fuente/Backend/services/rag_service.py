"""Servicio RAG-QA: orquesta el pipeline RAG con Google Gemini.

Implementa el flujo completo:
1. Registrar peticion (Tracer)
2. Generar embedding de la query (Embedder)
3. Buscar FAQs similares (VectorDB / Azure AI Search)
4. Construir prompt RAG (PromptManager)
5. Invocar LLM para sintetizar respuesta (Gemini)
6. Registrar respuesta (Tracer)
"""

import time
from typing import Any, Dict, List, Optional
from dataclasses import dataclass

from embeddings.embedder import Embedder
from vectorstore.vector_db import VectorDB
from prompts.prompts import PromptManager
from log.tracer import Tracer

# Import del cliente LLM
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None


@dataclass
class RAGConfig:
    """Configuracion del pipeline RAG."""

    llm_model: str = "gemini-1.5-flash"
    top_k: int = 5
    similarity_threshold: float = 0.75


class RAGService:
    """Orquesta el pipeline RAG-QA para el chatbot CACIF.

    Conecta todos los componentes del motor de busqueda y generacion:
    embedder, vector DB, prompt manager, LLM y tracer.
    """

    def __init__(
        self,
        embedder: Embedder,
        vector_db: VectorDB,
        prompt_manager: PromptManager,
        llm: Any,
        tracer: Optional[Tracer] = None,
        config: Optional[RAGConfig] = None,
    ) -> None:
        """Inyecta las dependencias del pipeline.

        Args:
            embedder: Componente que genera embeddings con Gemini.
            vector_db: Componente para busqueda semantica (Azure AI Search).
            prompt_manager: Generador de prompts RAG.
            llm: Cliente LLM (ChatGoogleGenerativeAI de LangChain).
            tracer: Componente para trazabilidad/logs NDJSON.
            config: Parametros de configuracion del pipeline.
        """
        self.embedder = embedder
        self.vector_db = vector_db
        self.prompt_manager = prompt_manager
        self.llm = llm
        self.tracer = tracer or Tracer()
        self.config = config or RAGConfig()

    @classmethod
    def from_components(
        cls,
        embedder: Embedder,
        vector_db: VectorDB,
        prompt_manager: PromptManager,
        llm: Any,
        tracer: Optional[Tracer] = None,
    ) -> "RAGService":
        """Factory que ensambla los componentes del pipeline."""
        return cls(embedder, vector_db, prompt_manager, llm, tracer)

    def run_rag(
        self,
        query: str,
        top_k: Optional[int] = None,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Orquesta el flujo RAG completo y devuelve el resultado.

        Args:
            query: Pregunta del usuario.
            top_k: Numero de FAQs a recuperar (override del config).
            user_id: ID del usuario para trazabilidad.

        Returns:
            Dict con 'answer', 'sources', 'metadata' (rag_confidence, intent, etc).
        """
        start_time = time.time()
        k = top_k or self.config.top_k

        # 1. Registrar peticion
        self.tracer.log_request(user_id, query)

        try:
            # 2. Generar embedding de la query
            embedding = self.embedder.embed(query)

            # 3. Buscar FAQs similares en la base vectorial
            docs = self.vector_db.search_by_embedding(embedding, top_k=k)

            # Filtrar por umbral de similitud
            filtered_docs = [
                d for d in docs
                if d.get("similarity_score", 0) >= self.config.similarity_threshold
            ]

            # Log de busqueda
            best_score = max(
                (d.get("similarity_score", 0) for d in docs), default=0
            )
            self.tracer.log_rag_search(k, len(filtered_docs), best_score)

            # 4. Construir prompt RAG con las FAQs como contexto
            prompt = self.prompt_manager.build_rag_prompt(query, filtered_docs)

            # 5. Invocar LLM para sintetizar la respuesta
            if self.llm is not None:
                response = self.llm.invoke(prompt)
                answer = response.content if hasattr(response, "content") else str(response)
            else:
                answer = (
                    "El servicio de IA no está disponible en este momento. "
                    "Por favor, contacta a investigacion.fisi@unmsm.edu.pe"
                )

            # Detectar intent basado en las FAQs recuperadas
            intent = self._detect_intent(filtered_docs, query)

            latencia_ms = int((time.time() - start_time) * 1000)

            # 6. Registrar respuesta
            self.tracer.log_response(user_id, query, answer, {
                "latencia_ms": latencia_ms,
                "intent": intent,
                "rag_confidence": best_score,
                "num_sources": len(filtered_docs),
            })

            return {
                "answer": answer,
                "sources": [
                    {
                        "document_name": d.get("fuente_documento", "Documento"),
                        "start_page": d.get("pagina_inicio"),
                        "end_page": d.get("pagina_fin"),
                        "similarity_score": d.get("similarity_score", 0),
                    }
                    for d in filtered_docs
                ],
                "metadata": {
                    "rag_confidence": best_score,
                    "intent": intent,
                    "latencia_ms": latencia_ms,
                    "num_faqs_retrieved": len(filtered_docs),
                },
            }

        except Exception as exc:
            self.tracer.log_error(exc, {"endpoint": "/chat/message", "user_id": user_id})
            raise

    def _detect_intent(self, docs: List[Dict[str, Any]], query: str) -> str:
        """Detecta el caso de uso (intent) a partir de las FAQs recuperadas.

        Prioriza el caso_uso mas frecuente en los documentos recuperados.
        Si no hay docs, hace deteccion basica por keywords.
        """
        if docs:
            # Contar frecuencia de caso_uso en los docs recuperados
            intent_counts: Dict[str, int] = {}
            for d in docs:
                cu = d.get("caso_uso", "CU00")
                intent_counts[cu] = intent_counts.get(cu, 0) + 1
            return max(intent_counts, key=intent_counts.get)  # type: ignore

        # Fallback: deteccion por keywords
        lower = query.lower()
        if any(kw in lower for kw in ["grupo", "investigación", "matchmaking"]):
            return "CU01"
        if any(kw in lower for kw in ["convocatoria", "concurso", "vacante"]):
            return "CU02"
        if any(kw in lower for kw in ["tesis", "convalidar", "ppp", "título"]):
            return "CU03"
        if any(kw in lower for kw in ["normativa", "plagio", "resolución", "oficial"]):
            return "CU04"
        return "CU00"
