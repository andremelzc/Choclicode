"""Gestor de templates de prompts para RAG.

Contiene utilidades para construir prompts RAG que incorporen
contexto recuperado y la query del usuario.
"""
from typing import List, Dict, Optional


class PromptManager:
    """Clase responsable de construir y seleccionar templates de prompts.

    - Cargar templates desde archivos o definiciones en código.
    - Construir prompts que combinan query + contextos recuperados.
    """

    def __init__(self, system_prompt: Optional[str] = None) -> None:
        """Inicializa el gestor de prompts.

        Args:
            system_prompt: Mensaje de sistema por defecto para el LLM.
        """
        self.system_prompt = system_prompt or ""

    def build_rag_prompt(self, query: str, docs: List[Dict[str, str]]) -> str:
        """Construye el prompt RAG final a enviar al LLM.

        Args:
            query: Pregunta del usuario.
            docs: Lista de documentos recuperados (cada uno debe incluir texto y metadatos).

        Returns:
            Prompt combinado como cadena.
        """
        raise NotImplementedError("Implementar build_rag_prompt")

    def format_sources(self, docs: List[Dict[str, str]]) -> str:
        """Formatea los documentos recuperados para mostrarlos en el prompt.

        Puede incluir transformaciones, truncado y sanitización.
        """
        raise NotImplementedError("Implementar format_sources")
