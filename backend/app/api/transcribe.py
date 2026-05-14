"""
Voice transcription route using local Whisper model (synchronous or Celery).
"""

import base64
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.monitoring_deps import monitor_task
from app.models.note import Note

logger = logging.getLogger(__name__)
router = APIRouter()


class TranscribeRequest(BaseModel):
    """Submit audio (base64) for transcription."""
    audio_b64: str = Field(..., description="Base64-encoded audio (WAV/MP3/M4A/WebM).")
    language: str = Field("zh", description="Language code (e.g. 'zh', 'en').")
    model: str = Field("medium", description="Whisper model size: 'tiny', 'base', 'small', 'medium'.")
    async_mode: bool = Field(False, description="Use Celery background task for long audio.")


class TranscribeResponse(BaseModel):
    """Transcription result."""
    text: str
    language: str
    duration: float = 0.0
    task_id: str | None = None


def get_whisper_model(model_name: str = "medium"):
    """Load or return cached Whisper model."""
    import whisper
    cache_dir = Path.home() / ".cache" / "whisper"
    return whisper.load_model(model_name, download_root=str(cache_dir))


@router.post("/transcribe", response_model=TranscribeResponse, tags=["voice"])
def transcribe_audio(
    body: TranscribeRequest,
    current_user: dict = Depends(get_current_user),
) -> TranscribeResponse:
    """Transcribe audio using local Whisper model (sync or async via Celery)."""
    with monitor_task("transcribe_audio"):
        import tempfile

        audio_data = body.audio_b64
        if audio_data.startswith("data:"):
            parts = audio_data.split(",", 1)
            if len(parts) == 2:
                audio_data = parts[1]

        try:
            audio_bytes = base64.b64decode(audio_data)
        except Exception as exc:
            logger.error("Invalid base64 audio: %s", exc)
            raise HTTPException(status_code=400, detail=f"Invalid base64 audio: {exc}")

        model_size = len(audio_bytes) / (1024 * 1024)
        logger.info("Audio size: %.2f MB, async_mode: %s", model_size, body.async_mode)

        if body.async_mode or model_size > 5:
            return _transcribe_async(body, audio_data, current_user)
        else:
            return _transcribe_sync(body, audio_data)


def _transcribe_sync(body: TranscribeRequest, audio_data: str) -> TranscribeResponse:
    """Synchronous transcription for small audio files."""
    import whisper
    import tempfile
    import torch

    try:
        cache_dir = Path.home() / ".cache" / "whisper"
        model_path = cache_dir / f"{body.model}.pt"
        
        logger.info("Loading Whisper model: %s from %s", body.model, model_path)
        
        if not model_path.exists():
            logger.warning("Model file not found at %s, will download", model_path)
        
        model = whisper.load_model(body.model, download_root=str(cache_dir))
        logger.info("Whisper model loaded successfully")

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(base64.b64decode(audio_data))
            audio_path = f.name
        
        logger.info("Transcribing audio file: %s", audio_path)

        result = model.transcribe(
            audio_path,
            language=body.language if body.language else None,
            fp16=torch.cuda.is_available(),
        )
        
        logger.info("Transcription result: %s", result.get("text", ""))

        Path(audio_path).unlink(missing_ok=True)

        return TranscribeResponse(
            text=result["text"],
            language=result.get("language", body.language),
            duration=result.get("duration", 0.0),
        )
    except whisper._download.GradioVisibilityError:
        logger.error("Whisper model not found")
        raise HTTPException(status_code=503, detail="Whisper model not found. Please ensure models are downloaded.")
    except FileNotFoundError as e:
        logger.error("Whisper model file not found: %s", e)
        raise HTTPException(status_code=503, detail=f"Whisper model '{body.model}' not found in ~/.cache/whisper/")
    except Exception as exc:
        logger.exception("Transcription failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}")


def _transcribe_async(body: TranscribeRequest, audio_data: str, current_user: dict) -> TranscribeResponse:
    """Submit transcription as a Celery background task."""
    try:
        from app.tasks.transcribe_tasks import transcribe_audio_task
        from app.core.database import SessionLocal
        from app.models.note import Note

        db = SessionLocal()
        try:
            note = Note(
                user_id=current_user.get("sub") or current_user.get("id"),
                title="录音转写中...",
                raw_content="",
                content="",
                note_type="voice",
                is_organized=False,
                organize_status="processing",
            )
            db.add(note)
            db.commit()
            db.refresh(note)
            note_id = note.id
        finally:
            db.close()

        task = transcribe_audio_task.delay(note_id, audio_data, body.language, body.model)

        return TranscribeResponse(
            text="",
            language=body.language,
            duration=0.0,
            task_id=task.id,
        )
    except Exception as exc:
        logger.warning("Celery not available, falling back to sync mode: %s", exc)
        return _transcribe_sync(body, audio_data)