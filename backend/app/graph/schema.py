from backend.app.core.neo4j import neo4j_connection


class GraphSchemaService:

    CONSTRAINTS = [
        """
        CREATE CONSTRAINT repository_github_id IF NOT EXISTS
        FOR (r:Repository)
        REQUIRE r.github_id IS UNIQUE
        """,
        """
        CREATE CONSTRAINT technology_name IF NOT EXISTS
        FOR (t:Technology)
        REQUIRE t.name IS UNIQUE
        """,
        """
        CREATE CONSTRAINT skill_name IF NOT EXISTS
        FOR (s:Skill)
        REQUIRE s.name IS UNIQUE
        """,
        """
        CREATE CONSTRAINT tag_name IF NOT EXISTS
        FOR (t:Tag)
        REQUIRE t.name IS UNIQUE
        """,
        """
        CREATE CONSTRAINT category_name IF NOT EXISTS
        FOR (c:Category)
        REQUIRE c.name IS UNIQUE
        """,
        """
        CREATE CONSTRAINT architecture_name IF NOT EXISTS
        FOR (a:Architecture)
        REQUIRE a.name IS UNIQUE
        """,
        """
        CREATE CONSTRAINT complexity_name IF NOT EXISTS
        FOR (c:Complexity)
        REQUIRE c.name IS UNIQUE
        """,
    ]

    def initialize(self):

        with neo4j_connection.driver.session() as session:

            for constraint in self.CONSTRAINTS:
                session.run(constraint).consume()

        return {
            "status": "ready",
            "constraints": len(self.CONSTRAINTS),
        }
