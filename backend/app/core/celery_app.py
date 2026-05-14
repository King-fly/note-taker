"""
Celery application configuration with Redis broker / result backend.
"""

import os

from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "classsync_tasks",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Shanghai",
    enable_utc=True,
    worker_concurrency=settings.CELERY_WORKER_CONCURRENCY,
    worker_prefetch_multiplier=settings.CELERY_WORKER_PREFETCH_MULTIPLIER,
    task_acks_late=True,
    task_track_started=True,
    # Timeouts & retries
    task_soft_time_limit=300,  # 5 min soft limit
    task_time_limit=600,  # 10 min hard limit
    broker_connection_retry_on_startup=True,
    # Beat schedule
    beat_schedule={
        "daily-review-reminder": {
            "task": "app.tasks.remind_tasks.daily_review_reminder",
            "schedule": 86400,  # every 24 hours
        },
        "cleanup-old-uploads": {
            "task": "app.tasks.cleanup_tasks.cleanup_old_uploads",
            "schedule": 86400 * 7,  # weekly
        },
    },
)

# Auto-discover task modules
celery_app.autodiscover_tasks(["app.tasks"], related_name=None)
