import os
import requests
from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def download_audio(media_url: str):
    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}"
    }
    response = requests.get(media_url, headers=headers)
    if response.status_code == 200:
        filename = f"temp_audio_{os.urandom(4).hex()}.ogg"
        with open(filename, "wb") as f:
            f.write(response.content)
        return filename
    return None

def transcribe_audio(file_path: str):
    try:
        with open(file_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text"
            )
        return transcription
    except Exception as e:
        print(f"Transcription error: {e}")
        return None
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
