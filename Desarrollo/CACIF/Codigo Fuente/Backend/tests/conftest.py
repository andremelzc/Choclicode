"""Fixtures compartidos para tests del backend CACIF.

Provee un TestClient async (httpx) que apunta a la app FastAPI
sin necesidad de base de datos real ni servicios externos.
"""

import os
import pytest
import httpx

# Forzar variables de entorno antes de importar la app,
# para evitar que intente conectarse a servicios reales.
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")
os.environ.setdefault("JWT_SECRET", "test-secret-key-for-ci")
os.environ.setdefault("GEMINI_API_KEY", "fake-key")
os.environ.setdefault("AZURE_SEARCH_ENDPOINT", "https://fake.search.windows.net")
os.environ.setdefault("AZURE_SEARCH_API_KEY", "fake-key")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "fake")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "fake")
os.environ.setdefault("UPSTASH_REDIS_URL", "https://fake.upstash.io")
os.environ.setdefault("UPSTASH_REDIS_TOKEN", "fake")

from app.main import app  # noqa: E402
from app.dependencies import create_access_token  # noqa: E402


@pytest.fixture()
def client():
    """Cliente HTTP de prueba que usa ASGI transport (no necesita servidor)."""
    transport = httpx.ASGITransport(app=app)
    client_instance = httpx.Client(transport=transport, base_url="http://testserver")
    yield client_instance
    client_instance.close()


@pytest.fixture()
def guest_token() -> str:
    """Token JWT de invitado pre-generado para reutilizar en tests."""
    return create_access_token(
        data={
            "sub": "guest_test123",
            "university_code": "Invitado",
            "full_name": "Usuario Test",
            "role": "invitado",
        }
    )


@pytest.fixture()
def auth_headers(guest_token: str) -> dict:
    """Headers de autorización con el token de invitado."""
    return {"Authorization": f"Bearer {guest_token}"}
