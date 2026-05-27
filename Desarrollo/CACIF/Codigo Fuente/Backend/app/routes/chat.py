"""Router de chat y conversaciones /api/chat.

Endpoints:
- GET  /api/chat/conversations                         -> Listar conversaciones
- POST /api/chat/conversations                         -> Crear conversacion
- GET  /api/chat/conversations/{conversation_id}/messages -> Listar mensajes
- POST /api/chat/message                               -> Enviar mensaje (pipeline RAG)
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Conversacion, Mensaje, Estudiante
from app.schemas import (
    ConversationCreate,
    ConversationResponse,
    MessageRequest,
    MessageResponse,
    CitedSourceResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])


# ── Helpers ─────────────────────────────────────────────────────────

def _conv_to_response(conv: Conversacion) -> ConversationResponse:
    """Convierte un ORM Conversacion a su schema de respuesta."""
    return ConversationResponse(
        id=str(conv.id),
        student_id=str(conv.student_id),
        intent_type=conv.intent_type,
        title=conv.title,
        started_at=conv.started_at.isoformat(),
        closed_at=conv.closed_at.isoformat() if conv.closed_at else None,
        total_messages=conv.total_messages,
    )


def _msg_to_response(msg: Mensaje) -> MessageResponse:
    """Convierte un ORM Mensaje a su schema de respuesta."""
    return MessageResponse(
        id=str(msg.id),
        conversation_id=str(msg.conversation_id),
        role=msg.role,
        content=msg.content,
        tokens_used=msg.tokens_used,
        rag_confidence=msg.rag_confidence,
        sent_at=msg.sent_at.isoformat(),
        cited_sources=[
            CitedSourceResponse(
                id=str(fc.id),
                document_name=fc.chunk.source_document or "Documento",
                start_page=fc.chunk.start_page,
                end_page=fc.chunk.end_page,
                similarity_score=fc.similarity_score,
            )
            for fc in msg.fuentes_citadas
        ] if msg.fuentes_citadas else None,
    )


# ═══════════════════════════════════════════════════════════════════
# GET /api/chat/conversations
# ═══════════════════════════════════════════════════════════════════

@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Recuperar el historial de conversaciones del estudiante activo.

    Los invitados no tienen historial persistente, retorna lista vacia.
    """
    if current_user.get("role") == "invitado":
        return []

    student_id = current_user["sub"]
    result = await db.execute(
        select(Conversacion)
        .where(Conversacion.student_id == uuid.UUID(student_id))
        .order_by(Conversacion.started_at.desc())
    )
    conversaciones = result.scalars().all()
    return [_conv_to_response(c) for c in conversaciones]


# ═══════════════════════════════════════════════════════════════════
# POST /api/chat/conversations
# ═══════════════════════════════════════════════════════════════════

@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    payload: ConversationCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Crear una nueva conversacion vacia y asignarla al estudiante.

    Los invitados pueden crear conversaciones efimeras (no se persisten).
    """
    if current_user.get("role") == "invitado":
        # Conversacion efimera sin DB
        guest_conv = ConversationResponse(
            id=str(uuid.uuid4()),
            student_id=current_user["sub"],
            intent_type=payload.intent_type,
            title=payload.title,
            started_at=datetime.now(timezone.utc).isoformat(),
            total_messages=0,
        )
        return guest_conv

    student_id = uuid.UUID(current_user["sub"])

    nueva = Conversacion(
        student_id=student_id,
        intent_type=payload.intent_type,
        title=payload.title,
    )
    db.add(nueva)
    await db.commit()
    await db.refresh(nueva)
    return _conv_to_response(nueva)


# ═══════════════════════════════════════════════════════════════════
# GET /api/chat/conversations/{conversation_id}/messages
# ═══════════════════════════════════════════════════════════════════

@router.get(
    "/conversations/{conversation_id}/messages",
    response_model=list[MessageResponse],
)
async def list_messages(
    conversation_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Recuperar el historial de mensajes de una conversacion especifica.

    Ordena cronologicamente. Verifica que la conversacion pertenezca al usuario.
    """
    if current_user.get("role") == "invitado":
        return []

    conv_uuid = uuid.UUID(conversation_id)
    student_id = uuid.UUID(current_user["sub"])

    # Verificar propiedad
    result = await db.execute(
        select(Conversacion).where(
            Conversacion.id == conv_uuid,
            Conversacion.student_id == student_id,
        )
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversación no encontrada",
        )

    # Obtener mensajes
    msg_result = await db.execute(
        select(Mensaje)
        .where(Mensaje.conversation_id == conv_uuid)
        .order_by(Mensaje.sent_at.asc())
    )
    mensajes = msg_result.scalars().all()
    return [_msg_to_response(m) for m in mensajes]


# ═══════════════════════════════════════════════════════════════════
# POST /api/chat/message
# ═══════════════════════════════════════════════════════════════════

@router.post("/message", response_model=MessageResponse)
async def send_message(
    payload: MessageRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Endpoint principal del pipeline RAG-QA.

    Flujo segun CACIF-EBC:
    1. Guardar mensaje del usuario en tabla Mensaje
    2. Generar embedding con Google Gemini
    3. Buscar FAQs similares en Azure AI Search
    4. Sintetizar respuesta con LLM (Gemini)
    5. Detectar ui_type segun intent (CU01 -> matchmaking_cards, CU02 -> convocatoria_cards)
    6. Guardar respuesta del asistente (solo si no es invitado)

    Nota: La integracion real con Gemini y Azure AI Search se implementa
    en el servicio RAG (commit posterior). Este endpoint actualmente retorna
    una respuesta de esqueleto funcional.
    """
    is_guest = current_user.get("role") == "invitado"
    conv_id = uuid.UUID(payload.conversation_id)

    # ── 1. Guardar mensaje del usuario (solo si no es invitado) ─────
    if not is_guest:
        student_id = uuid.UUID(current_user["sub"])

        # Verificar que la conversacion exista y pertenezca al usuario
        result = await db.execute(
            select(Conversacion).where(
                Conversacion.id == conv_id,
                Conversacion.student_id == student_id,
            )
        )
        conv = result.scalar_one_or_none()
        if not conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversación no encontrada",
            )

        user_msg = Mensaje(
            conversation_id=conv_id,
            role="user",
            content=payload.content,
        )
        db.add(user_msg)

        # Actualizar contador
        conv.total_messages += 1

    # ── 2-5. Pipeline RAG (esqueleto funcional) ─────────────────────
    # TODO: Integrar con RAGService real en commit posterior.
    # Por ahora, generamos una respuesta basica para que el endpoint
    # sea funcional de punta a punta.

    lower_content = payload.content.lower()
    ui_type = "text"
    rag_confidence = 0.85
    response_content = (
        "Entiendo tu consulta. Como Asistente CACIF, puedo ayudarte con "
        "orientación sobre grupos de investigación, convocatorias, "
        "trámites de tesis y normativa académica de la FISI. "
        "¿Podrías darme más detalles sobre lo que necesitas?"
    )

    # Deteccion basica de intent para ui_type
    if any(kw in lower_content for kw in ["grupo", "investigación", "matchmaking", "ia", "software"]):
        ui_type = "matchmaking_cards"
        response_content = (
            "He analizado tus intereses y encontré los siguientes grupos "
            "de investigación que podrían interesarte:"
        )
        rag_confidence = 0.92
    elif any(kw in lower_content for kw in ["convocatoria", "concurso", "vacante", "postular"]):
        ui_type = "convocatoria_cards"
        response_content = (
            "He encontrado las siguientes convocatorias vigentes para "
            "grupos de investigación:"
        )
        rag_confidence = 0.90
    elif any(kw in lower_content for kw in ["tesis", "convalidar", "ppp", "título"]):
        response_content = (
            "Para los trámites relacionados con tu tesis o convalidación "
            "de PPP, te puedo orientar con los requisitos y procedimientos "
            "establecidos en el reglamento de la FISI."
        )
        rag_confidence = 0.88

    # ── 6. Guardar respuesta del asistente ──────────────────────────
    assistant_msg_id = str(uuid.uuid4())

    if not is_guest:
        assistant_msg = Mensaje(
            id=uuid.UUID(assistant_msg_id),
            conversation_id=conv_id,
            role="assistant",
            content=response_content,
            rag_confidence=rag_confidence,
        )
        db.add(assistant_msg)
        conv.total_messages += 1
        await db.commit()

    return MessageResponse(
        id=assistant_msg_id,
        conversation_id=str(conv_id),
        role="assistant",
        content=response_content,
        rag_confidence=rag_confidence,
        sent_at=datetime.now(timezone.utc).isoformat(),
        ui_type=ui_type,
    )
