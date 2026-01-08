from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import whatsapp, listings, agents, conversations
from app.config import settings

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp"])
app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])

@app.get("/")
def read_root():
    return {"message": "Wakeeli AI Backend is running."}
