"""
Flashcard model – auto-generated review cards from notes.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class CardDifficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ReviewStatus(str, enum.Enum):
    NEW = "new"
    LEARNING = "learning"
    REVIEW = "review"
    GRADUATED = "graduated"


class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    note_id = Column(String(36), ForeignKey("notes.id", ondelete="CASCADE"), nullable=True, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    tags = Column(String(1000), nullable=True)  # JSON list
    difficulty = Column(Enum(CardDifficulty), default=CardDifficulty.MEDIUM, nullable=False)
    review_status = Column(Enum(ReviewStatus), default=ReviewStatus.NEW, nullable=False)

    # Spaced repetition fields
    ease_factor = Column(Float, default=2.5, nullable=False)
    interval_days = Column(Integer, default=0, nullable=False)
    next_review_date = Column(DateTime(timezone=True), nullable=True)
    review_count = Column(Integer, default=0, nullable=False)
    last_review_date = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.current_timestamp(),
        nullable=False,
    )

    # Relationships
    owner = relationship("User", back_populates="flashcards")
    note = relationship("Note", back_populates="flashcards")

    __table_args__ = (Index("ix_flashcards_user_status", "user_id", "review_status"),)

    def __repr__(self):
        return f"<Flashcard(id={self.id}, status={self.review_status})>"
