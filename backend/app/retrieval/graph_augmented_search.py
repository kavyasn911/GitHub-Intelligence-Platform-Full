from backend.app.indexing.embedding_generator import EmbeddingGenerator
from backend.app.indexing.vector_store import RepositoryVectorStore
from backend.app.retrieval.explanation import RetrievalExplanationEngine
from backend.app.retrieval.fusion_engine import RetrievalFusionEngine
from backend.app.retrieval.graph_retrieval import GraphRetrievalService
from backend.app.search.query_intelligence import QueryIntelligenceEngine


class GraphAugmentedRetrievalService:

    def __init__(self):

        self.query_engine = QueryIntelligenceEngine()
        self.embedding_generator = EmbeddingGenerator()
        self.vector_store = RepositoryVectorStore()
        self.graph_retrieval = GraphRetrievalService()
        self.fusion_engine = RetrievalFusionEngine()
        self.explanation_engine = RetrievalExplanationEngine()

    def search(
        self,
        query: str,
        limit: int = 5,
    ):

        query_intelligence = self.query_engine.parse(
            query
        )

        semantic_query = query_intelligence.get(
            "semantic_query",
            query,
        )

        query_vector = self.embedding_generator.generate(
            semantic_query
        )

        candidate_limit = max(
            limit * 3,
            10,
        )

        vector_candidates = self.vector_store.search(
            query_vector=query_vector,
            limit=candidate_limit,
        )

        candidate_ids = [
            candidate["id"]
            for candidate in vector_candidates
        ]

        graph_data = self.graph_retrieval.enrich_candidates(
            candidate_ids
        )

        ranked_results = self.fusion_engine.rank(
            candidates=vector_candidates,
            query_intelligence=query_intelligence,
            graph_data=graph_data,
        )

        final_results = []

        for result in ranked_results[:limit]:

            result["explanation"] = (
                self.explanation_engine.explain(
                    result=result,
                    query_intelligence=query_intelligence,
                )
            )

            final_results.append(result)

        return {
            "status": "success",
            "query": query,
            "query_intelligence": query_intelligence,
            "retrieval": {
                "strategy": "graph_augmented_vector_fusion",
                "vector_candidates": len(
                    vector_candidates
                ),
                "graph_enriched_candidates": len(
                    graph_data
                ),
                "weights": {
                    "vector_similarity": (
                        self.fusion_engine.VECTOR_WEIGHT
                    ),
                    "graph_relevance": (
                        self.fusion_engine.GRAPH_WEIGHT
                    ),
                    "repository_quality": (
                        self.fusion_engine.QUALITY_WEIGHT
                    ),
                },
            },
            "count": len(final_results),
            "results": final_results,
        }
