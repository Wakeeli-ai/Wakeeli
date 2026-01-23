from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

# Listing Schemas
class ListingBase(BaseModel):
    listing_type: str
    property_type: str
    title: str
    category: str
    city: str
    area: Optional[str] = None
    building_name: Optional[str] = None

    bedrooms: int
    bathrooms: int
    built_up_area: float
    plot_area: Optional[float] = None
    floor_number: Optional[int] = None

    parking: Optional[str] = None
    property_age: Optional[str] = None
    furnishing: Optional[str] = None
    view: Optional[str] = None
    condition: Optional[str] = None

    sale_price: Optional[float] = None
    rent_price: Optional[float] = None
    rental_duration: Optional[str] = None
    security_deposit: Optional[float] = None
    negotiable: Optional[bool] = None

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

# User Schemas
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True