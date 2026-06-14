"""Tests de configuración — verifican los valores por defecto de Settings."""

from app.config import Settings


class TestSettings:
    def test_default_jwt_algorithm(self):
        """El algoritmo JWT por defecto debe ser HS256."""
        s = Settings()
        assert s.JWT_ALGORITHM == "HS256"

    def test_default_jwt_expiration(self):
        """La expiración JWT por defecto debe ser 480 minutos (8 horas)."""
        s = Settings()
        assert s.JWT_EXPIRATION_MINUTES == 480

    def test_default_rag_top_k(self):
        """RAG_TOP_K por defecto debe ser 5."""
        s = Settings()
        assert s.RAG_TOP_K == 5

    def test_default_rag_threshold(self):
        """RAG_SIMILARITY_THRESHOLD por defecto debe ser 0.75."""
        s = Settings()
        assert s.RAG_SIMILARITY_THRESHOLD == 0.75

    def test_default_guest_max_questions(self):
        """GUEST_MAX_QUESTIONS por defecto debe ser 5."""
        s = Settings()
        assert s.GUEST_MAX_QUESTIONS == 5

    def test_default_cache_ttl(self):
        """CACHE_TTL_SECONDS por defecto debe ser 86400 (24 horas)."""
        s = Settings()
        assert s.CACHE_TTL_SECONDS == 86400

    def test_default_gemini_model(self):
        """El modelo Gemini por defecto."""
        s = Settings()
        assert s.GEMINI_MODEL == "gemini-flash-latest"

    def test_default_azure_search_index(self):
        """El índice de Azure AI Search por defecto."""
        s = Settings()
        assert s.AZURE_SEARCH_INDEX_NAME == "cacif-qa-index"
