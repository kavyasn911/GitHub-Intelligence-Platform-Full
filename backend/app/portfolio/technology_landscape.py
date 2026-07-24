from collections import Counter

from backend.app.graph.graph_query import GraphQueryService


class TechnologyLandscapeService:

    def __init__(self):
        self.graph_query = GraphQueryService()

    def analyze(self) -> dict:

        statistics = self.graph_query.statistics()

        technology_count = (
            statistics.get("nodes", {}).get("Technology", 0)
        )

        return {
            "status": "success",
            "technology_landscape": {
                "unique_technologies": technology_count,
                "graph_statistics": statistics,
            },
        }
