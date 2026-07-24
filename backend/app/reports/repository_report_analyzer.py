from collections import Counter


class RepositoryReportAnalyzer:

    def analyze(
        self,
        repository_name: str,
        graph_data: dict,
        related_data: dict,
    ) -> dict:

        repository = graph_data.get("repository", {}) or {}
        connections = graph_data.get("connections", []) or []
        related = related_data.get("repositories", []) or []

        entities = {}

        for connection in connections:

            node_type = connection.get("node_type", "Unknown")
            name = connection.get("name")

            if not name:
                continue

            entities.setdefault(node_type, []).append(name)

        technologies = entities.get("Technology", [])
        skills = entities.get("Skill", [])
        tags = entities.get("Tag", [])
        categories = entities.get("Category", [])
        architectures = entities.get("Architecture", [])
        complexities = entities.get("Complexity", [])

        score = repository.get("overall_score") or 0
        grade = repository.get("grade") or "Unknown"

        strengths = []
        risks = []
        recommendations = []

        if score >= 80:
            strengths.append(
                "Repository demonstrates strong overall engineering quality."
            )
        elif score >= 60:
            strengths.append(
                "Repository demonstrates moderate engineering quality."
            )
            recommendations.append(
                "Improve weaker quality dimensions to reach production-grade maturity."
            )
        else:
            risks.append(
                "Repository quality score indicates significant engineering improvement opportunities."
            )
            recommendations.append(
                "Prioritize documentation, maintainability, architecture, and deployment readiness."
            )

        if len(technologies) >= 8:
            strengths.append(
                "Repository demonstrates broad technology depth."
            )
        elif len(technologies) <= 2:
            risks.append(
                "Repository has limited detected technology depth."
            )
            recommendations.append(
                "Improve technology documentation and dependency metadata."
            )

        if architectures and architectures[0] != "Unknown":
            strengths.append(
                f"Detected architecture is {architectures[0]}."
            )
        else:
            risks.append(
                "Repository architecture could not be confidently identified."
            )
            recommendations.append(
                "Document architectural structure and major components."
            )

        if complexities and complexities[0] == "Advanced":
            strengths.append(
                "Repository demonstrates advanced implementation complexity."
            )

        if not skills:
            risks.append(
                "No explicit engineering skills were detected."
            )
            recommendations.append(
                "Improve README documentation to expose engineering capabilities."
            )

        related_names = [
            item.get("name")
            for item in related
            if item.get("name")
        ]

        return {
            "repository": repository_name,
            "profile": {
                "full_name": repository.get("full_name"),
                "language": repository.get("language"),
                "quality_score": score,
                "grade": grade,
                "architectures": architectures,
                "complexities": complexities,
                "categories": categories,
            },
            "technology_intelligence": {
                "technology_count": len(set(technologies)),
                "technologies": sorted(set(technologies)),
                "skills": sorted(set(skills)),
                "tags": sorted(set(tags)),
            },
            "strengths": strengths,
            "risks": risks,
            "recommendations": recommendations,
            "related_repository_count": len(related_names),
            "related_repositories": related_names,
        }
