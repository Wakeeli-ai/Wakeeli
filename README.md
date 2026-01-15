# Wakeeli - Real Estate AI Conversation Engine

Unified conversational AI for real estate, supporting WhatsApp (Text/Voice) and a web Admin Panel.

## Architecture

*   **Backend**: Python (FastAPI), SQLAlchemy, PostgreSQL
*   **Frontend**: React (Vite), TypeScript
*   **AI**: OpenAI GPT-4o (Function Calling), Whisper (Transcription)

## Prerequisites

*   Python 3.10+ (or Docker)
*   Node.js 18+ (or Docker)
*   PostgreSQL (or Docker)

## Quick Start with Docker 🐳

The easiest way to run Wakeeli is using Docker:

```bash
# 1. Copy environment file
cp docker-compose.env.example .env

# 2. Edit .env with your API keys (OpenAI, WhatsApp)

# 3. Start everything
docker-compose up -d

# Access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker instructions.

## Manual Setup & Run

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Configure Environment
cp env.example .env
# Edit .env with your credentials

# Run Server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.
Docs at `http://localhost:8000/docs`.

### 2. Frontend (Admin Panel)

```bash
cd frontend
npm install
npm run dev
```

The Admin Panel will be available at `http://localhost:5173`.

### 3. WhatsApp Setup

1.  Create a Meta App (WhatsApp Cloud API).
2.  Configure Webhook URL to `YOUR_PUBLIC_URL/api/whatsapp/webhook`.
3.  Set Verify Token matches `.env`.
4.  Subscribe to `messages` field.

## Features

*   **Conversational AI**: Understands English/Arabic, extracts requirements (Rent/Buy, Location, Budget).
*   **Listing Search**: Matches user needs against database.
*   **Voice Notes**: Transcribes and processes audio messages.
*   **Agent Routing**: Assigns leads to agents based on territory/specialty.
*   **Admin Panel**: Manage Listings and Agents, view Conversations.

## License

Proprietary.
