import json


class GroundedPromptBuilder:

    SYSTEM_PROMPT = """
You are the AI reasoning layer of the GitHub Intelligence Platform.

You analyze GitHub repositories using evidence retrieved from semantic search,
repository intelligence scoring, and a Neo4j knowledge graph.

Rules:

1. Answer only from the supplied repository evidence.
2. Never invent repositories, technologies, scores, grades, or architectures.
3. Clearly explain why a repository was selected.
4. Compare repositories when useful.
5. Distinguish semantic relevance from repository quality.
6. If evidence is insufficient, explicitly say so.
7. Keep answers concise, technical, and useful.
8. Do not expose hidden reasoning or chain-of-thought.
"""

    def build_repository_prompt(
        self,
        query: str,
        context: dict,
    ) -> str:

        repositories = context.get(
            "repositories",
            [],
        )

        evidence = []

        for repository in repositories:

            evidence.append({
                "name": repository.get("name"),
                "full_name": repository.get("full_name"),
                "language": repository.get("language"),
                "relevance_score": repository.get(
                    "final_score"
                ),
                "quality_score": repository.get(
                    "quality_score"
                ),
                "grade": repository.get("grade"),
                "technologies": repository.get(
                    "technologies",
                    [],
                ),
                "skills": repository.get(
                    "skills",
                    [],
                ),
                "architecture": repository.get(
                    "architectures",
                    [],
                ),
                "complexity": repository.get(
                    "complexities",
                    [],
                ),
                "categories": repository.get(
                    "categories",
                    [],
                ),
            })

        return (
            f"USER QUERY:\n{query}\n\n"
            f"REPOSITORY EVIDENCE:\n"
            f"{json.dumps(evidence, indent=2, default=str)}\n\n"
            "Answer the user query using only the evidence above. "
            "Explain the recommendation using repository names, "
            "relevance, quality, architecture, complexity, and "
            "technologies when supported by the evidence."
        )

    def build_comparison_prompt(
        self,
        repository_name: str,
        graph_context: dict,
    ) -> str:

        repositories = graph_context.get(
            "repositories",
            [],
        )

        evidence = []

        for repository in repositories:

            evidence.append({
                "name": repository.get("name"),
                "full_name": repository.get("full_name"),
                "language": repository.get("language"),
                "quality_score": repository.get(
                    "overall_score"
                ),
                "grade": repository.get("grade"),
                "shared_count": repository.get(
                    "shared_count"
                ),
                "shared_entities": repository.get(
                    "shared_entities",
                    [],
                ),
            })

        return (
            f"SOURCE REPOSITORY:\n{repository_name}\n\n"
            f"KNOWLEDGE GRAPH EVIDENCE:\n"
            f"{json.dumps(evidence, indent=2, default=str)}\n\n"
            "Identify the most closely related repository and explain "
            "the comparison using only the supplied graph evidence."
        )
