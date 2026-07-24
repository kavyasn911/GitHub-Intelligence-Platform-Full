import re


class RepositoryRelevanceFilter:

    STOP_WORDS = {
        "a", "an", "the", "and", "or", "for", "to",
        "of", "with", "using", "build", "create", "make",
        "need", "want", "platform", "application", "system",
        "project", "solution", "software", "tool", "i", "me",
        "my"
    }

    GENERIC_TERMS = {
        "page", "app", "website", "service", "api",
        "frontend", "backend", "web"
    }

    CONCEPT_EXPANSIONS = {
        "login": {
            "login", "authentication", "auth", "signin",
            "sign-in", "oauth", "jwt", "session",
            "identity", "credential", "credentials",
            "password", "user"
        },
        "secure": {
            "secure", "security", "authentication",
            "authorization", "oauth", "jwt", "mfa",
            "2fa", "password", "hashing", "session",
            "identity"
        },
        "monitor": {
            "monitor", "monitoring", "observability",
            "metrics", "telemetry", "prometheus", "grafana"
        },
        "monitoring": {
            "monitor", "monitoring", "observability",
            "metrics", "telemetry", "prometheus", "grafana"
        },
        "anomaly": {
            "anomaly", "anomalies", "outlier",
            "detection", "forecasting"
        },
        "infrastructure": {
            "infrastructure", "cloud", "devops",
            "kubernetes", "docker", "server", "cluster"
        },
        "ai": {
            "ai", "artificial", "intelligence",
            "machine", "learning", "ml", "llm"
        },
        "llm": {
            "llm", "language", "model", "models",
            "chatgpt", "openai", "gemini", "deepseek",
            "claude", "inference"
        },
        "evaluation": {
            "evaluation", "evaluate", "evaluating",
            "benchmark", "benchmarking", "metrics",
            "scoring", "judge", "comparison", "ranking"
        },
        "compare": {
            "compare", "comparison", "benchmark",
            "evaluation", "ranking", "scoring"
        },
        "model": {
            "model", "models", "llm", "inference",
            "chatgpt", "gemini", "deepseek", "claude"
        },
    }

    def filter(
        self,
        query: str,
        repositories: list,
        minimum_overlap: int = 2,
    ) -> dict:

        query_terms = self._terms(query)

        important_terms = {
            term
            for term in query_terms
            if term not in self.GENERIC_TERMS
        }

        expanded_concepts = self._expand(important_terms)

        accepted = []
        rejected = []

        for repository in repositories:

            repository_terms = self._repository_terms(repository)

            direct_matches = sorted(
                important_terms.intersection(repository_terms)
            )

            concept_matches = sorted(
                expanded_concepts.intersection(repository_terms)
            )

            generic_matches = sorted(
                query_terms
                .intersection(self.GENERIC_TERMS)
                .intersection(repository_terms)
            )

            direct_score = len(direct_matches) * 3.0
            concept_score = len(concept_matches) * 1.0
            generic_score = len(generic_matches) * 0.25

            relevance_score = round(
                direct_score + concept_score + generic_score,
                2,
            )

            semantic_context_available = bool(
                repository.get("description")
                or repository.get("topics")
                or repository.get("readme_available")
            )

            match_evidence = (
                len(direct_matches)
                + len(concept_matches)
            )

            strong_direct_match = len(direct_matches) >= 1
            broad_concept_match = len(concept_matches) >= 1
            strong_relevance = relevance_score >= 1.0

            accepted_repository = (
                semantic_context_available
                and not repository.get("archived", False)
                and (
                    strong_direct_match
                    or broad_concept_match
                    or strong_relevance
                )
            )

            enriched = {
                **repository,
                "relevance_gate": {
                    "accepted": accepted_repository,
                    "query_terms": sorted(query_terms),
                    "important_terms": sorted(important_terms),
                    "direct_matches": direct_matches,
                    "concept_matches": concept_matches,
                    "generic_matches": generic_matches,
                    "relevance_score": relevance_score,
                },
            }

            if accepted_repository:
                accepted.append(enriched)
            else:
                rejected.append(enriched)

        accepted.sort(
            key=lambda item: item.get(
                "relevance_gate", {}
            ).get("relevance_score", 0),
            reverse=True,
        )

        return {
            "accepted": accepted,
            "rejected": rejected,
            "accepted_count": len(accepted),
            "rejected_count": len(rejected),
        }

    def _expand(self, terms: set):

        expanded = set()

        for term in terms:
            expanded.add(term)
            expanded.update(
                self.CONCEPT_EXPANSIONS.get(term, set())
            )

        return expanded

    def _repository_terms(self, repository: dict):

        analysis = repository.get("analysis", {})
        architecture = repository.get(
            "architecture_intelligence", {}
        )

        text = " ".join([
            repository.get("name") or "",
            repository.get("full_name") or "",
            repository.get("description") or "",
            repository.get("language") or "",
            " ".join(repository.get("topics") or []),
            analysis.get("summary") or "",
            " ".join(analysis.get("technologies") or []),
            " ".join(architecture.get("frameworks") or []),
            " ".join(architecture.get("architectures") or []),
        ])

        return self._terms(text)

    def _terms(self, text: str):

        words = re.findall(
            r"[A-Za-z0-9+#.-]+",
            str(text).lower(),
        )

        return {
            word
            for word in words
            if word not in self.STOP_WORDS
            and len(word) > 1
        }

