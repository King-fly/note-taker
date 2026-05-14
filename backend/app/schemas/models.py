"""
Pydantic response / request schemas.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


# ── Auth ───────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    display_name: Optional[str] = None
    grade: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ── User ───────────────────────────────────────────────────────────

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    display_name: Optional[str]
    avatar_url: Optional[str]
    grade: Optional[str]
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    grade: Optional[str] = None


# ── Enums ──────────────────────────────────────────────────────────

class NoteType(str, Enum):
    VOICE = "voice"
    OCR = "ocr"
    TEXT = "text"
    IMAGE = "image"


class NoteTemplate(str, Enum):
    CORNELL = "康奈尔"
    MIND_MAP = "思维导图"
    FORMULA = "理科公式"
    FRAMEWORK = "文科框架"


class CardDifficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class ReviewStatus(str, Enum):
    NEW = "new"
    LEARNING = "learning"
    REVIEW = "review"
    GRADUATED = "graduated"


# ── Note ───────────────────────────────────────────────────────────

class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: Optional[str] = None
    raw_content: Optional[str] = None
    note_type: NoteType = NoteType.TEXT
    subject: Optional[str] = None
    tags: Optional[list[str]] = None
    confidence_score: Optional[float] = None


class NoteOrganize(BaseModel):
    template: NoteTemplate


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    subject: Optional[str] = None
    tags: Optional[list[str]] = None


class NoteResponse(BaseModel):
    id: str
    title: str
    content: Optional[str]
    raw_content: Optional[str]
    note_type: str
    template: Optional[str]
    subject: Optional[str]
    tags: Optional[list[str]] = None
    is_organized: bool
    organize_status: Optional[str]
    ai_summary: Optional[str]
    confidence_score: Optional[float]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    organized_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

    @field_validator("tags", mode="before")
    @classmethod
    def _parse_tags(cls, value: Any) -> Optional[list[str]]:
        if value is None:
            return None
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            import json
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, list) else None
            except (json.JSONDecodeError, TypeError):
                return None
        return None


class NoteListResponse(BaseModel):
    total: int
    items: list[NoteResponse]


# ── Flashcard ──────────────────────────────────────────────────────

class FlashcardCreate(BaseModel):
    note_id: Optional[str] = None
    question: str
    answer: str
    tags: Optional[list[str]] = None
    difficulty: CardDifficulty = CardDifficulty.MEDIUM


class FlashcardAssessment(BaseModel):
    difficulty: CardDifficulty  # easy / hard


class FlashcardResponse(BaseModel):
    id: str
    note_id: Optional[str]
    question: str
    answer: str
    tags: Optional[list[str]] = None
    difficulty: str
    review_status: str
    interval_days: int
    next_review_date: Optional[datetime]
    review_count: int
    created_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)

    @field_validator("tags", mode="before")
    @classmethod
    def _parse_tags(cls, value: Any) -> Optional[list[str]]:
        if value is None:
            return None
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            import json
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, list) else None
            except (json.JSONDecodeError, TypeError):
                return None
        return None


class FlashcardListResponse(BaseModel):
    total: int
    items: list[FlashcardResponse]


# ── Vocabulary ─────────────────────────────────────────────────────

class VocabularyCreate(BaseModel):
    word: str = Field(..., min_length=1, max_length=200)
    shortcut: str = Field(..., min_length=1, max_length=20)
    category: Optional[str] = None


class VocabularyUpdate(BaseModel):
    word: Optional[str] = None
    category: Optional[str] = None


class VocabularyResponse(BaseModel):
    id: str
    word: str
    shortcut: str
    category: Optional[str]
    created_at: Optional[datetime]
    model_config = ConfigDict(from_attributes=True)


# ── Generic ────────────────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str


class ProfileStats(BaseModel):
    total_notes: int
    total_flashcards: int
    organized_notes: int
    streak_days: int
