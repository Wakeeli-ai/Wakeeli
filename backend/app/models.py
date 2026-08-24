import uuid as _uuid

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    listing_type = Column(String, index=True)  # rent, buy
    property_type = Column(String, index=True)  # Apartment, Villa, etc.
    property_id = Column(String, unique=True, index=True)  # Unique ID from source
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

    # Amenities and extras
    maids_room = Column(Boolean, nullable=True)
    balconies = Column(Integer, nullable=True)
    electricity_24_7 = Column(Boolean, nullable=True)
    elevator = Column(Boolean, nullable=True)
    concierge = Column(Boolean, nullable=True)
    storage = Column(Boolean, nullable=True)
    ac_heating = Column(Boolean, nullable=True)
    generator = Column(Boolean, nullable=True)
    notes = Column(Text, nullable=True)




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

    budget_min = Column(Float, nullable=True)
    budget_max = Column(Float, nullable=True)
    timeline = Column(String(100), nullable=True)
    urgency = Column(String(50), nullable=True)

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
    role = Column(String, default="agent")  # "admin", "agent", or "superadmin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)

    company = relationship("Company", back_populates="users", foreign_keys=[company_id])


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    agency_name = Column(String, nullable=True)
    whatsapp_number = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    plan_tier = Column(String, default="starter")  # starter, professional, enterprise
    agent_count = Column(Integer, default=1)
    slug = Column(String, unique=True, index=True)
    status = Column(String, default="active")  # active, trial, churned
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    users = relationship("User", back_populates="company", foreign_keys="User.company_id")


class TokenUsage(Base):
    """Persistent token usage tracking for Claude API calls."""
    __tablename__ = "token_usage"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=False), default=None, index=True)
    model = Column(String, index=True)
    call_label = Column(String, nullable=True)
    conversation_id = Column(Integer, nullable=True, index=True)
    input_tokens = Column(Integer, default=0)
    cache_creation_input_tokens = Column(Integer, default=0)
    cache_read_input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_input_tokens = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)


# ---------------------------------------------------------------------------
# Portal tables (Wakeeli client portal, authenticated via Supabase JWT)
# ---------------------------------------------------------------------------

class WakeeliUserRole(Base):
    """Global role assignments for portal users (identified by Supabase user_id)."""
    __tablename__ = "wakeeli_user_roles"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    user_id = Column(String(36), nullable=False, index=True)
    role = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class WakeeliClient(Base):
    """
    Agency (client) record created when a user completes onboarding.
    One record per portal user (user_id is unique).
    """
    __tablename__ = "wakeeli_clients"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    user_id = Column(String(36), nullable=False, unique=True, index=True)
    brand_name = Column(String(255), nullable=True)
    approved = Column(Boolean, nullable=False, default=False)
    intake_completion_pct = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    triggers = relationship("WakeeliTrigger", back_populates="client", cascade="all, delete-orphan")
    sequences = relationship("WakeeliSequence", back_populates="client", cascade="all, delete-orphan")


class WakeeliPrompt(Base):
    """AI prompt templates owned by a portal user, optionally scoped to a client."""
    __tablename__ = "wakeeli_prompts"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("wakeeli_clients.id"), nullable=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    is_shared = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class WakeeliConversationRule(Base):
    """WhatsApp routing and escalation rules scoped to a client."""
    __tablename__ = "wakeeli_conversation_rules"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("wakeeli_clients.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    condition_type = Column(String(100), nullable=False)
    condition_value = Column(String(500), nullable=False)
    action_type = Column(String(100), nullable=False)
    action_value = Column(String(500), nullable=True)
    priority = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class WakeeliClientSettings(Base):
    """Per-client feature toggles and configuration. One row per client."""
    __tablename__ = "wakeeli_client_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("wakeeli_clients.id"), nullable=False, unique=True, index=True)
    general_inbound_enabled = Column(Boolean, nullable=False, default=True)


# ---------------------------------------------------------------------------
# Triggers and Sequences (portal, scoped per WakeeliClient)
# ---------------------------------------------------------------------------

class WakeeliTrigger(Base):
    """Keyword trigger that fires an opt-in message when matched in WhatsApp."""
    __tablename__ = "wakeeli_triggers"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("wakeeli_clients.id"), nullable=False, index=True)
    keyword = Column(String(255), nullable=False)
    opt_in = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    client = relationship("WakeeliClient", back_populates="triggers")


class WakeeliSequence(Base):
    """Automated follow-up sequence attached to a client."""
    __tablename__ = "wakeeli_sequences"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("wakeeli_clients.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    trigger_type = Column(String(100), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    client = relationship("WakeeliClient", back_populates="sequences")
    steps = relationship(
        "WakeeliSequenceStep",
        back_populates="sequence",
        order_by="WakeeliSequenceStep.step_number",
        cascade="all, delete-orphan",
    )


class WakeeliSequenceStep(Base):
    """Single step within a WakeeliSequence."""
    __tablename__ = "wakeeli_sequence_steps"

    id = Column(String(36), primary_key=True, default=lambda: str(_uuid.uuid4()))
    sequence_id = Column(String(36), ForeignKey("wakeeli_sequences.id"), nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    delay_days = Column(Integer, nullable=False, default=0)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    sequence = relationship("WakeeliSequence", back_populates="steps")