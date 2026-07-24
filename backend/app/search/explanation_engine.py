class SearchExplanationEngine:

    def explain(
        self,
        result: dict,
        parsed_query: dict,
    ):

        payload = result.get("payload") or {}
        filters = parsed_query.get("filters") or {}

        reasons = []

        language = filters.get("language")

        if (
            language
            and payload.get("language") == language
        ):
            reasons.append(
                f"Matches requested language: {language}"
            )

        complexity = filters.get("complexity")

        if (
            complexity
            and payload.get("complexity") == complexity
        ):
            reasons.append(
                f"Matches requested complexity: {complexity}"
            )

        architecture = filters.get("architecture")

        if (
            architecture
            and payload.get("architecture") == architecture
        ):
            reasons.append(
                f"Matches requested architecture: {architecture}"
            )

        requested_technologies = set(
            filters.get("technologies") or []
        )

        repository_technologies = set(
            payload.get("technologies") or []
        )

        matched_technologies = sorted(
            requested_technologies.intersection(
                repository_technologies
            )
        )

        if matched_technologies:
            reasons.append(
                "Matches technologies: "
                + ", ".join(matched_technologies)
            )

        if not reasons:
            reasons.append(
                "Ranked primarily by semantic similarity"
            )

        return {
            "summary": (
                f"{payload.get('name', 'Repository')} "
                f"matched the search with final score "
                f"{result.get('ranking', {}).get('final_score', 0)}"
            ),
            "reasons": reasons,
        }
