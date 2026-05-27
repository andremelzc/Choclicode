"""Módulo para indexación y búsqueda semántica (Vector DB).

Abstracción para un almacén vectorial (p. ej. FAISS, Milvus, Pinecone).
Contiene firmas necesarias para añadir documentos y buscar por embedding.
"""
from typing import Any, Dict, List, Optional


class VectorDB:
    """Abstracción del almacén vectorial.

    Implementaciones concretas deben encargarse de persistencia, serialización
    y recuperación (por ejemplo FAISS, Annoy, Milvus, Pinecone, etc.).
    """

    def __init__(self, index_path: Optional[str] = None) -> None:
        """Inicializa o abre el índice.

        Args:
            index_path: Ruta al índice en disco (si aplica).
        """
        self.index_path = index_path

    def add_documents(self, documents: List[Dict[str, Any]], embeddings: List[List[float]]) -> None:
        """Añade documentos y sus embeddings al índice.

        Args:
            documents: Lista de objetos/metadata de documentos.
            embeddings: Lista de embeddings alineada con `documents`.
        """
        raise NotImplementedError("Implementar add_documents")

    def search_by_embedding(self, embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
        """Busca documentos similares al embedding dado.

        Args:
            embedding: Vector de consulta.
            top_k: Número de resultados a devolver.

        Returns:
            Lista de documentos con metadatos y scores.
        """
        raise NotImplementedError("Implementar search_by_embedding")

    def persist(self) -> None:
        """Persistir el índice a disco o servicio remoto.

        Implementaciones concretas deberían guardar el estado actual.
        """
        raise NotImplementedError("Implementar persist")

    def delete_index(self) -> None:
        """Eliminar o resetear el índice (útil para pruebas)."""
        raise NotImplementedError("Implementar delete_index")
