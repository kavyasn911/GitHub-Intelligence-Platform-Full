from backend.app.core.neo4j import neo4j_connection


class GraphSimilarityService:

    def similar_repositories(
        self,
        repository_name: str,
        limit: int = 5,
    ):

        with neo4j_connection.driver.session() as session:

            result = session.run(
                """
                MATCH (source:Repository)
                WHERE
                    toLower(source.name) = toLower($repository_name)
                    OR
                    toLower(source.full_name) = toLower($repository_name)

                MATCH (source)-[]->(shared)<-[]-(target:Repository)

                WHERE source <> target

                WITH
                    target,
                    count(DISTINCT shared) AS shared_count,
                    collect(
                        DISTINCT {
                            type: labels(shared)[0],
                            name: shared.name
                        }
                    ) AS shared_entities

                RETURN
                    target.github_id AS id,
                    target.name AS name,
                    target.full_name AS full_name,
                    target.language AS language,
                    target.overall_score AS overall_score,
                    target.grade AS grade,
                    shared_count,
                    shared_entities

                ORDER BY
                    shared_count DESC,
                    overall_score DESC

                LIMIT $limit
                """,
                repository_name=repository_name,
                limit=limit,
            )

            repositories = [
                dict(record)
                for record in result
            ]

        return {
            "status": "success",
            "source_repository": repository_name,
            "strategy": "knowledge_graph_similarity",
            "count": len(repositories),
            "repositories": repositories,
        }
