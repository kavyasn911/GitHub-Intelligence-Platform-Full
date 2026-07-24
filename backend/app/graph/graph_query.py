from backend.app.core.neo4j import neo4j_connection


class GraphQueryService:

    def statistics(self):

        with neo4j_connection.driver.session() as session:

            result = session.run(
                """
                MATCH (n)
                WITH labels(n)[0] AS label, count(n) AS count
                RETURN label, count
                ORDER BY label
                """
            )

            nodes = {
                record["label"]: record["count"]
                for record in result
            }

            relationship_result = session.run(
                """
                MATCH ()-[r]->()
                RETURN type(r) AS type, count(r) AS count
                ORDER BY type
                """
            )

            relationships = {
                record["type"]: record["count"]
                for record in relationship_result
            }

        return {
            "status": "success",
            "nodes": nodes,
            "relationships": relationships,
            "total_nodes": sum(nodes.values()),
            "total_relationships": sum(
                relationships.values()
            ),
        }

    def repository_graph(self, repository_name: str):

        with neo4j_connection.driver.session() as session:

            result = session.run(
                """
                MATCH (r:Repository)
                WHERE
                    toLower(r.name) = toLower($repository_name)
                    OR
                    toLower(r.full_name) = toLower($repository_name)

                OPTIONAL MATCH (r)-[rel]->(connected)

                RETURN
                    properties(r) AS repository,
                    collect(
                        DISTINCT {
                            relationship: type(rel),
                            node_type: labels(connected)[0],
                            name: connected.name
                        }
                    ) AS connections
                """,
                repository_name=repository_name,
            ).single()

        if result is None:
            return {
                "status": "not_found",
                "repository": repository_name,
                "connections": [],
            }

        connections = [
            connection
            for connection in result["connections"]
            if connection.get("name")
        ]

        return {
            "status": "success",
            "repository": result["repository"],
            "connections": connections,
        }

    def related_repositories(
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

                MATCH (source)-[sourceRel]->(shared)<-[targetRel]-(target:Repository)

                WHERE source <> target

                WITH
                    source,
                    target,
                    count(DISTINCT shared) AS shared_connections,
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
                    shared_connections,
                    shared_entities

                ORDER BY
                    shared_connections DESC,
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
            "count": len(repositories),
            "repositories": repositories,
        }

    def technology_repositories(
        self,
        technology: str,
    ):

        with neo4j_connection.driver.session() as session:

            result = session.run(
                """
                MATCH (r:Repository)-[:USES_TECHNOLOGY]->(t:Technology)

                WHERE toLower(t.name) = toLower($technology)

                RETURN
                    r.github_id AS id,
                    r.name AS name,
                    r.full_name AS full_name,
                    r.language AS language,
                    r.overall_score AS overall_score,
                    r.grade AS grade

                ORDER BY r.overall_score DESC
                """,
                technology=technology,
            )

            repositories = [
                dict(record)
                for record in result
            ]

        return {
            "status": "success",
            "technology": technology,
            "count": len(repositories),
            "repositories": repositories,
        }
