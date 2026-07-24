from collections import Counter

from backend.app.graph.graph_query import GraphQueryService


class PortfolioIntelligenceService:

    def __init__(self):
        self.graph_query = GraphQueryService()

    def analyze(self) -> dict:

        statistics = self.graph_query.statistics()

        repository_count = (
            statistics.get("nodes", {}).get("Repository", 0)
        )

        return {
            "status": "success",
            "portfolio": {
                "repository_count": repository_count,
                "total_graph_nodes": statistics.get(
                    "total_nodes",
                    0,
                ),
                "total_graph_relationships": statistics.get(
                    "total_relationships",
                    0,
                ),
                "node_distribution": statistics.get(
                    "nodes",
                    {},
                ),
                "relationship_distribution": statistics.get(
                    "relationships",
                    {},
                ),
            },
        }
