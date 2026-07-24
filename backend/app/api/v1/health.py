from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "GitHub Intelligence Platform",
        "version": "1.0.0"
    }
