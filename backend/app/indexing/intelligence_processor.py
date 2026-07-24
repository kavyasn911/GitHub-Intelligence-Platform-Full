from backend.app.intelligence.repository_intelligence import RepositoryIntelligence
from backend.app.intelligence.architecture_detector import ArchitectureDetector
from backend.app.intelligence.scoring_engine import RepositoryScoringEngine
from backend.app.intelligence.tag_generator import RepositoryTagGenerator
from backend.app.intelligence.knowledge_card import RepositoryKnowledgeCardGenerator


class IntelligenceProcessor:

    def __init__(self):

        self.engine = RepositoryIntelligence()
        self.architecture = ArchitectureDetector()
        self.scoring = RepositoryScoringEngine()
        self.tags = RepositoryTagGenerator()
        self.knowledge_card = RepositoryKnowledgeCardGenerator()

    def process(
        self,
        repository: dict,
    ):

        intelligence = self.engine.analyze(
            repository
        )

        intelligence["architecture"] = (
            self.architecture.detect(
                repository
            )
        )

        repository["intelligence"] = intelligence

        intelligence["repository_score"] = (
            self.scoring.score(
                repository
            )
        )

        repository["intelligence"] = intelligence

        intelligence["tags"] = (
            self.tags.generate(
                repository
            )
        )

        repository["intelligence"] = intelligence

        intelligence["knowledge_card"] = (
            self.knowledge_card.generate(
                repository
            )
        )

        repository["intelligence"] = intelligence

        return repository
