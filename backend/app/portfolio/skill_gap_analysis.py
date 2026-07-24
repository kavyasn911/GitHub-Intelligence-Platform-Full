from collections import Counter

from backend.app.graph.graph_query import GraphQueryService


class SkillGapAnalysisService:

    def __init__(self):
        self.graph_query = GraphQueryService()

    def analyze(self) -> dict:

        statistics = self.graph_query.statistics()

        repository_count = (
            statistics.get("nodes", {}).get("Repository", 0)
        )

        skill_count = (
            statistics.get("nodes", {}).get("Skill", 0)
        )

        skill_relationships = (
            statistics.get(
                "relationships",
                {},
            ).get(
                "REQUIRES_SKILL",
                0,
            )
        )

        average_skills = round(
            skill_relationships / repository_count,
            2,
        ) if repository_count else 0

        recommendations = []

        if average_skills < 3:
            recommendations.append(
                "Improve repository documentation so engineering skills can be detected more accurately."
            )

        if skill_count < 5:
            recommendations.append(
                "The portfolio shows limited skill diversity."
            )

        if not recommendations:
            recommendations.append(
                "The portfolio demonstrates healthy detected skill diversity."
            )

        return {
            "status": "success",
            "skill_intelligence": {
                "unique_skills": skill_count,
                "skill_relationships": skill_relationships,
                "average_skills_per_repository": average_skills,
                "recommendations": recommendations,
            },
        }
