import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Wakeeli AI"
    DATABASE_URL: str = "postgresql://user:password@localhost/wakeeli_db"
    OPENAI_API_KEY: str
    WHATSAPP_TOKEN: str
    WHATSAPP_VERIFY_TOKEN: str
    WHATSAPP_PHONE_NUMBER_ID: str
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin"

    class Config:
        env_file = ".env"

settings = Settings()
