# ClassSync Frontend

> Modern React frontend for the **ClassSync** AI Classroom Note Taker app.

## Tech Stack

| Component | Technology |
|---|---|
| **Framework** | React 19 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS 3 |
| **Routing** | React Router v6 |
| **Icons** | Lucide React |
| **UI Components** | ShadCN UI |
| **State Management** | React Context + Hooks |
| **Internationalization** | React i18next |
| **Deployment** | Docker + Nginx |

## Project Structure

```
frontend/
├── public/                # Static assets
│   ├── index.html         # HTML template
│   └── favicon.ico        # Favicon
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components (buttons, inputs, etc.)
│   │   ├── Home/          # Home page components
│   │   ├── Notes/         # Notes page components
│   │   ├── Review/        # Review page components
│   │   └── Layout/        # Layout components (Header, Sidebar)
│   ├── pages/             # Page components
│   │   ├── Home.tsx       # Dashboard/home page
│   │   ├── Notes.tsx      # Notes management
│   │   ├── Review.tsx     # Flashcard review
│   │   └── Profile.tsx    # User profile
│   ├── hooks/             # Custom React hooks
│   │   ├── useAuth.ts     # Authentication hook
│   │   ├── useNotes.ts    # Notes management hook
│   │   └── useApi.ts      # API client hook
│   ├── api/               # API client and types
│   │   ├── client.ts      # Axios instance
│   │   └── types.ts       # TypeScript types
│   ├── i18n/              # Internationalization
│   │   ├── en.ts          # English translations
│   │   ├── zh.ts          # Chinese translations
│   │   └── config.ts      # i18n configuration
│   ├── utils/             # Utility functions
│   ├── auth-context.tsx   # Authentication context
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── nginx.conf             # Nginx configuration for production
├── components.json        # ShadCN configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies
```

## Quick Start (Development)

### Prerequisites

- Node.js >= 20.x
- npm or yarn

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your backend URL:

```bash
VITE_API_BASE_URL=http://localhost/api/v1
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

### 5. Run Tests

```bash
npm run test
```

## 🐳 Docker Deployment

### Build and Run

From the project root directory:

```bash
# Build and start all services
docker-compose up --build -d
```

### Service URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost |
| API | http://localhost/api/v1 |

## Key Features

### Authentication
- Secure JWT-based authentication
- Login and registration forms
- Protected routes
- Token refresh mechanism

### Note Management
- Create, edit, and delete notes
- Multi-modal input (text, audio, image)
- AI-powered note organization
- Search and filter notes

### Review System
- Flashcard-based review
- Spaced repetition algorithm
- Vocabulary management
- Progress tracking

### UI/UX
- Responsive design (mobile-first)
- Dark/light mode support
- Loading states and error handling
- Smooth animations and transitions

## Component Architecture

### Layout Components
- `Header` - Navigation header with logo and user menu
- `Sidebar` - Navigation sidebar with menu items
- `Layout` - Main layout wrapper

### Page Components
- `Home` - Dashboard with quick actions and recent notes
- `Notes` - Notes list with search and filters
- `Review` - Flashcard review interface
- `Profile` - User profile management

### UI Components
- `NoteCard` - Display single note preview
- `Flashcard` - Interactive flashcard component
- `AudioRecorder` - Audio recording interface
- `CameraDialog` - Camera/image capture modal

## API Integration

### Authentication Endpoints
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/register` - Register

### Notes Endpoints
- GET `/api/v1/notes` - List notes
- POST `/api/v1/notes` - Create note
- GET `/api/v1/notes/{id}` - Get note
- PUT `/api/v1/notes/{id}` - Update note
- DELETE `/api/v1/notes/{id}` - Delete note

### Review Endpoints
- GET `/api/v1/review/flashcards` - List flashcards
- POST `/api/v1/review/flashcards` - Create flashcard
- PUT `/api/v1/review/flashcards/{id}/assess` - Assess flashcard

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props

### Component Patterns
- Use custom hooks for data fetching
- Use React Context for global state
- Use memoization where needed
- Handle loading and error states

### Styling
- Use Tailwind CSS for styling
- Follow design system patterns
- Use consistent spacing and typography
- Support dark/light modes

## Internationalization

The app supports English and Chinese languages:

```bash
# Switch language
i18n.changeLanguage('en')  # English
i18n.changeLanguage('zh')  # Chinese
```

Translation files are located in `src/i18n/`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License