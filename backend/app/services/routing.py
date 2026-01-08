from sqlalchemy.orm import Session
from app.models import Agent, Conversation

def find_best_agent(db: Session, requirements: dict):
    # Filter active agents
    query = db.query(Agent).filter(Agent.is_active == True)

    req_location = requirements.get("location")
    req_type = requirements.get("listing_type") # rent or buy

    # This is a simple in-memory filter for JSON fields as MVP.
    # For production with many agents, use Postgres JSONB operators.
    all_agents = query.order_by(Agent.priority.asc()).all()
    
    matched_agents = []
    for agent in all_agents:
        is_territory_match = False
        is_specialty_match = False

        if not req_location:
            is_territory_match = True # No location preference
        else:
            # Check if any territory matches partially
            if agent.territories:
                for territory in agent.territories:
                    if territory.lower() in req_location.lower() or req_location.lower() in territory.lower():
                        is_territory_match = True
                        break
        
        if not req_type:
             is_specialty_match = True
        else:
            if agent.specialties and req_type in agent.specialties:
                is_specialty_match = True
        
        if is_territory_match and is_specialty_match:
            matched_agents.append(agent)

    if matched_agents:
        return matched_agents[0] # Return highest priority match
    
    # Fallback to any active agent if no specific match
    return all_agents[0] if all_agents else None

def assign_agent(db: Session, conversation_id: int, agent_id: int):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation:
        conversation.agent_id = agent_id
        conversation.status = "qualified"
        db.commit()
        db.refresh(conversation)
    return conversation
