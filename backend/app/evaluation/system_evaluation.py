from backend.app.evaluation.grounding_validator import GroundingValidator
from backend.app.performance.health_service import SystemHealthService
from backend.app.performance.cache_service import CacheService
from backend.app.graph.graph_query import GraphQueryService
from backend.app.indexing.vector_store import RepositoryVectorStore


class SystemEvaluationService:

    def __init__(self):

        self.health_service = (
            SystemHealthService()
        )

        self.cache = CacheService()

    def evaluate(self) -> dict:

        health = (
            self.health_service.health()
        )

        graph = (
            GraphQueryService()
            .statistics()
        )

        vector_count = (
            RepositoryVectorStore()
            .count()
        )

        cache = (
            self.cache.statistics()
        )

        checks = {
            "infrastructure_healthy": (
                health.get("status")
                == "healthy"
            ),
            "knowledge_graph_available": (
                graph.get(
                    "total_nodes",
                    0,
                )
                > 0
            ),
            "knowledge_graph_relationships_available": (
                graph.get(
                    "total_relationships",
                    0,
                )
                > 0
            ),
            "vector_index_available": (
                vector_count > 0
            ),
            "cache_available": (
                cache.get("status")
                == "healthy"
            ),
        }

        passed = sum(
            1
            for value
            in checks.values()
            if value
        )

        total = len(checks)

        score = round(
            (
                passed
                / total
            )
            * 100,
            2,
        )

        if score >= 90:
            grade = "A"

        elif score >= 80:
            grade = "B"

        elif score >= 70:
            grade = "C"

        elif score >= 60:
            grade = "D"

        else:
            grade = "F"

        return {
            "status": "success",
            "evaluation": {
                "score": score,
                "grade": grade,
                "passed_checks": passed,
                "total_checks": total,
                "checks": checks,
            },
            "system": {
                "health": health,
                "graph_nodes": graph.get(
                    "total_nodes",
                    0,
                ),
                "graph_relationships": graph.get(
                    "total_relationships",
                    0,
                ),
                "vector_count": vector_count,
                "cache": cache,
            },
        }

    def liveness(self) -> dict:

        return {
            "status": "alive",
            "application": (
                "GitHub Intelligence Platform"
            ),
        }

    def readiness(self) -> dict:

        health = (
            self.health_service.health()
        )

        ready = (
            health.get("status")
            == "healthy"
        )

        return {
            "status": (
                "ready"
                if ready
                else "not_ready"
            ),
            "ready": ready,
            "services": health.get(
                "services",
                {},
            ),
        }
