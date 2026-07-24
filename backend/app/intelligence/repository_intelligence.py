import re


class RepositoryIntelligence:

    CATEGORY_RULES = {
        "Artificial Intelligence": [
            "tensorflow",
            "pytorch",
            "langchain",
            "ollama",
            "llm",
            "ai",
            "machine learning",
        ],
        "Web Development": [
            "react",
            "fastapi",
            "django",
            "flask",
            "spring",
            "node",
            "express",
        ],
        "Infrastructure": [
            "docker",
            "kubernetes",
            "redis",
            "postgresql",
            "neo4j",
            "terraform",
        ],
        "Mobile": [
            "android",
            "kotlin",
            "flutter",
            "swift",
        ],
        "Data Science": [
            "numpy",
            "pandas",
            "scikit",
            "matplotlib",
        ],
    }

    SKILL_KEYWORDS = [
        "Python",
        "Java",
        "FastAPI",
        "React",
        "Docker",
        "Redis",
        "PostgreSQL",
        "Neo4j",
        "TensorFlow",
        "PyTorch",
        "LangChain",
        "SQLAlchemy",
        "TypeScript",
        "Vite",
        "Kubernetes",
        "Node.js",
    ]

    def analyze(self, repository):

        summary = repository.get("analysis", {}).get(
            "summary",
            ""
        )

        technologies = repository.get(
            "analysis",
            {}
        ).get(
            "technologies",
            []
        )

        text = (
            summary +
            " " +
            " ".join(technologies)
        ).lower()

        category = self.detect_category(text)

        complexity = self.detect_complexity(
            technologies
        )

        quality = self.quality_score(
            repository
        )

        skills = self.extract_skills(
            technologies,
            summary,
        )

        return {
            "category": category,
            "complexity": complexity,
            "quality_score": quality,
            "skills": skills,
        }

    def detect_category(self, text):

        best = "General"

        highest = 0

        for category, words in self.CATEGORY_RULES.items():

            score = 0

            for word in words:

                if word.lower() in text:
                    score += 1

            if score > highest:
                highest = score
                best = category

        return best

    def detect_complexity(
        self,
        technologies,
    ):

        count = len(technologies)

        if count < 4:
            return "Beginner"

        if count < 8:
            return "Intermediate"

        return "Advanced"

    def quality_score(
        self,
        repository,
    ):

        score = 5.0

        if repository.get("readme"):
            score += 1

        if repository.get("description"):
            score += 1

        score += min(
            len(
                repository.get(
                    "analysis",
                    {}
                ).get(
                    "technologies",
                    []
                )
            ) * 0.25,
            3
        )

        return round(
            min(score, 10),
            1,
        )

    def extract_skills(
        self,
        technologies,
        summary,
    ):

        found = set()

        text = (
            summary +
            " " +
            " ".join(
                technologies
            )
        )

        for skill in self.SKILL_KEYWORDS:

            if re.search(
                re.escape(skill),
                text,
                re.IGNORECASE,
            ):
                found.add(skill)

        return sorted(found)
