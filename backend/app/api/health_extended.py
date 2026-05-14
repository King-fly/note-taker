"""
Extended health check endpoints with detailed system status.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import time
import psutil
import os
from datetime import datetime

from app.schemas.models import MessageResponse

router = APIRouter()


class HealthStatus(BaseModel):
    status: str
    timestamp: datetime
    uptime: float
    system: Dict[str, Any]
    database: Dict[str, Any]
    redis: Dict[str, Any]


class DetailedHealthResponse(BaseModel):
    api: HealthStatus
    system: Dict[str, Any]
    dependencies: Dict[str, Any]


@router.get("/health", tags=["health"], response_model=MessageResponse)
def health_check() -> MessageResponse:
    """Basic health check endpoint."""
    return MessageResponse(message="ok")


@router.get("/health/extended", tags=["health"], response_model=DetailedHealthResponse)
def extended_health_check() -> DetailedHealthResponse:
    """Extended health check with system resource details."""
    # System information
    cpu_percent = psutil.cpu_percent(interval=1)
    memory_info = psutil.virtual_memory()
    disk_usage = psutil.disk_usage('/')
    
    # Process information
    process = psutil.Process(os.getpid())
    process_memory = process.memory_info().rss / 1024 / 1024  # MB
    process_cpu = process.cpu_percent()
    
    # Calculate uptime
    boot_time = psutil.boot_time()
    uptime = time.time() - boot_time
    
    # Determine overall status based on thresholds
    system_status = "healthy"
    if cpu_percent > 80 or memory_info.percent > 80:
        system_status = "warning"
    if cpu_percent > 95 or memory_info.percent > 95:
        system_status = "critical"
    
    # Mock database and redis checks (would connect in real implementation)
    database_status = {"connected": True, "latency_ms": 5.2, "status": "healthy"}
    redis_status = {"connected": True, "latency_ms": 1.8, "status": "healthy"}
    
    return DetailedHealthResponse(
        api=HealthStatus(
            status=system_status,
            timestamp=datetime.utcnow(),
            uptime=uptime,
            system={
                "cpu_percent": cpu_percent,
                "memory_percent": memory_info.percent,
                "disk_percent": disk_usage.percent,
                "load_average": list(psutil.getloadavg()) if hasattr(psutil, 'getloadavg') else [],
            },
            database=database_status,
            redis=redis_status,
        ),
        system={
            "process_memory_mb": round(process_memory, 2),
            "process_cpu_percent": process_cpu,
            "num_threads": process.num_threads(),
            "num_fds": process.num_fds(),
        },
        dependencies={
            "database": database_status,
            "redis": redis_status,
            "celery_workers": 4,  # Would check actual workers in real implementation
        }
    )


@router.get("/health/metrics", tags=["health"])
def get_application_metrics():
    """Return application-specific metrics."""
    # This would integrate with the Prometheus metrics we defined earlier
    from app.core.monitoring import get_metrics_summary
    return {
        "summary": get_metrics_summary(),
        "timestamp": datetime.utcnow(),
        "status": "metrics_endpoint_ready"
    }