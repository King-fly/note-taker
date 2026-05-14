"""
FastAPI application entry point.
"""

from app.lifespan import create_application

app = create_application()
