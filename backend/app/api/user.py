"""
User profile routes: get/update profile, get stats.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.models import MessageResponse, UserUpdate, UserProfile
from app.schemas.user import ProfileStats

router = APIRouter()


def _get_current_user_or_raise(db: Session, current_user: dict) -> User:
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/user/profile", response_model=UserProfile, tags=["user"])
def get_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    return _get_current_user_or_raise(db, current_user)


@router.put("/user/profile", response_model=UserProfile, tags=["user"])
def update_profile(
    body: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserProfile:
    user = _get_current_user_or_raise(db, current_user)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return UserProfile.model_validate(user)


@router.get("/user/stats", response_model=ProfileStats, tags=["user"])
def get_user_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileStats:
    """Return summary statistics for the authenticated user."""
    from app.models.note import Note
    from app.models.flashcard import Flashcard

    user = _get_current_user_or_raise(db, current_user)
    total_notes = db.query(Note).filter(Note.user_id == user.id).count()
    total_flashcards = db.query(Flashcard).filter(Flashcard.user_id == user.id).count()
    organized_notes = db.query(Note).filter(Note.user_id == user.id, Note.is_organized.is_(True)).count()
    return ProfileStats(
        total_notes=total_notes,
        total_flashcards=total_flashcards,
        organized_notes=organized_notes,
        streak_days=0,  # TODO: compute streak
    )
