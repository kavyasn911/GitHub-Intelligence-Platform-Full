from qdrant_client.models import (
    FieldCondition,
    Filter,
    MatchAny,
    MatchValue,
    Range,
)


class SearchFilterBuilder:

    def build(self, filters: dict):

        conditions = []

        language = filters.get("language")

        if language:
            conditions.append(
                FieldCondition(
                    key="language",
                    match=MatchValue(
                        value=language
                    ),
                )
            )

        complexity = filters.get("complexity")

        if complexity:
            conditions.append(
                FieldCondition(
                    key="complexity",
                    match=MatchValue(
                        value=complexity
                    ),
                )
            )

        architecture = filters.get("architecture")

        if architecture:
            conditions.append(
                FieldCondition(
                    key="architecture",
                    match=MatchValue(
                        value=architecture
                    ),
                )
            )

        technologies = filters.get("technologies") or []

        if technologies:
            conditions.append(
                FieldCondition(
                    key="technologies",
                    match=MatchAny(
                        any=technologies
                    ),
                )
            )

        minimum_score = filters.get("minimum_score")

        if minimum_score is not None:
            conditions.append(
                FieldCondition(
                    key="overall_score",
                    range=Range(
                        gte=minimum_score
                    ),
                )
            )

        if not conditions:
            return None

        return Filter(
            must=conditions
        )
