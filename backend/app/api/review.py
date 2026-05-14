"""
Review / flashcard routes.

Supports:
- Auto-generate flashcards from notes (Celery async)
- List flashcards due for review
- Mark cards as easy/hard (spaced repetition)
"""

import json
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.database import get_db
from app.models.flashcard import CardDifficulty, Flashcard, ReviewStatus
from app.models.vocabulary import Vocabulary
from app.schemas.models import (
    FlashcardAssessment,
    FlashcardCreate,
    FlashcardListResponse,
    FlashcardResponse,
    MessageResponse,
    VocabularyCreate,
    VocabularyResponse,
)
from app.models.note import Note
from app.tasks.review_tasks import generate_flashcards_task

router = APIRouter()


class FlashcardListQuery(BaseModel):
    status: Optional[ReviewStatus] = Query(None, description="Filter by review status")
    subject: Optional[str] = Query(None, description="Filter by subject tag")
    page: int = Query(1, ge=1)
    page_size: int = Query(10, ge=1, le=50)


# ── Endpoints ──────────────────────────────────────────────────────

@router.post("/review/flashcards", response_model=FlashcardResponse, status_code=201, tags=["review"])
def create_flashcard(
    body: FlashcardCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Flashcard:
    """Create a manual flashcard."""
    card = Flashcard(
        user_id=current_user["user_id"],
        note_id=body.note_id,
        question=body.question,
        answer=body.answer,
        tags=json.dumps(body.tags) if body.tags else None,
        difficulty=body.difficulty,
    )
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


@router.post("/review/flashcards/generate", response_model=MessageResponse, tags=["review"])
def generate_flashcards(
    note_id: str = Query(..., description="Note ID to generate flashcards from"),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Trigger async flashcard generation from a note via Celery."""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user["user_id"]).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    generate_flashcards_task.delay(note_id)
    return MessageResponse(message="Flashcard generation queued")


@router.get("/review/flashcards/due", response_model=FlashcardListResponse, tags=["review"])
def get_due_flashcards(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FlashcardListResponse:
    """Get flashcards due for review today or earlier."""
    now = datetime.now(timezone.utc)
    cards = (
        db.query(Flashcard)
        .filter(
            Flashcard.user_id == current_user["user_id"],
            Flashcard.review_status != ReviewStatus.GRADUATED,
            or_(
                Flashcard.next_review_date.is_(None),
                Flashcard.next_review_date <= now,
            ),
        )
        .order_by(Flashcard.difficulty.asc(), Flashcard.next_review_date.asc())
        .all()
    )
    return FlashcardListResponse(total=len(cards), items=[FlashcardResponse.model_validate(c) for c in cards])


@router.get("/review/flashcards", response_model=FlashcardListResponse, tags=["review"])
def list_flashcards(
    query: FlashcardListQuery = Depends(),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FlashcardListResponse:
    """List user's flashcards with optional filtering."""
    q = db.query(Flashcard).filter(Flashcard.user_id == current_user["user_id"])
    if query.status:
        q = q.filter(Flashcard.review_status == query.status)
    if query.subject:
        q = q.filter(Flashcard.tags.contains(f'"{query.subject}"'))
    total = q.count()
    items = (
        q.order_by(Flashcard.next_review_date.asc())
        .offset((query.page - 1) * query.page_size)
        .limit(query.page_size)
        .all()
    )
    return FlashcardListResponse(total=total, items=[FlashcardResponse.model_validate(c) for c in items])


@router.get("/review/flashcards/{card_id}", response_model=FlashcardResponse, tags=["review"])
def get_flashcard(
    card_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Flashcard:
    card = db.query(Flashcard).filter(Flashcard.id == card_id, Flashcard.user_id == current_user["user_id"]).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return card


@router.put("/review/flashcards/{card_id}/assess", response_model=FlashcardResponse, tags=["review"])
def assess_flashcard(
    card_id: str,
    body: FlashcardAssessment,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Flashcard:
    """Assess a flashcard (easy/hard) using SM-2 spaced repetition algorithm."""
    card = db.query(Flashcard).filter(Flashcard.id == card_id, Flashcard.user_id == current_user["user_id"]).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    # SM-2 algorithm
    ease = card.ease_factor
    # Map assessment to SM-2 quality (0-5 scale): hard=3, easy=5
    quality = 5 if body.difficulty == CardDifficulty.EASY else 3

    if quality >= 3:
        if quality == 5:  # easy
            ease = max(1.3, ease + 0.1)
        else:  # hard (quality=3)
            ease = max(1.3, ease - 0.2)
        interval = _next_interval(card.interval_days, ease, quality)
        card.review_status = ReviewStatus.REVIEW
    else:
        ease = max(1.3, ease - 0.2)
        interval = 1
        card.review_status = ReviewStatus.LEARNING

    card.ease_factor = round(ease, 2)
    card.interval_days = interval
    card.review_count += 1
    card.last_review_date = datetime.now(timezone.utc)
    # next_review_date = now + interval days
    card.next_review_date = datetime.now(timezone.utc) + timedelta(days=interval)

    db.commit()
    db.refresh(card)
    return card


@router.delete("/review/flashcards/{card_id}", response_model=MessageResponse, tags=["review"])
def delete_flashcard(
    card_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    card = db.query(Flashcard).filter(Flashcard.id == card_id, Flashcard.user_id == current_user["user_id"]).first()
    if not card:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    db.delete(card)
    db.commit()
    return MessageResponse(message="Flashcard deleted")


# ── Helpers ────────────────────────────────────────────────────────

def _next_interval(interval_days: int, ease_factor: float, quality: int = 5) -> int:
    """Compute next review interval (days) using SM-2."""
    if quality >= 3:
        if interval_days == 0:
            return 1
        elif interval_days == 1:
            return 6
        else:
            return max(1, round(interval_days * ease_factor))
    else:
        return 1  # must review again


# ── Vocabulary ─────────────────────────────────────────────────────

@router.get("/vocab", response_model=list[VocabularyResponse], tags=["review"])
def list_vocab(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[VocabularyResponse]:
    items = db.query(Vocabulary).filter(Vocabulary.user_id == current_user["user_id"]).all()
    return [VocabularyResponse.model_validate(v) for v in items]


@router.post("/vocab", response_model=VocabularyResponse, status_code=201, tags=["review"])
def create_vocab(
    body: VocabularyCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VocabularyResponse:
    # Check uniqueness of shortcut
    existing = db.query(Vocabulary).filter(
        Vocabulary.user_id == current_user["user_id"],
        Vocabulary.shortcut == body.shortcut,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Shortcut already exists")

    vocab = Vocabulary(
        user_id=current_user["user_id"],
        word=body.word,
        shortcut=body.shortcut,
        category=body.category,
    )
    db.add(vocab)
    db.commit()
    db.refresh(vocab)
    return VocabularyResponse.model_validate(vocab)


@router.delete("/vocab/{vocab_id}", response_model=MessageResponse, tags=["review"])
def delete_vocab(
    vocab_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    vocab = db.query(Vocabulary).filter(
        Vocabulary.id == vocab_id, Vocabulary.user_id == current_user["user_id"]
    ).first()
    if not vocab:
        raise HTTPException(status_code=404, detail="Vocabulary not found")
    db.delete(vocab)
    db.commit()
    return MessageResponse(message="Vocabulary deleted")
