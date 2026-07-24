import json


class DiscoveryRecommendationPromptBuilder:

    SYSTEM_PROMPT = """
You are the recommendation reasoning layer of an enterprise GitHub Intelligence Platform.

Your job is to help engineers avoid rebuilding software that already exists.

You receive deterministic evidence about GitHub repositories discovered and analyzed by the platform.

STRICT RULES:

1. Use only the supplied evidence.
2. Never invent repositories, technologies, frameworks, architectures, scores, risks, or capabilities.
3. Never claim that a missing requirement exists in a repository.
4. Clearly distinguish direct reuse, fork and extend, component reuse, architectural reference, and build new.
5. Explain why the top repository was selected.
6. Mention important alternatives when supported by evidence.
7. Explain reusable frameworks, technologies, and architecture patterns.
8. Explain missing capabilities and risks.
9. Give a practical implementation recommendation.
10. Do not expose chain-of-thought.
11. Do not repeat large JSON structures.
12. Keep the answer technical, concise, and decision-oriented.

OUTPUT STRUCTURE:

Executive Recommendation

Best Existing Repository

Why It Matches

Recommended Reuse Strategy

Reusable Components

Missing Capabilities

Risks

Alternative Repositories

Implementation Path

Final Decision
"""

    def build(
        self,
        query: str,
        discovery_result: dict,
    ) -> str:

        recommendations = []

        for repository in discovery_result.get(
            "external_recommendations",
            [],
        ):

            reuse = repository.get(
                "reuse_intelligence",
                {},
            )

            recommendations.append({
                "name":
                    repository.get("name"),
                "full_name":
                    repository.get("full_name"),
                "description":
                    repository.get("description"),
                "language":
                    repository.get("language"),
                "stars":
                    repository.get("stars"),
                "forks":
                    repository.get("forks"),
                "ranking":
                    repository.get("ranking", {}),
                "repository_health":
                    repository.get(
                        "repository_health",
                        {},
                    ),
                "requirement_match":
                    repository.get(
                        "requirement_match",
                        {},
                    ),
                "architecture_intelligence":
                    repository.get(
                        "architecture_intelligence",
                        {},
                    ),
                "reuse_intelligence": {
                    "strategy":
                        reuse.get("strategy"),
                    "reuse_score":
                        reuse.get("reuse_score"),
                    "requirement_coverage":
                        reuse.get(
                            "requirement_coverage"
                        ),
                    "matched_requirements":
                        reuse.get(
                            "matched_requirements",
                            [],
                        ),
                    "missing_requirements":
                        reuse.get(
                            "missing_requirements",
                            [],
                        ),
                    "reusable_components":
                        reuse.get(
                            "reusable_components",
                            [],
                        ),
                    "risks":
                        reuse.get("risks", []),
                    "implementation_plan":
                        reuse.get(
                            "implementation_plan",
                            {},
                        ),
                },
            })

        evidence = {
            "user_query": query,
            "query_plan":
                discovery_result.get(
                    "query_plan",
                    {},
                ),
            "candidate_pool_size":
                discovery_result.get(
                    "github_search",
                    {},
                ).get(
                    "candidate_pool_size",
                    0,
                ),
            "recommendations":
                recommendations,
        }

        return (
            "USER REQUEST:\n"
            f"{query}\n\n"
            "DETERMINISTIC DISCOVERY EVIDENCE:\n"
            f"{json.dumps(evidence, indent=2, default=str)}\n\n"
            "Generate the final engineering recommendation using only "
            "the supplied deterministic evidence. Help the engineer "
            "decide what existing repository to reuse, what components "
            "can be reused, what is missing, what risks exist, and the "
            "recommended implementation path."
        )
