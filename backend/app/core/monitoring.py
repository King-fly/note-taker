"""
Production-grade monitoring setup with Prometheus metrics.
"""

import time
import logging
from contextlib import contextmanager
from typing import Dict, Optional

from prometheus_client import Counter, Histogram, Gauge, start_http_server
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import structlog

logger = structlog.get_logger(__name__)

# Define Prometheus metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of requests",
    ["method", "endpoint", "status"]
)

REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "Duration of HTTP requests in seconds",
    ["method", "endpoint"]
)

ACTIVE_REQUESTS = Gauge(
    "active_requests",
    "Number of active requests",
    ["method", "endpoint"]
)

DB_CONNECTIONS = Gauge(
    "db_connections",
    "Current number of database connections"
)

TASK_QUEUE_SIZE = Gauge(
    "celery_task_queue_size",
    "Current number of tasks in queue"
)

ERROR_COUNT = Counter(
    "error_count_total",
    "Total number of errors",
    ["type", "endpoint"]
)


class MetricsMiddleware(BaseHTTPMiddleware):
    """
    Middleware to collect HTTP request metrics.
    """
    
    async def dispatch(self, request: Request, call_next):
        method = request.method
        endpoint = request.url.path
        
        # Increment active requests gauge
        ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).inc()
        
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # Record metrics
            REQUEST_COUNT.labels(
                method=method,
                endpoint=endpoint,
                status=response.status_code
            ).inc()
            
            duration = time.time() - start_time
            REQUEST_DURATION.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)
            
            return response
            
        except Exception as e:
            # Record error metrics
            ERROR_COUNT.labels(
                type=type(e).__name__,
                endpoint=endpoint
            ).inc()
            
            # Record failed request
            REQUEST_COUNT.labels(
                method=method,
                endpoint=endpoint,
                status=500
            ).inc()
            
            duration = time.time() - start_time
            REQUEST_DURATION.labels(
                method=method,
                endpoint=endpoint
            ).observe(duration)
            
            raise
        finally:
            # Decrement active requests gauge
            ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).dec()


def setup_monitoring(port: int = 9090):
    """
    Start Prometheus metrics server.
    """
    logger.info(f"Starting metrics server on port {port}")
    start_http_server(port)


@contextmanager
def track_db_connections():
    """
    Context manager to track database connection usage.
    """
    DB_CONNECTIONS.inc()
    try:
        yield
    finally:
        DB_CONNECTIONS.dec()


def record_task_completion(task_name: str, duration: float, success: bool = True):
    """
    Record task completion metrics.
    """
    if success:
        logger.info(
            "task_completed",
            task_name=task_name,
            duration=duration
        )
    else:
        ERROR_COUNT.labels(type="task_failure", endpoint=task_name).inc()
        logger.error(
            "task_failed",
            task_name=task_name,
            duration=duration
        )


def record_ai_api_call(provider: str, model: str, duration: float, tokens_used: Optional[int] = None):
    """
    Record metrics for AI API calls.
    """
    logger.info(
        "ai_api_call",
        provider=provider,
        model=model,
        duration=duration,
        tokens_used=tokens_used
    )


def get_metrics_summary() -> Dict[str, float]:
    """
    Get summary of current metrics.
    """
    # This would return a summary of key metrics
    return {
        "request_rate": REQUEST_COUNT._metrics.values(),  # Simplified
        "avg_response_time": REQUEST_DURATION._metrics.values(),  # Simplified
    }