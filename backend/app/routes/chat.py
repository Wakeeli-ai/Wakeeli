import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Conversation
from app.services.agent import process_user_message

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None


@router.post("/test")
async def chat_test(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Test endpoint for the web chat UI. No WhatsApp credentials required.
    Accepts a message and optional conversation_id, returns the AI response.
    """
    conv_key = request.conversation_id or str(uuid.uuid4())
    phone = f"web-test-{conv_key}"

    conversation = db.query(Conversation).filter(Conversation.user_phone == phone).first()
    if not conversation:
        conversation = Conversation(user_phone=phone)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    messages = process_user_message(db, conversation.id, request.message)

    return {"messages": messages, "conversation_id": conv_key}
