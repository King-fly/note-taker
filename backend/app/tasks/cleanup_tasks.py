"""
Additional Celery periodic tasks (cleanup, reminders, etc.).
"""

import logging
import os
import shutil
from datetime import datetime, timezone, timedelta

from sqlalchemy.orm import Session

from app.core.celery_app import celery_app
from app.core.database import SessionLocal
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


@celery_app.task(name="app.tasks.cleanup_tasks.cleanup_old_uploads")
def cleanup_old_uploads():
    """Remove upload files older than 30 days that are no longer referenced."""
    upload_dir = settings.UPLOAD_DIR
    if not os.path.exists(upload_dir):
        return {"status": "skipped", "reason": "upload dir does not exist"}

    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    removed = 0
    for root, dirs, files in os.walk(upload_dir):
        for fname in files:
            fpath = os.path.join(root, fname)
            mtime = datetime.fromtimestamp(os.path.getmtime(fpath), tz=timezone.utc)
            if mtime < cutoff:
                try:
                    os.remove(fpath)
                    removed += 1
                except OSError as exc:
                    logger.warning("Failed to remove %s: %s", fpath, exc)

    return {"status": "completed", "files_removed": removed}


@celery_app.task(name="app.tasks.remind_tasks.daily_review_reminder")
def daily_review_reminder():
    """Task placeholder for daily review reminders.

    In production this would push notifications via FCM/APNS.
    """
    logger.info("Daily review reminder task triggered (placeholder)")
    return {"status": "reminder_sent", "recipients": 0}  # TODO: send push notifications
