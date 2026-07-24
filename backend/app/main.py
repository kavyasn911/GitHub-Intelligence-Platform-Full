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
