"""
User profile statistics schema.
"""

from pydantic import BaseModel


class ProfileStats(BaseModel):
    total_notes: int
    total_flashcards: int
    organized_notes: int
    streak_days: int
