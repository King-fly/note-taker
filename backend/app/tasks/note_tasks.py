"""
Celery task for AI-powered note organization.
"""

import json
import logging

from sqlalchemy.orm import Session

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.note import Note, NoteTemplate
from app.services.ai_service import generate_text, generate_formula, generate_framework

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=2, name="app.tasks.note_tasks.organize_note_task")
def organize_note_task(self, note_id: str, template: str) -> dict:
    """Background task to organize a raw note using AI.

    Args:
        note_id: Primary key of the note to organize.
        template: Template type (康奈尔/思维导图/理科公式/文科框架).
    """
    db: Session = SessionLocal()
    try:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note or note.is_organized:
            logger.info("Note %s already organized or not found", note_id)
            return {"status": "skipped"}

        note.organize_status = "processing"
        db.commit()

        content = note.raw_content or note.content or ""
        subject = note.subject

        if not content.strip():
            logger.warning("Note %s has no content for organization", note_id)
            note.is_organized = True
            note.organize_status = "completed"
            note.content = ""
            db.commit()
            return {"status": "skipped", "reason": "no_content", "note_id": note_id}

        logger.info("Organizing note %s with template %s", note_id, template)

        organized_content = _produce_content(template, content, subject, note)
        if not organized_content or not organized_content.strip():
            logger.warning("AI returned empty content for note %s", note_id)
            note.is_organized = False
            note.organize_status = "failed"
            db.commit()
            return {"status": "failed", "reason": "empty_ai_response", "note_id": note_id}

        note.content = organized_content
        note.is_organized = True
        note.organize_status = "completed"
        db.commit()

        return {"status": "completed", "note_id": note_id}

    except Exception as exc:
        logger.exception("Failed to organize note %s: %s", note_id, exc)
        try:
            note = db.query(Note).filter(Note.id == note_id).first()
            if note:
                note.organize_status = "failed"
                db.commit()
        except Exception:
            pass
        try:
            db.close()
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
    finally:
        try:
            db.close()
        except Exception:
            pass


def _produce_content(template: str, content: str, subject: str | None, note: Note) -> str:
    """Call the appropriate AI template to produce organized content."""
    if template == NoteTemplate.CORNELL:
        return generate_cornell(content, subject)
    elif template == NoteTemplate.MIND_MAP:
        return generate_mindmap(content, subject)
    elif template == NoteTemplate.FORMULA:
        return generate_formula(content, subject)
    elif template == NoteTemplate.FRAMEWORK:
        return generate_framework(content, subject)
    else:
        return content


def _cornell_prompt(raw: str, subject: str | None) -> str:
    sub = f" Subject: {subject}" if subject else ""
    return (
        f"You are an expert study assistant. Convert the following raw classroom notes{sub} "
        f"into structured Cornell Notes with three sections: "
        f"1) Cues (key questions and terms), "
        f"2) Notes (detailed explanations), "
        f"3) Summary (one paragraph overview).\n\n"
        f"Raw notes:\n{raw[:4000]}\n\n"
        f"Output only the three sections, labeled with markdown headers."
    )


def generate_cornell(raw_content: str, subject: str | None) -> str:
    return generate_text(_cornell_prompt(raw_content, subject))


def _mindmap_prompt(raw: str, subject: str | None) -> str:
    sub = f" Subject: {subject}" if subject else ""
    return (
        f"Convert these raw notes{sub} into a hierarchical mind-map outline.\n\n"
        f"Raw notes:\n{raw[:4000]}\n\n"
        f"Use indented bullet points (1-4 levels deep). Start with main topic, then subtopics and details."
    )


def generate_mindmap(raw_content: str, subject: str | None) -> str:
    return generate_text(_mindmap_prompt(raw_content, subject))
