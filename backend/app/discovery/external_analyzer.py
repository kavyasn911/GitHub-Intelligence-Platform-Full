from backend.app.github.readme import ReadmeFetcher
from backend.app.github.analyzer import RepositoryAnalyzer

from backend.app.discovery.repository_health import RepositoryHealthAnalyzer
from backend.app.discovery.architecture_intelligence import RepositoryArchitectureIntelligence
from backend.app.discovery.repository_purpose import RepositoryPurposeClassifier
from backend.app.discovery.repository_exclusion import RepositoryExclusionEngine


class ExternalRepositoryAnalyzer:

    def __init__(self):

        self.readme_fetcher = ReadmeFetcher()

        self.repository_analyzer = (
            RepositoryAnalyzer()
        )

        self.health_analyzer = (
            RepositoryHealthAnalyzer()
        )

        self.architecture_intelligence = (
            RepositoryArchitectureIntelligence()
        )

        self.purpose_classifier = (
            RepositoryPurposeClassifier()
        )

        self.repository_exclusion = (
            RepositoryExclusionEngine()
        )

    def analyze(
        self,
        repository: dict,
    ) -> dict:

        full_name = repository.get(
            "full_name"
        )

        readme = (
            self.readme_fetcher.fetch_readme(
                full_name
            )
        )

        analysis = (
            self.repository_analyzer.analyze(
                readme or ""
            )
        )

        enriched_repository = {
            **repository,
            "analysis": analysis,
            "readme_available": bool(readme),
        }

        enriched_repository[
            "repository_health"
        ] = self.health_analyzer.analyze(
            enriched_repository
        )

        enriched_repository[
            "architecture_intelligence"
        ] = (
            self.architecture_intelligence
            .analyze(
                enriched_repository
            )
        )

        enriched_repository[
            "repository_purpose"
        ] = (
            self.purpose_classifier.classify(
                enriched_repository
            )
        )

        return enriched_repository

