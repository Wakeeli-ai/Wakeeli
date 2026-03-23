import json
from openai import OpenAI
from sqlalchemy.orm import Session
from app.config import settings
from app.services.matching import search_listings, recommend_alternatives
from app.services.routing import find_best_agent, assign_agent
from app.models import Conversation, Message, Event

client = OpenAI(api_key=settings.OPENAI_API_KEY)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "update_requirements",
            "description": "Update the user's property requirements as you learn them during conversation. Call this whenever the user mentions rent/buy preference, location, budget, bedrooms, property type, or any other requirements. This helps track what the user is looking for.",
            "parameters": {
                "type": "object",
                "properties": {
                    "listing_type": {"type": "string", "enum": ["rent", "buy"], "description": "Whether user wants to rent or buy"},
                    "location": {"type": "string", "description": "Preferred city or area"},
                    "budget_min": {"type": "number", "description": "Minimum budget in USD"},
                    "budget_max": {"type": "number", "description": "Maximum budget in USD"},
                    "bedrooms": {"type": "integer", "description": "Number of bedrooms needed"},
                    "bathrooms": {"type": "integer", "description": "Number of bathrooms needed"},
                    "property_type": {"type": "string", "description": "Type like Apartment, Villa, Studio, etc."},
                    "furnishing": {"type": "string", "enum": ["furnished", "unfurnished", "semi"]},
                    "additional_requirements": {"type": "array", "items": {"type": "string"}, "description": "Other requirements like parking, gym, sea view, etc."}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_listings",
            "description": "Search for real estate listings based on filters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "listing_type": {"type": "string", "enum": ["rent", "buy"]},
                    "location": {"type": "string"},
                    "budget_min": {"type": "number"},
                    "budget_max": {"type": "number"},
                    "bedrooms": {"type": "integer"},
                    "furnishing": {"type": "string", "enum": ["furnished", "unfurnished", "semi"]}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "recommend_alternatives",
            "description": "Recommend alternative listings when exact match fails.",
            "parameters": {
                "type": "object",
                "properties": {
                    "listing_type": {"type": "string", "enum": ["rent", "buy"]},
                    "location": {"type": "string"},
                    "budget_max": {"type": "number"},
                },
                "required": ["listing_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "handoff_to_agent",
            "description": "Hand off the conversation to a human agent when requirements are gathered or user requests it.",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string", "description": "Summary of user needs"},
                    "requirements": {
                        "type": "object",
                        "description": "Extracted requirements JSON"
                    }
                },
                "required": ["summary", "requirements"]
            }
        }
    }
]

SYSTEM_PROMPT = """You are Wakeeli, a professional real estate AI assistant.
Your goal is to help users find properties in Lebanon.
You understand Lebanese Arabic, English, and mixed speech.

Rules:
1. Extract user requirements: rent/buy, location, budget, bedrooms, furnishing.
2. IMPORTANT: Whenever the user mentions ANY requirement (rent vs buy, location, budget, bedrooms, property type, etc.), 
   immediately call 'update_requirements' with whatever info you've learned. Do this progressively as you learn new info.
3. Ask clarifying questions if info is missing.
4. Use 'search_listings' to find properties once you have enough info.
5. If no results, use 'recommend_alternatives'.
6. ONLY show listings returned by the tools. Do NOT invent listings.
7. When a lead is qualified (requirements gathered) or requests an agent, use 'handoff_to_agent'.
8. Be polite and match the user's language/tone.
"""



intent_system_prompt = """
You are an intelligent real-estate assistant responsible for understanding user requests and extracting structured information.

Your job is to read a user's message and determine their intent and any property requirements they mention.

The user may write informally, with spelling mistakes, incomplete sentences, or in any language. You must understand the meaning regardless of how the message is written.

SUPPORTED LANGUAGES:
The user may speak in any language (English, Spanish, French, Arabic, Yoruba, Hindi, etc.). Always interpret the message correctly and extract the information.

CONVERSATIONAL UNDERSTANDING:
Users may ask things in many ways, for example:
- "I need a 2 bedroom in Lekki under 2m"
- "Show me houses to rent in Abuja"
- "Is this property still available https://example.com/p/123"
- "Property ID 4456"
- "I'm looking for a cheap apartment in Lagos"
- "Quiero comprar una casa en Madrid"
- "Je cherche un appartement à louer à Paris"

You must understand the user's intent even if the message is messy or conversational.

INTENTS YOU SHOULD DETECT:
- property_search → user is looking for properties
- property_lookup → user shared a property ID or property link
- property_info → user asks about a specific property
- greeting → user is greeting
- unknown → if the request cannot be determined

FIELDS TO EXTRACT IF PRESENT:
- property_id (string or number)
- property_link (URL)
- property_name (name or description of the property)
- listing_type ("rent" or "buy")
- location (city or area)
- budget_max (number only, normalized to integer)
- bedrooms (number)

EXTRA RULES:
- If the user provides a property link or property ID, intent should be "property_lookup".
- If the user is searching for properties to rent or buy, intent should be "property_search".
- Convert budgets like "2m", "2 million", "500k", "₦2.5m", "$300k" into numeric values.
- If information is not present, return null.
- Do not guess information that is not in the message.

OUTPUT FORMAT:
You MUST return ONLY valid JSON with this structure:

{
  "intent": string,
  "property_id": string | null,
  "property_link": string | null,
  "property_name": string | null,
  "listing_type": "rent" | "buy" | null,
  "location": string | null,
  "budget_max": number | null,
  "bedrooms": number | null
}

Return ONLY JSON. Do not add explanations or text outside the JSON.
"""



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

    user_requirements = detect_intent_and_extract_requirements(user_message, history)
    print(f"Extracted requirements: {user_requirements}")

    
    # Save user message to DB
    new_msg = Message(conversation_id=conversation_id, role="user", content=user_message)
    db.add(new_msg)
    db.commit()

    # # 2. Call OpenAI
    # completion = client.chat.completions.create(
    #     model="gpt-4o", # Or gpt-3.5-turbo if cost is a concern
    #     messages=msg_history,
    #     tools=TOOLS,
    #     tool_choice="auto"
    # )

    # response_message = completion.choices[0].message
    
    # # 3. Handle Tool Calls
    if user_requirements:
    # if response_message.tool_calls:
    #     # Append assistant message with tool calls to history
    #     msg_history.append(response_message)
        
    #     for tool_call in response_message.tool_calls:
    #         function_name = tool_call.function.name
    #         function_args = json.loads(tool_call.function.arguments)
            
    #         tool_output = None
            
    #         if function_name == "update_requirements":
    #             # Progressively update conversation requirements
    #             existing_reqs = conversation.user_requirements or {}
    #             # Merge new requirements with existing ones (new values override)
    #             for key, value in function_args.items():
    #                 if value is not None:
    #                     if key == "additional_requirements" and existing_reqs.get(key):
    #                         # Merge additional requirements lists
    #                         existing_list = existing_reqs.get(key, [])
    #                         new_list = value if isinstance(value, list) else [value]
    #                         existing_reqs[key] = list(set(existing_list + new_list))
    #                     else:
    #                         existing_reqs[key] = value
    #             conversation.user_requirements = existing_reqs
    #             db.commit()
    #             tool_output = f"Requirements updated: {json.dumps(existing_reqs)}"

    #         elif function_name == "search_listings":
    #             results = search_listings(db, function_args)
    #             # Serialize results with richer context
    #             tool_output = json.dumps([
    #                 {
    #                     "title": r.title,
    #                     "listing_type": r.listing_type,
    #                     "price": r.sale_price if r.listing_type == "buy" else r.rent_price,
    #                     "city": r.city,
    #                     "area": r.area,
    #                     "bedrooms": r.bedrooms,
    #                     "bathrooms": r.bathrooms
    #                 }
    #                 for r in results
    #             ])
    #             if not results:
    #                 tool_output = "No listings found matching these exact criteria."

    #         elif function_name == "recommend_alternatives":
    #             results = recommend_alternatives(db, function_args)
    #             tool_output = json.dumps([
    #                 {
    #                     "title": r.title,
    #                     "listing_type": r.listing_type,
    #                     "price": r.sale_price if r.listing_type == "buy" else r.rent_price,
    #                     "city": r.city,
    #                     "area": r.area,
    #                     "bedrooms": r.bedrooms,
    #                     "bathrooms": r.bathrooms
    #                 }
    #                 for r in results
    #             ])
            
    #         elif function_name == "handoff_to_agent":
    #             # Update conversation requirements
    #             requirements = function_args.get("requirements", {})
    #             conversation.user_requirements = requirements
                
    #             # Find agent
    #             agent = find_best_agent(db, requirements)
    #             if agent:
    #                 assign_agent(db, conversation.id, agent.id)
    #                 tool_output = f"Handed off to agent {agent.name}."
    #             else:
    #                 tool_output = "No available agent found, but requirements logged."
                
    #             # Create Handoff Event
    #             event = Event(event_type="handoff", payload={"conversation_id": conversation_id, "agent_id": agent.id if agent else None})
    #             db.add(event)
    #             db.commit()

    #         # Append tool output to history
    #         msg_history.append({
    #             "tool_call_id": tool_call.id,
    #             "role": "tool",
    #             "name": function_name,
    #             "content": str(tool_output)
    #         })

        # Get final response from model
        final_response = client.chat.completions.create(
            model="gpt-4o",
            messages=msg_history
        )
        ai_text = final_response.choices[0].message.content
    else:
        # ai_text = response_message.content
        ai_text = "Sorry, I had trouble processing your request. Could you please rephrase or provide more details?"

    # 4. Save AI response
    ai_msg = Message(conversation_id=conversation_id, role="assistant", content=ai_text)
    db.add(ai_msg)
    db.commit()
    
    return ai_text





def detect_intent_and_extract_requirements(message: str, history: list):

    result = {
        "intent": None,
        "property_id": None,
        "property_link": None,
        "property_name": None,
        "listing_type": None,
        "location": None,
        "budget_max": None,
        "bedrooms": None,
        "raw_message": message
    }

    messages = [{"role": "system", "content": intent_system_prompt}]

    # add history
    messages.extend(history)

    # add latest user message
    messages.append({
        "role": "user",
        "content": message
    })

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0,
        messages=messages
    )

    if response.choices:
        try:
            extracted = json.loads(response.choices[0].message.content)
            result.update(extracted)
        except json.JSONDecodeError:
            pass

    return result
