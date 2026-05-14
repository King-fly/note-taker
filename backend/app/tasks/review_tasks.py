"""
Celery tasks for review / flashcard generation.
"""

import json
import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.flashcard import CardDifficulty, Flashcard, ReviewStatus
from app.models.note import Note
from app.services.ai_service import generate_flashcards as _generate_flashcards

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=2, name="app.tasks.review_tasks.generate_flashcards_task")
def generate_flashcards_task(self, note_id: str) -> dict:
    """Background task to generate flashcards from a note using AI.

    Args:
        note_id: Primary key of the note to generate flashcards from.
    """
    db: Session = SessionLocal()
    try:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            logger.info("Note %s not found for flashcard generation", note_id)
            return {"status": "skipped"}

        # Check if this note already has flashcards to avoid duplicates
        existing_count = db.query(Flashcard).filter(
            Flashcard.note_id == note_id
        ).count()
        if existing_count > 0:
            logger.info("Note %s already has %d flashcards, skipping generation", note_id, existing_count)
            return {"status": "skipped", "reason": "already_has_flashcards"}

        content = note.content or note.raw_content or ""
        if not content.strip():
            logger.info("Note %s has no content for flashcard generation", note_id)
            return {"status": "no_content"}

        logger.info("Generating flashcards for note %s (user: %s)", note_id, note.user_id)
        cards_data = _generate_flashcards(content)

        if not cards_data:
            logger.warning("No cards generated for note %s", note_id)
            return {"status": "no_cards", "note_id": note_id}

        created = 0
        for card_data in cards_data:
            # Skip cards with empty question or answer
            question = card_data.get("question", "").strip()
            answer = card_data.get("answer", "").strip()
            if not question or not answer:
                continue
            card = Flashcard(
                user_id=note.user_id,
                note_id=note_id,
                question=question,
                answer=answer,
                tags=json.dumps(card_data.get("tags", [])) if card_data.get("tags") else None,
                difficulty=CardDifficulty(card_data.get("difficulty", "medium")),
                review_status=ReviewStatus.NEW,
                ease_factor=2.5,
                interval_days=0,
                next_review_date=datetime.now(timezone.utc),  # due immediately
                review_count=0,
            )
            db.add(card)
            created += 1

        db.commit()

        return {
            "status": "completed",
            "note_id": note_id,
            "cards_generated": created,
        }

    except Exception as exc:
        logger.exception("Failed to generate flashcards for note %s: %s", note_id, exc)
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
    finally:
        try:
            db.close()
        except Exception:
            pass
