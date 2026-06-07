"""Tests de Knowledge Base — CRUD de FAQs via API.

Estos tests usan el almacenamiento en memoria (_faq_store) del endpoint KB,
por lo que no necesitan base de datos real.
"""

import pytest


# ═══════════════════════════════════════════════════════════════════
# Helper
# ═══════════════════════════════════════════════════════════════════

def _create_faq(client, auth_headers, **overrides):
    """Helper para crear una FAQ con datos por defecto."""
    payload = {
        "caso_uso": "CU01",
        "tema": "Grupos de investigación",
        "pregunta": "¿Cómo me uno a un grupo?",
        "respuesta": "Debes postular durante la convocatoria abierta del semestre.",
        **overrides,
    }
    return client.post("/api/kb/faqs", json=payload, headers=auth_headers)


# ═══════════════════════════════════════════════════════════════════
# Autenticación requerida
# ═══════════════════════════════════════════════════════════════════

class TestKBAuth:
    def test_create_faq_without_token_returns_403(self, client):
        """POST /api/kb/faqs sin token debe retornar 403."""
        response = client.post("/api/kb/faqs", json={
            "caso_uso": "CU01",
            "tema": "Test",
            "pregunta": "¿Test?",
            "respuesta": "Test.",
        })
        assert response.status_code == 403

    def test_list_faqs_without_token_returns_403(self, client):
        """GET /api/kb/faqs sin token debe retornar 403."""
        response = client.get("/api/kb/faqs")
        assert response.status_code == 403


# ═══════════════════════════════════════════════════════════════════
# CRUD de FAQs
# ═══════════════════════════════════════════════════════════════════

class TestKBCrud:
    def test_create_faq(self, client, auth_headers):
        """POST /api/kb/faqs debe retornar 201 con los datos correctos."""
        response = _create_faq(client, auth_headers)
        assert response.status_code == 201

        data = response.json()
        assert data["caso_uso"] == "CU01"
        assert data["pregunta"] == "¿Cómo me uno a un grupo?"
        assert "id" in data

    def test_list_faqs(self, client, auth_headers):
        """GET /api/kb/faqs debe incluir las FAQs creadas."""
        # Crear una FAQ primero
        _create_faq(client, auth_headers, caso_uso="CU02", tema="Convocatorias")

        response = client.get("/api/kb/faqs", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_list_faqs_filter_by_caso_uso(self, client, auth_headers):
        """GET /api/kb/faqs?caso_uso=CU03 debe filtrar correctamente."""
        _create_faq(client, auth_headers, caso_uso="CU03", tema="Asesoría")
        _create_faq(client, auth_headers, caso_uso="CU04", tema="Normativa")

        response = client.get(
            "/api/kb/faqs", params={"caso_uso": "CU03"}, headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        for faq in data:
            assert faq["caso_uso"] == "CU03"

    def test_update_faq(self, client, auth_headers):
        """PUT /api/kb/faqs/{id} debe actualizar campos parcialmente."""
        # Crear
        create_resp = _create_faq(client, auth_headers)
        faq_id = create_resp.json()["id"]

        # Actualizar solo el tema
        update_resp = client.put(
            f"/api/kb/faqs/{faq_id}",
            json={"tema": "Tema actualizado"},
            headers=auth_headers,
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["tema"] == "Tema actualizado"
        # El resto no debe cambiar
        assert update_resp.json()["caso_uso"] == "CU01"

    def test_update_faq_not_found(self, client, auth_headers):
        """PUT /api/kb/faqs/{id} con ID inexistente debe retornar 404."""
        response = client.put(
            "/api/kb/faqs/id-que-no-existe",
            json={"tema": "Nuevo"},
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_create_faq_with_optional_fields(self, client, auth_headers):
        """POST /api/kb/faqs con campos opcionales debe funcionar."""
        response = _create_faq(
            client,
            auth_headers,
            fuente_documento="Reglamento General",
            pagina_inicio=15,
            pagina_fin=20,
        )
        assert response.status_code == 201
        data = response.json()
        assert data["fuente_documento"] == "Reglamento General"
        assert data["pagina_inicio"] == 15
        assert data["pagina_fin"] == 20
