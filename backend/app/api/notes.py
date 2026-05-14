"""
Notes CRUD routes.

Supports:
- Create quick-notes (voice, OCR, text, image)
- List / search / filter notes
- Mark notes as organized
- Trigger AI-powered auto-organization (Celery async)
"""

import json
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.database import get_db
from app.models.note import Note, NoteTemplate, NoteType
from app.models.user import User
from app.schemas.models import (
    MessageResponse,
    NoteCreate,
    NoteListResponse,
    NoteOrganize,
    NoteResponse,
    NoteUpdate,
)
from app.tasks.note_tasks import organize_note_task

logger = logging.getLogger(__name__)

router = APIRouter()


# ── DTO for note list query ────────────────────────────────────────

class NoteListQuery(BaseModel):
    search: Optional[str] = Query(None, description="Full-text search on title")
    subject: Optional[str] = Query(None, description="Filter by subject")
    is_organized: Optional[bool] = Query(None, description="Filter by organization status")
    note_type: Optional[NoteType] = Query(None, description="Filter by note type")
    page: int = Query(1, ge=1, description="Page number")
    page_size: int = Query(20, ge=1, le=100, description="Items per page")


# ── Endpoints ──────────────────────────────────────────────────────

@router.post("/notes", response_model=NoteResponse, status_code=201, tags=["notes"])
def create_note(
    body: NoteCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Note:
    """Create a new quick-note (raw capture)."""
    note = Note(
        user_id=current_user["user_id"],
        title=body.title,
        content=body.content,
        raw_content=body.raw_content,
        note_type=body.note_type,
        subject=body.subject,
        tags=json.dumps(body.tags) if body.tags else None,
        confidence_score=body.confidence_score,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/notes", response_model=NoteListResponse, tags=["notes"])
def list_notes(
    query: NoteListQuery = Depends(),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> NoteListResponse:
    """List and search the user's notes with filtering & pagination."""
    q = db.query(Note).filter(Note.user_id == current_user["user_id"])

    if query.search:
        pattern = f"%{query.search}%"
        q = q.filter(or_(Note.title.ilike(pattern), Note.content.ilike(pattern)))
    if query.subject:
        q = q.filter(Note.subject == query.subject)
    if query.is_organized is not None:
        q = q.filter(Note.is_organized == query.is_organized)
    if query.note_type:
        q = q.filter(Note.note_type == query.note_type)

    total = q.count()
    items = (
        q.order_by(Note.created_at.desc())
        .offset((query.page - 1) * query.page_size)
        .limit(query.page_size)
        .all()
    )
    return NoteListResponse(total=total, items=[NoteResponse.model_validate(n) for n in items])


@router.get("/notes/{note_id}", response_model=NoteResponse, tags=["notes"])
def get_note(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Note:
    """Retrieve a single note by ID."""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user["user_id"]).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/notes/{note_id}", response_model=NoteResponse, tags=["notes"])
def update_note(
    note_id: str,
    body: NoteUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Note:
    """Update a note's metadata (title, subject, tags, content)."""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user["user_id"]).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(note, field, value)
    if body.tags:
        note.tags = json.dumps(body.tags)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/notes/{note_id}", response_model=MessageResponse, tags=["notes"])
def delete_note(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Delete a note."""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user["user_id"]).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return MessageResponse(message="Note deleted")


@router.post("/notes/{note_id}/organize", response_model=NoteResponse, tags=["notes"])
def organize_note(
    note_id: str,
    body: NoteOrganize,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Note:
    """Trigger AI-powered organisation via Celery background task."""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user["user_id"]).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.is_organized:
        raise HTTPException(status_code=400, detail="Note is already organized")

    # Don't allow organizing if there's no content to work with
    content = note.raw_content or note.content or ""
    if not content.strip():
        raise HTTPException(status_code=400, detail="Note has no content to organize")

    note.template = body.template
    note.organize_status = "pending"
    db.commit()
    db.refresh(note)

    # Queue async organization
    organize_note_task.delay(note_id, body.template)
    return note


@router.delete("/notes/{note_id}/organize", response_model=MessageResponse, tags=["notes"])
def cancel_organize(
    note_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """Cancel in-progress AI organization."""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user["user_id"]).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.organize_status in ("pending", "processing"):
        note.organize_status = "failed"
        db.commit()
        return MessageResponse(message="Organization cancelled")
    return MessageResponse(message="Note is not being organized")
