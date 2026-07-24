class RepositoryIntelligenceAgent:

    def answer(
        self,
        query: str,
        context: dict,
    ):
        repositories = context.get(
            "repositories",
            [],
        )

        if not repositories:
            return {
                "answer": "No repositories matched the query.",
                "evidence": [],
            }

        top_repository = repositories[0]

        evidence = []

        for repository in repositories:
            evidence.append({
                "repository": repository.get("name"),
                "relevance_score": repository.get("final_score"),
                "quality_score": repository.get("quality_score"),
                "grade": repository.get("grade"),
                "technologies": repository.get("technologies", []),
                "architecture": repository.get("architectures", []),
                "complexity": repository.get("complexities", []),
            })

        answer = (
            f"Based on semantic relevance, knowledge graph evidence, "
            f"and repository quality, "
            f"{top_repository.get('name')} is the strongest match. "
            f"It has a fused relevance score of "
            f"{top_repository.get('final_score')} and a repository "
            f"quality score of {top_repository.get('quality_score')} "
            f"with grade {top_repository.get('grade')}."
        )

        return {
            "answer": answer,
            "top_repository": top_repository.get("name"),
            "confidence": top_repository.get("final_score"),
            "evidence": evidence,
        }
