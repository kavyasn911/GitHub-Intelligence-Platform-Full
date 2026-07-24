from backend.app.core.qdrant import qdrant_client
from backend.app.graph.graph_store import RepositoryGraphStore
from backend.app.graph.schema import GraphSchemaService
from backend.app.indexing.vector_store import RepositoryVectorStore


class GraphSynchronizationService:

    def __init__(self):
        self.schema = GraphSchemaService()
        self.graph_store = RepositoryGraphStore()

    def synchronize(self):

        self.schema.initialize()

        points = []
        offset = None

        while True:

            batch, offset = qdrant_client.scroll(
                collection_name=RepositoryVectorStore.COLLECTION_NAME,
                limit=100,
                offset=offset,
                with_payload=True,
                with_vectors=False,
            )

            points.extend(batch)

            if offset is None:
                break

        synchronized = 0
        failed = 0
        errors = []

        for point in points:

            try:

                payload = point.payload or {}

                repository = {
                    "id": point.id,
                    "name": payload.get("name"),
                    "full_name": payload.get("full_name"),
                    "description": payload.get("description"),
                    "language": payload.get("language"),
                    "stars": payload.get("stars", 0),
                    "analysis": {
                        "technologies": payload.get(
                            "technologies",
                            [],
                        )
                    },
                    "intelligence": {
                        "category": payload.get(
                            "category",
                            "General",
                        ),
                        "complexity": payload.get(
                            "complexity",
                            "Unknown",
                        ),
                        "skills": payload.get(
                            "skills",
                            [],
                        ),
                        "architecture": {
                            "architecture": payload.get(
                                "architecture",
                                "Unknown",
                            )
                        },
                        "repository_score": {
                            "overall_score": payload.get(
                                "overall_score",
                                0,
                            ),
                            "grade": payload.get(
                                "grade",
                                "Unknown",
                            ),
                        },
                        "tags": payload.get(
                            "tags",
                            [],
                        ),
                    },
                }

                self.graph_store.store_repository(
                    repository
                )

                synchronized += 1

            except Exception as exc:

                failed += 1

                errors.append({
                    "id": point.id,
                    "error": str(exc),
                })

        return {
            "status": (
                "success"
                if failed == 0
                else "partial_success"
            ),
            "total": len(points),
            "synchronized": synchronized,
            "failed": failed,
            "errors": errors,
        }
