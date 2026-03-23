import json
from openai import OpenAI
from sqlalchemy.orm import Session
from app.config import settings
from app.services.matching import search_listings, recommend_alternatives
from app.services.routing import find_best_agent, assign_agent
from app.models import Conversation, Message, Event, Listing
from app.services.prompt import intent_detection_prompt, get_reply_system_prompt, Normal_conversation_prompt
from app.services.session import SessionState, STAGES
from pprint import pprint

client = OpenAI(api_key=settings.OPENAI_API_KEY)



session = SessionState()



def update_memory(extracted):
    pprint(extracted)

    session.update_agent_state(extracted)




def decide_next_action():
    session.update_stage()

    current_stage = session.stage

    return STAGES.get(current_stage)




#     Step 3:
#     If the user's name and some property preferences are already known, and the user appears to be looking to rent, ask when they plan to move in.



def generate_reply(action, user_message, db, conversation, conversation_id):
    state = session.getter()  # your session snapshot
    property_info = state.get("property_info", {})

    message = ""

    # ---------------------------
    # ACTION HANDLER
    # ---------------------------
    if action == "intent_detection":
        message = """
Important behavior rules:

- First respond naturally to what the user just said.
- Do NOT repeat the same greeting message.
- Do NOT restart the conversation every time.
- Keep responses short and conversational.
- If the user is greeting or making small talk, respond like a human agent would.
- Do NOT ask for too much information at once.

Your goal is simply to guide the user toward explaining their real estate need.
"""



    elif action == "handoff_or_finish":
        requirements = property_info
        conversation.user_requirements = requirements
        
        # Find agent
        agent = find_best_agent(db, requirements)
        if agent:
            assign_agent(db, conversation.id, agent.id)
            tool_output = f"Handed off to agent {agent.name}."
        else:
            tool_output = "Not found available agent found, but requirements logged."
        
        # Create Handoff Event
        event = Event(event_type="handoff", payload={"conversation_id": conversation_id, "agent_id": agent.id if agent else None})
        db.add(event)
        db.commit()

        # Log the handoff event
        message = f"""
Important behavior rules:

- Inform the user that you are **{tool_output}**

example messages:
- Hey {state.get('user_info', {}).get('name', '')}! Based on what you've shared, I'm connecting you with one of our expert agents who can assist you further. Please hold on for a moment while I do that.
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

            # ---------------------------
            # 1️⃣ PROPERTY BY LINK/ID
            # ---------------------------
            if link_or_id:
                listing = db.query(Listing).filter(
                    Listing.property_id == link_or_id
                ).first()

                if listing:
                    price = listing.rent_price if listing.listing_type == "rent" else listing.sale_price

                    msg = f"""
    Property Details:
        - Title: {listing.title}
        - Location: {listing.city}
        - Bedrooms: {listing.bedrooms or 'N/A'}
        - Bathrooms: {listing.bathrooms or 'N/A'}
        - Furnishing: {listing.furnishing or 'N/A'}
        - Price: {price} USD
        - Type: {listing.listing_type}
        - ID: {listing.property_id}

    Instructions:
        - Present this in a clean, easy-to-read format.
        - Use spacing or bullet points if needed.
        - After presenting, ask the user if this is the property they are referring to.
    """
                else:
                    msg = """
    No property found with that ID.

    Ask the user to confirm the ID or provide more details.
    """

            # ---------------------------
            # 2️⃣ SEARCH BASED ON PREFERENCES
            # ---------------------------
            else:
                has_filters = any([budget_min, budget_max, bedrooms, furnishing])

                if location and has_filters:
                    results = search_listings(db, property_info)

                    if results:
                        formatted_results = "\n".join([
                            f"- {r.title} in {r.city} | {r.bedrooms or '?'} bed | {r.bathrooms or '?'} bath | "
                            f"{r.furnishing or 'unknown'} | "
                            f"{(r.rent_price if r.listing_type == 'rent' else r.sale_price)} USD"
                            for r in results[:5]
                        ])
                    else:
                        alternative_results = recommend_alternatives(db, property_info)
                        if alternative_results:
                            formatted_results = "I couldn't find an exact match, but here are some alternative properties:\n".join([
                                f"- {r.title} in {r.city} | {r.bedrooms or '?'} bed | {r.bathrooms or '?'} bath | "
                                f"{r.furnishing or 'unknown'} | "
                                f"{(r.rent_price if r.listing_type == 'rent' else r.sale_price)} USD"
                                for r in alternative_results[:5]
                            ])

                        msg = f"""
    Matching Properties in {location}:

    {formatted_results}

    Ask the user which one they like or if they want more options.
    """
                        
                else:
                    msg = """
    Not enough information.

    Ask the user for:
    - Location
    - And at least one of: budget, bedrooms, or furnishing
    """

            # ---------------------------
            # FINAL PROMPT
            # ---------------------------
            message = f"""
    Instructions:
    - Be natural and conversational.
    - Present information clearly.
    - Help the user move forward.

    {msg}
    """

        except Exception as e:
            print("Error in process_property_request:", e)
            message = """
    Something went wrong while searching for properties.

    Ask the user politely to try again or re-share their preferences.
    """





    elif action == "more_info_needed":

        if state.get("classification") == "B":

            if not property_info.get("link_or_id") and not state.get("user_info", {}).get("not_link_or_id"):
                message = """
Important beahavior rules:

- Ask users for the property link or ID 

Example:
Please could you share the property link or ID, so i can assist you better?
"""

            elif not state.get("user_info", {}).get("name") :
                message = """
Important beahavior rules:

- Ask users for their full name

"""
            

            else:
                excluded_fields = {"link_or_id", "timeline"}

                missing_fields = [
                    key for key, value in property_info.items()
                    if key not in excluded_fields and value in (None, "", [])
                ]

                total_required = len(property_info) - len(excluded_fields)

                # Human-friendly field names
                field_map = {
                    "budget_min": "minimum budget",
                    "budget_max": "maximum budget",
                    "bedrooms": "number of bedrooms",
                    "bathrooms": "number of bathrooms",
                    "property_type": "property type",
                    "furnishing": "furnishing preference",
                    "location": "preferred location",
                    "listing_type": "listing type"
                }

                readable_fields = [field_map.get(f, f) for f in missing_fields]

                if missing_fields:
                    message =  f"""
                    Important behavior rules:

                    - Ask user for all this missing information: **{', '.join(readable_fields)}?**
                    """
                else:
                    if not property_info.get("timeline"):
                        message = """
                        Important behavior rules:

                        - Ask user about their timeline for buying or renting
                        """

    # ---------------------------
    # LLM GENERATION
    # ---------------------------
    system_prompt = get_reply_system_prompt(message)

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "system", "content": f"Current session state: {state}"},
        {"role": "user", "content": user_message}
    ]

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )

    reply = completion.choices[0].message.content
    return reply




def extract_entities(message, history):

    messages = [
        {"role": "system", "content": intent_detection_prompt},
        *history,
        {"role": "user", "content": message}
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        response_format={"type": "json_object"}
    )

    data = json.loads(response.choices[0].message.content)

    return data




def process_user_message(db: Session, conversation_id: int, user_message: str, **kwargs) -> str:
    history = []

    # 1. Fetch conversation history
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

    #STEP 2: Update session memory with extracted info
    update_memory(extracted)

    #STEP 3: Decide next action based on current session state
    action = decide_next_action()

    # Generate reply based on the action
    reply = generate_reply(action, user_message, db, conversation, conversation_id)

    ai_msg = Message(conversation_id=conversation_id, role="assistant", content=reply)
    db.add(ai_msg)
    db.commit()

    return reply


