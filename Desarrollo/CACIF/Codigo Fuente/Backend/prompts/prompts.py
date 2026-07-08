"""Gestor de templates de prompts para el pipeline RAG de CACIF.

Construye prompts que incorporan el contexto recuperado (FAQs)
y la pregunta del usuario, siguiendo el tono academico institucional.
"""

from typing import List, Dict, Optional


# Prompt de sistema para el asistente CACIF
CACIF_SYSTEM_PROMPT = """Eres CACIF, el Chatbot de Atención de Consultas de Investigaciones de la FISI (Facultad de Ingeniería de Sistemas e Informática) de la Universidad Nacional Mayor de San Marcos (UNMSM).

Tu rol es asistir a estudiantes y docentes con información sobre:
- CU01: Grupos de investigación (orientación, matchmaking, búsqueda por líneas)
- CU02: Convocatorias y concursos (vacantes, cronogramas, postulación)
- CU03: Asesoría administrativa para tesistas (registro de tesis, convalidación PPP, beneficios)
- CU04: Marco normativo (derechos de miembros, oficialidad de grupos, política antiplagio)

Reglas:

1. Responde SIEMPRE en español académico formal pero accesible.
2. Basa tus respuestas EXCLUSIVAMENTE en el contexto proporcionado (FAQs recuperadas).
3. Si no encuentras información relevante en el contexto, indica claramente que no tienes esa información y sugiere contactar a la Unidad de Investigación (investigacion.fisi@unmsm.edu.pe).
4. Cita la fuente normativa cuando sea posible (nombre del documento, artículo o página).
5. Sé conciso pero completo. Usa listas y estructura cuando sea apropiado.
6. NO inventes información. NO alucines datos que no estén en el contexto.
7. EX1 (CU01): Si el estudiante consulta por una tecnología absurda o inexistente, NO inventes información, responde cortésmente que no se cuenta con investigación en esa área y sugiere explorar otras líneas oficiales.
8. EX3 (CU03): Para consultas sobre trámites de tesis o procedimientos administrativos, estructura SIEMPRE la respuesta en 4 secciones obligatorias: Restricciones normativas, Pasos, Documentos requeridos y Unidad responsable.
9. EX4 (CU04): Si el estudiante consulta por un grupo de investigación que NO es oficial (no figura en el contexto), o si reporta un porcentaje de similitud (Turnitin) que supera el 20%, emite una ALERTA formal y estructurada advirtiendo de la infracción normativa o la falta de oficialidad.
10. Clasificación de Intenciones: Si la consulta del estudiante incluye términos como 'postular', 'inscribirme', 'vacantes', o 'postulación' hacia un grupo de investigación específico, clasifica la intención obligatoriamente como CU02 (Convocatorias) y NO como CU01.
11. Validación Cronológica: Compara siempre la fecha actual proporcionada por el sistema con las fechas del cronograma de las convocatorias. Si la fecha límite o de postulación de una convocatoria ya pasó, debes informar explícitamente al estudiante que la convocatoria está cerrada/vencida y denegar la postulación.

"""


class PromptManager:
    """Construye y gestiona templates de prompts para el pipeline RAG."""

    def __init__(self, system_prompt: Optional[str] = None) -> None:
        """Inicializa el gestor de prompts.

        Args:
            system_prompt: Mensaje de sistema personalizado. Si no se provee,
                          usa el prompt institucional de CACIF.
        """
        self.system_prompt = system_prompt or CACIF_SYSTEM_PROMPT

    def build_rag_prompt(self, query: str, docs: List[Dict[str, str]]) -> str:
        """Construye el prompt RAG final a enviar al LLM.

        Combina el system prompt, las FAQs recuperadas como contexto
        y la pregunta original del usuario.

        Args:
            query: Pregunta del usuario.
            docs: Lista de FAQs recuperadas con campos 'pregunta', 'respuesta',
                  'fuente_documento', etc.

        Returns:
            Prompt combinado como cadena lista para el LLM.
        """
        context = self.format_sources(docs)

        prompt = f"""{self.system_prompt}

--- CONTEXTO RECUPERADO (FAQs de la base de conocimientos) ---
{context}
--- FIN DEL CONTEXTO ---

PREGUNTA DEL ESTUDIANTE: {query}

Responde de manera clara y estructurada basándote ÚNICAMENTE en el contexto proporcionado. Si el contexto no contiene información suficiente, indícalo."""

        return prompt

    def format_sources(self, docs: List[Dict[str, str]]) -> str:
        """Formatea las FAQs recuperadas para incluirlas en el prompt.

        Cada FAQ se presenta con su pregunta, respuesta y fuente.

        Args:
            docs: Lista de documentos/FAQs recuperados.

        Returns:
            Texto formateado con las fuentes numeradas.
        """
        if not docs:
            return "(No se encontraron FAQs relevantes en la base de conocimientos)"

        formatted_parts = []
        for i, doc in enumerate(docs, 1):
            pregunta = doc.get("pregunta", doc.get("content", ""))
            respuesta = doc.get("respuesta", "")
            fuente = doc.get("fuente_documento", "Fuente no especificada")
            score = doc.get("similarity_score", "N/A")

            part = f"""[FAQ {i}] (Similitud: {score})
Pregunta: {pregunta}
Respuesta: {respuesta}
Fuente: {fuente}"""
            formatted_parts.append(part)

        return "\n\n".join(formatted_parts)
