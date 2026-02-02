from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Conversation
from app.schemas import ConversationDetail

router = APIRouter()

@router.get("/", response_model=List[ConversationDetail])
def get_conversations(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    conversations = db.query(Conversation).offset(skip).limit(limit).all()
    return conversations

@router.get("/by-phone/{phone}")
def get_conversation_by_phone(phone: str, db: Session = Depends(get_db)):
    """Get conversation history by phone number - for test chat UI"""
    conversation = db.query(Conversation).filter(Conversation.user_phone == phone).first()
    if not conversation:
        return {"messages": [], "conversation_id": None}
    return {
        "messages": [
            {"role": m.role, "content": m.content, "timestamp": m.timestamp.isoformat()}
            for m in conversation.messages
        ],
        "conversation_id": conversation.id
    }


@router.get("/{conversation_id}", response_model=ConversationDetail)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation
