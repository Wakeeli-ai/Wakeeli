from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# Listing Schemas
class ListingBase(BaseModel):
    title: str
    listing_type: str
    price: float
    location: str
    bedrooms: int
    furnishing: Optional[str] = None
    description: Optional[str] = None
    is_available: bool = True

class ListingCreate(ListingBase):
    pass

class Listing(ListingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Agent Schemas
class AgentBase(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    territories: List[str]
    specialties: List[str]
    priority: int = 1
    is_active: bool = True

class AgentCreate(AgentBase):
    pass

class Agent(AgentBase):
    id: int

    class Config:
        from_attributes = True

# Conversation Schemas
class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    user_phone: str
    status: str = "new"
    user_requirements: Optional[dict] = None

class Conversation(ConversationBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    agent_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class ConversationDetail(Conversation):
    messages: List[Message] = []
    agent: Optional[Agent] = None
