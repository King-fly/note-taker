"""
Application lifespan: startup and shutdown events.
"""

import logging

from fastapi import FastAPI

from app.core.database import init_db
from app.core.logging import setup_logging

logger = logging.getLogger(__name__)


def create_application() -> FastAPI:
    """Factory that creates and configures the FastAPI application."""
    app = FastAPI(
        title="ClassSync API",
        description="AI-powered classroom note-taking assistant backend.",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    # ── Middleware ──────────────────────────────────────────────────
    from fastapi.middleware.cors import CORSMiddleware
    from app.core.config import get_settings

    s = get_settings()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=s.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Lifespan ───────────────────────────────────────────────────
    @app.on_event("startup")
    def on_startup():
        setup_logging()
        logger.info("Starting %s v%s", s.PROJECT_NAME, s.VERSION)
        init_db()
        logger.info("Database tables initialized")

    @app.on_event("shutdown")
    def on_shutdown():
        logger.info("Shutting down %s", s.PROJECT_NAME)

    # ── Routes ─────────────────────────────────────────────────────
    from app.api import auth, notes, review, user, health, ocr, transcribe

    app.include_router(health.router, prefix=s.API_PREFIX, tags=["health"])
    app.include_router(auth.router, prefix=s.API_PREFIX, tags=["auth"])
    app.include_router(user.router, prefix=s.API_PREFIX, tags=["user"])
    app.include_router(notes.router, prefix=s.API_PREFIX, tags=["notes"])
    app.include_router(review.router, prefix=s.API_PREFIX, tags=["review"])
    app.include_router(ocr.router, prefix=s.API_PREFIX, tags=["ocr"])
    app.include_router(transcribe.router, prefix=s.API_PREFIX, tags=["voice"])

    return app