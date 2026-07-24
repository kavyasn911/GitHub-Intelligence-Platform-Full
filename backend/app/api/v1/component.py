from fastapi import APIRouter, HTTPException

from backend.app.component_intelligence.services.code_intelligence_engine import CodeIntelligenceEngine

router = APIRouter(
    prefix="/component",
    tags=["Component Intelligence"],
)

engine = CodeIntelligenceEngine()


@router.get("/analyze/{owner}/{repo}")
def analyze_repository(owner: str, repo: str):

    full_name = f"{owner}/{repo}"

    try:
        return engine.analyze(full_name)

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )
