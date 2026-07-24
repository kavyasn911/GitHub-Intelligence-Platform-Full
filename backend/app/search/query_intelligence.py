import re


class QueryIntelligenceEngine:

    LANGUAGE_MAP = {
        "python": "Python",
        "java": "Java",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
    }

    COMPLEXITIES = {
        "beginner": "Beginner",
        "intermediate": "Intermediate",
        "advanced": "Advanced",
    }

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

    ARCHITECTURES = [
        "Microservices",
        "Cloud Native",
        "Full Stack",
        "Layered Backend",
    ]

    def parse(self, query: str):

        original_query = query.strip()
        lower_query = original_query.lower()

        filters = {}

        for keyword, language in self.LANGUAGE_MAP.items():
            if re.search(
                rf"\b{re.escape(keyword)}\b",
                lower_query,
            ):
                filters["language"] = language
                break

        for keyword, complexity in self.COMPLEXITIES.items():
            if re.search(
                rf"\b{re.escape(keyword)}\b",
                lower_query,
            ):
                filters["complexity"] = complexity
                break

        technologies = []

        for technology in self.TECHNOLOGIES:
            if technology.lower() in lower_query:
                technologies.append(technology)

        if technologies:
            filters["technologies"] = sorted(
                set(technologies)
            )

        for architecture in self.ARCHITECTURES:
            if architecture.lower() in lower_query:
                filters["architecture"] = architecture
                break

        minimum_score = self._extract_minimum_score(
            lower_query
        )

        if minimum_score is not None:
            filters["minimum_score"] = minimum_score

        intent = self._detect_intent(
            lower_query
        )

        return {
            "original_query": original_query,
            "semantic_query": original_query,
            "intent": intent,
            "filters": filters,
        }

    def _detect_intent(self, query):

        if any(
            signal in query
            for signal in [
                "similar",
                "like this",
                "related repositories",
            ]
        ):
            return "recommendation"

        if any(
            signal in query
            for signal in [
                "best",
                "highest score",
                "top repositories",
            ]
        ):
            return "ranking"

        if any(
            signal in query
            for signal in [
                "find",
                "search",
                "show",
                "repositories",
                "projects",
            ]
        ):
            return "repository_search"

        return "semantic_search"

    def _extract_minimum_score(self, query):

        patterns = [
            r"score\s*(?:above|over|greater than)\s*(\d+)",
            r"minimum score\s*(\d+)",
            r"score\s*>=?\s*(\d+)",
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                query,
            )

            if match:
                return float(match.group(1))

        return None
