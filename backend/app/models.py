from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    listing_type = Column(String, index=True)  # rent, buy
    property_type = Column(String, index=True)  # Apartment, Villa, etc.
    title = Column(String, index=True)
    category = Column(String, index=True)  # Residential, Commercial, Land
    city = Column(String, index=True)
    area = Column(String, nullable=True)  # Area/Neighborhood
    building_name = Column(String, nullable=True)

    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    built_up_area = Column(Float)
    plot_area = Column(Float, nullable=True)
    floor_number = Column(Integer, nullable=True)

    parking = Column(String, nullable=True)  # None/1/2/Covered
    property_age = Column(String, nullable=True)  # 1-5, 5-10, 10+
    furnishing = Column(String, nullable=True)  # Furnished/Semi/Unfurnished
    view = Column(String, nullable=True)  # Sea/City/Mountain/Open
    condition = Column(String, nullable=True)  # Ready/Under Construction/Needs Renovation

    sale_price = Column(Float, nullable=True)
    rent_price = Column(Float, nullable=True)
    rental_duration = Column(String, nullable=True)  # Daily/Monthly/Yearly
    security_deposit = Column(Float, nullable=True)
    negotiable = Column(Boolean, nullable=True)

    description = Column(Text, nullable=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    phone = Column(String)
    email = Column(String, nullable=True)
    territories = Column(JSON) # List of cities/areas
    specialties = Column(JSON) # List: ["rent", "buy"]
    priority = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_phone = Column(String, unique=True, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True)
    status = Column(String, default="new") # new, qualified, handed_off, closed
    user_requirements = Column(JSON, nullable=True) # rent/buy, location, budget, etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    agent = relationship("Agent")
    messages = relationship("Message", back_populates="conversation")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"))
    role = Column(String) # user, assistant, system
    content = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String)
    payload = Column(JSON)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())