from fastapi import APIRouter

from backend.app.schemas.search import SemanticSearchRequest
from backend.app.search.semantic_search import SemanticSearchService


router = APIRouter(
    prefix="/search",
    tags=["Semantic Search"],
)


@router.post("")
def semantic_search(request: SemanticSearchRequest):

    service = SemanticSearchService()

    return service.search(
        query=request.query,
        limit=request.limit,
    )
