import math

from backend.app.indexing.embedding_generator import EmbeddingGenerator
from backend.app.discovery.requirement_matcher import RepositoryRequirementMatcher
from backend.app.discovery.general_relevance import GeneralRepositoryRelevanceEngine


class ExternalRepositoryRankingService:

    def __init__(self):

        self.embedding_generator = (
            EmbeddingGenerator()
        )

        self.requirement_matcher = (
            RepositoryRequirementMatcher()
        )

        self.general_relevance_engine = (
            GeneralRepositoryRelevanceEngine()
        )

    def rank(
        self,
        query: str,
        repositories: list,
        specification: dict | None = None,
    ) -> list:

        if not repositories:
            return []

        searchable_texts = [
            self._build_searchable_text(
                repository
            )
            for repository in repositories
        ]

        embedding_texts = [
            query,
            *searchable_texts,
        ]

        batch_embeddings = (
            self.embedding_generator.generate_batch(
                embedding_texts
            )
        )

        query_embedding = batch_embeddings[0]

        repository_embeddings = (
            batch_embeddings[1:]
        )

        ranked = []

        for (
            repository,
            repository_embedding,
        ) in zip(
            repositories,
            repository_embeddings,
        ):

            semantic_score = (
                self._cosine_similarity(
                    query_embedding,
                    repository_embedding,
                )
            )

            metadata_score = (
                self._metadata_score(
                    repository
                )
            )

            popularity_score = (
                self._popularity_score(
                    repository
                )
            )

            health_score = (
                repository
                .get(
                    "repository_health",
                    {},
                )
                .get(
                    "health_score",
                    0,
                )
            )

            requirement_match = (
                self.requirement_matcher.match(
                    query=query,
                    repository=repository,
                    specification=specification,
                )
            )

            requirement_score = (
                requirement_match.get(
                    "requirement_score",
                    0,
                )
            )

            relevance_gate = repository.get(
                "relevance_gate",
                {},
            )

            raw_relevance_score = (
                relevance_gate.get(
                    "relevance_score",
                    0,
                )
            )

            relevance_score = min(
                raw_relevance_score / 20.0,
                1.0,
            )

            direct_match_count = len(
                relevance_gate.get(
                    "direct_matches",
                    [],
                )
            )

            concept_match_count = len(
                relevance_gate.get(
                    "concept_matches",
                    [],
                )
            )

            intent_coverage_score = min(
                (
                    direct_match_count * 0.15
                    + concept_match_count * 0.05
                ),
                1.0,
            )

            # GENERAL QUERY-TO-REPOSITORY RELEVANCE

            general_relevance_result = (
                self.general_relevance_engine.evaluate(
                    query=query,
                    repository=repository,
                    specification=specification,
                )
            )

            general_relevance_score = (
                general_relevance_result.get(
                    "score",
                    0.0,
                )
            )

            # GITHUB SEARCH EVIDENCE

            github_search_hits = (
                repository.get("github_search_hits")
                or 0
            )

            best_github_position = (
                repository.get("best_github_position")
                or 100
            )

            hit_score = min(
                github_search_hits / 4.0,
                1.0,
            )

            position_score = max(
                0.0,
                1.0 - (
                    (best_github_position - 1)
                    / 20.0
                ),
            )

            github_evidence_score = (
                hit_score * 0.40
                + position_score * 0.60
            )

            # REQUIREMENT CONFIDENCE
            #
            # Reduce inflated requirement scores when
            # semantic similarity is weak.

            requirement_confidence = (
                requirement_score
                * (
                    0.60
                    + semantic_score * 0.40
                )
            )

            # REPOSITORY PURPOSE ALIGNMENT

            repository_purpose = repository.get(
                "repository_purpose",
                {},
            )

            primary_purpose = repository_purpose.get(
                "primary_purpose",
                "unknown",
            )

            purpose_evidence = repository_purpose.get(
                "evidence",
                {},
            )

            query_lower = query.lower()

            desired_purposes = set()

            if (
                "agent" in query_lower
                or "multi-agent" in query_lower
                or "multi agent" in query_lower
            ):
                desired_purposes.add("ai_agent_framework")

            if (
                "llm" in query_lower
                or "model platform" in query_lower
                or "multi-model" in query_lower
                or "multi model" in query_lower
            ):
                desired_purposes.add("llm_platform")

            if (
                "monitoring" in query_lower
                or "observability" in query_lower
            ):
                desired_purposes.add("observability_platform")

            if (
                "workflow" in query_lower
                or "automation" in query_lower
            ):
                desired_purposes.add("automation_platform")

            if (
                "rag" in query_lower
                or "knowledge base" in query_lower
                or "semantic search" in query_lower
            ):
                desired_purposes.add("knowledge_platform")

            purpose_alignment_score = 0.0

            if desired_purposes:

                if primary_purpose in desired_purposes:
                    purpose_alignment_score = 1.0
                else:
                    matching_evidence = sum(
                        len(
                            purpose_evidence.get(
                                purpose,
                                [],
                            )
                        )
                        for purpose in desired_purposes
                    )

                    purpose_alignment_score = min(
                        matching_evidence / 4.0,
                        0.6,
                    )


            matched_query_weight = repository.get(
                "matched_query_weight",
                1,
            )

            query_weight_score = min(
                matched_query_weight / 10.0,
                1.0,
            )


            exclusion = repository.get(
                "repository_exclusion",
                {},
            )

            repository_quality_score = exclusion.get(
                "quality_score",
                1.0,
            )

            repository_excluded = exclusion.get(
                "exclude",
                False,
            )

            final_score = (
                general_relevance_score * 0.30
                + semantic_score * 0.20
                + requirement_confidence * 0.15
                + github_evidence_score * 0.08
                + query_weight_score * 0.10
                + repository_quality_score * 0.10
                + purpose_alignment_score * 0.10
                + health_score * 0.06
                + metadata_score * 0.03
                + popularity_score * 0.03
                + relevance_score * 0.015
                + intent_coverage_score * 0.015
            )


            if repository_excluded:
                final_score *= 0.20

            ranked.append({
                **repository,
                "requirement_match":
                    requirement_match,
                "ranking": {
                    "semantic_score": round(
                        semantic_score,
                        4,
                    ),
                    "requirement_score": round(
                        requirement_score,
                        4,
                    ),
                    "relevance_score": round(
                        relevance_score,
                        4,
                    ),
                    "intent_coverage_score": round(
                        intent_coverage_score,
                        4,
                    ),
                    "health_score": round(
                        health_score,
                        4,
                    ),
                    "metadata_score": round(
                        metadata_score,
                        4,
                    ),
                    "popularity_score": round(
                        popularity_score,
                        4,
                    ),
                    "github_evidence_score": round(
                        github_evidence_score,
                        4,
                    ),
                    "query_weight_score": round(
                        query_weight_score,
                        4,
                    ),
                    "repository_quality_score": round(
                        repository_quality_score,
                        4,
                    ),
                    "repository_excluded": repository_excluded,
                    "requirement_confidence": round(
                        requirement_confidence,
                        4,
                    ),
                    "general_relevance_score": round(
                        general_relevance_score,
                        4,
                    ),
                    "general_relevance":
                        general_relevance_result,
                    "primary_purpose": primary_purpose,
                    "purpose_alignment_score": round(
                        purpose_alignment_score,
                        4,
                    ),
                    "final_score": round(
                        final_score,
                        4,
                    ),
                },
            })

        return sorted(
            ranked,
            key=lambda item:
                item["ranking"][
                    "final_score"
                ],
            reverse=True,
        )

    def _build_searchable_text(
        self,
        repository,
    ):

        analysis = repository.get(
            "analysis",
            {},
        )

        architecture = repository.get(
            "architecture_intelligence",
            {},
        )

        parts = [
            repository.get("name") or "",
            repository.get("full_name") or "",
            repository.get("description") or "",
            repository.get("language") or "",
            " ".join(
                repository.get("topics") or []
            ),
            analysis.get("summary") or "",
            " ".join(
                analysis.get(
                    "technologies",
                    [],
                )
            ),
            " ".join(
                architecture.get(
                    "frameworks",
                    [],
                )
            ),
            " ".join(
                architecture.get(
                    "architectures",
                    [],
                )
            ),
        ]

        return "\n".join(
            part
            for part in parts
            if part
        )

    def _cosine_similarity(
        self,
        vector_a,
        vector_b,
    ):

        if not vector_a or not vector_b:
            return 0.0

        dot_product = sum(
            a * b
            for a, b in zip(
                vector_a,
                vector_b,
            )
        )

        magnitude_a = math.sqrt(
            sum(
                a * a
                for a in vector_a
            )
        )

        magnitude_b = math.sqrt(
            sum(
                b * b
                for b in vector_b
            )
        )

        if (
            magnitude_a == 0
            or magnitude_b == 0
        ):
            return 0.0

        return (
            dot_product
            / (
                magnitude_a
                * magnitude_b
            )
        )

    def _popularity_score(
        self,
        repository,
    ):

        stars = (
            repository.get("stars")
            or 0
        )

        return min(
            math.log10(stars + 1)
            / 5,
            1.0,
        )

    def _metadata_score(
        self,
        repository,
    ):

        score = 0.0

        if repository.get("description"):
            score += 0.25

        if repository.get("language"):
            score += 0.20

        if repository.get("topics"):
            score += 0.20

        if repository.get(
            "readme_available"
        ):
            score += 0.25

        if not repository.get(
            "archived"
        ):
            score += 0.10

        return min(score, 1.0)




