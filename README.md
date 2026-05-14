# Class Notes - AI-Powered Note Taking Application

A comprehensive full-stack note-taking application that combines modern web technologies with AI capabilities to help students and professionals capture, organize, and review their notes efficiently.

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
- **Custom AI models** for note organization

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
├── .env.example            # Environment variables template
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites

**Frontend:**
- Node.js >= 20.x
- npm or yarn

**Backend:**
- Python >= 3.12
- PostgreSQL database
- Redis server (for Celery)
- FFmpeg (for audio processing)

### Installation

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd note-taker
```

#### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Set up the database:
   ```bash
   # Make sure PostgreSQL is running
   alembic upgrade head
   ```

6. Run the backend server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

#### 3. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. Run the frontend:
   ```bash
   npm run dev
   ```

#### 4. Background Workers (Optional)

For AI processing and other background tasks:

1. Make sure Redis is running
2. From the backend directory, start Celery worker:
   ```bash
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
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
LOCAL_AI_URL=http://127.0.0.1:8085/v1
LOCAL_AI_MODEL=Qwen3.6-35B-A3B-UD-MLX-4bit
LOCAL_AI_API_KEY=omlx-yqha5fy1fm9aufeo
```

#### Frontend (.env)
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
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

## 🚢 Deployment

### Production Build

#### Frontend
```bash
cd frontend
npm run build
```

#### Backend
```bash
cd backend
# Use a production WSGI server like Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Support (Coming Soon)
Docker configurations will be added for easier deployment.

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

Built with ❤️ for students and professionals who want to enhance their note-taking experience with AI power.