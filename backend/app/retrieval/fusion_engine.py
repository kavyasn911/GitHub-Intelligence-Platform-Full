class RetrievalFusionEngine:

    VECTOR_WEIGHT = 0.55
    GRAPH_WEIGHT = 0.25
    QUALITY_WEIGHT = 0.20

    def rank(
        self,
        candidates: list,
        query_intelligence: dict,
        graph_data: dict,
    ):

        ranked = []

        filters = query_intelligence.get(
            "filters",
            {},
        )

        requested_language = filters.get("language")
        requested_complexity = filters.get("complexity")

        requested_technologies = {
            value.lower()
            for value in filters.get("technologies", [])
        }

        for candidate in candidates:

            repository_id = candidate["id"]

            payload = candidate.get("payload") or {}

            graph = graph_data.get(
                repository_id,
                {},
            )

            vector_score = max(
                0.0,
                min(
                    1.0,
                    float(candidate.get("score", 0)),
                ),
            )

            graph_score = self._calculate_graph_score(
                payload=payload,
                graph=graph,
                requested_language=requested_language,
                requested_complexity=requested_complexity,
                requested_technologies=requested_technologies,
            )

            quality_score = min(
                1.0,
                max(
                    0.0,
                    float(
                        graph.get(
                            "overall_score",
                            payload.get("overall_score", 0),
                        )
                        or 0
                    ) / 100.0,
                ),
            )

            final_score = (
                vector_score * self.VECTOR_WEIGHT
                + graph_score * self.GRAPH_WEIGHT
                + quality_score * self.QUALITY_WEIGHT
            )

            ranked.append({
                "id": repository_id,
                "final_score": round(final_score, 4),
                "scores": {
                    "vector_similarity": round(
                        vector_score,
                        4,
                    ),
                    "graph_relevance": round(
                        graph_score,
                        4,
                    ),
                    "repository_quality": round(
                        quality_score,
                        4,
                    ),
                },
                "repository": payload,
                "graph": graph,
            })

        return sorted(
            ranked,
            key=lambda item: item["final_score"],
            reverse=True,
        )

    def _calculate_graph_score(
        self,
        payload,
        graph,
        requested_language,
        requested_complexity,
        requested_technologies,
    ):

        evidence = 0.0
        possible = 0.0

        if requested_language:

            possible += 1.0

            if (
                (payload.get("language") or "").lower()
                == requested_language.lower()
            ):
                evidence += 1.0

        if requested_complexity:

            possible += 1.0

            complexities = {
                value.lower()
                for value in graph.get(
                    "complexities",
                    [],
                )
            }

            if requested_complexity.lower() in complexities:
                evidence += 1.0

        if requested_technologies:

            possible += 1.0

            graph_technologies = {
                value.lower()
                for value in graph.get(
                    "technologies",
                    [],
                )
            }

            matched = (
                requested_technologies
                & graph_technologies
            )

            evidence += (
                len(matched)
                / len(requested_technologies)
            )

        if possible == 0:
            return 0.5

        return evidence / possible

