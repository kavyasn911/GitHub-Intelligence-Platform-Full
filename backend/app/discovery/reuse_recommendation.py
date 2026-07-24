from backend.app.discovery.intelligent_reuse import IntelligentReuseDecisionEngine


class RepositoryReuseRecommendationService:

    def __init__(self):
        self.engine = IntelligentReuseDecisionEngine()

    def recommend(
        self,
        repository: dict,
        query: str = "",
    ) -> dict:

        return self.engine.decide(
            query=query,
            repository=repository,
        )
