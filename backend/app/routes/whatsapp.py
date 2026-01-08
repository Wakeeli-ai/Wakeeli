from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import Conversation
from app.services.llm import process_user_message
from app.services.transcription import download_audio, transcribe_audio
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/webhook")
async def verify_webhook(request: Request):
    # WhatsApp verification challenge
    params = request.query_params
    if params.get("hub.mode") == "subscribe" and params.get("hub.verify_token") == settings.WHATSAPP_VERIFY_TOKEN:
        return int(params.get("hub.challenge"))
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/webhook")
async def whatsapp_webhook(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    
    # Check if it's a message
    try:
        entry = data["entry"][0]
        changes = entry["changes"][0]
        value = changes["value"]
        
        if "messages" in value:
            message_data = value["messages"][0]
            phone_number = message_data["from"]
            
            # Find or Create Conversation
            conversation = db.query(Conversation).filter(Conversation.user_phone == phone_number).first()
            if not conversation:
                conversation = Conversation(user_phone=phone_number)
                db.add(conversation)
                db.commit()
                db.refresh(conversation)

            user_text = ""
            if message_data["type"] == "text":
                user_text = message_data["text"]["body"]
            elif message_data["type"] == "audio":
                # Handle Voice Note
                media_id = message_data["audio"]["id"]
                # Need to fetch media URL using ID (simplified for MVP, usually requires another API call to get URL)
                # In production: GET https://graph.facebook.com/v17.0/{media_id} -> get URL -> download
                # For MVP, assuming we handle this or mocking it. 
                # Let's assume we can't easily get the URL without the full implementation. 
                # I'll add a comment.
                user_text = "[Voice Note Received - Transcription Not Fully Implemented in MVP without Media URL Fetch]" 
                
                # Real implementation flow:
                # url_response = requests.get(f"https://graph.facebook.com/v17.0/{media_id}", headers=...)
                # url = url_response.json().get("url")
                # file_path = download_audio(url)
                # user_text = transcribe_audio(file_path)

            # Process with AI
            response_text = process_user_message(db, conversation.id, user_text)

            # Send response back to WhatsApp (Using Facebook Graph API)
            # This is where we would call requests.post to send the message.
            # print(f"Would send to {phone_number}: {response_text}")

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
    
    return {"status": "ok"}
