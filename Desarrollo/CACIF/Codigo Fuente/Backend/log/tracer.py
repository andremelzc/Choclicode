"""Modulo de logs y trazabilidad para el pipeline RAG.

Implementa logging estructurado en formato JSON (NDJSON) segun
la especificacion CACIF-ELT.
"""

import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional


class Tracer:
    """Registro y trazabilidad estructurada en formato NDJSON.

    Cada evento se registra como un objeto JSON con campos estandarizados:
    timestamp, level, service, event, y metadatos adicionales.
    """

    def __init__(
        self,
        service_name: str = "cacif-backend",
        logger: Optional[logging.Logger] = None,
    ) -> None:
        """Inicializa el tracer con un logger configurado para NDJSON.

        Args:
            service_name: Nombre del servicio para prefijar logs.
            logger: Logger opcional; si no se provee se crea uno configurado.
        """
        self.service_name = service_name
        self.logger = logger or self._create_logger()

    def _create_logger(self) -> logging.Logger:
        """Crea un logger configurado para salida NDJSON."""
        logger = logging.getLogger(self.service_name)
        logger.setLevel(logging.DEBUG)

        if not logger.handlers:
            handler = logging.StreamHandler()
            handler.setFormatter(logging.Formatter("%(message)s"))
            logger.addHandler(handler)

        return logger

    def _emit(
        self,
        level: str,
        event: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Emite un log estructurado en formato JSON."""
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level,
            "service": self.service_name,
            "event": event,
        }
        if metadata:
            log_entry.update(metadata)

        log_line = json.dumps(log_entry, ensure_ascii=False)

        level_map = {
            "DEBUG": logging.DEBUG,
            "INFO": logging.INFO,
            "WARN": logging.WARNING,
            "ERROR": logging.ERROR,
        }
        self.logger.log(level_map.get(level, logging.INFO), log_line)

    def log_request(
        self,
        user_id: Optional[str],
        query: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Registrar una peticion entrante al pipeline RAG.

        Args:
            user_id: Identificador del usuario.
            query: Texto de la query recibida.
            metadata: Metadatos adicionales.
        """
        data: Dict[str, Any] = {
            "user_id": user_id,
            "query": query[:200],  # Truncar para logs
        }
        if metadata:
            data.update(metadata)
        self._emit("INFO", "consulta_recibida", data)

    def log_response(
        self,
        user_id: Optional[str],
        query: str,
        response: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Registrar la respuesta generada por el pipeline.

        Args:
            user_id: Identificador del usuario.
            query: Query original.
            response: Texto de respuesta generado.
            metadata: Metadatos adicionales (latencia, tokens, etc).
        """
        data: Dict[str, Any] = {
            "user_id": user_id,
            "query": query[:200],
            "response_length": len(response),
        }
        if metadata:
            data.update(metadata)
        self._emit("INFO", "respuesta_enviada", data)

    def log_error(
        self,
        error: Exception,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Registrar un error ocurrido en el pipeline.

        Args:
            error: Excepcion capturada.
            metadata: Metadatos/contexto adicional.
        """
        data: Dict[str, Any] = {
            "error_type": type(error).__name__,
            "error_message": str(error),
        }
        if metadata:
            data.update(metadata)
        self._emit("ERROR", "error_pipeline", data)

    def log_intent(
        self,
        user_id: Optional[str],
        intent: str,
        confidence: float,
    ) -> None:
        """Registrar la clasificacion de intent detectada."""
        self._emit("INFO", "intent_clasificado", {
            "user_id": user_id,
            "intent": intent,
            "confidence": confidence,
        })

    def log_rag_search(
        self,
        top_k: int,
        num_results: int,
        best_score: float,
    ) -> None:
        """Registrar resultados de la busqueda vectorial."""
        level = "INFO" if best_score >= 0.75 else "WARN"
        self._emit(level, "chunks_recuperados", {
            "top_k": top_k,
            "num_results": num_results,
            "best_score": best_score,
        })
