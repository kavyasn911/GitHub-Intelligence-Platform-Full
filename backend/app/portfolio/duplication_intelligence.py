from backend.app.retrieval.graph_similarity import GraphSimilarityService


class DuplicationIntelligenceService:

    def __init__(self):
        self.similarity = GraphSimilarityService()

    def analyze_repository(
        self,
        repository_name: str,
        limit: int = 5,
    ) -> dict:

        result = self.similarity.similar_repositories(
            repository_name=repository_name,
            limit=limit,
        )

        repositories = result.get(
            "repositories",
            [],
        )

        if not repositories:
            return {
                "status": "success",
                "source_repository": repository_name,
                "strategy": "relative_knowledge_graph_overlap",
                "candidate_count": 0,
                "high_risk_count": 0,
                "duplication_candidates": [],
            }

        maximum_shared_count = max(
            repository.get("shared_count", 0)
            for repository in repositories
        )

        maximum_shared_count = max(
            maximum_shared_count,
            1,
        )

        duplication_candidates = []

        for repository in repositories:

            shared_count = repository.get(
                "shared_count",
                0,
            )

            confidence = round(
                shared_count
                / maximum_shared_count,
                4,
            )

            percentage = round(
                confidence * 100,
                2,
            )

            if confidence >= 0.70:
                risk = "high"

            elif confidence >= 0.30:
                risk = "medium"

            else:
                risk = "low"

            duplication_candidates.append({
                "repository": repository.get("name"),
                "full_name": repository.get("full_name"),
                "shared_entities": shared_count,
                "duplication_confidence": confidence,
                "duplication_percentage": percentage,
                "duplication_risk": risk,
                "quality_score": repository.get(
                    "overall_score",
                    0,
                ),
                "grade": repository.get(
                    "grade",
                    "Unknown",
                ),
            })

        duplication_candidates.sort(
            key=lambda item: (
                item["duplication_confidence"],
                item["quality_score"],
            ),
            reverse=True,
        )

        high_risk = [
            item
            for item in duplication_candidates
            if item["duplication_risk"] == "high"
        ]

        return {
            "status": "success",
            "source_repository": repository_name,
            "strategy": "relative_knowledge_graph_overlap",
            "candidate_count": len(
                duplication_candidates
            ),
            "high_risk_count": len(
                high_risk
            ),
            "duplication_candidates": duplication_candidates,
        }
