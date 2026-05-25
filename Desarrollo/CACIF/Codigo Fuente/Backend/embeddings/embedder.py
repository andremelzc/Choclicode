"""Modulo de generacion de embeddings con Google Gemini.

Utiliza la API de Google Generative AI para generar embeddings
vectoriales de texto (1536 dimensiones).
"""

from typing import List

import google.generativeai as genai

from app.config import get_settings

settings = get_settings()


class Embedder:
    """Generador de embeddings usando Google Gemini.

    Inicializa la conexion con la API de Gemini y expone metodos
    para generar embeddings individuales y por lotes.
    """

    def __init__(self, model_name: str = "") -> None:
        """Inicializa el embedder configurando la API key de Gemini.

        Args:
            model_name: Modelo de embeddings a usar. Si no se provee,
                        usa el configurado en settings.
        """
        self.model_name = model_name or settings.GEMINI_EMBEDDING_MODEL

        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)

    def embed(self, text: str) -> List[float]:
        """Genera un embedding para un texto dado.

        Args:
            text: Texto de entrada.

        Returns:
            Vector de embedding (lista de floats, 1536 dims).

        Raises:
            RuntimeError: Si la API key no esta configurada.
        """
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY no configurada. "
                "Agrega la variable al archivo .env"
            )

        result = genai.embed_content(
            model=self.model_name,
            content=text,
            task_type="retrieval_query",
        )
        return result["embedding"]

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Genera embeddings para una lista de textos.

        Args:
            texts: Lista de textos.

        Returns:
            Lista de embeddings correspondiendo a cada texto.
        """
        if not settings.GEMINI_API_KEY:
            raise RuntimeError(
                "GEMINI_API_KEY no configurada. "
                "Agrega la variable al archivo .env"
            )

        results = []
        for text in texts:
            result = genai.embed_content(
                model=self.model_name,
                content=text,
                task_type="retrieval_document",
            )
            results.append(result["embedding"])
        return results
