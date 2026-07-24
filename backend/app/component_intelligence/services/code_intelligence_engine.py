from backend.app.component_intelligence.services.clone_service import RepositoryCloneService
from backend.app.component_intelligence.services.repository_tree_service import RepositoryTreeService
from backend.app.component_intelligence.services.file_classifier import FileClassifier
from backend.app.component_intelligence.services.component_detector import ComponentDetector


class CodeIntelligenceEngine:

    def __init__(self):
        self.clone_service = RepositoryCloneService()
        self.tree_service = RepositoryTreeService()
        self.classifier = FileClassifier()
        self.detector = ComponentDetector()

    def analyze(self, full_name: str):

        clone = self.clone_service.clone(full_name)

        tree = self.tree_service.analyze(
            clone["path"]
        )

        classified = self.classifier.classify(
            tree
        )

        components = self.detector.detect(
            classified
        )

        return {
            "repository": full_name,
            "clone": clone,
            "tree_summary": {
                "total_items": tree["total_items"],
            },
            "components": components,
        }
