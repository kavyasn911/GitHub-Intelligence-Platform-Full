class RepositoryComparisonAgent:

    def compare(
        self,
        repository_name: str,
        graph_context: dict,
    ):
        repositories = graph_context.get(
            "repositories",
            [],
        )

        if not repositories:
            return {
                "answer": (
                    f"No graph-related repositories were found "
                    f"for {repository_name}."
                ),
                "comparisons": [],
            }

        comparisons = []

        for repository in repositories:
            comparisons.append({
                "repository": repository.get("name"),
                "shared_entities": repository.get("shared_count", 0),
                "quality_score": repository.get("overall_score", 0),
                "grade": repository.get("grade", "Unknown"),
                "language": repository.get("language"),
            })

        strongest = comparisons[0]

        return {
            "answer": (
                f"The repository most closely related to "
                f"{repository_name} is "
                f"{strongest.get('repository')}, sharing "
                f"{strongest.get('shared_entities')} knowledge graph "
                f"entities and having a quality score of "
                f"{strongest.get('quality_score')}."
            ),
            "source_repository": repository_name,
            "strongest_match": strongest.get("repository"),
            "comparisons": comparisons,
        }
