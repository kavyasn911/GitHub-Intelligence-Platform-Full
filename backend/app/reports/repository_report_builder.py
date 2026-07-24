class RepositoryReportBuilder:

    def build(
        self,
        analysis: dict,
    ) -> dict:

        profile = analysis.get("profile", {})

        strengths = analysis.get("strengths", [])
        risks = analysis.get("risks", [])
        recommendations = analysis.get(
            "recommendations",
            [],
        )

        executive_summary = (
            f"{analysis.get('repository')} has an overall repository "
            f"quality score of {profile.get('quality_score')} with grade "
            f"{profile.get('grade')}. "
            f"The repository contains "
            f"{analysis.get('technology_intelligence', {}).get('technology_count', 0)} "
            f"detected technologies and "
            f"{analysis.get('related_repository_count', 0)} related repositories."
        )

        return {
            "executive_summary": executive_summary,
            "repository_profile": profile,
            "technology_intelligence": analysis.get(
                "technology_intelligence",
                {},
            ),
            "engineering_assessment": {
                "strengths": strengths,
                "risks": risks,
            },
            "recommendations": recommendations,
            "relationship_intelligence": {
                "related_repository_count": analysis.get(
                    "related_repository_count",
                    0,
                ),
                "related_repositories": analysis.get(
                    "related_repositories",
                    [],
                ),
            },
        }
