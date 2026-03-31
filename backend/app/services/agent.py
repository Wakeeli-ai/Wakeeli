import json
import re
import anthropic
from sqlalchemy.orm import Session
from app.config import settings
from app.services.matching import search_listings, recommend_alternatives
from app.services.geography import REGION_MAP, GOVERNORATE_MAP, DISTRICT_MAP, GOVERNORATE_NAMES, DISTRICT_NAMES, get_location_type, get_area_examples
from app.services.routing import find_best_agent, assign_agent
from app.models import Conversation, Message, Event, Listing
from app.services.prompt import (
    intent_detection_prompt,
    get_reply_system_prompt,
    get_static_system_prompt,
    get_dynamic_action_prompt,
    Normal_conversation_prompt,
)
from app.services.session import SessionState, STAGES
from app.services.token_tracker import log_usage, check_token_budget
from pprint import pprint

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

# Per-conversation session storage keyed by conversation_id (int)
_sessions: dict = {}

# Routing detection patterns
_DISMISSIVE_PATTERNS = re.compile(
    r"\b(no|nah|nope|not interested|none of these|none of them|don'?t like|don'?t want|"
    r"not what i|no thanks|pass|nothing here|nothing works|not for me)\b",
    re.IGNORECASE
)

_TODAY_PATTERNS = re.compile(
    r"\b(today|tonight|right now|this morning|this afternoon|this evening)\b",
    re.IGNORECASE
)

_RESCHEDULE_PATTERNS = re.compile(
    r"\b(reschedule|change.{0,15}(visit|appointment|booking|time|day)|"
    r"move.{0,15}(visit|appointment|booking)|postpone|different (day|time|slot))\b",
    re.IGNORECASE
)

_FAR_TIMELINE_PATTERNS = re.compile(
    r"(just browsing|not sure when|not sure yet|not looking (yet|now|anytime soon)|"
    r"next year|no rush|no hurry|not urgent|few months|several months|"
    r"\b[3-9]\s*months?\b|\b1[0-9]\s*months?\b)",
    re.IGNORECASE
)

# Pattern to strip internal chain-of-thought reasoning that leaks into responses
_THINKING_LINE_PATTERN = re.compile(
    r'^(?:Wait[,.]|Hmm[,.]?|Hm[,.]?|Actually,\s+(?:let|I|wait)|'
    r'Let me restart|Let me re-think|Let me reconsider|Let me start over|'
    r'I need to reset|I need to reconsider|I realize[d]?\s+I|'
    r'Rethinking this|Re-reading this|'
    r'I already\b|I should\b|I notice[d]?\b|Looking at\b|Based on\b|'
    r'Oh,|Okay,|OK,|Right,|So,)[^\n]*(?:\n|$)',
    re.IGNORECASE | re.MULTILINE
)

# Phrases that indicate self-referential reasoning leaking into a response part
_SELF_REF_PHRASES = re.compile(
    r'\b(let me restart|i need to|i realize[d]?|wait[,\s]+i|hmm[,\s]+i)\b',
    re.IGNORECASE
)


def _strip_internal_reasoning(text: str) -> str:
    """Remove chain-of-thought reasoning that leaked into the bot response."""
    # First pass: remove lines that start with known thinking prefixes
    cleaned = _THINKING_LINE_PATTERN.sub('', text).strip()
    # Second pass: after splitting on |||, drop any segment containing self-referential phrases
    segments = cleaned.split('|||')
    filtered = []
    for seg in segments:
        if _SELF_REF_PHRASES.search(seg):
            continue
        if seg.strip():
            filtered.append(seg)
    return '|||'.join(filtered).strip()


def _check_routing_conditions(session: SessionState, user_message: str):
    """Check if any special routing condition is met. Returns (should_route, message)."""

    # Reschedule check
    if _RESCHEDULE_PATTERNS.search(user_message):
        return True, "Let me connect you with your agent to reschedule."

    # Same-day visit check (only relevant after listings have been shown)
    if session.listings_shown and _TODAY_PATTERNS.search(user_message):
        return True, "Let me connect you with one of our agents to arrange that for you."

    # Far timeline check (only meaningful once listings have been shown or user is qualified)
    if session.listings_shown and _FAR_TIMELINE_PATTERNS.search(user_message):
        return True, "No problem! Let me connect you with one of our agents who can keep you updated when something comes up."

    # Dismissive check after listings shown
    if session.listings_shown and _DISMISSIVE_PATTERNS.search(user_message):
        session.rejection_count += 1
        if session.rejection_count == 1:
            # First rejection: do not route yet, offer alternatives instead
            session.show_alternatives = True
            return False, ""
        if session.rejection_count >= 2:
            return True, "Let me connect you with one of our agents who might have more options for you."

    return False, ""


def get_session(conversation_id: int) -> SessionState:
    """Return the SessionState for this conversation, creating one if needed."""
    if conversation_id not in _sessions:
        _sessions[conversation_id] = SessionState()
    return _sessions[conversation_id]


def update_memory(session: SessionState, extracted):
    pprint(extracted)
    # LBP fallback: if budget values look like LBP (over 50,000), auto-convert to USD
    # Rate: 89,500 LBP = 1 USD
    prop_info = extracted.get("property_info", {})
    session.lbp_converted = {}
    if prop_info:
        for key in ("budget_min", "budget_max"):
            val = prop_info.get(key)
            if val and isinstance(val, (int, float)) and val > 50000:
                usd_val = round(val / 89500)
                session.lbp_converted[key] = usd_val
                prop_info[key] = usd_val
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
    try:
        return _generate_reply_inner(action, user_message, db, conversation, conversation_id, session)
    except Exception as e:
        print(f"generate_reply: unhandled error (action={action}): {e}")
        return ["Give me one moment, something went wrong on my end. Please try again."]


def _generate_reply_inner(action, user_message, db, conversation, conversation_id, session: SessionState) -> list[str]:
    state = session.getter()
    property_info = state.get("property_info", {})

    # BUG 1 fix: listing reply parts are built directly and returned without
    # relying on the LLM to reproduce the formatted listing text.
    # This attribute is set below in process_property_request when listings are found.
    _direct_parts: list[str] | None = None

    message = ""
    # Capture greeted status BEFORE any action block modifies it.
    # Used at the end to decide whether to prepend the anti-greeting safety prefix.
    was_greeted = session.greeted

    # Short-circuit: bare greeting gets a deterministic hardcoded response.
    # No LLM call needed. This prevents Claude from ignoring the instruction
    # and dumping qualification questions when the user just says hi/hello.
    if session.bare_greeting:
        arabic_patterns = re.compile(
            r'\b(marhaba|ahla|salam|kifak|bonjour|ahlan|yiiii|ya3ne|hayde|shu|wein|baddi)\b',
            re.IGNORECASE
        )
        if arabic_patterns.search(user_message):
            session.greeted = True
            return ["Marhaba kifak, shu fine a3mile la2ak?"]
        session.greeted = True
        return ["Hello! How can I help you?"]

    if action == "route_to_agent":
        route_message = session.pending_route_message or "Let me connect you with one of our agents."
        session.pending_route_message = None

        requirements = property_info
        if conversation is not None:
            conversation.user_requirements = requirements

        agent = find_best_agent(db, requirements)
        if agent and conversation is not None:
            assign_agent(db, conversation.id, agent.id)
            event = Event(event_type="handoff", payload={"conversation_id": conversation_id, "agent_id": agent.id})
        elif agent:
            event = Event(event_type="handoff", payload={"conversation_id": conversation_id, "agent_id": agent.id})
        else:
            event = Event(event_type="handoff", payload={"conversation_id": conversation_id, "agent_id": None})
        db.add(event)
        db.commit()

        session.handed_off = True
        return [route_message]

    elif action == "intent_detection":
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
        if conversation is not None:
            conversation.user_requirements = requirements

        agent = find_best_agent(db, requirements)
        if agent:
            if conversation is not None:
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
        # Mark as greeted so subsequent turns in the A1 flow don't re-greet
        session.greeted = True
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

                    # Find similar listings for cross-sell after booking confirmation
                    similar_filters = {
                        "listing_type": listing.listing_type,
                        "location": listing.area or listing.city,
                    }
                    price_val = listing.rent_price if listing.listing_type == "rent" else listing.sale_price
                    if price_val:
                        similar_filters["budget_max"] = price_val * 1.3
                    all_similar = search_listings(db, similar_filters)
                    similar_listings = [r for r in all_similar if r.property_id != link_or_id][:3]

                    similar_section = ""
                    if similar_listings:
                        similar_formatted = "\n\n".join([
                            _format_listing(r, i) for i, r in enumerate(similar_listings, 1)
                        ])
                        similar_section = (
                            "\n\nCROSS-SELL CONTEXT:\n"
                            "When the user confirms a visit booking, after sending the booking confirmation summary, "
                            "add one more message: \"I'll also send you a couple similar options that might interest you.\""
                            " Then present these similar listings:\n"
                            + similar_formatted
                        )

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
{similar_section}
"""
                else:
                    msg = """
No property found with that link or ID.
Let the user know it may not be in the database or the link may be wrong.
Offer to search for similar properties based on their preferences.
"""

            else:
                has_budget = budget_min or budget_max

                if session.listings_shown:
                    # Correction detection: if the user sent updated criteria that differ
                    # from the previous property_info, run a fresh DB search instead of
                    # letting Claude guess or hallucinate listings.
                    prev = getattr(session, '_prev_property_info', {})
                    correction_keys = ('bedrooms', 'location', 'budget_min', 'budget_max',
                                       'furnishing', 'listing_type')
                    criteria_changed = any(
                        session.property_info.get(k) != prev.get(k)
                        and session.property_info.get(k) is not None
                        for k in correction_keys
                    )

                    if criteria_changed:
                        # BUG 7 fix: reset listings_shown and re-search rather than
                        # falling back to agent. Only fall back if truly zero results.
                        session.listings_shown = False
                        results = search_listings(db, session.property_info)
                        if results:
                            session.listings_shown = True
                            results_to_show = results[:5]
                            result_count = len(results_to_show)
                            formatted_listings = "\n\n".join([
                                _format_listing(r, i) for i, r in enumerate(results_to_show, 1)
                            ])

                            # BUG 1 fix: directly include listings in reply parts
                            if result_count == 1:
                                corr_opening_instruction = (
                                    "Send ONE short opening phrase only, like 'Here you go' or 'Check this one out'. "
                                    "Do NOT say 'options'. No listing text. Reply with the opening phrase only."
                                )
                                corr_recommendation_instruction = (
                                    "Send ONE short closing question only, like 'What do you think?' "
                                    "Reply with the closing question only. No listing text."
                                )
                            else:
                                corr_opening_instruction = (
                                    "Send ONE short opening phrase only, like 'Sure' or 'Here you go'. "
                                    "Do NOT say 'let me redo the search'. No listing text. Reply with the opening phrase only."
                                )
                                corr_recommendation_instruction = (
                                    "Send a recommendation line then 'What do you think?' as two short messages. "
                                    "Example: 'Option 2 is probably the closest to what you had in mind' ||| 'What do you think?' "
                                    "No listing text."
                                )

                            msg = f"""
CORRECTION FLOW: The user updated their search criteria. Fresh results are already included in the response by the system.
Your job is only to generate:
1. {corr_opening_instruction}
2. {corr_recommendation_instruction}
Do NOT comment on the criteria change. Do NOT say 'let me redo the search'. Do NOT reproduce the listing text.
Use ||| to separate your parts.
"""
                            _direct_parts = ["__LISTING_OPENER__", formatted_listings, "__LISTING_CLOSER__"]

                        else:
                            alt_results = recommend_alternatives(db, session.property_info)
                            if alt_results:
                                session.listings_shown = True
                                alt_to_show = alt_results[:5]
                                formatted_listings = "\n\n".join([
                                    _format_listing(r, i) for i, r in enumerate(alt_to_show, 1)
                                ])
                                msg = f"""
CORRECTION FLOW: No exact match for updated criteria. Alternative listings are already included in the response by the system.
Your job is only to generate:
1. An opener telling the user these are slightly above their budget. Say: 'These are a bit above your range but they are the closest available right now.' Send that sentence only.
2. Send 'What do you think?' as a closing.
Do NOT reproduce the listing text. Use ||| to separate your parts.
"""
                                _direct_parts = ["__LISTING_OPENER__", formatted_listings, "__LISTING_CLOSER__"]

                            else:
                                # BUG 7 fix: if truly zero results even after relaxing filters,
                                # route to agent cleanly rather than crashing the flow.
                                msg = """
CORRECTION FLOW: No listings match the updated criteria.
Do NOT reveal there are zero results. Connect to agent: 'Let me connect you with one of our agents who might have more options for you.'
"""
                    else:
                        alternatives_instruction = ""
                        if session.show_alternatives:
                            session.show_alternatives = False
                            alternatives_instruction = (
                                "\nCRITICAL: The user just rejected the previous options but is NOT leaving. "
                                "They want to see different options. "
                                "Do NOT say goodbye. Do NOT end the conversation. Do NOT route to an agent. "
                                "Say exactly: 'Sure, want me to look at different options?' or "
                                "'Want me to adjust the search?' Keep it to one short sentence."
                            )

                        msg = f"""
The user has already seen listings. This is a follow-up message in the ongoing conversation.
{alternatives_instruction}
Respond naturally based on what the user just said. Possible scenarios:
- If they expressed interest in a specific option: move to booking a visit. Ask what day works.
- If they confirmed a visit time (e.g. 'Wednesday works', 'yeah that works', 'sure'): send a clean booking confirmation summary. Format: "Your visit is set for [day] at [time]" ||| "I'll be connecting you with the agent shortly"
- If they asked about address or location details: say "The agent will share the address with you." Keep it brief.
- If they asked a question about a specific property (price, size, features): answer from the listings context if possible, or say the agent will have more details.
- If they seem unsure or said something vague: ask what specifically they are unsure about or if they want to see different options. Keep it short.
- If they want to adjust criteria: acknowledge and offer to search again.
- Do NOT re-present the same listings again unless they explicitly ask.
- Do NOT ask for location, budget, or other criteria already collected.
- Keep responses short and conversational. Use ||| to separate if sending multiple messages.

User message to respond to: {user_message}
"""
                elif location and has_budget:
                    results = search_listings(db, property_info)

                    if results:
                        session.listings_shown = True
                        results_to_show = results[:5]
                        result_count = len(results_to_show)
                        formatted_listings = "\n\n".join([
                            _format_listing(r, i) for i, r in enumerate(results_to_show, 1)
                        ])

                        # BUG 1 fix: build reply parts directly so listings are always
                        # included in the response, not just in the LLM instruction.
                        if result_count == 1:
                            opening_instruction = (
                                "Send ONE short opening phrase only, like 'Here you go' or "
                                "'Check this one out'. Do NOT say 'options'. No listing text. "
                                "Reply with the opening phrase only."
                            )
                        else:
                            opening_instruction = (
                                "Send ONE short opening phrase only, like 'On it' or 'Here you go'. "
                                "Do NOT say 'Found some great options', 'searching now', or any variation. "
                                "Reply with the opening phrase only. No listing text."
                            )

                        if result_count == 1:
                            recommendation_instruction = (
                                "Send ONE short closing question only, like 'What do you think?' "
                                "Reply with the closing question only. No listing text."
                            )
                        else:
                            recommendation_instruction = (
                                "Send a recommendation line then 'What do you think?' as two separate short messages. "
                                "Example: 'Option 2 is probably the closest to what you had in mind' ||| 'What do you think?' "
                                "Reply with the recommendation and closing only. No listing text."
                            )

                        msg = f"""
LISTINGS FOUND. The listings are already included in the response by the system.
Your job is only to generate:
1. {opening_instruction}
2. {recommendation_instruction}
Do NOT reproduce the listing text. The listings block is injected automatically.
Use ||| to separate your parts.
"""
                        # Direct parts will be assembled after the LLM generates opener/closer
                        _direct_parts = ["__LISTING_OPENER__", formatted_listings, "__LISTING_CLOSER__"]

                    else:
                        alt_results = recommend_alternatives(db, property_info)
                        if alt_results:
                            session.listings_shown = True
                            alt_to_show = alt_results[:5]
                            alt_count = len(alt_to_show)
                            formatted_listings = "\n\n".join([
                                _format_listing(r, i) for i, r in enumerate(alt_to_show, 1)
                            ])

                            # BUG 1 fix: directly include alternatives in reply parts
                            if alt_count == 1:
                                alt_opening_instruction = (
                                    "Tell the user this listing is slightly above their budget. "
                                    "Say: 'This one is a bit above your range but it is the closest available right now.' "
                                    "Send that sentence only as the opener."
                                )
                                alt_recommendation_instruction = (
                                    "Send ONE short closing question only, like 'What do you think?' "
                                    "Reply with the closing question only. No listing text."
                                )
                            else:
                                alt_opening_instruction = (
                                    "Tell the user these are slightly above their budget. "
                                    "Say: 'These are a bit above your range but they are the closest available right now.' "
                                    "Send that sentence only as the opener."
                                )
                                alt_recommendation_instruction = (
                                    "Send a recommendation line then 'What do you think?' as two short messages. "
                                    "Example: 'Option 2 is probably the closest to what you had in mind' ||| 'What do you think?' "
                                    "Reply with the recommendation and closing only. No listing text."
                                )

                            msg = f"""
NO EXACT MATCH. Alternative listings are already included in the response by the system.
Your job is only to generate:
1. {alt_opening_instruction}
2. {alt_recommendation_instruction}
Do NOT reproduce the listing text. The listings block is injected automatically.
Use ||| to separate your parts.
"""
                            _direct_parts = ["__LISTING_OPENER__", formatted_listings, "__LISTING_CLOSER__"]

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
        already_greeted = session.greeted

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
                    if already_greeted:
                        # Greeting already sent in a previous turn. Ask only the question.
                        message = """
Ask ONLY: "Is this for rent or to buy?"
One question. Nothing else. Do not bundle with other questions. No greeting.
"""
                    elif not has_name:
                        # First contact. Send greeting + question.
                        session.greeted = True
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
                    asking_for_budget = (
                        not property_info.get("budget_min") and not property_info.get("budget_max")
                    )
                    if asking_for_budget:
                        missing_fields.append("budget range")
                    if not property_info.get("furnishing"):
                        missing_fields.append("furnished or unfurnished")

                    # Only increment budget_ask_count when we are actually about to send
                    # a message that asks for budget. Prevents double-counting on turns
                    # where the user provided a different field (e.g. location) but budget
                    # is still missing.
                    if asking_for_budget and missing_fields:
                        session.budget_ask_count += 1

                    if missing_fields and already_greeted and not has_name:
                        # Already greeted. Send bundled question + name ask. No greeting.
                        missing_str = ", ".join(missing_fields)

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

                        if session.name_ask_count >= 2:
                            # Already asked for name twice. Proceed without asking again.
                            message = f"""
Ask only for these missing details in one short message: {missing_str}.{area_note}
Do NOT include a greeting. Do NOT re-ask for anything already known.
Keep it casual and brief.
"""
                        else:
                            name_phrase = "What's your full name btw?" if session.name_ask_count == 0 else "And your name?"
                            session.name_asked = True
                            session.name_ask_count += 1
                            message = f"""
Already greeted. Do NOT repeat "Hello, thanks for reaching out!" or any greeting. Send exactly 2 messages using ||| as separator:

Message 1: ONE bundled question starting with a leading phrase like "Sure, to help you find the best options," then asking for ALL of these at once: {missing_str}.{area_note}
Message 2: "{name_phrase}"

Example: "Sure, to help you find the best options, what's your budget range, how many bedrooms, and would you prefer furnished or unfurnished?" ||| "{name_phrase}"

NEVER include a greeting in Message 1. NEVER write one big paragraph.
"""

                    elif missing_fields and already_greeted and has_name:
                        # Already greeted and name is known. Ask only missing fields. No greeting.
                        missing_str = ", ".join(missing_fields)

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

                        message = f"""
Ask only for these missing details in one short message: {missing_str}.{area_note}
Do NOT include a greeting. Do NOT re-ask for anything already known.
Keep it casual and brief.
"""

                    elif missing_fields and not has_name:
                        # First contact with missing fields.
                        missing_str = ", ".join(missing_fields)

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

                        if session.name_ask_count >= 2:
                            # Already asked for name twice. Skip name ask.
                            session.greeted = True
                            message = f"""
Entry B: listing type is known. First contact. Send exactly 2 messages using ||| as separator:

Message 1: "Hello, thanks for reaching out!" — use this exact phrase or a natural variation in their language. NOTHING ELSE.
Message 2: ONE bundled question starting with a leading phrase like "Sure, to help you find the best options," then asking for ALL of these at once: {missing_str}.{area_note}

WRONG examples (NEVER do this):
- "Marhaba! Looking for a place in Zalka, nice area." — NO, don't echo the user

NEVER ask fields separately. NEVER write one big paragraph.
"""
                        else:
                            session.name_asked = True
                            session.name_ask_count += 1
                            session.greeted = True
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
                        if session.name_ask_count >= 2:
                            # Asked twice already. Proceed without name.
                            message = """
All required info is collected. Let the user know you are finding options for them.
"""
                        else:
                            session.name_asked = True
                            session.name_ask_count += 1
                            message = """
All property details are collected but the name is still missing.
Send ONLY this exact message: "And your name?"
Nothing else. No other question. No filler.
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

    # Safety net: if the user was already greeted before this turn, prepend an explicit
    # instruction so the LLM cannot include any greeting regardless of which path ran.
    if was_greeted:
        message = (
            "IMPORTANT: Do NOT include any greeting like 'Hello' or 'Thanks for reaching out'. "
            "The user has already been greeted. Start directly with the question or information.\n\n"
            + message
        )

    static_prompt = get_static_system_prompt()
    dynamic_prompt = get_dynamic_action_prompt(message)
    session_state_text = f"\nCurrent session state: {state}"

    # Build system as a list of content blocks so the large static framework
    # is eligible for Anthropic prompt caching. The dynamic action instruction
    # and session state change every turn and are NOT cached.
    system_blocks = [
        {
            "type": "text",
            "text": static_prompt,
            "cache_control": {"type": "ephemeral"},
        },
        {
            "type": "text",
            "text": dynamic_prompt + session_state_text,
        },
    ]

    check_token_budget(len(static_prompt.split()) * 2, "claude-sonnet-4-6")

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            system=system_blocks,
            messages=[{"role": "user", "content": user_message}],
            extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
        )
        log_usage("claude-sonnet-4-6", response.usage, call_label="generate_reply")
        raw_reply = response.content[0].text
        raw_reply = _strip_internal_reasoning(raw_reply)
    except Exception as e:
        print(f"generate_reply: LLM call failed (action={action}): {e}")
        return ["Bear with me for a second, something went wrong. Please try again."]

    # Split on ||| delimiter and clean each part, stripping any stray quotation marks
    parts = [p.strip().strip('"').strip("'").strip() for p in raw_reply.split("|||") if p.strip()]

    # Listings flow: inject the formatted listings block between the LLM opener and closer.
    # _direct_parts = ["__LISTING_OPENER__", formatted_listings, "__LISTING_CLOSER__"]
    # LLM generates: opener (parts[0]) and closer (parts[1:])
    # Final reply: [opener, listings, ...closer_parts]
    if _direct_parts is not None:
        listing_block = _direct_parts[1]
        if parts:
            assembled = parts[0:1] + [listing_block] + parts[1:]
        else:
            assembled = [listing_block]
        return assembled

    return parts if parts else [raw_reply]


def extract_entities(message, history):
    # Build message list with cache_control on the last history message so
    # incremental conversation turns benefit from caching.
    messages: list[dict] = []
    if history:
        for hist_msg in history[:-1]:
            messages.append({"role": hist_msg["role"], "content": hist_msg["content"]})
        last_hist = history[-1]
        messages.append({
            "role": last_hist["role"],
            "content": [
                {
                    "type": "text",
                    "text": last_hist["content"],
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        })
    messages.append({"role": "user", "content": message})

    try:
        # Use Sonnet for long complex messages so all fields are reliably extracted
        word_count = len(message.split())
        extraction_model = "claude-sonnet-4-6" if word_count > 30 else "claude-haiku-4-5"

        # Cache the large static intent_detection_prompt
        system_blocks = [
            {
                "type": "text",
                "text": intent_detection_prompt,
                "cache_control": {"type": "ephemeral"},
            }
        ]

        response = client.messages.create(
            model=extraction_model,
            max_tokens=1024,
            system=system_blocks,
            messages=messages,
            extra_headers={"anthropic-beta": "prompt-caching-2024-07-31"},
        )
        log_usage(extraction_model, response.usage, call_label="extract_entities")

        raw_text = response.content[0].text.strip()
        # Strip markdown code fences if Claude wraps the JSON
        raw_text = re.sub(r'^```(?:json)?\s*', '', raw_text)
        raw_text = re.sub(r'\s*```$', '', raw_text).strip()
        data = json.loads(raw_text)
        return data

    except json.JSONDecodeError as e:
        print(f"extract_entities: JSON parse error: {e}")
        return {
            "classification": "B",
            "bare_greeting": False,
            "user_info": {"name": None, "not_link_or_id": False},
            "property_info": {
                "link_or_id": None, "listing_type": None, "location": None,
                "budget_min": None, "budget_max": None, "bedrooms": None,
                "bathrooms": None, "property_type": None, "furnishing": None,
                "timeline": None
            },
            "confidence": 0
        }
    except Exception as e:
        print(f"extract_entities: unexpected error: {e}")
        return {
            "classification": "B",
            "bare_greeting": False,
            "user_info": {"name": None, "not_link_or_id": False},
            "property_info": {
                "link_or_id": None, "listing_type": None, "location": None,
                "budget_min": None, "budget_max": None, "bedrooms": None,
                "bathrooms": None, "property_type": None, "furnishing": None,
                "timeline": None
            },
            "confidence": 0
        }


def process_user_message(db: Session, conversation_id: int, user_message: str, **kwargs) -> list[str]:
    history = []

    # Get or create the per-conversation session
    session = get_session(conversation_id)

    try:
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

        # If already handed off to agent, don't process further
        if session.handed_off:
            response_msg = "An agent will be reaching out to you shortly!"
            ai_msg = Message(conversation_id=conversation_id, role="assistant", content=response_msg)
            db.add(ai_msg)
            db.commit()
            return [response_msg]

        extracted = extract_entities(user_message, history)

        # Stash previous property_info before merging so correction detection can compare
        session._prev_property_info = dict(session.property_info)

        # Update session memory with extracted info
        update_memory(session, extracted)

        # Decide next action based on current session state
        action = decide_next_action(session)

        # Check routing conditions - may override the action
        should_route, route_message = _check_routing_conditions(session, user_message)
        if should_route:
            session.pending_route_message = route_message
            action = "route_to_agent"

        # Budget refusal: if budget was asked 2+ times and still not provided, route to agent
        if (action == "more_info_needed"
                and not session.property_info.get("budget_min")
                and not session.property_info.get("budget_max")
                and session.budget_ask_count >= 2):
            session.pending_route_message = "Let me connect you with one of our agents who can help you with that."
            action = "route_to_agent"

        # Generate reply based on the action
        reply_parts = generate_reply(action, user_message, db, conversation, conversation_id, session)

        # Save full reply as one message in DB (joined for history context)
        full_reply = " ||| ".join(reply_parts)
        ai_msg = Message(conversation_id=conversation_id, role="assistant", content=full_reply)
        db.add(ai_msg)
        db.commit()

        return reply_parts

    except Exception as e:
        print(f"process_user_message: unhandled error for conversation {conversation_id}: {e}")
        fallback = "Something went wrong on my end. Give me a second and try again."
        try:
            ai_msg = Message(conversation_id=conversation_id, role="assistant", content=fallback)
            db.add(ai_msg)
            db.commit()
        except Exception as db_err:
            print(f"process_user_message: could not save fallback message: {db_err}")
        return [fallback]
