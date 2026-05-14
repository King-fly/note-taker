"""
Sync log – tracks user's cloud sync activity.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(50), nullable=False)  # create / update / delete / organize
    entity_type = Column(String(50), nullable=False)  # note / flashcard / vocab
    entity_id = Column(String(36), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    client_id = Column(String(36), nullable=True)  # device identifier

    user = relationship("User", back_populates="sync_logs")

    def __repr__(self):
        return f"<SyncLog(action={self.action}, entity={self.entity_type})>"
