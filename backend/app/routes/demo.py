import uuid
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Literal
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Listing
from app.config import settings

router = APIRouter()

# In-memory session store: session_id -> list of messages
# Good enough for demo purposes; resets on server restart
_sessions: dict = {}


class DemoChatRequest(BaseModel):
    message: str
    mode: Literal["auto", "handoff"]
    session_id: Optional[str] = None


def get_listings_context(db: Session) -> str:
    """Query available listings and format as readable context for the AI."""
    listings = db.query(Listing).filter(Listing.is_available == True).limit(25).all()
    if not listings:
        return "No listings currently in the database. Tell the lead you will have your team follow up with available options."

    lines = []
    for listing in listings:
        price = ""
        if listing.listing_type == "rent" and listing.rent_price:
            duration = listing.rental_duration or "monthly"
            price = f"${listing.rent_price:,.0f}/{duration[:2].lower()}"
        elif listing.listing_type == "buy" and listing.sale_price:
            price = f"${listing.sale_price:,.0f}"

        parts = [
            f"[{listing.listing_type.upper()}]",
            listing.title or f"{listing.bedrooms}BR {listing.property_type}",
            f"{listing.bedrooms}BR/{listing.bathrooms}BA",
            listing.area or listing.city or "",
            price,
        ]
        if listing.view:
            parts.append(f"{listing.view} view")
        if listing.furnishing:
            parts.append(listing.furnishing)
        if listing.condition:
            parts.append(listing.condition)

        lines.append(" | ".join(p for p in parts if p))

    return "\n".join(lines)


def build_system_prompt(mode: str, listings_context: str) -> str:
    if mode == "auto":
        mode_instructions = """After presenting matching options:
- Ask which property interests them
- Once they pick one (or show interest), offer to book a viewing
- Ask for their preferred date and time (one question)
- Confirm the booking clearly: "Your viewing is confirmed at [property] on [date] at [time]. Our agent will meet you there."
- End warmly"""
    else:
        mode_instructions = """After presenting matching options:
- Ask which property interests them
- Once they show any interest, say: "Perfect! Let me connect you with one of our property specialists. They will reach out to you shortly to arrange a viewing."
- Stop there. Do not collect booking details. Your job is done after the handoff message."""

    return f"""You are the AI assistant for Wakeeli, a real estate platform serving Lebanon. You help inbound leads find properties via chat.

CRITICAL RULES:
- Keep every message SHORT. Think WhatsApp bubble, not email. Maximum 3-4 sentences.
- Ask ONE question at a time. Never stack multiple questions.
- Be warm, professional, and welcoming. Lebanese hospitality tone.
- Only recommend properties from the list below. Never invent properties.
- All prices are in USD.
- If the user's first message is "[START]", respond with a warm brief greeting and ask if they are looking to buy or rent. Never mention "[START]" in your response.

YOUR FLOW:
1. Greet warmly, ask if they want to buy or rent
2. Ask qualifying questions one at a time: preferred area, budget range, number of bedrooms
3. Once you have enough info (at minimum: buy/rent + one other criterion), match from properties below
4. Present 2-3 matching options in a clear format. Keep each option brief.
5. {mode_instructions}

AVAILABLE PROPERTIES:
{listings_context}"""


@router.post("/chat")
async def demo_chat(request: DemoChatRequest, db: Session = Depends(get_db)):
    """
    Demo chat endpoint. Two modes:
    - auto: AI qualifies, matches, and books a tour automatically
    - handoff: AI qualifies and matches, then hands off to a human agent
    """
    # Verify API key is available
    api_key = getattr(settings, "ANTHROPIC_API_KEY", None)
    if not api_key:
        return {
            "response": "Anthropic API key not configured. Add ANTHROPIC_API_KEY to environment variables.",
            "session_id": request.session_id or str(uuid.uuid4()),
            "error": True,
        }

    session_id = request.session_id or str(uuid.uuid4())

    # Get or create session history
    if session_id not in _sessions:
        _sessions[session_id] = []

    history = _sessions[session_id]

    # Add user message to history
    history.append({"role": "user", "content": request.message})

    # Get property listings for context
    listings_context = get_listings_context(db)
    system_prompt = build_system_prompt(request.mode, listings_context)

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=api_key)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=600,
            system=system_prompt,
            messages=history,
        )

        assistant_text = response.content[0].text

        # Add assistant response to history
        history.append({"role": "assistant", "content": assistant_text})

        # Keep last 30 messages to avoid token blowout on long sessions
        if len(history) > 30:
            _sessions[session_id] = history[-30:]

        return {
            "response": assistant_text,
            "session_id": session_id,
            "error": False,
        }

    except Exception as exc:
        # Remove the failed user message from history so retries work cleanly
        if history and history[-1]["role"] == "user":
            history.pop()
        return {
            "response": f"Something went wrong: {str(exc)}",
            "session_id": session_id,
            "error": True,
        }
