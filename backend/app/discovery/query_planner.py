import re


class GitHubDiscoveryQueryPlanner:

    STOP_WORDS = {
        "a", "an", "the", "and", "or", "for", "to",
        "of", "with", "that", "this", "build", "create",
        "make", "need", "want", "platform", "application",
        "system", "project", "using", "software", "solution"
    }

    TECHNOLOGIES = {
        "python", "java", "javascript", "typescript",
        "react", "fastapi", "docker", "kubernetes",
        "redis", "postgresql", "neo4j", "grafana",
        "prometheus", "ai", "ml", "llm", "django",
        "flask", "spring", "next.js", "node.js",
        "langchain", "ollama"
    }

    def plan(self, query: str) -> dict:

        words = re.findall(
            r"[A-Za-z0-9+#.-]+",
            query.lower(),
        )

        keywords = list(dict.fromkeys([
            word
            for word in words
            if word not in self.STOP_WORDS
            and len(word) > 1
        ]))

        technologies = [
            word
            for word in keywords
            if word in self.TECHNOLOGIES
        ]

        capability_keywords = [
            word
            for word in keywords
            if word not in technologies
        ]

        queries = []

        if capability_keywords:
            queries.append(
                " ".join(capability_keywords[:5])
            )

        if technologies:
            queries.append(
                " ".join(technologies[:5])
            )

        if capability_keywords and technologies:
            queries.append(
                " ".join(
                    capability_keywords[:3]
                    + technologies[:3]
                )
            )

        if len(keywords) >= 3:
            queries.append(
                " ".join(keywords[:6])
            )

        queries = [
            query
            for query in dict.fromkeys(queries)
            if query.strip()
        ]

        return {
            "original_query": query,
            "keywords": keywords,
            "capabilities": capability_keywords,
            "technologies": technologies,
            "github_queries": queries,
            "query_count": len(queries),
        }
