"""Tests de autenticación — JWT y endpoint de guest login."""

from datetime import timedelta

import pytest
from fastapi import HTTPException

from app.dependencies import create_access_token, decode_token


# ═══════════════════════════════════════════════════════════════════
# JWT: create + decode
# ═══════════════════════════════════════════════════════════════════

class TestJWT:
    def test_create_and_decode_token(self):
        """Crear un token y decodificarlo debe retornar el payload original."""
        payload = {
            "sub": "user-123",
            "role": "estudiante",
            "university_code": "20200001",
            "full_name": "Test User",
        }
        token = create_access_token(data=payload)
        decoded = decode_token(token)

        assert decoded["sub"] == "user-123"
        assert decoded["role"] == "estudiante"
        assert decoded["university_code"] == "20200001"
        assert "exp" in decoded

    def test_decode_invalid_token_raises_401(self):
        """Un token corrupto debe lanzar HTTPException 401."""
        with pytest.raises(HTTPException) as exc_info:
            decode_token("este-token-es-invalido")
        assert exc_info.value.status_code == 401

    def test_decode_expired_token_raises_401(self):
        """Un token expirado debe lanzar HTTPException 401."""
        token = create_access_token(
            data={"sub": "user-123"},
            expires_delta=timedelta(seconds=-10),
        )
        with pytest.raises(HTTPException) as exc_info:
            decode_token(token)
        assert exc_info.value.status_code == 401

    def test_token_contains_expiration(self):
        """El token generado debe incluir el campo 'exp'."""
        token = create_access_token(data={"sub": "user-123"})
        decoded = decode_token(token)
        assert "exp" in decoded

    def test_custom_expiration(self):
        """Se puede configurar una expiración personalizada."""
        token = create_access_token(
            data={"sub": "user-123"},
            expires_delta=timedelta(hours=1),
        )
        decoded = decode_token(token)
        assert decoded["sub"] == "user-123"


# ═══════════════════════════════════════════════════════════════════
# Endpoint: POST /api/auth/guest
# ═══════════════════════════════════════════════════════════════════

class TestGuestEndpoint:
    def test_guest_login_returns_200(self, client):
        """POST /api/auth/guest debe retornar 200 con un JWT válido."""
        response = client.post("/api/auth/guest")
        assert response.status_code == 200

        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["rol"] == "invitado"
        assert data["user"]["university_code"] == "Invitado"

    def test_guest_login_returns_valid_jwt(self, client):
        """El token retornado por guest login debe ser decodificable."""
        response = client.post("/api/auth/guest")
        data = response.json()

        decoded = decode_token(data["token"])
        assert decoded["role"] == "invitado"
        assert decoded["sub"].startswith("guest_")

    def test_guest_login_unique_ids(self, client):
        """Cada llamada a guest login debe generar un ID único."""
        r1 = client.post("/api/auth/guest")
        r2 = client.post("/api/auth/guest")

        id1 = r1.json()["user"]["id"]
        id2 = r2.json()["user"]["id"]
        assert id1 != id2
