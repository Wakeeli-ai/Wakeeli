import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "Wakeeli AI"
    DATABASE_URL: str = "sqlite:///./wakeeli.db"
    JWT_SECRET_KEY: str = "wakeeli-dev-secret-key-change-in-production"
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: str
    WHATSAPP_TOKEN: str = ""
    WHATSAPP_VERIFY_TOKEN: str = "wakeeli_verify"
    WHATSAPP_PHONE_NUMBER_ID: str = ""
    ADMIN_USERNAME: str = "Admin"
    ADMIN_PASSWORD: str = "Admin123"
    VERSION: str = "v15.0"
    PHONE_NUMBER_ID: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
