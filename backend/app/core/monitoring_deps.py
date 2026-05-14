"""
Monitoring-related dependencies and utilities.
"""

from fastapi import Depends, HTTPException, status
from typing import Optional
import time
import asyncio
from contextlib import contextmanager

from app.core.config import get_settings
from app.core.monitoring import (
    REQUEST_COUNT, 
    REQUEST_DURATION, 
    ACTIVE_REQUESTS, 
    ERROR_COUNT,
    record_task_completion,
    record_ai_api_call
)
import structlog

logger = structlog.get_logger(__name__)


def get_monitoring_enabled():
    """Dependency to check if monitoring is enabled."""
    settings = get_settings()
    return settings.METRICS_ENABLED


@contextmanager
def monitor_task(task_name: str):
    """Context manager to monitor task execution."""
    start_time = time.time()
    try:
        logger.info(f"Starting task: {task_name}")
        yield
        duration = time.time() - start_time
        record_task_completion(task_name, duration, success=True)
        logger.info(f"Task completed: {task_name}, Duration: {duration:.2f}s")
    except Exception as e:
        duration = time.time() - start_time
        record_task_completion(task_name, duration, success=False)
        logger.error(f"Task failed: {task_name}, Duration: {duration:.2f}s, Error: {str(e)}")
        raise


async def monitor_ai_call(provider: str, model: str, call_func, *args, **kwargs):
    """Monitor AI API calls."""
    start_time = time.time()
    try:
        result = await call_func(*args, **kwargs) if asyncio.iscoroutinefunction(call_func) else call_func(*args, **kwargs)
        duration = time.time() - start_time
        record_ai_api_call(provider, model, duration)
        return result
    except Exception as e:
        duration = time.time() - start_time
        logger.error(f"AI API call failed: {provider}/{model}, Duration: {duration:.2f}s, Error: {str(e)}")
        raise


def add_monitoring_middleware(app):
    """Add monitoring middleware to FastAPI app."""
    from app.core.monitoring import MetricsMiddleware
    app.add_middleware(MetricsMiddleware)