from backend.app.core.neo4j import neo4j_connection
from backend.app.graph.relationship_extractor import RepositoryRelationshipExtractor


class RepositoryGraphStore:

    def __init__(self):
        self.extractor = RepositoryRelationshipExtractor()

    def store_repository(self, repository: dict):

        graph_data = self.extractor.extract(repository)

        repository_data = graph_data["repository"]

        with neo4j_connection.driver.session() as session:

            session.run(
                """
                MERGE (r:Repository {github_id: $github_id})
                SET
                    r.name = $name,
                    r.full_name = $full_name,
                    r.language = $language,
                    r.description = $description,
                    r.stars = $stars,
                    r.overall_score = $overall_score,
                    r.grade = $grade,
                    r.updated_at = datetime()
                """,
                **repository_data,
            ).consume()

            self._replace_relationships(
                session=session,
                github_id=repository_data["github_id"],
                relationship="USES_TECHNOLOGY",
                label="Technology",
                values=graph_data["technologies"],
            )

            self._replace_relationships(
                session=session,
                github_id=repository_data["github_id"],
                relationship="REQUIRES_SKILL",
                label="Skill",
                values=graph_data["skills"],
            )

            self._replace_relationships(
                session=session,
                github_id=repository_data["github_id"],
                relationship="TAGGED_WITH",
                label="Tag",
                values=graph_data["tags"],
            )

            self._replace_relationships(
                session=session,
                github_id=repository_data["github_id"],
                relationship="BELONGS_TO",
                label="Category",
                values=[graph_data["category"]],
            )

            self._replace_relationships(
                session=session,
                github_id=repository_data["github_id"],
                relationship="HAS_ARCHITECTURE",
                label="Architecture",
                values=[graph_data["architecture"]],
            )

            self._replace_relationships(
                session=session,
                github_id=repository_data["github_id"],
                relationship="HAS_COMPLEXITY",
                label="Complexity",
                values=[graph_data["complexity"]],
            )

        return {
            "status": "stored",
            "repository": repository_data["full_name"],
        }

    def _replace_relationships(
        self,
        session,
        github_id,
        relationship,
        label,
        values,
    ):

        delete_query = f"""
        MATCH (r:Repository {{github_id: $github_id}})
        OPTIONAL MATCH (r)-[rel:{relationship}]->()
        DELETE rel
        """

        session.run(
            delete_query,
            github_id=github_id,
        ).consume()

        values = [
            value
            for value in values
            if value
        ]

        if not values:
            return

        create_query = f"""
        MATCH (r:Repository {{github_id: $github_id}})
        UNWIND $values AS value
        MERGE (n:{label} {{name: value}})
        MERGE (r)-[:{relationship}]->(n)
        """

        session.run(
            create_query,
            github_id=github_id,
            values=values,
        ).consume()
