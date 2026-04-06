import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy import text, inspect
from app.database import engine, Base
from app.routes import whatsapp, listings, agents, conversations, auth, chat, analytics, demo
from app.models import Listing
from app.config import settings

# Create Tables
Base.metadata.create_all(bind=engine)

# Ensure users table has all required columns (handles legacy DBs)
try:
    inspector = inspect(engine)
    if inspector.has_table("users"):
        columns = [c["name"] for c in inspector.get_columns("users")]
        with engine.begin() as conn:
            if "role" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'agent'"))
            if "is_active" not in columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE"))
except Exception:
    pass

app = FastAPI(title=settings.PROJECT_NAME)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes (registered first, highest priority)
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(whatsapp.router, prefix="/api/whatsapp", tags=["WhatsApp"])
app.include_router(listings.router, prefix="/api/listings", tags=["Listings"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(conversations.router, prefix="/api/conversations", tags=["Conversations"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(demo.router, prefix="/api/demo", tags=["Demo"])

# Backend static files (chat-test and costs-dashboard HTML)
_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(_static_dir):
    app.mount("/static", StaticFiles(directory=_static_dir), name="static")


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


@app.get("/dashboard/costs")
def costs_dashboard():
    """Serve the cost analytics dashboard. No authentication required."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "static", "costs-dashboard.html")
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


# Super-admin static assets (Vite build assets directory)
_superadmin_dist = os.path.join(os.path.dirname(__file__), "..", "superadmin_dist")
_superadmin_assets = os.path.join(_superadmin_dist, "assets")
if os.path.isdir(_superadmin_assets):
    app.mount("/superadmin/assets", StaticFiles(directory=_superadmin_assets), name="superadmin_assets")


@app.get("/superadmin")
def superadmin_root():
    """Redirect bare /superadmin to /superadmin/ so the SPA loads correctly."""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/superadmin/")


@app.get("/superadmin/{path:path}")
def serve_superadmin_spa(path: str):
    """Serve the super-admin React SPA for all /superadmin/* routes."""
    superadmin_dist = os.path.join(os.path.dirname(__file__), "..", "superadmin_dist")

    # Serve real files (images, icons, etc.) if they exist directly in superadmin_dist
    file_path = os.path.join(superadmin_dist, path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # Fall back to index.html for all React Router paths.
    # Always send no-cache so browsers never serve a stale main-frontend HTML
    # that was cached before the superadmin route was deployed.
    index_path = os.path.join(superadmin_dist, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(
            index_path,
            headers={
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
            },
        )

    return JSONResponse({"error": "Super-admin not found"}, status_code=404)


# Frontend static assets (Vite build, JS/CSS bundles live in /assets)
_frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend_dist")
_frontend_assets = os.path.join(_frontend_dist, "assets")
if os.path.isdir(_frontend_assets):
    app.mount("/assets", StaticFiles(directory=_frontend_assets), name="frontend_assets")


@app.get("/")
def read_root():
    """Serve React app at root, fallback to JSON if no build present."""
    index_path = os.path.join(os.path.dirname(__file__), "..", "frontend_dist", "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {"message": "Wakeeli AI Backend is running."}


@app.get("/demo/auto")
def demo_auto():
    """Serve the Wakeeli demo chat in Auto Booking mode."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "demo.html")
    return FileResponse(
        html_path,
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )


@app.get("/demo/handoff")
def demo_handoff():
    """Serve the Wakeeli demo chat in Agent Handoff mode."""
    html_path = os.path.join(os.path.dirname(__file__), "..", "demo", "demo.html")
    return FileResponse(
        html_path,
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        },
    )


# SPA catch-all: must be registered LAST
# Serves index.html for any non-API, non-static path (React Router support)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Let API paths return 404 normally
    if full_path.startswith("api/") or full_path == "api":
        return JSONResponse({"error": "Not found"}, status_code=404)

    # Never let the main-frontend catch-all intercept superadmin paths.
    # The dedicated /superadmin/{path:path} route above handles these, but
    # this guard is a hard safety net in case route ordering ever shifts.
    if full_path == "superadmin" or full_path.startswith("superadmin/"):
        return JSONResponse({"error": "Not found"}, status_code=404)

    # Never intercept demo paths - the explicit routes above handle these.
    if full_path == "demo/auto" or full_path == "demo/handoff":
        return JSONResponse({"error": "Not found"}, status_code=404)

    frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend_dist")

    # Serve real files (favicon.ico, manifest.json, etc.) if they exist
    file_path = os.path.join(frontend_dist, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    # Fall back to index.html for React Router paths
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)

    return JSONResponse({"error": "Not found"}, status_code=404)
