import os
from pathlib import Path
from dotenv import load_dotenv

# Must run before any other `backend.app...` import — those modules read
# config via os.getenv() at import/instantiation time, and pydantic-settings
# (used in core/config.py) only populates its OWN Settings object, not the
# real process environment. Without this, .env values like OLLAMA_MODEL,
# NEO4J_URI, etc. are silently ignored outside Docker (where env_file: does
# this injection for you automatically).
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.v1.router import api_router
from backend.app.core.config import settings
from backend.app.core.exceptions import (
    GitHubIntelligenceException,
    github_exception_handler,
    generic_exception_handler,
)
from backend.app.core.logging import app_logger
from backend.app.middleware.request_logger import RequestLoggingMiddleware

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Enterprise AI GitHub Discovery Platform",
)

# Middleware
app.add_middleware(RequestLoggingMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
app.add_exception_handler(
    GitHubIntelligenceException,
    github_exception_handler,
)

app.add_exception_handler(
    Exception,
    generic_exception_handler,
)

# API Router
app.include_router(
    api_router,
    prefix=settings.API_PREFIX,
)


@app.get("/")
async def root():
    app_logger.info("Root endpoint accessed")

    return {
        "application": settings.APP_NAME,
        "version": settings.VERSION,
        "status": "running",
    }
