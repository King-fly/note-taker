"""
Celery task for voice transcription using Whisper.
"""

import base64
import logging
import tempfile
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.note import Note

logger = logging.getLogger(__name__)


@celery_app.task(bind=True, max_retries=3, name="app.tasks.transcribe_tasks.transcribe_audio_task")
def transcribe_audio_task(self, note_id: str, audio_b64: str, language: str = "zh", model: str = "medium") -> dict:
    """Background task to transcribe audio using Whisper.

    Args:
        note_id: Primary key of the note to update with transcription.
        audio_b64: Base64-encoded audio data.
        language: Language code (e.g. 'zh', 'en').
        model: Whisper model size: 'tiny', 'base', 'small', 'medium'.
    """
    db: Session = SessionLocal()
    try:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            logger.warning("Note %s not found for transcription", note_id)
            return {"status": "failed", "reason": "note_not_found"}

        import whisper
        import torch

        cache_dir = Path.home() / ".cache" / "whisper"
        model_path = cache_dir / f"{model}.pt"
        
        if not model_path.exists():
            logger.info("Downloading Whisper %s model to %s", model, cache_dir)
        
        whisper_model = whisper.load_model(model, download_root=str(cache_dir))

        audio_data = audio_b64
        if "," in audio_data:
            audio_data = audio_data.split(",", 1)[1]

        try:
            audio_bytes = base64.b64decode(audio_data)
        except Exception as exc:
            logger.error("Invalid base64 audio: %s", exc)
            return {"status": "failed", "reason": "invalid_base64"}

        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(audio_bytes)
            audio_path = f.name

        logger.info("Transcribing audio for note %s with model %s", note_id, model)

        result = whisper_model.transcribe(
            audio_path,
            language=language if language else None,
            fp16=torch.cuda.is_available(),
        )

        Path(audio_path).unlink(missing_ok=True)

        transcription = result.get("text", "").strip()
        if not transcription:
            logger.warning("Whisper returned empty transcription for note %s", note_id)
            return {"status": "failed", "reason": "empty_transcription"}

        note.content = transcription
        note.raw_content = transcription
        note.ai_summary = f"录音转写 | 时长: {result.get('duration', 0):.1f}秒 | 语言: {result.get('language', language)}"
        db.commit()

        logger.info("Transcription completed for note %s", note_id)
        return {
            "status": "completed",
            "note_id": note_id,
            "text": transcription,
            "duration": result.get("duration", 0),
            "language": result.get("language", language),
        }

    except whisper._download.GradioVisibilityError:
        logger.error("Whisper model not found: %s", model)
        return {"status": "failed", "reason": "model_not_found"}
    except FileNotFoundError:
        logger.error("Whisper model file not found: %s", model)
        return {"status": "failed", "reason": "model_file_not_found"}
    except Exception as exc:
        logger.exception("Transcription failed for note %s: %s", note_id, exc)
        try:
            note = db.query(Note).filter(Note.id == note_id).first()
            if note:
                note.ai_summary = f"转写失败: {exc}"
                db.commit()
        except Exception:
            pass
        raise self.retry(exc=exc, countdown=30 * (2 ** self.request.retries))
    finally:
        try:
            db.close()
        except Exception:
            pass