"""Módulo de logs y trazabilidad para el pipeline RAG.

Proporciona una abstracción para registrar peticiones, respuestas y errores
de forma estructurada (se puede integrar con OpenTelemetry, Sentry, etc.).
"""
import logging
from typing import Any, Dict, Optional


class Tracer:
    """Registro y trazabilidad estructurada.

    En una implementación real, este componente puede enviar trazas a
    sistemas externos, añadir IDs de correlación, medir latencias, etc.
    """

    def __init__(self, service_name: str = "rag-service", logger: Optional[logging.Logger] = None) -> None:
        """Inicializa el tracer con un logger.

        Args:
            service_name: Nombre del servicio para prefijar logs/metricas.
            logger: Logger opcional; si no se provee se crea uno básico.
        """
        self.service_name = service_name
        self.logger = logger or logging.getLogger(service_name)

    def log_request(self, user_id: Optional[str], query: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Registrar una petición entrante.

        Args:
            user_id: Identificador del usuario (si aplica).
            query: Texto de la query recibida.
            metadata: Metadatos adicionales.
        """
        raise NotImplementedError("Implementar log_request")

    def log_response(self, user_id: Optional[str], query: str, response: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Registrar la respuesta generada por el pipeline.

        Args:
            user_id: Identificador del usuario (si aplica).
            query: Query original.
            response: Texto de respuesta generado.
            metadata: Metadatos adicionales.
        """
        raise NotImplementedError("Implementar log_response")

    def log_error(self, error: Exception, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Registrar un error ocurrido en el pipeline.

        Args:
            error: Excepción capturada.
            metadata: Metadatos/contexto adicional.
        """
        raise NotImplementedError("Implementar log_error")
