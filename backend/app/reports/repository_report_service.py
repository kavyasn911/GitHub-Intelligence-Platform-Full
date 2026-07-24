from backend.app.graph.graph_query import GraphQueryService
from backend.app.retrieval.graph_similarity import GraphSimilarityService
from backend.app.reports.repository_report_analyzer import RepositoryReportAnalyzer
from backend.app.reports.repository_report_builder import RepositoryReportBuilder
from backend.app.reports.ai_report_generator import AIReportGenerator


class RepositoryReportService:

    def __init__(self):
        self.graph_query = GraphQueryService()
        self.graph_similarity = GraphSimilarityService()
        self.analyzer = RepositoryReportAnalyzer()
        self.builder = RepositoryReportBuilder()
        self.ai_generator = AIReportGenerator()

    def analyze(
        self,
        repository_name: str,
        related_limit: int = 5,
    ) -> dict:

        graph_data = self.graph_query.repository_graph(
            repository_name
        )

        if graph_data.get("status") != "success":
            return graph_data

        related_data = (
            self.graph_similarity.similar_repositories(
                repository_name=repository_name,
                limit=related_limit,
            )
        )

        analysis = self.analyzer.analyze(
            repository_name=repository_name,
            graph_data=graph_data,
            related_data=related_data,
        )

        report = self.builder.build(analysis)

        return {
            "status": "success",
            "repository": repository_name,
            "report_type": "deterministic_repository_intelligence",
            "report": report,
        }

    def generate(
        self,
        repository_name: str,
        related_limit: int = 5,
    ) -> dict:

        deterministic_result = self.analyze(
            repository_name=repository_name,
            related_limit=related_limit,
        )

        if deterministic_result.get("status") != "success":
            return deterministic_result

        generated = self.ai_generator.generate(
            repository_name=repository_name,
            report=deterministic_result["report"],
        )

        return {
            "status": "success",
            "repository": repository_name,
            "report_type": "ai_grounded_repository_intelligence",
            "response": generated,
        }
