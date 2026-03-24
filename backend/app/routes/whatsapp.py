from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import Conversation
from app.services.agent import process_user_message
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


def mark_as_read(phone_number_id, version, access_token, message_id):

    url = f"https://graph.facebook.com/{version}/{phone_number_id}/messages"

    payload = {
        "messaging_product": "whatsapp",
        "status": "read",
        "message_id": message_id
    }

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    requests.post(url, json=payload, headers=headers)



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
            message_id = message_data["id"] if "id" in message_data else None
            
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
                        f"https://graph.facebook.com/{settings.VERSION}/{media_id}",
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

            # Send typing indicator
            try:
                mark_as_read(
                settings.WHATSAPP_PHONE_NUMBER_ID,
                settings.VERSION,
                settings.WHATSAPP_TOKEN,
                message_id
            )
            except Exception as e:
                logger.error(f"Error sending typing indicator: {e}")

            # Process with AI
            response_parts = process_user_message(db, conversation.id, user_text)

            # Send each message part separately to WhatsApp
            try:
                url = f"https://graph.facebook.com/{settings.VERSION}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
                headers = {
                    "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
                    "Content-Type": "application/json"
                }
                for part in response_parts:
                    if not part or not part.strip():
                        continue
                    payload = {
                        "messaging_product": "whatsapp",
                        "to": phone_number,
                        "type": "text",
                        "text": {"body": part.strip()}
                    }
                    response = requests.post(url, json=payload, headers=headers)
                    response.raise_for_status()
                logger.info(f"Message sent successfully to {phone_number} ({len(response_parts)} parts)")
            except Exception as e:
                logger.error(f"Error sending WhatsApp message: {e}")
                # Don't fail the webhook, just log the error

    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
    
    return {"status": "ok"}
