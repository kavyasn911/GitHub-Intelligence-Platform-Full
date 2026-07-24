from backend.app.core.qdrant import qdrant_client
from backend.app.indexing.embedding_generator import EmbeddingGenerator
from backend.app.indexing.vector_store import RepositoryVectorStore
from backend.app.search.explanation_engine import SearchExplanationEngine
from backend.app.search.filter_builder import SearchFilterBuilder
from backend.app.search.query_intelligence import QueryIntelligenceEngine
from backend.app.search.ranking_engine import SearchRankingEngine


class AdvancedSearchService:

    def __init__(self):

        self.query_engine = QueryIntelligenceEngine()
        self.embedding_generator = EmbeddingGenerator()
        self.filter_builder = SearchFilterBuilder()
        self.ranking_engine = SearchRankingEngine()
        self.explanation_engine = SearchExplanationEngine()

    def search(
        self,
        query: str,
        limit: int = 5,
    ):

        parsed_query = self.query_engine.parse(
            query
        )

        query_vector = self.embedding_generator.generate(
            parsed_query["semantic_query"]
        )

        query_filter = self.filter_builder.build(
            parsed_query["filters"]
        )

        result = qdrant_client.query_points(
            collection_name=RepositoryVectorStore.COLLECTION_NAME,
            query=query_vector,
            query_filter=query_filter,
            limit=limit * 3,
            with_payload=True,
        )

        raw_results = [
            {
                "id": point.id,
                "score": float(point.score),
                "payload": point.payload or {},
            }
            for point in result.points
        ]

        ranked_results = self.ranking_engine.rank(
            raw_results,
            parsed_query,
        )

        final_results = []

        for result in ranked_results[:limit]:

            result["explanation"] = (
                self.explanation_engine.explain(
                    result,
                    parsed_query,
                )
            )

            final_results.append(result)

        return {
            "status": "success",
            "query": query,
            "query_intelligence": parsed_query,
            "count": len(final_results),
            "results": final_results,
        }
