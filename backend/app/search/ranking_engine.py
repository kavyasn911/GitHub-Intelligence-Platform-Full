class SearchRankingEngine:

    def rank(
        self,
        results: list,
        parsed_query: dict,
    ):

        filters = parsed_query.get("filters") or {}

        ranked_results = []

        for result in results:

            payload = result.get("payload") or {}

            semantic_score = float(
                result.get("score") or 0
            )

            metadata_score = self._metadata_score(
                payload,
                filters,
            )

            quality_score = float(
                payload.get("overall_score") or 0
            ) / 100.0

            final_score = (
                semantic_score * 0.70
                + metadata_score * 0.20
                + quality_score * 0.10
            )

            ranked_results.append({
                **result,
                "ranking": {
                    "semantic_score": round(
                        semantic_score,
                        4,
                    ),
                    "metadata_score": round(
                        metadata_score,
                        4,
                    ),
                    "quality_score": round(
                        quality_score,
                        4,
                    ),
                    "final_score": round(
                        final_score,
                        4,
                    ),
                },
            })

        return sorted(
            ranked_results,
            key=lambda item: item[
                "ranking"
            ]["final_score"],
            reverse=True,
        )

    def _metadata_score(
        self,
        payload,
        filters,
    ):

        if not filters:
            return 0.5

        matches = 0
        total = 0

        language = filters.get("language")

        if language:
            total += 1

            if payload.get("language") == language:
                matches += 1

        complexity = filters.get("complexity")

        if complexity:
            total += 1

            if payload.get("complexity") == complexity:
                matches += 1

        architecture = filters.get("architecture")

        if architecture:
            total += 1

            if payload.get("architecture") == architecture:
                matches += 1

        technologies = filters.get("technologies") or []

        if technologies:

            payload_technologies = set(
                payload.get("technologies") or []
            )

            for technology in technologies:

                total += 1

                if technology in payload_technologies:
                    matches += 1

        minimum_score = filters.get("minimum_score")

        if minimum_score is not None:

            total += 1

            if (
                float(
                    payload.get("overall_score") or 0
                )
                >= minimum_score
            ):
                matches += 1

        if total == 0:
            return 0.5

        return matches / total
