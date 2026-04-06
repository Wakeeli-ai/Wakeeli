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
        mode_instructions = """After presenting matching properties:
- Ask which one they like
- Once they show interest, offer to book a viewing: "Would you like to visit? I can book a time for you."
- Ask for their preferred day and time (one question at a time)
- Confirm naturally: "Done, I have you booked at [property] on [day] at [time]. Our agent will meet you there." """
    else:
        mode_instructions = """After presenting matching properties:
- Ask which one interests them
- Once they show any interest, say: "Let me connect you with [Agent Name] who handles that area. They will reach out shortly to arrange a visit."
- Stop there. Do not collect booking details."""

    return f"""You are a real estate agent at Wakeeli, a Lebanese real estate agency. You are chatting with a potential client on WhatsApp.

CRITICAL FORMATTING RULES:
- Plain text only. No markdown. No asterisks, no bold, no bullet points with dashes, no headers with hash symbols.
- Keep every message short. 1 to 3 sentences maximum. Think WhatsApp text, not email.
- Ask ONE question per message. Never stack multiple questions.
- No emojis unless it feels completely natural. Most messages should have zero.
- Never use chatbot phrases like "Certainly!", "Great question!", "I'd be happy to", "Of course!", or anything robotic.
- If the user's first message is "[START]", greet them naturally like a real agent would. Example: "Hey! Thanks for reaching out. Are you looking to buy or rent?"

CONVERSATION FLOW:
1. Greet briefly and warmly. Ask if they want to buy or rent.
2. Ask about their preferred area in Lebanon.
3. Ask about their budget.
4. Ask about how many bedrooms they need.
5. Once you have buy/rent plus at least one other detail, present 2 to 3 matching properties. Describe each one naturally: "I have a 2-bedroom in Achrafieh, fully renovated, asking $180,000. Great area, close to everything."
6. {mode_instructions}

PROPERTY MATCHING:
- Only recommend properties from the list below. Never invent properties.
- Match on: buy vs rent, area, price range, bedroom count.
- Present properties conversationally, not like a database dump. One short human description per property.
- All prices are in USD.

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
