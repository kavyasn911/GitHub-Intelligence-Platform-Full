from collections import Counter


class TechnologyIntelligenceAgent:

    def answer(
        self,
        query: str,
        context: dict,
    ) -> dict:

        repositories = context.get("repositories", [])

        technologies = []

        for repository in repositories:
            technologies.extend(
                repository.get("technologies", [])
            )

        counts = Counter(technologies)

        ranked_technologies = [
            {
                "technology": technology,
                "repository_count": count,
            }
            for technology, count in counts.most_common()
        ]

        if not ranked_technologies:
            answer = "No technology evidence is available."
        else:
            answer = (
                f"The dominant technology is "
                f"{ranked_technologies[0]['technology']}, appearing across "
                f"{ranked_technologies[0]['repository_count']} retrieved repositories."
            )

        return {
            "answer": answer,
            "technologies": ranked_technologies,
            "repositories_analyzed": len(repositories),
        }
