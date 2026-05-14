"""
Application configuration using pydantic-settings with environment variable support.
"""

from functools import lru_cache
from typing import Any, List, Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    # ── General ──────────────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    PROJECT_NAME: str = "ClassSync - AI Classroom Note Taker"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── Database ─────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./notes_taker.db"
    DATABASE_URL_SYNC: str = "sqlite:///./notes_taker.db"

    # ── Redis / Celery ──────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    CELERY_WORKER_CONCURRENCY: int = 4
    CELERY_WORKER_PREFETCH_MULTIPLIER: int = 1
    FLOWER_PORT: int = 5555

    # ── Authentication ───────────────────────────────────────────────
    SECRET_KEY: str = "change-this-to-a-random-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24h
    ALGORITHM: str = "HS256"
    HASHING_ALGORITHM: str = "bcrypt"

    # ── Local MLX Inference Server ───────────────────────────────────
    LOCAL_AI_BASE_URL: str = "http://127.0.0.1:8085/v1"
    LOCAL_AI_API_KEY: str = "omlx-yqha5fy1fm9aufeo"
    LOCAL_AI_MODEL: str = "Qwen3.6-35B-A3B-UD-MLX-4bit"

    # ── File Upload ──────────────────────────────────────────────────
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10 MB
    UPLOAD_DIR: str = "uploads"

    # ── Monitoring ───────────────────────────────────────────────────
    METRICS_ENABLED: bool = True
    METRICS_PORT: int = 9090
    LOG_LEVEL: str = "INFO"

    # ── CORS ─────────────────────────────────────────────────────────
    CORS_ORIGINS: Any = '["http://localhost:3000","http://localhost:5173","http://127.0.0.1:3000","http://127.0.0.1:5173"]'

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value):
        import json

        # Already a list (from dotenv multi-line or programmatic)
        if isinstance(value, (list, tuple)):
            return [str(v).strip() for v in value]
        # JSON array string
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(v).strip() for v in parsed]
            except json.JSONDecodeError:
                pass
            # Fallback: comma-separated
            return [o.strip() for o in value.split(",") if o.strip()]
        return value

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (singleton)."""
    return Settings()