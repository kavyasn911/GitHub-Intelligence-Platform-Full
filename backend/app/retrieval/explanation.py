class RetrievalExplanationEngine:

    def explain(
        self,
        result: dict,
        query_intelligence: dict,
    ):

        repository = result.get(
            "repository",
            {},
        )

        graph = result.get(
            "graph",
            {},
        )

        scores = result.get(
            "scores",
            {},
        )

        filters = query_intelligence.get(
            "filters",
            {},
        )

        reasons = []

        vector_score = scores.get(
            "vector_similarity",
            0,
        )

        if vector_score >= 0.60:
            reasons.append(
                "Strong semantic similarity to the search query"
            )
        elif vector_score >= 0.30:
            reasons.append(
                "Moderate semantic similarity to the search query"
            )
        else:
            reasons.append(
                "Low semantic similarity but retained through retrieval fusion"
            )

        requested_language = filters.get(
            "language"
        )

        if (
            requested_language
            and repository.get("language")
            and repository["language"].lower()
            == requested_language.lower()
        ):
            reasons.append(
                f"Matches requested language: {requested_language}"
            )

        requested_complexity = filters.get(
            "complexity"
        )

        complexities = graph.get(
            "complexities",
            [],
        )

        if (
            requested_complexity
            and requested_complexity.lower()
            in {
                value.lower()
                for value in complexities
            }
        ):
            reasons.append(
                f"Matches requested complexity: {requested_complexity}"
            )

        requested_technologies = {
            value.lower()
            for value in filters.get(
                "technologies",
                [],
            )
        }

        technologies = graph.get(
            "technologies",
            [],
        )

        matched_technologies = [
            technology
            for technology in technologies
            if technology.lower()
            in requested_technologies
        ]

        if matched_technologies:
            reasons.append(
                "Matches technologies: "
                + ", ".join(
                    matched_technologies
                )
            )

        overall_score = graph.get(
            "overall_score",
            0,
        )

        if overall_score >= 80:
            reasons.append(
                f"High repository quality score: {overall_score}"
            )

        return {
            "summary": (
                f"{repository.get('name', 'Repository')} "
                f"received a fused relevance score of "
                f"{result.get('final_score', 0)}"
            ),
            "reasons": reasons,
            "score_breakdown": scores,
        }
