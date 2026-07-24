class RepositoryArchitectureIntelligence:

    def analyze(self, repository: dict) -> dict:

        analysis = repository.get(
            "analysis",
            {},
        )

        technologies = set(
            analysis.get(
                "technologies",
                [],
            )
        )

        frameworks = []

        known_frameworks = {
            "FastAPI",
            "React",
            "Vite",
            "Next.js",
            "Django",
            "Flask",
            "Spring",
            "Node.js",
            "LangChain",
            "SQLAlchemy",
        }

        for technology in technologies:

            if technology in known_frameworks:
                frameworks.append(technology)

        architectures = []

        if (
            "Docker Compose" in technologies
            or "Kubernetes" in technologies
        ):
            architectures.append(
                "Containerized Distributed Architecture"
            )

        if (
            "FastAPI" in technologies
            and "React" in technologies
        ):
            architectures.append(
                "Full Stack API Architecture"
            )

        if (
            "LangChain" in technologies
            or "Ollama" in technologies
        ):
            architectures.append(
                "AI Application Architecture"
            )

        if (
            "PostgreSQL" in technologies
            or "Redis" in technologies
            or "Neo4j" in technologies
        ):
            architectures.append(
                "Data-Driven Service Architecture"
            )

        if not architectures:
            architectures.append(
                "Architecture Not Determined"
            )

        return {
            "frameworks": sorted(frameworks),
            "architectures": architectures,
            "technology_count": len(
                technologies
            ),
            "technologies": sorted(
                technologies
            ),
        }
