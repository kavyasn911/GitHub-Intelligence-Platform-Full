from qdrant_client import QdrantClient

from backend.app.core.config import settings

qdrant_client = QdrantClient(
    url=settings.QDRANT_URL
)
