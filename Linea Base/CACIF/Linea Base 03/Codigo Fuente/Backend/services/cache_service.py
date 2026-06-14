"""Servicio de cache para respuestas RAG usando Upstash Redis.

Implementa cache L1 (coincidencia exacta con normalizacion de texto).
Si UPSTASH_REDIS_URL no esta configurada, el cache se desactiva
y el pipeline RAG funciona sin cambios (fail-open).
"""

import hashlib
import json
import logging
import re
import unicodedata
from typing import Optional

from app.config import get_settings

logger = logging.getLogger(__name__)


class CacheService:
    """Cache de respuestas RAG con Upstash Redis.

    Almacena pares query_normalizada -> respuesta_json con un TTL configurable.
    La normalizacion (lowercase, sin acentos, sin puntuacion) permite que
    variaciones triviales de la misma pregunta compartan cache.
    """

    PREFIX = "cacif:rag:"

    def __init__(self, url: str, token: str, ttl_seconds: int = 86400) -> None:
        """Inicializa la conexion a Upstash Redis.

        Args:
            url: URL REST de Upstash (ej: https://xxx.upstash.io).
            token: Token de autenticacion de Upstash.
            ttl_seconds: Tiempo de vida del cache en segundos (default: 24h).
        """
        from upstash_redis import Redis
        self.redis = Redis(url=url, token=token)
        self.ttl = ttl_seconds

    def _normalize(self, query: str) -> str:
        """Normaliza la query para maximizar cache hits.

        Transformaciones aplicadas:
        1. Convertir a minusculas
        2. Eliminar acentos (tildes)
        3. Eliminar signos de puntuacion (¿?¡!.,;:-"'())
        4. Colapsar multiples espacios en uno solo
        5. Strip de espacios al inicio y final

        Ejemplo:
            "¿Cómo registro mi tesis?" -> "como registro mi tesis"
            "Como registro mi tesis"   -> "como registro mi tesis"
            Ambas generan el mismo hash -> mismo cache hit.
        """
        text = query.lower().strip()
        # Eliminar acentos: NFD descompone "é" en "e" + acento, luego filtramos
        text = unicodedata.normalize("NFD", text)
        text = "".join(c for c in text if unicodedata.category(c) != "Mn")
        # Eliminar puntuacion no significativa
        text = re.sub(r"[¿?¡!.,;:\-\"'()]+", " ", text)
        # Colapsar espacios multiples
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _make_key(self, query: str) -> str:
        """Genera la key Redis a partir de la query normalizada.

        Usa SHA-256 truncado a 16 caracteres como key.
        Ejemplo: "cacif:rag:a1b2c3d4e5f67890"
        """
        normalized = self._normalize(query)
        hash_val = hashlib.sha256(normalized.encode()).hexdigest()[:16]
        return f"{self.PREFIX}{hash_val}"

    def get(self, query: str) -> Optional[dict]:
        """Busca una respuesta cacheada para la query dada.

        Args:
            query: La pregunta del estudiante tal como llego.

        Returns:
            dict con la respuesta RAG completa si hay cache hit, None si miss.
        """
        try:
            key = self._make_key(query)
            cached = self.redis.get(key)
            if cached is None:
                logger.debug("Cache MISS para query: %s (key: %s)", query[:50], key)
                return None
            logger.info("Cache HIT para query: %s (key: %s)", query[:50], key)
            if isinstance(cached, str):
                return json.loads(cached)
            return cached
        except Exception as exc:
            # Si Redis falla, loggeamos y seguimos sin cache (fail-open)
            logger.warning("Error al consultar cache Redis: %s", exc)
            return None

    def set(self, query: str, response: dict) -> None:
        """Cachea la respuesta RAG para la query dada.

        Solo cachea respuestas con confianza razonable (confidence > 0.5).
        Respuestas de baja confianza probablemente son "no encontre info",
        que no vale la pena cachear.

        Args:
            query: La pregunta original del estudiante.
            response: El dict completo retornado por BedrockRAGService.run().
        """
        try:
            confidence = response.get("confidence", 0)
            if confidence < 0.5:
                logger.debug(
                    "No se cachea (confidence=%.2f < 0.5): %s", confidence, query[:50]
                )
                return

            key = self._make_key(query)
            payload = json.dumps(response, ensure_ascii=False)
            self.redis.set(key, payload, ex=self.ttl)
            logger.info("Cache SET para query: %s (key: %s, TTL: %ds)", query[:50], key, self.ttl)
        except Exception as exc:
            # Si Redis falla al guardar, no pasa nada, la respuesta ya se genero
            logger.warning("Error al guardar en cache Redis: %s", exc)


# ── Singleton ────────────────────────────────────────────────────────

_cache_instance: Optional[CacheService] = None


def get_cache_service() -> Optional[CacheService]:
    """Retorna la instancia singleton del cache, o None si no esta configurado.

    Si UPSTASH_REDIS_URL o UPSTASH_REDIS_TOKEN estan vacios, retorna None
    y el pipeline RAG funciona sin cache (comportamiento actual).
    """
    global _cache_instance
    settings = get_settings()

    # Si no hay credenciales, cache desactivado
    if not settings.UPSTASH_REDIS_URL or not settings.UPSTASH_REDIS_TOKEN:
        return None

    if _cache_instance is None:
        _cache_instance = CacheService(
            url=settings.UPSTASH_REDIS_URL,
            token=settings.UPSTASH_REDIS_TOKEN,
            ttl_seconds=settings.CACHE_TTL_SECONDS,
        )
    return _cache_instance
