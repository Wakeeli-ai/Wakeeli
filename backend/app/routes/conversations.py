from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel
import json
import re
from app.database import get_db
from app.models import Conversation, Message, Agent
from app.schemas import ConversationDetail
from app.config import settings


class AssignAgentRequest(BaseModel):
    agent_id: int


class UpdateStatusRequest(BaseModel):
    status: str  # new, qualified, handed_off, closed

router = APIRouter()


def extract_requirements_from_messages(messages: List[Message]) -> dict:
    """
    Fallback: Analyze conversation messages to extract user requirements.
    Uses simple pattern matching for common real estate terms.
    """
    requirements = {}
    
    # Combine all user messages
    user_text = " ".join([m.content.lower() for m in messages if m.role == "user"])
    
    # Extract listing_type (rent vs buy)
    if any(word in user_text for word in ["rent", "renting", "للإيجار", "اجار", "ايجار"]):
        requirements["listing_type"] = "rent"
    elif any(word in user_text for word in ["buy", "buying", "purchase", "للبيع", "شراء"]):
        requirements["listing_type"] = "buy"
    
    # Extract bedrooms
    bedroom_match = re.search(r'(\d+)\s*(?:bed|bedroom|br|غرف)', user_text)
    if bedroom_match:
        requirements["bedrooms"] = int(bedroom_match.group(1))
    
    # Extract budget (look for dollar amounts)
    budget_match = re.search(r'\$?\s*(\d{1,3}(?:,?\d{3})*)\s*(?:usd|dollar|\$)?', user_text)
    if budget_match:
        budget = int(budget_match.group(1).replace(",", ""))
        requirements["budget_max"] = budget
    
    # Extract common Lebanese locations
    locations = ["beirut", "jounieh", "byblos", "tripoli", "sidon", "zahle", 
                 "batroun", "achrafieh", "hamra", "verdun", "downtown", "dbayeh",
                 "kaslik", "antelias", "hazmieh", "baabda", "broummana"]
    for loc in locations:
        if loc in user_text:
            requirements["location"] = loc.title()
            break
    
    # Extract furnishing preference
    if "furnished" in user_text and "unfurnished" not in user_text:
        requirements["furnishing"] = "furnished"
    elif "unfurnished" in user_text:
        requirements["furnishing"] = "unfurnished"
    
    return requirements

@router.get("/", response_model=List[ConversationDetail])
def get_conversations(
    skip: int = 0, 
    limit: int = 50, 
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all conversations with optional search.
    Search matches against phone number and message content.
    """
    query = db.query(Conversation)
    
    if search:
        search_term = f"%{search}%"
        # Search by phone number or by message content
        query = query.filter(
            or_(
                Conversation.user_phone.ilike(search_term),
                Conversation.id.in_(
                    db.query(Message.conversation_id).filter(
                        Message.content.ilike(search_term)
                    ).distinct()
                )
            )
        )
    
    conversations = query.order_by(Conversation.updated_at.desc().nullsfirst(), Conversation.created_at.desc()).offset(skip).limit(limit).all()
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


@router.get("/{conversation_id}/extract-requirements")
def extract_requirements(conversation_id: int, db: Session = Depends(get_db)):
    """
    Fallback endpoint: Extract requirements from conversation messages
    if user_requirements is empty or incomplete.
    """
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # If requirements already exist, return them
    if conversation.user_requirements and conversation.user_requirements.get("listing_type"):
        return {"requirements": conversation.user_requirements, "source": "stored"}
    
    # Otherwise, extract from messages
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).all()
    extracted = extract_requirements_from_messages(messages)
    
    # Merge with any existing partial requirements
    existing = conversation.user_requirements or {}
    merged = {**extracted, **existing}  # existing takes precedence
    
    # Optionally save back to conversation
    if merged and not conversation.user_requirements:
        conversation.user_requirements = merged
        db.commit()
    
    return {"requirements": merged, "source": "extracted"}


@router.patch("/{conversation_id}/assign")
def assign_agent_to_conversation(
    conversation_id: int, 
    request: AssignAgentRequest, 
    db: Session = Depends(get_db)
):
    """Assign an agent to a conversation/lead."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    # Verify agent exists
    agent = db.query(Agent).filter(Agent.id == request.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Update conversation
    conversation.agent_id = request.agent_id
    
    # Auto-update status if currently new or qualified
    if conversation.status in ["new", "qualified"]:
        conversation.status = "handed_off"
    
    db.commit()
    db.refresh(conversation)
    
    return {
        "message": f"Conversation assigned to {agent.name}",
        "conversation_id": conversation.id,
        "agent_id": agent.id,
        "status": conversation.status
    }


@router.patch("/{conversation_id}/status")
def update_conversation_status(
    conversation_id: int, 
    request: UpdateStatusRequest, 
    db: Session = Depends(get_db)
):
    """Update the status of a conversation/lead."""
    valid_statuses = ["new", "qualified", "handed_off", "closed"]
    if request.status not in valid_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )
    
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation.status = request.status
    db.commit()
    db.refresh(conversation)
    
    return {
        "message": f"Status updated to {request.status}",
        "conversation_id": conversation.id,
        "status": conversation.status
    }
