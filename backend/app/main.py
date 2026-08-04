import os
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.endpoints import documents, chat  # Import both endpoints

def create_upload_directories():
    """Ensures base storage directories exist during bootstrap."""
    os.makedirs(settings.UPLOADS_DIR, exist_ok=True)
    os.makedirs(settings.CHROMA_DB_DIR, exist_ok=True)

# Initialize application
app = FastAPI(
    title="AI Research Assistant API",
    description="Backend API supporting local secure document ingestion and RAG using Qwen 2.5",
    version="1.0.0"
)

# Set up CORS policies
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(documents.router)
app.include_router(chat.router)  # Register Chat & history workflows

@app.on_event("startup")
async def startup_event():
    create_upload_directories()

@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Basic health check endpoint to check system statuses."""
    import httpx
    ollama_online = False
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            res = await client.get(f"{settings.OLLAMA_BASE_URL}/")
            ollama_online = res.status_code == 200
    except Exception:
        pass

    return {
        "status": "healthy",
        "environment": settings.ENV,
        "ollama_connected": ollama_online
    }