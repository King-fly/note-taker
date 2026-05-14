"""
Health check endpoint.
"""

from fastapi import APIRouter

from app.schemas.models import MessageResponse

router = APIRouter()


@router.get("/health", tags=["health"])
def health_check() -> MessageResponse:
    return MessageResponse(message="ok")
