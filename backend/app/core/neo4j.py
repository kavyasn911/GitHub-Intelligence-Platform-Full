import os

from neo4j import GraphDatabase


class Neo4jConnection:

    def __init__(
        self,
        uri: str | None = None,
        username: str | None = None,
        password: str | None = None,
    ):

        self.uri = (
            uri
            or os.getenv(
                "NEO4J_URI",
                "bolt://localhost:7687", 
            )
        )

        self.username = (
            username
            or os.getenv(
                "NEO4J_USERNAME",
                "neo4j",
            )
        )

        self.password = (
            password
            or os.getenv(
                "NEO4J_PASSWORD",
                "githubintelligence123",
            )
        )

        self.driver = GraphDatabase.driver(
            self.uri,
            auth=(
                self.username,
                self.password,
            ),
        )

    def verify(self):
        self.driver.verify_connectivity()
        return True

    def close(self):
        self.driver.close()


neo4j_connection = Neo4jConnection()
