class PortfolioIntelligenceAgent:

    def answer(
        self,
        query: str,
        context: dict,
    ) -> dict:

        repositories = context.get("repositories", [])

        if not repositories:
            return {
                "answer": "No repository evidence is available.",
                "repositories": [],
            }

        ranked = sorted(
            repositories,
            key=lambda item: (
                item.get("quality_score") or 0,
                item.get("final_score") or 0,
            ),
            reverse=True,
        )

        strongest = ranked[0]

        average_quality = round(
            sum(
                repository.get("quality_score") or 0
                for repository in ranked
            ) / len(ranked),
            2,
        )

        return {
            "answer": (
                f"{strongest.get('name')} is the strongest repository "
                f"in the retrieved portfolio context with quality score "
                f"{strongest.get('quality_score')} and grade "
                f"{strongest.get('grade')}."
            ),
            "strongest_repository": strongest.get("name"),
            "average_quality": average_quality,
            "repositories": ranked,
        }
