class RepositoryKnowledgeCardGenerator:

    def generate(self, repository: dict):

        analysis = repository.get("analysis") or {}
        intelligence = repository.get("intelligence") or {}

        architecture_data = intelligence.get("architecture") or {}
        score_data = intelligence.get("repository_score") or {}

        technologies = analysis.get("technologies") or []
        skills = intelligence.get("skills") or []
        tags = intelligence.get("tags") or []

        return {
            "repository": {
                "id": repository.get("id"),
                "name": repository.get("name"),
                "full_name": repository.get("full_name"),
                "description": repository.get("description"),
                "language": repository.get("language"),
            },
            "profile": {
                "category": intelligence.get(
                    "category",
                    "General",
                ),
                "complexity": intelligence.get(
                    "complexity",
                    "Unknown",
                ),
                "architecture": architecture_data.get(
                    "architecture",
                    "Unknown",
                ),
                "architecture_confidence": architecture_data.get(
                    "confidence",
                    0.0,
                ),
            },
            "technology_profile": {
                "technologies": technologies,
                "skills": skills,
                "tags": tags,
            },
            "quality_profile": {
                "overall_score": score_data.get(
                    "overall_score",
                    0,
                ),
                "grade": score_data.get(
                    "grade",
                    "Unknown",
                ),
                "dimensions": score_data.get(
                    "dimensions",
                    {},
                ),
            },
            "summary": analysis.get(
                "summary",
                "Summary unavailable",
            ),
        }
