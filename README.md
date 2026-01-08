# Wakeeli - Real Estate AI Conversation Engine

Unified conversational AI for real estate, supporting WhatsApp (Text/Voice) and a web Admin Panel.

## Architecture

*   **Backend**: Python (FastAPI), SQLAlchemy, PostgreSQL
*   **Frontend**: React (Vite), TypeScript
*   **AI**: OpenAI GPT-4o (Function Calling), Whisper (Transcription)

## Prerequisites

*   Python 3.10+
*   Node.js 18+
*   PostgreSQL

## Setup & Run

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
