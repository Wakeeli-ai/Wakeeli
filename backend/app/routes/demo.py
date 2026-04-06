import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Literal
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Conversation
from app.services.agent import process_user_message

router = APIRouter()

# In-memory map: demo session_id (str) -> conversation_id (int in DB)
# Keyed by session_id so each browser tab gets its own isolated conversation.
# Resets on server restart, which is acceptable for demo use.
_demo_sessions: dict[str, int] = {}


class DemoChatRequest(BaseModel):
    message: str
    mode: Literal["auto", "handoff"]
    session_id: Optional[str] = None


def _get_or_create_conversation(db: Session, session_id: str) -> Conversation:
    """Return the DB Conversation for this demo session, creating one if needed."""
    phone = f"demo-{session_id}"
    conversation = db.query(Conversation).filter(Conversation.user_phone == phone).first()
    if not conversation:
        conversation = Conversation(user_phone=phone)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    return conversation


@router.post("/chat")
async def demo_chat(request: DemoChatRequest, db: Session = Depends(get_db)):
    """
    Demo chat endpoint. Uses the exact same agent.py pipeline as /api/chat/test.

    Two modes:
    - auto: AI qualifies, matches listings, and books a tour automatically
    - handoff: AI qualifies and matches, then passes to a human agent once the
      lead is ready (instead of booking the tour itself)

    The mode is passed through to process_user_message via a kwarg so the
    pipeline can adjust the terminal action without changing any core logic.

    No auto-greeting is sent. The lead always texts first.
    """
    session_id = request.session_id or str(uuid.uuid4())

    # Look up or create the DB conversation for this demo session
    conversation = _get_or_create_conversation(db, session_id)
    conversation_id = conversation.id

    # Run the full agent pipeline (same as /api/chat/test)
    # The mode kwarg is forwarded so the pipeline can apply handoff-mode overrides
    messages = process_user_message(
        db,
        conversation_id,
        request.message,
        demo_mode=request.mode,
    )

    return {
        "messages": messages,
        "session_id": session_id,
    }
