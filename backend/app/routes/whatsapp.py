from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import Conversation
from app.services.llm import process_user_message
from app.services.transcription import download_audio, transcribe_audio
import logging
import requests

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
                try:
                    # Fetch media URL from Meta Graph API
                    headers = {"Authorization": f"Bearer {settings.WHATSAPP_TOKEN}"}
                    url_response = requests.get(
                        f"https://graph.facebook.com/v18.0/{media_id}",
                        headers=headers
                    )
                    url_response.raise_for_status()
                    media_url = url_response.json().get("url")
                    
                    if media_url:
                        # Download and transcribe
                        file_path = download_audio(media_url)
                        if file_path:
                            user_text = transcribe_audio(file_path)
                            if not user_text:
                                user_text = "[Voice Note - Transcription failed]"
                        else:
                            user_text = "[Voice Note - Download failed]"
                    else:
                        user_text = "[Voice Note Received - Could not retrieve audio URL]"
                        logger.warning(f"Could not get media URL for {media_id}")
                except Exception as e:
                    logger.error(f"Error processing voice note: {e}")
                    user_text = "[Voice Note Received - Error processing audio]"

            # Process with AI
            response_text = process_user_message(db, conversation.id, user_text)

            # Send response back to WhatsApp (Using Facebook Graph API)
            try:
                url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
                headers = {
                    "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "messaging_product": "whatsapp",
                    "to": phone_number,
                    "type": "text",
                    "text": {"body": response_text}
                }
                
                response = requests.post(url, json=payload, headers=headers)
                response.raise_for_status()
                logger.info(f"Message sent successfully to {phone_number}")
            except Exception as e:
                logger.error(f"Error sending WhatsApp message: {e}")
                # Don't fail the webhook, just log the error

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
    
    return {"status": "ok"}
