class RepositoryRelationshipExtractor:

    def extract(self, repository: dict):

        analysis = repository.get("analysis") or {}
        intelligence = repository.get("intelligence") or {}

        architecture_data = intelligence.get("architecture") or {}

        return {
            "repository": {
                "github_id": repository.get("id"),
                "name": repository.get("name"),
                "full_name": repository.get("full_name"),
                "language": repository.get("language"),
                "description": repository.get("description"),
                "stars": repository.get("stars", 0),
                "overall_score": (
                    intelligence.get("repository_score") or {}
                ).get("overall_score", 0),
                "grade": (
                    intelligence.get("repository_score") or {}
                ).get("grade", "Unknown"),
            },
            "technologies": analysis.get("technologies") or [],
            "skills": intelligence.get("skills") or [],
            "tags": intelligence.get("tags") or [],
            "category": intelligence.get("category", "General"),
            "complexity": intelligence.get("complexity", "Unknown"),
            "architecture": architecture_data.get(
                "architecture",
                "Unknown",
            ),
        }
