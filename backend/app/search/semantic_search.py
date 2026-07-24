from backend.app.indexing.embedding_generator import EmbeddingGenerator
from backend.app.indexing.vector_store import RepositoryVectorStore


class SemanticSearchService:

    def __init__(self):
        self.embedding_generator = EmbeddingGenerator()
        self.vector_store = RepositoryVectorStore()

    def search(
        self,
        query: str,
        limit: int = 5,
    ):

        query_embedding = self.embedding_generator.generate(query)

        results = self.vector_store.search(
            query_vector=query_embedding,
            limit=limit,
        )

        return {
            "query": query,
            "count": len(results),
            "results": results,
        }
