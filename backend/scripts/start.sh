#!/usr/bin/env python3
"""
Start script for the backend service.

Usage:
    ./scripts/start.sh               # start FastAPI server
    ./scripts/start.sh worker        # start Celery worker
    ./scripts/start.sh flower        # start Flower monitoring
    ./scripts/start.sh migrate       # run Alembic migrations
"""

import subprocess
import sys


def main():
    if len(sys.argv) < 2:
        print("Usage: ./scripts/start.sh [server|worker|flower|migrate]")
        sys.exit(1)

    cmd = sys.argv[1]

    match cmd:
        case "server":
            print("🚀 Starting FastAPI server...")
            subprocess.run(
                [
                    "uvicorn",
                    "app.main:app",
                    "--host",
                    "0.0.0.0",
                    "--port",
                    "8000",
                    "--reload",
                ],
                check=True,
            )

        case "worker":
            print("🐵 Starting Celery worker...")
            subprocess.run(
                [
                    "celery",
                    "-A",
                    "app.core.celery_app.celery_app",
                    "worker",
                    "--loglevel=info",
                    "--concurrency=4",
                    "--pool=solo",  # use 'prefork' on Linux / production
                ],
                check=True,
            )

        case "flower":
            print("🌸 Starting Flower monitoring...")
            subprocess.run(
                [
                    "celery",
                    "-A",
                    "app.core.celery_app.celery_app",
                    "flower",
                    "--port=5555",
                    "--basic_auth=admin:",
                ],
                check=True,
            )

        case "migrate":
            print("🔧 Running Alembic migrations...")
            subprocess.run(
                [
                    "alembic",
                    "upgrade",
                    "head",
                ],
                check=True,
            )

        case _:
            print(f"Unknown command: {cmd}")
            sys.exit(1)


if __name__ == "__main__":
    main()
