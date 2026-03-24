import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.database import engine, Base
from app.routes import whatsapp, listings, agents, conversations, auth, chat
from app.models import Listing
from app.config import settings

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp"])
app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

# Static files
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(_static_dir):
    app.mount("/static", StaticFiles(directory=_static_dir), name="static")


@app.get("/")
def read_root():
    return {"message": "Wakeeli AI Backend is running."}


@app.get("/chat-test")
def chat_test_page():
    """Serve the web chat test interface with no-cache headers."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "static", "chat-test.html")
    return FileResponse(
        html_path,
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )


# TEMP: one-time reset for listings table (remove after use)
@app.post("/admin/reset-listings")
def reset_listings():
    Listing.__table__.drop(bind=engine, checkfirst=True)
    Listing.__table__.create(bind=engine, checkfirst=True)
    return {"status": "ok", "message": "Listings table reset."}
