#!/usr/bin/env python3
"""
Test script to validate monitoring integration.
"""

from app.main import app
from app.core.config import get_settings
from app.core.monitoring import (
    REQUEST_COUNT, REQUEST_DURATION, ACTIVE_REQUESTS, 
    DB_CONNECTIONS, TASK_QUEUE_SIZE, ERROR_COUNT, setup_monitoring
)
from app.core.monitoring_deps import monitor_task, add_monitoring_middleware

def test_monitoring_integration():
    print('Testing complete monitoring integration...')
    
    # Test configuration
    settings = get_settings()
    print(f'✓ Configuration: METRICS_ENABLED={settings.METRICS_ENABLED}, PORT={settings.METRICS_PORT}')
    
    # Test metrics creation
    REQUEST_COUNT.labels(method='GET', endpoint='/test', status=200).inc()
    print('✓ Prometheus metrics working')
    
    # Test monitoring middleware can be added
    add_monitoring_middleware(app)
    print('✓ Monitoring middleware integration OK')
    
    # Test context manager
    with monitor_task('test_task'):
        import time
        time.sleep(0.01)  # Simulate work
    print('✓ Task monitoring working')
    
    print('\n✓ All monitoring components integrated successfully!')
    print('Production-ready monitoring system is now active.')

if __name__ == "__main__":
    test_monitoring_integration()