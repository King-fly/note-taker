"""
Note model – the central entity.  Supports raw quick-notes and
organised notes (Cornell, mind-map, formula, framework).
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class NoteType(str, enum.Enum):
    """Kinds of raw input."""
    VOICE = "voice"       # 语音转写
    OCR = "ocr"           # 拍照识别
    TEXT = "text"         # 快捷打字
    IMAGE = "image"       # 纯图片


class NoteTemplate(str, enum.Enum):
    """Organisation templates."""
    CORNELL = "康奈尔"
    MIND_MAP = "思维导图"
    FORMULA = "理科公式"
    FRAMEWORK = "文科框架"


class Note(Base):
    __tablename__ = "notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    raw_content = Column(Text, nullable=True)   # 原始速记内容
    note_type = Column(Enum(NoteType), nullable=False, default=NoteType.TEXT)
    template = Column(Enum(NoteTemplate), nullable=True)
    subject = Column(String(50), nullable=True)  # 数学, 物理, 英语 ...
    tags = Column(String(1000), nullable=True)   # JSON list of tag strings
    is_organized = Column(Boolean, default=False, nullable=False)
    organize_status = Column(String(20), nullable=True)  # pending / processing / completed / failed
    ocr_image_path = Column(String(500), nullable=True)
    audio_path = Column(String(500), nullable=True)
    confidence_score = Column(Float, nullable=True)
    ai_summary = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.current_timestamp(),
        nullable=False,
    )
    organized_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="notes")
    flashcards = relationship("Flashcard", back_populates="note", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_notes_user_organized", "user_id", "is_organized"),
        Index("ix_notes_user_subject", "user_id", "subject"),
    )

    def __repr__(self):
        return f"<Note(id={self.id}, title={self.title}, organized={self.is_organized})>"
