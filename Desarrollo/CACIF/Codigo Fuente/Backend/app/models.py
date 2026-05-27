"""Modelos ORM del sistema CACIF.

Basados en el modelo de datos documentado en CACIF-MD y el README:
- Estudiante
- Conversacion
- Mensaje
- DocumentoNormativo
- ChunkNormativo
- FuenteCitada
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import (
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    ARRAY,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ── Estudiante ──────────────────────────────────────────────────────

class Estudiante(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    university_code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relaciones
    conversaciones: Mapped[List["Conversacion"]] = relationship(
        back_populates="estudiante", cascade="all, delete-orphan"
    )


# ── Conversacion ────────────────────────────────────────────────────

class Conversacion(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("students.id"), nullable=False
    )
    intent_type: Mapped[str] = mapped_column(
        SAEnum("CU00", "CU01", "CU02", "CU03", "CU04", name="intent_type"),
        nullable=False,
        default="CU00"
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    closed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    total_messages: Mapped[int] = mapped_column(Integer, default=0)

    # Relaciones
    estudiante: Mapped["Estudiante"] = relationship(back_populates="conversaciones")
    mensajes: Mapped[List["Mensaje"]] = relationship(
        back_populates="conversacion", cascade="all, delete-orphan"
    )


# ── Mensaje ─────────────────────────────────────────────────────────

class Mensaje(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False
    )
    role: Mapped[str] = mapped_column(
        SAEnum("user", "assistant", name="message_role"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    tokens_used: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    rag_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relaciones
    conversacion: Mapped["Conversacion"] = relationship(back_populates="mensajes")
    fuentes_citadas: Mapped[List["FuenteCitada"]] = relationship(
        back_populates="mensaje", cascade="all, delete-orphan"
    )


# ── Documento Normativo ─────────────────────────────────────────────

class DocumentoNormativo(Base):
    __tablename__ = "normative_documents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    doc_type: Mapped[str] = mapped_column(
        SAEnum("reglamento", "resolucion", "directiva", name="doc_type_enum"),
        nullable=False,
    )
    official_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    published_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    ingested_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relaciones
    chunks: Mapped[List["ChunkNormativo"]] = relationship(
        back_populates="documento", cascade="all, delete-orphan"
    )


# ── Chunk Normativo ─────────────────────────────────────────────────

class ChunkNormativo(Base):
    __tablename__ = "normative_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    document_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("normative_documents.id"), nullable=False
    )
    source_document: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    start_page: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    end_page: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    version: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    valid_from: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relaciones
    documento: Mapped["DocumentoNormativo"] = relationship(back_populates="chunks")
    fuentes_citadas: Mapped[List["FuenteCitada"]] = relationship(
        back_populates="chunk", cascade="all, delete-orphan"
    )


# ── Fuente Citada ───────────────────────────────────────────────────

class FuenteCitada(Base):
    __tablename__ = "cited_sources"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    message_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("messages.id"), nullable=False
    )
    chunk_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("normative_chunks.id"), nullable=False
    )
    position: Mapped[int] = mapped_column(Integer, default=0)
    similarity_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Relaciones
    mensaje: Mapped["Mensaje"] = relationship(back_populates="fuentes_citadas")
    chunk: Mapped["ChunkNormativo"] = relationship(back_populates="fuentes_citadas")


