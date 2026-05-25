"""Configuracion centralizada del backend CACIF.

Carga variables de entorno usando pydantic-settings.
Crear un archivo .env en la raiz del Backend con las variables necesarias.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Variables de entorno del backend."""

    # --- Base de datos (Supabase / PostgreSQL) ---
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/cacif"

    # --- JWT ---
    JWT_SECRET: str = "cacif-dev-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 480  # 8 horas

    # --- Google Gemini ---
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_EMBEDDING_MODEL: str = "models/text-embedding-004"

    # --- Azure AI Search ---
    AZURE_SEARCH_ENDPOINT: str = ""
    AZURE_SEARCH_API_KEY: str = ""
    AZURE_SEARCH_INDEX_NAME: str = "cacif-qa-index"

    # --- RAG ---
    RAG_TOP_K: int = 5
    RAG_SIMILARITY_THRESHOLD: float = 0.75

    # --- Rate Limiting ---
    GUEST_MAX_QUESTIONS: int = 5

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    """Singleton de configuracion."""
    return Settings()
