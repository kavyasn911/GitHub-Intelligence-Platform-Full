import re

TECHNOLOGIES = [
    "FastAPI",
    "React",
    "Vite",
    "Docker",
    "Docker Compose",
    "PostgreSQL",
    "Redis",
    "Neo4j",
    "ChromaDB",
    "SQLAlchemy",
    "TypeScript",
    "Python",
    "Java",
    "Node.js",
    "Spring Boot",
    "Kubernetes",
    "TensorFlow",
    "PyTorch",
    "LangChain",
    "Ollama",
]


class RepositoryAnalyzer:

    def analyze(self, readme: str):

        technologies = []

        if not readme:
            return {
                "technologies": [],
                "summary": "README not found"
            }

        for tech in TECHNOLOGIES:

            if re.search(re.escape(tech), readme, re.IGNORECASE):
                technologies.append(tech)

        return {
            "technologies": sorted(list(set(technologies))),
            "summary": readme[:500]
        }
