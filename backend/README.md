# ClassSync Backend

> Production-grade backend for the **ClassSync** AI Classroom Note Taker app.

## Tech Stack

| Component | Technology |
|---|---|
| **Web Framework** | FastAPI 0.115 + Uvicorn |
| **Database** | SQLite (dev) / PostgreSQL (prod) — SQLAlchemy ORM |
| **Task Queue** | Celery 5.4 + Redis 7 |
| **Task Monitoring** | Flower 2.0 |
| **Migrations** | Alembic |
| **Authentication** | JWT (python-jose) + bcrypt |
| **AI Provider** | Local MLX Inference Server |
| **OCR** | Tesseract + Pillow |
| **Deployment** | Docker + Docker Compose |

## Project Structure

```
backend/
├── app/
│   ├── api/              # FastAPI route handlers
│   │   ├── auth.py       # Register / Login
│   │   ├── health.py     # Health check
│   │   ├── notes.py      # CRUD + AI organize
│   │   ├── review.py     # Flashcards + vocab
│   │   └── user.py       # Profile + stats
│   ├── core/
│   │   ├── config.py     # Pydantic settings
│   │   ├── database.py   # SQLAlchemy engine/session
│   │   ├── security.py   # JWT + password hashing
│   │   ├── celery_app.py # Celery configuration
│   │   └── logging.py    # Structured logging
│   ├── models/           # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── note.py
│   │   ├── flashcard.py
│   │   ├── vocabulary.py
│   │   └── sync_log.py
│   ├── schemas/          # Pydantic request/response schemas
│   │   ├── models.py
│   │   └── user.py
│   ├── services/         # Business logic
│   │   └── ai_service.py # Local MLX inference server wrapper
│   ├── tasks/            # Celery background tasks
│   │   ├── note_tasks.py     # AI note organization
│   │   ├── review_tasks.py   # Flashcard generation
│   │   └── cleanup_tasks.py  # Periodic maintenance
│   ├── lifespan.py       # App factory & startup/shutdown
│   └── main.py           # Entry point
├── migrations/           # Alembic migrations
├── scripts/
│   └── start.sh          # Startup script
├── .env.example          # Environment variable template
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── alembic.ini
```

## Quick Start (Development)

### Prerequisites

- Python 3.12+
- Redis 7+ (`brew install redis` on macOS)
- Tesseract OCR (`brew install tesseract` on macOS)
- Local MLX Inference Server running at http://127.0.0.1:8085/v1

### 1. Environment Setup

```bash
cd backend
cp .env.example .env
# .env already contains local AI server configuration
```

### 2. Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Start Redis

```bash
# macOS with Homebrew
brew services start redis

# Or run directly
redis-server
```

### 4. Start Local MLX Server

Ensure your local MLX inference server is running at http://127.0.0.1:8085/v1

### 5. Start the Services

**Terminal 1 — API Server:**
```bash
./scripts/start.sh server
# → http://localhost:8000/docs (interactive API docs)
```

**Terminal 2 — Celery Worker:**
```bash
./scripts/start.sh worker
```

**Terminal 3 (optional) — Flower Dashboard:**
```bash
./scripts/start.sh flower
# → http://localhost:5555
```

### 6. Run Tests

```bash
pytest tests/ -v
```

## Docker Deployment

```bash
# Build & start all services
docker-compose up --build -d

# View logs
docker-compose logs -f api
docker-compose logs -f celery-worker

# Stop all
docker-compose down
```

## API Endpoints

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/health` | Health check |

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register user → returns JWT |
| POST | `/api/v1/auth/login` | Login → returns JWT |

### User
| Method | Path | Description |
|---|---|---|
| GET | `/api/v1/user/profile` | Get profile |
| PUT | `/api/v1/user/profile` | Update profile |
| GET | `/api/v1/user/stats` | Get user statistics |

### Notes
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/notes` | Create quick-note |
| GET | `/api/v1/notes` | List/search/filter notes |
| GET | `/api/v1/notes/{id}` | Get note detail |
| PUT | `/api/v1/notes/{id}` | Update note |
| DELETE | `/api/v1/notes/{id}` | Delete note |
| POST | `/api/v1/notes/{id}/organize` | Trigger AI organize (async) |
| DELETE | `/api/v1/notes/{id}/organize` | Cancel organization |

### Review & Flashcards
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/review/flashcards` | Create manual flashcard |
| POST | `/api/v1/review/flashcards/generate` | Auto-generate from note |
| GET | `/api/v1/review/flashcards/due` | Get cards due for review |
| GET | `/api/v1/review/flashcards` | List all flashcards |
| PUT | `/api/v1/review/flashcards/{id}/assess` | Mark easy/hard (SM-2) |
| DELETE | `/api/v1/review/flashcards/{id}` | Delete flashcard |
| GET/POST/DELETE | `/api/v1/review/vocab` | Vocabulary management |

## Celery Task Queue

| Task Name | Description | Trigger |
|---|---|---|
| `organize_note_task` | AI organize raw note into structured template | POST `/notes/{id}/organize` |
| `generate_flashcards_task` | Generate Q&A cards from note content | POST `/review/flashcards/generate` |
| `daily_review_reminder` | Daily push notification (placeholder) | Scheduled (24h) |
| `cleanup_old_uploads` | Remove orphaned uploads >30 days | Scheduled (weekly) |

### Monitor Tasks

```bash
# Start Flower
./scripts/start.sh flower

# Open http://localhost:5555
```

## Environment Variables

See `.env.example` for full list. Key variables:

- `LOCAL_AI_BASE_URL` — Local MLX inference server URL (default: http://127.0.0.1:8085/v1)
- `LOCAL_AI_API_KEY` — API key for local AI server
- `LOCAL_AI_MODEL` — Model name to use (default: Qwen3.6-35B-A3B-UD-MLX-4bit)
- `SECRET_KEY` — JWT signing secret (change in production)
- `DATABASE_URL` — SQLAlchemy connection string
- `CELERY_BROKER_URL` / `CELERY_RESULT_BACKEND` — Redis URLs

## Database Schema

```
users
├── id (PK), username, email, hashed_password
├── display_name, avatar_url, grade
├── is_active, is_superuser
└── created_at, updated_at

notes
├── id (PK), user_id (FK→users)
├── title, content, raw_content
├── note_type (voice/ocr/text/image)
├── template (康奈尔/思维导图/理科公式/文科框架)
├── subject, tags (JSON), is_organized
├── organize_status, ai_summary
├── confidence_score, ocr_image_path, audio_path
└── created_at, updated_at, organized_at

flashcards
├── id (PK), user_id (FK), note_id (FK)
├── question, answer, tags (JSON)
├── difficulty (easy/medium/hard)
├── review_status, ease_factor, interval_days
├── next_review_date, review_count, last_review_date
└── created_at, updated_at

vocabularies
├── id (PK), user_id (FK)
├── word, shortcut, category
└── created_at

sync_logs
├── id (PK), user_id (FK)
├── action, entity_type, entity_id
└── timestamp, client_id
```