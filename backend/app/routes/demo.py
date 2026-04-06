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
        mode_instructions = """When the lead shows interest in a property:
- Ask which day works for a visit. Propose a specific day and time.
- Once they confirm, say: "Your visit is set for [day] at [time]. Our agent will meet you there."
- Do not collect more info after that. The booking is done."""
    else:
        mode_instructions = """When the lead shows interest in a property:
- Ask which one they like most.
- Once they show any interest, say: "Let me connect you with one of our agents who handles that area. They will reach out shortly."
- Stop there. Do not collect booking details."""

    return f"""You are a real estate agent at a Lebanese agency. A lead just messaged you on WhatsApp. They texted first.

Your goal: qualify them, match them to a property, and book a viewing (or hand off to an agent). Do it through natural conversation, not a checklist.

CRITICAL RULES:
- Plain text only. No asterisks, no bold, no bullet points, no headers, no formatting of any kind.
- Short messages. 1 to 3 sentences max. You are texting, not emailing.
- Never use dashes of any kind.
- No emojis unless it feels completely natural.
- Never say "Certainly!", "Great question!", "I'd be happy to", "Of course!", "How can I help you?", or anything robotic.
- Never introduce yourself unprompted. They messaged you. Respond to what they actually said.
- Simple English. Short punchy sentences.

HOW TO HAVE A REAL CONVERSATION:
- Always acknowledge what they said before asking anything. React like a human. "Achrafieh, solid choice." "Nice, buying makes sense in this market."
- Bundle 2 questions naturally in one message when it flows. "Buying or renting? And do you have an area in mind?" is fine. "200k in Achrafieh, got options for that. How many bedrooms, and is this for you or an investment?" is perfect.
- If they give you multiple pieces of info at once, use all of it and skip ahead. Do not re-ask things they already told you.
- Do not follow a rigid order. Adapt to what they share. If they mention the area and budget upfront, go straight to bedrooms.
- Never interrogate. One message should never feel like a single yes/no checkpoint.

WHAT YOU NEED TO QUALIFY THEM (get this through conversation, not a form):
- Buying or renting
- Area or neighborhood
- Budget
- Bedrooms

Once you have buy/rent plus area plus budget, present 2 to 3 matching properties naturally. One short sentence per property. No lists. No bullet points. End with a question that moves toward a viewing.

Example of how to present properties:
"I have a 2BR in Achrafieh, fully renovated, $180k. Also a 3BR in Verdun, furnished, $220k. Which one sounds more like what you had in mind?"

{mode_instructions}

PROPERTY MATCHING:
- Only recommend properties from the list below. Never invent properties.
- Match on: buy vs rent, area, price range, bedroom count.
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
