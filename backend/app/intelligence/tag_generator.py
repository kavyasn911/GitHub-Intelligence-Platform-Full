class RepositoryTagGenerator:

    TAG_RULES = {
        "Artificial Intelligence": [
            "ai", "machine learning", "tensorflow",
            "pytorch", "langchain", "ollama", "llm",
        ],
        "Backend": [
            "fastapi", "django", "flask",
            "spring boot", "sqlalchemy",
        ],
        "Frontend": [
            "react", "vite", "typescript",
        ],
        "Infrastructure": [
            "docker", "docker compose",
            "kubernetes", "terraform",
        ],
        "Database": [
            "postgresql", "redis",
            "neo4j", "chromadb",
        ],
        "Data Science": [
            "numpy", "pandas",
            "scikit", "tensorflow",
        ],
        "Cloud Native": [
            "kubernetes", "docker",
            "microservices",
        ],
        "REST API": [
            "fastapi", "flask",
            "django", "spring boot",
        ],
    }

    def generate(self, repository: dict):

        analysis = repository.get("analysis") or {}
        intelligence = repository.get("intelligence") or {}

        technologies = analysis.get("technologies") or []
        readme = repository.get("readme") or ""
        description = repository.get("description") or ""

        architecture_data = intelligence.get("architecture") or {}
        architecture = architecture_data.get("architecture") or ""

        searchable_text = " ".join([
            repository.get("name") or "",
            description,
            readme,
            " ".join(technologies),
            architecture,
        ]).lower()

        tags = set()

        for tag, keywords in self.TAG_RULES.items():

            if any(
                keyword.lower() in searchable_text
                for keyword in keywords
            ):
                tags.add(tag)

        for technology in technologies:
            tags.add(technology)

        return sorted(tags)
