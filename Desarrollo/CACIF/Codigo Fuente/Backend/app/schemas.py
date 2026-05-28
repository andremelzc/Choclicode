"""Schemas Pydantic para request/response.

Alineados con los contratos del frontend (auth.ts, chat.ts).
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════════════

class LoginRequest(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    university_code: str
    full_name: str
    rol: str = "estudiante"


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


# ═══════════════════════════════════════════════════════════════════
# CONVERSATION
# ═══════════════════════════════════════════════════════════════════

class ConversationCreate(BaseModel):
    intent_type: str = "CU00"


class ConversationResponse(BaseModel):
    id: str
    student_id: str
    intent_type: str
    started_at: str
    closed_at: Optional[str] = None
    total_messages: int


# ═══════════════════════════════════════════════════════════════════
# MESSAGE
# ═══════════════════════════════════════════════════════════════════

class CitedSourceResponse(BaseModel):
    id: str
    document_name: str
    start_page: Optional[int] = None
    end_page: Optional[int] = None
    similarity_score: float


class TimelineEventResponse(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    status: Optional[str] = None

class ContestDataResponse(BaseModel):
    id: str
    title: Optional[str] = None
    contest_type: Optional[str] = None
    status_badge: Optional[str] = None
    status_label: Optional[str] = None
    requirements: Optional[list[str]] = []
    prize: Optional[str] = None
    required_documents: Optional[str] = None
    apply_url: Optional[str] = None
    timeline_events: Optional[list[TimelineEventResponse]] = []

class GroupCardDataResponse(BaseModel):
    id: str
    name: Optional[str] = None
    coordinator: Optional[str] = None
    lines: Optional[list[str]] = []
    technical_areas: Optional[list[str]] = []
    description: Optional[str] = None


class MessageRequest(BaseModel):
    conversation_id: str
    content: str


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str  # 'user' | 'assistant'
    content: str
    tokens_used: Optional[int] = None
    rag_confidence: Optional[float] = None
    sent_at: str
    cited_sources: Optional[list[CitedSourceResponse]] = None
    ui_type: Optional[str] = None  # 'text' | 'matchmaking_cards' | 'convocatoria_cards'
    cards_data: Optional[list[GroupCardDataResponse]] = None
    contest_data: Optional[list[ContestDataResponse]] = None


# ═══════════════════════════════════════════════════════════════════
# KNOWLEDGE BASE / FAQs
# ═══════════════════════════════════════════════════════════════════

class FAQCreate(BaseModel):
    caso_uso: str = Field(..., description="CU01, CU02, CU03 o CU04")
    tema: str = Field(..., description="Tema de la FAQ")
    pregunta: str = Field(..., description="Pregunta de la FAQ")
    respuesta: str = Field(..., description="Respuesta validada")
    fuente_documento: Optional[str] = None
    pagina_inicio: Optional[int] = None
    pagina_fin: Optional[int] = None


class FAQUpdate(BaseModel):
    tema: Optional[str] = None
    pregunta: Optional[str] = None
    respuesta: Optional[str] = None
    fuente_documento: Optional[str] = None
    pagina_inicio: Optional[int] = None
    pagina_fin: Optional[int] = None


class FAQResponse(BaseModel):
    id: str
    caso_uso: str
    tema: str
    pregunta: str
    respuesta: str
    fuente_documento: Optional[str] = None
    pagina_inicio: Optional[int] = None
    pagina_fin: Optional[int] = None
