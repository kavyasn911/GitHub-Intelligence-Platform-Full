from qdrant_client.models import Distance, PointStruct, VectorParams

from backend.app.core.qdrant import qdrant_client


class RepositoryVectorStore:

    COLLECTION_NAME = "github_repositories"
    VECTOR_SIZE = 384

    def create_collection(self):

        if not qdrant_client.collection_exists(
            collection_name=self.COLLECTION_NAME
        ):
            qdrant_client.create_collection(
                collection_name=self.COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=self.VECTOR_SIZE,
                    distance=Distance.COSINE,
                ),
            )

        return {
            "status": "ready",
            "collection": self.COLLECTION_NAME,
        }

    def store_repository(
        self,
        repository: dict,
        embedding: list[float],
    ):

        analysis = repository.get("analysis") or {}
        intelligence = repository.get("intelligence") or {}

        architecture_data = (
            intelligence.get("architecture") or {}
        )

        score_data = (
            intelligence.get("repository_score") or {}
        )

        knowledge_card = (
            intelligence.get("knowledge_card") or {}
        )

        payload = {
            "name": repository.get("name"),
            "full_name": repository.get("full_name"),
            "description": repository.get("description"),
            "language": repository.get("language"),
            "default_branch": repository.get("default_branch"),
            "private": repository.get("private", False),
            "stars": repository.get("stars", 0),

            "technologies": analysis.get(
                "technologies",
                [],
            ),

            "category": intelligence.get(
                "category",
                "General",
            ),

            "complexity": intelligence.get(
                "complexity",
                "Unknown",
            ),

            "quality_score": intelligence.get(
                "quality_score",
                0,
            ),

            "skills": intelligence.get(
                "skills",
                [],
            ),

            "architecture": architecture_data.get(
                "architecture",
                "Unknown",
            ),

            "architecture_confidence": architecture_data.get(
                "confidence",
                0,
            ),

            "architecture_reasons": architecture_data.get(
                "reasons",
                [],
            ),

            "overall_score": score_data.get(
                "overall_score",
                0,
            ),

            "grade": score_data.get(
                "grade",
                "Unknown",
            ),

            "score_dimensions": score_data.get(
                "dimensions",
                {},
            ),

            "tags": intelligence.get(
                "tags",
                [],
            ),

            "knowledge_card": knowledge_card,
        }

        point = PointStruct(
            id=repository["id"],
            vector=embedding,
            payload=payload,
        )

        qdrant_client.upsert(
            collection_name=self.COLLECTION_NAME,
            points=[point],
            wait=True,
        )

    def search(
        self,
        query_vector: list[float],
        limit: int = 5,
    ):

        result = qdrant_client.query_points(
            collection_name=self.COLLECTION_NAME,
            query=query_vector,
            limit=limit,
            with_payload=True,
        )

        return [
            {
                "id": point.id,
                "score": point.score,
                "payload": point.payload,
            }
            for point in result.points
        ]

    def count(self):

        result = qdrant_client.count(
            collection_name=self.COLLECTION_NAME,
            exact=True,
        )

        return result.count
