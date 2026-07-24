from backend.app.github.analyzer import RepositoryAnalyzer
from backend.app.github.readme import ReadmeFetcher
from backend.app.indexing.dependency_detector import DependencyDetector
from backend.app.indexing.intelligence_processor import IntelligenceProcessor


class MetadataExtractor:

    def __init__(self):

        self.readme = ReadmeFetcher()
        self.analyzer = RepositoryAnalyzer()
        self.dependency_detector = DependencyDetector()
        self.intelligence = IntelligenceProcessor()

    def extract(self, repository):

        full_name = repository["full_name"]

        readme = self.readme.fetch_readme(
            full_name
        )

        analysis = self.analyzer.analyze(readme)

        dependency_analysis = self.dependency_detector.detect(
            full_name
        )

        enriched = {
            **repository,
            "readme": readme,
            "analysis": analysis,
            "dependency_analysis": dependency_analysis,
        }

        enriched = self.intelligence.process(
            enriched
        )

        return enriched
