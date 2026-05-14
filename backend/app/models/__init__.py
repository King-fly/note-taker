"""SQLAlchemy models – importing all submodules registers each model on Base."""

from app.models import user  # noqa: F401
from app.models import note  # noqa: F401
from app.models import flashcard  # noqa: F401
from app.models import vocabulary  # noqa: F401
from app.models import sync_log  # noqa: F401
