"""Módulo de generación de embeddings.

Contiene la clase `Embedder` con las firmas necesarias para generar
embeddings (individual y por lotes). No implementa la lógica.
"""
from typing import List, Optional

class Embedder:
    """Generador de embeddings.

    En esta clase se debe integrar la librería de embeddings elegida
    (p. ej. LangChain adapters o cliente directo de Google).
    """

    def __init__(self, model_name: str = "google-embedding-model") -> None:
        """Inicializa el embedder con la configuración del modelo.

        Args:
            model_name: Identificador del modelo de embeddings a usar.
        """
        self.model_name = model_name

    def embed(self, text: str) -> List[float]:
        """Genera un embedding para un texto dado.

        Args:
            text: Texto de entrada.

        Returns:
            Vector de embedding (lista de floats).
        """
        raise NotImplementedError("Implementar generación de embedding")

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Genera embeddings para una lista de textos.

        Args:
            texts: Lista de textos.

        Returns:
            Lista de embeddings correspondiendo a cada texto.
        """
        raise NotImplementedError("Implementar generación de embeddings por lotes")
