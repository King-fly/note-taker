# ClassSync - AI-Powered Classroom Note Taker

A comprehensive full-stack AI note-taking application designed specifically for students. Capture, organize, and review your class notes with the power of AI.

## 🚀 Features

### Core Functionality
- **Multi-modal Note Capture**: Record audio, take photos, or type notes quickly
- **AI-Powered Organization**: Automatic note structuring with AI assistance
- **Smart Review System**: Flashcard-based review with spaced repetition
- **User Authentication**: Secure login and profile management
- **Internationalization**: Full Chinese/English language support

### AI Capabilities
- **Voice-to-Text Transcription**: Local Whisper integration for offline audio processing
- **OCR Recognition**: AI-powered image text extraction
- **Note Structuring**: Automatic organization into Cornell Notes or Mind Maps
- **Flashcard Generation**: AI-generated study cards from notes

### Technical Features
- **Responsive Design**: Mobile-first approach with desktop support
- **Modern UI**: Clean interface with dark/light mode support
- **Real-time Updates**: Live feedback during note processing
- **Background Processing**: Asynchronous task handling with Celery

## 📋 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for fast builds and development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **React i18next** for internationalization
- **ShadCN UI** components

### Backend
- **FastAPI** for high-performance API
- **SQLAlchemy** for database ORM
- **PostgreSQL** as primary database
- **Redis** for caching and Celery broker
- **Celery** for background task processing
- **Pydantic** for data validation

### AI & ML
- **Local Whisper** for speech-to-text
- **Tesseract OCR** for image text recognition
- **Local MLX Inference Server** for AI processing

### DevOps
- **Docker** & **Docker Compose** for containerization
- **Nginx** for reverse proxy and static file serving
- **Flower** for Celery task monitoring

## 🏗️ Project Structure

```
note-taker/
├── frontend/                 # React + TypeScript frontend
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── api/             # API client and types
│   │   ├── i18n/            # Internationalization files
│   │   └── utils/           # Utility functions
│   ├── nginx.conf           # Frontend Nginx configuration
│   ├── components.json      # ShadCN configuration
│   └── package.json         # Dependencies
├── backend/                 # FastAPI backend
│   ├── app/                 # Application code
│   │   ├── api/             # API endpoints
│   │   ├── models/          # Database models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── core/            # Core functionality
│   │   ├── tasks/           # Celery background tasks
│   │   └── main.py          # Application entry point
│   ├── requirements.txt     # Python dependencies
│   └── alembic/             # Database migrations
├── nginx.conf               # Reverse proxy configuration
├── docker-compose.yml       # Docker Compose configuration
├── .env.example            # Environment variables template
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites

**For Docker Deployment (Recommended):**
- Docker Engine >= 24.x
- Docker Compose >= 2.x

**For Local Development:**
- Node.js >= 20.x
- Python >= 3.12
- PostgreSQL database
- Redis server (for Celery)
- FFmpeg (for audio processing)
- Tesseract OCR

### 🐳 Docker Deployment (Recommended)

**1. Clone the Repository**

```bash
git clone <repository-url>
cd note-taker
```

**2. Configure Environment Variables**

```bash
cp .env.example .env
# Edit .env with your configuration if needed
```

**3. Build and Run**

```bash
# Build and start all services
docker-compose up --build -d
```

**4. Access the Application**

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| API Documentation | http://localhost/docs |
| Flower Monitoring | http://localhost:5555 |

**5. Stop Services**

```bash
docker-compose down
```

### 🛠️ Local Development

#### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your database configuration
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=http://localhost:8000/api/v1
npm run dev
```

#### Background Workers

```bash
cd backend
celery -A app.core.celery_app worker --loglevel=info
```

## 🛠️ Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost/dbname

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI Services
LOCAL_AI_BASE_URL=http://127.0.0.1:8085/v1
LOCAL_AI_API_KEY=your-api-key
LOCAL_AI_MODEL=Qwen3.6-35B-A3B-UD-MLX-4bit
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost/api/v1
```

## 🧪 Running Tests

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🏗️ Docker Services

### Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     nginx (port 80)                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   /api/*     │    │   /ws/*      │    │   /*         │  │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘  │
└─────────┼────────────────────┼────────────────────┼─────────┘
          ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   classsync-api │  │   classsync-api │  │ classsync-front │
│   (port 8000)   │  │   (port 8000)   │  │   (port 80)     │
└────────┬────────┘  └─────────────────┘  └─────────────────┘
         │
         ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ classsync-db    │  │ classsync-redis │  │ classsync-worker│
│  (PostgreSQL)   │  │    (Redis)      │  │   (Celery)      │
└─────────────────┘  └─────────────────┘  └────────┬────────┘
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │ classsync-flower│
                                          │  (port 5555)    │
                                          └─────────────────┘
```

### Service List

| Service | Container Name | Description |
|---------|---------------|-------------|
| API | classsync-api | FastAPI backend server |
| Frontend | classsync-frontend | React frontend |
| Database | classsync-db | PostgreSQL database |
| Redis | classsync-redis | Redis cache/broker |
| Worker | classsync-worker | Celery background worker |
| Flower | classsync-flower | Celery task monitor |
| Nginx | classsync-nginx | Reverse proxy |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information
3. Include steps to reproduce if applicable

---

Built with ❤️ for students who want to enhance their learning experience with AI power.