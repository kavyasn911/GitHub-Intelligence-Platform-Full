from backend.app.retrieval.graph_augmented_search import GraphAugmentedRetrievalService
from backend.app.retrieval.graph_similarity import GraphSimilarityService


class AgentContextService:

    def __init__(self):
        self.retrieval = GraphAugmentedRetrievalService()
        self.graph_similarity = GraphSimilarityService()

    def build_search_context(
        self,
        query: str,
        limit: int = 5,
    ):
        result = self.retrieval.search(
            query=query,
            limit=limit,
        )

        repositories = []

        for item in result.get("results", []):
            repository = item.get("repository", {})
            graph = item.get("graph", {})

            repositories.append({
                "id": item.get("id"),
                "name": repository.get("name"),
                "full_name": repository.get("full_name"),
                "language": repository.get("language"),
                "final_score": item.get("final_score"),
                "quality_score": graph.get(
                    "overall_score",
                    repository.get("overall_score", 0),
                ),
                "grade": graph.get(
                    "grade",
                    repository.get("grade", "Unknown"),
                ),
                "technologies": graph.get("technologies", []),
                "skills": graph.get("skills", []),
                "tags": graph.get("tags", []),
                "categories": graph.get("categories", []),
                "architectures": graph.get("architectures", []),
                "complexities": graph.get("complexities", []),
                "explanation": item.get("explanation", {}),
            })

        return {
            "query": query,
            "query_intelligence": result.get(
                "query_intelligence",
                {},
            ),
            "repositories": repositories,
        }

    def build_comparison_context(
        self,
        repository_name: str,
        limit: int = 5,
    ):
        return self.graph_similarity.similar_repositories(
            repository_name=repository_name,
            limit=limit,
        )
