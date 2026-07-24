from backend.app.core.qdrant import qdrant_client


class RepositoryRecommendationService:

    COLLECTION_NAME = "github_repositories"

    def recommend(
        self,
        repository_name: str,
        limit: int = 5,
    ):

        points, _ = qdrant_client.scroll(
            collection_name=self.COLLECTION_NAME,
            scroll_filter=None,
            limit=1000,
            with_payload=True,
            with_vectors=True,
        )

        source_point = None

        for point in points:

            payload = point.payload or {}

            name = str(
                payload.get("name") or ""
            ).lower()

            full_name = str(
                payload.get("full_name") or ""
            ).lower()

            query = repository_name.lower()

            if (
                name == query
                or full_name == query
            ):
                source_point = point
                break

        if source_point is None:

            return {
                "status": "not_found",
                "query_repository": repository_name,
                "count": 0,
                "recommendations": [],
            }

        results = qdrant_client.query_points(
            collection_name=self.COLLECTION_NAME,
            query=source_point.vector,
            limit=limit + 1,
            with_payload=True,
        )

        recommendations = []

        for point in results.points:

            if point.id == source_point.id:
                continue

            recommendations.append({
                "id": point.id,
                "similarity_score": round(
                    float(point.score),
                    4,
                ),
                "repository": point.payload or {},
            })

            if len(recommendations) >= limit:
                break

        return {
            "status": "success",
            "query_repository": repository_name,
            "source_repository_id": source_point.id,
            "count": len(recommendations),
            "recommendations": recommendations,
        }
