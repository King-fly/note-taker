"""
SQLAlchemy engine, session, and Base declarative base.
Uses SQLite for development and supports MySQL/PostgreSQL in production.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings

settings = get_settings()

# Sync engine (Alembic + sync operations)
engine = create_engine(
    settings.DATABASE_URL_SYNC,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL_SYNC else {},
    pool_pre_ping=True,
)

# Async-compatible session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Yield a request-scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables defined by SQLAlchemy models."""
    Base.metadata.create_all(bind=engine)
