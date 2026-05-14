"""Celery background tasks"""

# Import all task modules so they are registered with the Celery app.
# These imports are required because autodiscover_tasks may not catch
# submodules that haven't been imported yet.
from app.tasks import cleanup_tasks, note_tasks, review_tasks  # noqa: F401
