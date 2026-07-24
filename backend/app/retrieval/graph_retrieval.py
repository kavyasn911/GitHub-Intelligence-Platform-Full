from backend.app.core.neo4j import neo4j_connection


class GraphRetrievalService:

    def enrich_candidates(
        self,
        candidate_ids: list,
    ):

        if not candidate_ids:
            return {}

        with neo4j_connection.driver.session() as session:

            result = session.run(
                """
                MATCH (r:Repository)
                WHERE r.github_id IN $candidate_ids

                OPTIONAL MATCH (r)-[:USES_TECHNOLOGY]->(technology:Technology)
                OPTIONAL MATCH (r)-[:REQUIRES_SKILL]->(skill:Skill)
                OPTIONAL MATCH (r)-[:TAGGED_WITH]->(tag:Tag)
                OPTIONAL MATCH (r)-[:BELONGS_TO]->(category:Category)
                OPTIONAL MATCH (r)-[:HAS_ARCHITECTURE]->(architecture:Architecture)
                OPTIONAL MATCH (r)-[:HAS_COMPLEXITY]->(complexity:Complexity)

                RETURN
                    r.github_id AS id,
                    r.overall_score AS overall_score,
                    r.grade AS grade,
                    collect(DISTINCT technology.name) AS technologies,
                    collect(DISTINCT skill.name) AS skills,
                    collect(DISTINCT tag.name) AS tags,
                    collect(DISTINCT category.name) AS categories,
                    collect(DISTINCT architecture.name) AS architectures,
                    collect(DISTINCT complexity.name) AS complexities
                """,
                candidate_ids=candidate_ids,
            )

            return {
                record["id"]: {
                    "overall_score": record["overall_score"] or 0,
                    "grade": record["grade"] or "Unknown",
                    "technologies": [
                        value
                        for value in record["technologies"]
                        if value
                    ],
                    "skills": [
                        value
                        for value in record["skills"]
                        if value
                    ],
                    "tags": [
                        value
                        for value in record["tags"]
                        if value
                    ],
                    "categories": [
                        value
                        for value in record["categories"]
                        if value
                    ],
                    "architectures": [
                        value
                        for value in record["architectures"]
                        if value
                    ],
                    "complexities": [
                        value
                        for value in record["complexities"]
                        if value
                    ],
                }
                for record in result
            }
