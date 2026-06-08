"""Tests de schemas Pydantic — serialización, deserialización y validación."""

import pytest
from pydantic import ValidationError

from app.schemas import (
    LoginRequest,
    AuthResponse,
    UserResponse,
    ConversationCreate,
    ConversationResponse,
    MessageRequest,
    MessageResponse,
    FAQCreate,
    FAQUpdate,
    FAQResponse,
)


# ═══════════════════════════════════════════════════════════════════
# LoginRequest
# ═══════════════════════════════════════════════════════════════════

class TestLoginRequest:
    def test_valid_login(self):
        req = LoginRequest(email="test@unmsm.edu.pe", password="secret123")
        assert req.email == "test@unmsm.edu.pe"
        assert req.password == "secret123"

    def test_missing_email_raises(self):
        with pytest.raises(ValidationError):
            LoginRequest(password="secret123")

    def test_missing_password_raises(self):
        with pytest.raises(ValidationError):
            LoginRequest(email="test@unmsm.edu.pe")


# ═══════════════════════════════════════════════════════════════════
# AuthResponse / UserResponse
# ═══════════════════════════════════════════════════════════════════

class TestAuthResponse:
    def test_valid_auth_response(self):
        user = UserResponse(
            id="abc-123",
            university_code="20200001",
            full_name="Juan Pérez",
        )
        auth = AuthResponse(token="jwt-token-here", user=user)
        assert auth.token == "jwt-token-here"
        assert auth.user.university_code == "20200001"
        assert auth.user.rol == "estudiante"  # default

    def test_user_response_custom_rol(self):
        user = UserResponse(
            id="abc-123",
            university_code="INV001",
            full_name="Invitado",
            rol="invitado",
        )
        assert user.rol == "invitado"


# ═══════════════════════════════════════════════════════════════════
# ConversationCreate / ConversationResponse
# ═══════════════════════════════════════════════════════════════════

class TestConversation:
    def test_create_default_intent(self):
        conv = ConversationCreate()
        assert conv.intent_type == "CU00"

    def test_create_custom_intent(self):
        conv = ConversationCreate(intent_type="CU03")
        assert conv.intent_type == "CU03"

    def test_response_optional_closed_at(self):
        resp = ConversationResponse(
            id="uuid-1",
            student_id="uuid-2",
            intent_type="CU01",
            started_at="2026-06-01T00:00:00Z",
            total_messages=5,
        )
        assert resp.closed_at is None
        assert resp.total_messages == 5


# ═══════════════════════════════════════════════════════════════════
# MessageRequest / MessageResponse
# ═══════════════════════════════════════════════════════════════════

class TestMessage:
    def test_valid_message_request(self):
        req = MessageRequest(
            conversation_id="conv-uuid",
            content="¿Qué grupos de investigación hay?",
        )
        assert req.content == "¿Qué grupos de investigación hay?"

    def test_message_request_missing_content(self):
        with pytest.raises(ValidationError):
            MessageRequest(conversation_id="conv-uuid")

    def test_message_response_optional_fields(self):
        resp = MessageResponse(
            id="msg-uuid",
            conversation_id="conv-uuid",
            role="assistant",
            content="Respuesta del chatbot",
            sent_at="2026-06-01T00:00:00Z",
        )
        assert resp.tokens_used is None
        assert resp.rag_confidence is None
        assert resp.cited_sources is None
        assert resp.ui_type is None
        assert resp.cards_data is None


# ═══════════════════════════════════════════════════════════════════
# FAQ Schemas
# ═══════════════════════════════════════════════════════════════════

class TestFAQ:
    def test_valid_faq_create(self):
        faq = FAQCreate(
            caso_uso="CU01",
            tema="Grupos de investigación",
            pregunta="¿Cómo unirme a un grupo?",
            respuesta="Debes postular durante la convocatoria abierta.",
        )
        assert faq.caso_uso == "CU01"
        assert faq.fuente_documento is None

    def test_faq_create_missing_required(self):
        with pytest.raises(ValidationError):
            FAQCreate(caso_uso="CU01", tema="Test")
            # Falta pregunta y respuesta

    def test_faq_update_partial(self):
        update = FAQUpdate(tema="Nuevo tema")
        dumped = update.model_dump(exclude_unset=True)
        assert dumped == {"tema": "Nuevo tema"}
        assert "pregunta" not in dumped

    def test_faq_response(self):
        resp = FAQResponse(
            id="faq-uuid",
            caso_uso="CU02",
            tema="Convocatorias",
            pregunta="¿Cuándo es la próxima convocatoria?",
            respuesta="En julio 2026.",
        )
        assert resp.id == "faq-uuid"
        assert resp.pagina_inicio is None
