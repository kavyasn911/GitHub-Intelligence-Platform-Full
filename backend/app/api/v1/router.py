from fastapi import APIRouter

from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.github import router as github_router
from backend.app.api.v1.search import router as search_router
from backend.app.api.v1.component import router as component_router


api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(github_router)
api_router.include_router(search_router)
api_router.include_router(component_router)
