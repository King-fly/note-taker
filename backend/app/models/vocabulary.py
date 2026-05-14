"""
Vocabulary model – custom shortcut words for fast typing.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Vocabulary(Base):
    __tablename__ = "vocabularies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    word = Column(String(200), nullable=False)
    shortcut = Column(String(20), nullable=False)
    category = Column(String(50), nullable=True)  # 学科分类
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    owner = relationship("User", back_populates="vocabularies")

    __table_args__ = (
        # Prevent duplicate shortcuts per user
    )

    def __repr__(self):
        return f"<Vocabulary(id={self.id}, word={self.word}, shortcut=/{self.shortcut})>"
