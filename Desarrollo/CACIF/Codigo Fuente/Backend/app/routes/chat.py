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
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Conversacion, Mensaje, FuenteCitada
from app.schemas import (
    ConversationCreate,
    ConversationResponse,
    MessageRequest,
    MessageResponse,
    CitedSourceResponse,
)
from services.bedrock_rag_service import get_bedrock_rag_service

router = APIRouter(prefix="/chat", tags=["chat"])


# ── Helpers ─────────────────────────────────────────────────────────

def _conv_to_response(conv: Conversacion) -> ConversationResponse:
    """Convierte un ORM Conversacion a su schema de respuesta."""
    return ConversationResponse(
        id=str(conv.id),
        student_id=str(conv.student_id),
        intent_type=conv.intent_type,
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
        ui_type=msg.ui_type,
        cards_data=msg.ui_data.get("cards_data") if msg.ui_data else None,
        contest_data=msg.ui_data.get("contest_data") if msg.ui_data else None,
        stepper_data=msg.ui_data.get("stepper_data") if msg.ui_data else None,
        citation_data=msg.ui_data.get("citation_data") if msg.ui_data else None,
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
            started_at=datetime.now(timezone.utc).isoformat(),
            total_messages=0,
        )
        return guest_conv

    student_id = uuid.UUID(current_user["sub"])

    nueva = Conversacion(
        student_id=student_id,
        intent_type=payload.intent_type,
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
        .options(selectinload(Mensaje.fuentes_citadas).selectinload(FuenteCitada.chunk))
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

    Flujo:
    1. Guardar mensaje del usuario en DB (solo usuarios autenticados)
    2. Recuperar docs relevantes desde AWS Bedrock Knowledge Base (KWLERMH1JC)
    3. Sintetizar respuesta con Claude via Bedrock (ChatBedrockConverse)
    4. Detectar intent (CU01-CU04) por keywords para actualizar conversacion
    5. Guardar respuesta del asistente (solo si no es invitado)
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

    # ── 2-5. Pipeline RAG con AWS Bedrock Knowledge Base ────────────
    try:
        settings = get_settings()
        rag_service = get_bedrock_rag_service(settings)
        rag_result = await rag_service.run(payload.content)
        print("=== RESULTADO RAG EXITOSO ===", flush=True)
        print(rag_result, flush=True)
        print("==============================", flush=True)
    except Exception as exc:
        import traceback
        print("=== ERROR EN PIPELINE RAG ===", flush=True)
        traceback.print_exc()
        print("==============================", flush=True)
        
        exc_str = str(exc).lower()
        if "resource_exhausted" in exc_str or "quota" in exc_str or "429" in exc_str:
            err_msg = (
                "¡Hola! Lo siento mucho, pero en este momento mi servicio de inteligencia artificial está un poco saturado "
                "debido al límite de consultas diarias. 🥺 Por favor, espera un par de minutos e inténtalo de nuevo. "
                "Si el problema persiste, puedes escribirnos directamente a investigacion.fisi@unmsm.edu.pe para ayudarte."
            )
        else:
            err_msg = (
                "¡Ups! En este momento no logro conectarme a mi base de conocimientos. 🔍 "
                "Por favor, intenta enviar tu mensaje nuevamente en unos instantes. "
                "Si el inconveniente continúa, no dudes en escribir a la Unidad de Investigación "
                "(investigacion.fisi@unmsm.edu.pe) para darte soporte."
            )

        # Respuesta de fallback si Bedrock no está disponible
        rag_result = {
            "answer": err_msg,
            "intent": "CU00",
            "confidence": 0.0,
            "sources": [],
        }

    response_content: str = rag_result["answer"]
    detected_intent: str = rag_result["intent"]
    rag_confidence: float = rag_result["confidence"]
    ui_type: str = rag_result.get("ui_type", "text")
    ui_data: dict = rag_result.get("ui_data", {})
    
    cards_data = ui_data.get("cards_data") if ui_data else None
    contest_data = ui_data.get("contest_data") if ui_data else None
    stepper_data = ui_data.get("stepper_data") if ui_data else None
    citation_data = ui_data.get("citation_data") if ui_data else None

    assistant_msg_id = str(uuid.uuid4())

    if not is_guest:
        # Actualizar intent_type de la conversacion si era CU00
        if conv.intent_type == "CU00" and detected_intent != "CU00":
            conv.intent_type = detected_intent

        assistant_msg = Mensaje(
            id=uuid.UUID(assistant_msg_id),
            conversation_id=conv_id,
            role="assistant",
            content=response_content,
            rag_confidence=rag_confidence,
            ui_type=ui_type,
            ui_data=ui_data if ui_data else None,
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
        cards_data=cards_data,
        contest_data=contest_data,
        stepper_data=stepper_data,
        citation_data=citation_data,
    )
