import json
import re
import anthropic
from sqlalchemy.orm import Session
from app.config import settings
from app.services.matching import search_listings, recommend_alternatives
from app.services.geography import REGION_MAP, GOVERNORATE_MAP, DISTRICT_MAP, GOVERNORATE_NAMES, DISTRICT_NAMES, get_location_type, get_area_examples
from app.services.routing import find_best_agent, assign_agent
from app.models import Conversation, Message, Event, Listing
from app.services.prompt import intent_detection_prompt, get_reply_system_prompt, Normal_conversation_prompt
from app.services.session import SessionState, STAGES
from pprint import pprint

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

# Per-conversation session storage keyed by conversation_id (int)
_sessions: dict = {}


def get_session(conversation_id: int) -> SessionState:
    """Return the SessionState for this conversation, creating one if needed."""
    if conversation_id not in _sessions:
        _sessions[conversation_id] = SessionState()
    return _sessions[conversation_id]


def update_memory(session: SessionState, extracted):
    pprint(extracted)
    session.update_agent_state(extracted)


def decide_next_action(session: SessionState):
    session.update_stage()
    current_stage = session.stage
    return STAGES.get(current_stage)


def _format_listing(r, index: int) -> str:
    """Format a listing row into a clean, readable text block."""
    price = r.rent_price if r.listing_type == "rent" else r.sale_price
    price_label = r.listing_type or "rent"
    price_str = f"${price:,.0f}/month" if price_label == "rent" else f"${price:,.0f}"
    area_str = r.area or r.city or "Unknown area"
    furnishing_str = r.furnishing or "unfurnished"
    bedrooms_str = f"{r.bedrooms} bed" if r.bedrooms else "? bed"
    bathrooms_str = f"{r.bathrooms} bath" if r.bathrooms else ""
    bed_bath = f"{bedrooms_str}, {bathrooms_str}" if bathrooms_str else bedrooms_str

    desc_snippet = ""
    if r.description:
        desc_snippet = (r.description[:100] + "...") if len(r.description) > 100 else r.description

    lines = [f"{index}. {r.title}"]
    lines.append(f"   {area_str}, {bed_bath}, {furnishing_str}, {price_str}")
    if desc_snippet:
        lines.append(f"   {desc_snippet}")
    return "\n".join(lines)


def generate_reply(action, user_message, db, conversation, conversation_id, session: SessionState) -> list[str]:
    state = session.getter()
    property_info = state.get("property_info", {})

    message = ""

    # Short-circuit: bare greeting gets a deterministic hardcoded response.
    # No LLM call needed. This prevents Claude from ignoring the instruction
    # and dumping qualification questions when the user just says hi/hello.
    if session.bare_greeting:
        arabic_patterns = re.compile(
            r'\b(marhaba|ahla|salam|kifak|bonjour|ahlan|yiiii|ya3ne|hayde|shu|wein|baddi)\b',
            re.IGNORECASE
        )
        if arabic_patterns.search(user_message):
            return ["Marhaba kifak, shu fine a3mile la2ak?"]
        return ["Hello! How can I help you?"]

    if action == "intent_detection":
        message = """
Important behavior rules:

- First respond naturally to what the user just said.
- Do NOT repeat the same greeting message.
- Do NOT restart the conversation every time.
- Keep responses short and conversational.
- If the user is greeting or making small talk, respond like a human agent would.
- Guide the user toward explaining their real estate need.
"""

    elif action == "handoff_or_finish":
        requirements = property_info
        conversation.user_requirements = requirements

        agent = find_best_agent(db, requirements)
        if agent:
            assign_agent(db, conversation.id, agent.id)
            tool_output = f"Handed off to agent {agent.name}."
        else:
            tool_output = "No available agent found, but requirements logged."

        event = Event(event_type="handoff", payload={"conversation_id": conversation_id, "agent_id": agent.id if agent else None})
        db.add(event)
        db.commit()

        name = state.get("user_info", {}).get("name", "")
        message = f"""
Important behavior rules:

- Inform the user: {tool_output}

Example:
"Hey {name}! I'm connecting you with one of our agents now." ||| "They'll be in touch with you shortly!"
"""

    elif action == "collect_property_info":
        missing = []

        if not property_info.get("link_or_id"):
            missing.append("property link or ID")

        if not state.get("user_info", {}).get("name"):
            missing.append("your full name")

        if missing:
            message = f"Ask user for this missing information: **{', '.join(missing)}**."
        else:
            message = "Could you please share more details about the property?"

    elif action == "process_property_request":
        try:
            link_or_id = property_info.get("link_or_id")
            location = property_info.get("location")
            budget_min = property_info.get("budget_min")
            budget_max = property_info.get("budget_max")
            bedrooms = property_info.get("bedrooms")
            furnishing = property_info.get("furnishing")

            msg = ""

            if link_or_id:
                listing = db.query(Listing).filter(
                    Listing.property_id == link_or_id
                ).first()

                if listing:
                    price = listing.rent_price if listing.listing_type == "rent" else listing.sale_price
                    price_str = f"${price:,.0f}/month" if listing.listing_type == "rent" else f"${price:,.0f}"
                    desc_snippet = ""
                    if listing.description:
                        desc_snippet = (listing.description[:100] + "...") if len(listing.description) > 100 else listing.description

                    msg = f"""
Property found:
  Title: {listing.title}
  Location: {listing.area or listing.city}
  Bedrooms: {listing.bedrooms or 'N/A'}, Bathrooms: {listing.bathrooms or 'N/A'}
  Furnishing: {listing.furnishing or 'N/A'}
  Price: {price_str}
  Type: {'For Rent' if listing.listing_type == 'rent' else 'For Sale'}
  {f'Details: {desc_snippet}' if desc_snippet else ''}

Present this property in a natural, friendly way.
Tell the user the property is available and share the details clearly.
Then ask if they want to book a visit.
Use ||| to separate the property details message from the follow-up question.
"""
                else:
                    msg = """
No property found with that link or ID.
Let the user know it may not be in the database or the link may be wrong.
Offer to search for similar properties based on their preferences.
"""

            else:
                has_budget = budget_min or budget_max

                if location and has_budget:
                    results = search_listings(db, property_info)

                    if results:
                        results_to_show = results[:5]
                        result_count = len(results_to_show)
                        formatted_listings = "\n\n".join([
                            _format_listing(r, i) for i, r in enumerate(results_to_show, 1)
                        ])
                        area_label = location or "your area"

                        if result_count == 1:
                            opening_instruction = "First send a short opening message appropriate for a single result, like 'Here you go' or 'Check this one out'. Do NOT use plural language or say 'options'."
                            recommendation_instruction = "Skip the recommendation line since there is only one result."
                        else:
                            opening_instruction = f"First send a short opening message like 'On it' or 'Here you go'. Do NOT say 'Found some great options', 'searching now', 'looking now', or any variation."
                            recommendation_instruction = "Then recommend which option is closest to their criteria by saying something like 'Option X is probably the closest to what you had in mind'."

                        msg = f"""
LISTINGS FOUND — present these to the user.
{opening_instruction}
Then send the numbered listings as one message.
{recommendation_instruction}
Then send a final separate message saying 'What do you think?'
Use ||| to separate these parts.

LISTINGS:
{formatted_listings}
"""
                    else:
                        alt_results = recommend_alternatives(db, property_info)
                        if alt_results:
                            alt_to_show = alt_results[:5]
                            alt_count = len(alt_to_show)
                            formatted_listings = "\n\n".join([
                                _format_listing(r, i) for i, r in enumerate(alt_to_show, 1)
                            ])
                            if alt_count == 1:
                                alt_opening = "Tell the user this is slightly above their budget but is the closest match available, and let them decide if they want to stretch."
                                alt_recommendation = "Skip the recommendation line since there is only one result."
                            else:
                                alt_opening = "Tell the user these are slightly above their budget but are the closest matches available, and let them decide if they want to stretch."
                                alt_recommendation = "Then recommend which option is closest to their criteria by saying something like 'Option X is probably the closest to what you had in mind'."
                            msg = f"""
No exact match found for their criteria. Present these alternative listings.
{alt_opening}
{alt_recommendation}
Then send a final separate message saying 'What do you think?'
Use ||| to separate: opening message ||| listings ||| recommendation ||| 'What do you think?'

ALTERNATIVE LISTINGS:
{formatted_listings}
"""
                        else:
                            msg = """
CRITICAL: There are ZERO listings matching their criteria in the database right now.
Do NOT say you found options. Do NOT make up or invent listings. Do NOT hallucinate properties.
Tell the user honestly that you could not find matching properties right now but you will keep looking.
Offer to connect them with a human agent who might have more options off-market.
Be honest and direct.
"""
                else:
                    msg = """
Not enough information to search yet.
Budget range is required before searching. Ask for location and budget range.
If location is already known, ask only for the budget range.
Bundle it into one short message.
"""

            message = f"""
Be natural and conversational.
Present property information clearly.
Help the user move toward booking a visit.
Do NOT echo or summarize the user's requirements before presenting results. If you need to acknowledge their last input, say something brief like "All right, noted!" then go straight to the listings.

{msg}
"""

        except Exception as e:
            print("Error in process_property_request:", e)
            message = """
Something went wrong while searching.
Ask the user politely to try again or re-share their preferences.
"""

    elif action == "more_info_needed":
        classification = state.get("classification")
        has_name = state.get("user_info", {}).get("name")
        bare_greeting = state.get("bare_greeting", False)

        if classification == "B":
            # Bare greeting: user sent only "hi" / "hello" / "marhaba" with no intent
            if bare_greeting:
                message = """
The user sent only a greeting with no property intent whatsoever.
Respond with ONE single message only: "Hello how can I help you?" or a natural variation in their language.
Do NOT ask qualification questions. Do NOT ask for their name. Do NOT say "thanks for reaching out".
Just ask how you can help.
Lebanese Arabic variation: "Marhaba kifak, shu fine a3mile la2ak?"
"""
            else:
                # listing_type must be known before anything else.
                # If missing, ask only that one question and stop.
                if not property_info.get("listing_type"):
                    if not has_name:
                        message = """
Entry B: listing type unknown. This is first contact. Send exactly 2 messages using ||| as separator:

Message 1: "Hello, thanks for reaching out!" - use this exact phrase or a natural variation in their language. NOTHING ELSE.
Message 2: "Is this for rent or to buy?"

Example: "Hello, thanks for reaching out!" ||| "Is this for rent or to buy?"
"""
                    else:
                        message = """
Ask ONLY: "Is this for rent or to buy?"
One question. Nothing else. Do not bundle with other questions.
"""

                else:
                    missing_fields = []
                    if not property_info.get("location"):
                        missing_fields.append("preferred location")
                    if not property_info.get("bedrooms"):
                        missing_fields.append("number of bedrooms")
                    if not property_info.get("budget_min") and not property_info.get("budget_max"):
                        missing_fields.append("budget range")
                    if not property_info.get("furnishing"):
                        missing_fields.append("furnished or unfurnished")

                    if missing_fields and not has_name:
                        missing_str = ", ".join(missing_fields)

                        # Check if location is a governorate or district and ask for more specificity
                        location_val = property_info.get("location", "")
                        area_note = ""
                        if location_val:
                            loc_type, loc_canonical = get_location_type(location_val)
                            if loc_type == 'governorate':
                                examples = get_area_examples(loc_canonical, 'governorate')
                                area_note = f" Also ask if they have a specific area in {location_val.title()} in mind, like {examples}."
                            elif loc_type == 'district':
                                examples = get_area_examples(loc_canonical, 'district')
                                area_note = f" Also ask if they have a specific town in {location_val.title()} in mind, like {examples}."
                            # If city or unknown, no area_note needed

                        message = f"""
Entry B: listing type is known. First contact or early stage. Send exactly 3 messages using ||| as separator:

Message 1: "Hello, thanks for reaching out!" — use this exact phrase or a natural variation in their language. NOTHING ELSE.
Message 2: ONE bundled question starting with a leading phrase like "Sure, to help you find the best options," then asking for ALL of these at once: {missing_str}.{area_note}
Message 3: "What's your full name btw?"

Example: "Hello, thanks for reaching out!" ||| "Sure, to help you find the best options, what's your budget range, how many bedrooms, and would you prefer furnished or unfurnished?" ||| "What's your full name btw?"

WRONG examples (NEVER do this):
- "Marhaba! Looking for a place in Zalka, nice area." — NO, don't echo the user
- "Hello! An apartment in Beirut, great choice." — NO, don't echo the user
- "Hey! Furnished 3-bedroom, got it." — NO, don't repeat their requirements

NEVER ask name first. NEVER ask fields separately. NEVER write one big paragraph.
"""
                    elif missing_fields:
                        missing_str = ", ".join(missing_fields)
                        message = f"""
Ask only for these missing details in one short message: {missing_str}
Do NOT re-ask for anything already known.
Keep it casual and brief.
"""
                    elif not has_name:
                        message = """
Ask for the user's full name naturally and briefly.
"""
                    else:
                        message = """
All required info is collected. Let the user know you are finding options for them.
"""

        elif classification == "A2":
            if not state.get("user_info", {}).get("not_link_or_id"):
                message = """
Ask the user for the listing link or property ID so you can check the details.
Keep it brief and friendly.
"""
            else:
                # No link available, treat like B discovery
                missing_fields = []
                if not property_info.get("location"):
                    missing_fields.append("location")
                if not property_info.get("budget_min") and not property_info.get("budget_max"):
                    missing_fields.append("budget")
                if not property_info.get("bedrooms"):
                    missing_fields.append("bedrooms")
                if not property_info.get("furnishing"):
                    missing_fields.append("furnishing preference")
                if missing_fields:
                    missing_str = ", ".join(missing_fields)
                    message = f"""
No link available. Ask for search details to find similar properties.
Ask for these in one bundled message: {missing_str}
"""
                else:
                    message = """
All info collected. Tell the user you are searching for options.
"""
        else:
            message = """
Greet the user naturally and ask how you can help them find a property in Lebanon.
"""

    system_prompt = get_reply_system_prompt(message)
    combined_system = f"{system_prompt}\n\nCurrent session state: {state}"

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=combined_system,
        messages=[{"role": "user", "content": user_message}]
    )

    raw_reply = response.content[0].text

    # Split on ||| delimiter and clean each part, stripping any stray quotation marks
    parts = [p.strip().strip('"').strip("'").strip() for p in raw_reply.split("|||") if p.strip()]
    return parts if parts else [raw_reply]


def extract_entities(message, history):

    messages = [
        *history,
        {"role": "user", "content": message}
    ]

    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1024,
        system=intent_detection_prompt,
        messages=messages
    )

    raw_text = response.content[0].text.strip()
    # Strip markdown code fences if Claude wraps the JSON
    raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text)
    raw_text = re.sub(r'\s*```$', '', raw_text).strip()
    data = json.loads(raw_text)

    return data


def process_user_message(db: Session, conversation_id: int, user_message: str, **kwargs) -> list[str]:
    history = []

    # Get or create the per-conversation session
    session = get_session(conversation_id)

    # Fetch conversation and recent history
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    recent_messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.timestamp.desc())
        .limit(10)
        .all()
    )
    recent_messages = list(reversed(recent_messages))

    for msg in recent_messages:
        history.append({
            "role": msg.role,
            "content": msg.content
        })

    # Save user message to DB
    new_msg = Message(conversation_id=conversation_id, role="user", content=user_message)
    db.add(new_msg)
    db.commit()

    extracted = extract_entities(user_message, history)

    # Update session memory with extracted info
    update_memory(session, extracted)

    # Decide next action based on current session state
    action = decide_next_action(session)

    # Generate reply based on the action
    reply_parts = generate_reply(action, user_message, db, conversation, conversation_id, session)

    # Save full reply as one message in DB (joined for history context)
    full_reply = " ||| ".join(reply_parts)
    ai_msg = Message(conversation_id=conversation_id, role="assistant", content=full_reply)
    db.add(ai_msg)
    db.commit()

    return reply_parts
