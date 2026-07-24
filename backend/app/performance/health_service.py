from backend.app.core.redis import redis_client
from backend.app.core.qdrant import qdrant_client
from backend.app.graph.graph_query import GraphQueryService
from backend.app.llm.ollama_provider import OllamaProvider
from backend.app.performance.cache_service import CacheService


class SystemHealthService:

    def __init__(self):
        self.cache = CacheService()

    def _redis_health(self):

        try:
            return {
                "status": (
                    "healthy"
                    if redis_client.ping()
                    else "unhealthy"
                )
            }

        except Exception as exc:
            return {
                "status": "unhealthy",
                "error": str(exc),
            }

    def _qdrant_health(self):

        try:
            collections = (
                qdrant_client.get_collections()
            )

            return {
                "status": "healthy",
                "collections": len(
                    collections.collections
                ),
            }

        except Exception as exc:
            return {
                "status": "unhealthy",
                "error": str(exc),
            }

    def _neo4j_health(self):

        try:
            result = GraphQueryService().statistics()

            return {
                "status": "healthy",
                "nodes": result.get(
                    "total_nodes",
                    0,
                ),
                "relationships": result.get(
                    "total_relationships",
                    0,
                ),
            }

        except Exception as exc:
            return {
                "status": "unhealthy",
                "error": str(exc),
            }

    def _llm_health(self):

        try:
            return OllamaProvider().health()

        except Exception as exc:
            return {
                "status": "unhealthy",
                "error": str(exc),
            }

    def health(self):

        services = {
            "redis": self._redis_health(),
            "qdrant": self._qdrant_health(),
            "neo4j": self._neo4j_health(),
            "llm": self._llm_health(),
        }

        healthy = all(
            service.get("status")
            in (
                "healthy",
                "success",
            )
            for service in services.values()
        )

        return {
            "status": (
                "healthy"
                if healthy
                else "degraded"
            ),
            "services": services,
        }
