import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Wakeeli AI"
    DATABASE_URL: str = "postgresql://postgres:darrey327739@localhost:5432/wakeeli_db"
    JWT_SECRET_KEY: str 
    OPENAI_API_KEY: str
    WHATSAPP_TOKEN: str
    WHATSAPP_VERIFY_TOKEN: str
    WHATSAPP_PHONE_NUMBER_ID: str
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin"
    VERSION: str = "v15.0"
    PHONE_NUMBER_ID: str

    class Config:
        env_file = ".env"

settings = Settings()
