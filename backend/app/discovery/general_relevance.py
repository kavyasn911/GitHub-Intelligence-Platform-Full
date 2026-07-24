import math
import re
from collections import Counter
from typing import Any

from backend.app.indexing.embedding_generator import EmbeddingGenerator


class GeneralRepositoryRelevanceEngine:

    STOPWORDS = {
        "a",
        "an",
        "and",
        "are",
        "as",
        "at",
        "be",
        "build",
        "by",
        "create",
        "for",
        "from",
        "i",
        "in",
        "is",
        "it",
        "me",
        "my",
        "need",
        "of",
        "on",
        "or",
        "project",
        "software",
        "system",
        "that",
        "the",
        "this",
        "to",
        "tool",
        "want",
        "with",
    }

    GENERIC_TERMS = {
        "application",
        "framework",
        "platform",
        "project",
        "service",
        "software",
        "solution",
        "system",
        "tool",
    }

    TECHNOLOGY_ALIASES = {
        "javascript": {
            "javascript",
            "js",
        },
        "typescript": {
            "typescript",
            "ts",
        },
        "python": {
            "python",
            "py",
        },
        "react": {
            "react",
            "reactjs",
            "react.js",
        },
        "vue": {
            "vue",
            "vuejs",
            "vue.js",
        },
        "angular": {
            "angular",
            "angularjs",
        },
        "fastapi": {
            "fastapi",
        },
        "django": {
            "django",
        },
        "flask": {
            "flask",
        },
        "nodejs": {
            "node",
            "nodejs",
            "node.js",
        },
        "docker": {
            "docker",
            "container",
            "containerized",
        },
        "kubernetes": {
            "kubernetes",
            "k8s",
        },
        "postgresql": {
            "postgres",
            "postgresql",
        },
        "mysql": {
            "mysql",
        },
        "mongodb": {
            "mongodb",
            "mongo",
        },
        "redis": {
            "redis",
        },
        "qdrant": {
            "qdrant",
        },
        "neo4j": {
            "neo4j",
        },
        "ollama": {
            "ollama",
        },
        "openai": {
            "openai",
            "chatgpt",
            "gpt",
        },
        "gemini": {
            "gemini",
        },
        "deepseek": {
            "deepseek",
        },
        "langchain": {
            "langchain",
        },
        "langgraph": {
            "langgraph",
        },
        "mcp": {
            "mcp",
            "model context protocol",
        },
        "rag": {
            "rag",
            "retrieval augmented generation",
        },
        "prometheus": {
            "prometheus",
        },
        "grafana": {
            "grafana",
        },
    }

    CAPABILITY_GROUPS = {
        "ai_agent": {
            "ai agent",
            "agent",
            "agents",
            "autonomous agent",
            "agent framework",
            "agent harness",
            "agent runtime",
        },
        "multi_agent": {
            "multi-agent",
            "multi agent",
            "agent orchestration",
        },
        "workflow": {
            "workflow",
            "workflow engine",
            "workflow automation",
        },
        "automation": {
            "automation",
            "automate",
        },
        "observability": {
            "observability",
            "monitoring",
            "telemetry",
        },
        "logging": {
            "logging",
            "logs",
            "log analysis",
        },
        "metrics": {
            "metrics",
            "metric collection",
        },
        "semantic_search": {
            "semantic search",
            "vector search",
        },
        "knowledge_base": {
            "knowledge base",
            "knowledge management",
        },
        "model_inference": {
            "model inference",
            "llm inference",
            "inference engine",
        },
        "multi_model": {
            "multi-model",
            "multi model",
            "multiple models",
        },
        "model_evaluation": {
            "model evaluation",
            "llm evaluation",
            "evaluate models",
        },
        "model_ranking": {
            "model ranking",
            "rank models",
            "compare models",
            "model comparison",
        },
        "api": {
            "api",
            "rest api",
            "graphql",
        },
        "dashboard": {
            "dashboard",
            "visualization",
            "analytics dashboard",
        },
        "authentication": {
            "authentication",
            "authorization",
            "oauth",
            "login",
        },
        "database": {
            "database",
            "data storage",
            "persistence",
        },
        "containerization": {
            "docker",
            "containerized",
            "containerization",
        },
        "orchestration": {
            "orchestration",
            "orchestrator",
        },
        "plugin_system": {
            "plugin",
            "plugins",
            "extension",
            "extensions",
        },
    }

    PURPOSE_HINTS = {
        "ai_agent_framework": {
            "ai agent",
            "agent framework",
            "agent harness",
            "agent runtime",
            "autonomous agent",
            "multi-agent",
            "multi agent",
        },
        "agent_extension": {
            "agent skill",
            "agent skills",
            "plugin",
            "extension",
            "addon",
        },
        "resource_collection": {
            "awesome list",
            "curated list",
            "templates",
            "resource collection",
        },
        "developer_tool": {
            "developer tool",
            "cli",
            "desktop app",
            "code editor",
            "configuration manager",
        },
        "llm_platform": {
            "llm platform",
            "model gateway",
            "multi-model",
            "multi model",
            "llm orchestration",
        },
        "observability_platform": {
            "observability",
            "monitoring platform",
            "telemetry platform",
        },
        "automation_platform": {
            "automation platform",
            "workflow engine",
            "integration platform",
        },
        "knowledge_platform": {
            "knowledge base",
            "semantic search",
            "vector search",
            "rag platform",
        },
    }

    NEGATIVE_ROLE_CONFLICTS = {
        "ai_agent_framework": {
            "agent_extension",
            "resource_collection",
        },
        "llm_platform": {
            "resource_collection",
        },
        "observability_platform": {
            "resource_collection",
            "agent_extension",
        },
        "automation_platform": {
            "resource_collection",
        },
        "knowledge_platform": {
            "resource_collection",
        },
    }

    def __init__(self):

        self.embedding_generator = EmbeddingGenerator()

    def evaluate(
        self,
        query: str,
        repository: dict,
        specification: dict | None = None,
        query_embedding: list[float] | None = None,
        repository_embedding: list[float] | None = None,
    ) -> dict:

        specification = specification or {}

        query_profile = self._build_query_profile(
            query=query,
            specification=specification,
        )

        repository_profile = self._build_repository_profile(
            repository
        )

        lexical_result = self._lexical_score(
            query_profile,
            repository_profile,
        )

        phrase_result = self._phrase_score(
            query_profile,
            repository_profile,
        )

        capability_result = self._capability_score(
            query_profile,
            repository_profile,
        )

        technology_result = self._technology_score(
            query_profile,
            repository_profile,
        )

        purpose_result = self._purpose_score(
            query_profile,
            repository_profile,
        )

        semantic_score = self._semantic_score(
            query_profile=query_profile,
            repository_profile=repository_profile,
            query_embedding=query_embedding,
            repository_embedding=repository_embedding,
        )

        specificity_result = self._specificity_score(
            query_profile,
            repository_profile,
        )

        conflict_result = self._conflict_score(
            query_profile,
            repository_profile,
        )

        evidence_score = self._evidence_score(
            lexical_score=lexical_result["score"],
            phrase_score=phrase_result["score"],
            capability_score=capability_result["score"],
            technology_score=technology_result["score"],
            purpose_score=purpose_result["score"],
            semantic_score=semantic_score,
        )

        raw_score = (
            semantic_score * 0.25
            + lexical_result["score"] * 0.15
            + phrase_result["score"] * 0.10
            + capability_result["score"] * 0.20
            + technology_result["score"] * 0.10
            + purpose_result["score"] * 0.15
            + specificity_result["score"] * 0.05
        )

        penalty = (
            conflict_result["penalty"]
            + specificity_result["generic_penalty"]
        )

        adjusted_score = self._clamp(
            raw_score - penalty
        )

        confidence = self._confidence_score(
            final_score=adjusted_score,
            evidence_score=evidence_score,
            query_profile=query_profile,
            repository_profile=repository_profile,
        )

        decision = self._decision(
            score=adjusted_score,
            confidence=confidence,
            conflict_penalty=conflict_result["penalty"],
        )

        return {
            "score": round(adjusted_score, 4),
            "confidence": round(confidence, 4),
            "decision": decision,
            "semantic_score": round(
                semantic_score,
                4,
            ),
            "lexical_score": round(
                lexical_result["score"],
                4,
            ),
            "phrase_score": round(
                phrase_result["score"],
                4,
            ),
            "capability_score": round(
                capability_result["score"],
                4,
            ),
            "technology_score": round(
                technology_result["score"],
                4,
            ),
            "purpose_score": round(
                purpose_result["score"],
                4,
            ),
            "specificity_score": round(
                specificity_result["score"],
                4,
            ),
            "conflict_penalty": round(
                conflict_result["penalty"],
                4,
            ),
            "generic_penalty": round(
                specificity_result["generic_penalty"],
                4,
            ),
            "evidence_score": round(
                evidence_score,
                4,
            ),
            "matched_terms":
                lexical_result["matched_terms"],
            "matched_phrases":
                phrase_result["matched_phrases"],
            "matched_capabilities":
                capability_result["matched"],
            "missing_capabilities":
                capability_result["missing"],
            "matched_technologies":
                technology_result["matched"],
            "missing_technologies":
                technology_result["missing"],
            "desired_purposes":
                purpose_result["desired"],
            "repository_purpose":
                purpose_result["repository_purpose"],
            "purpose_aligned":
                purpose_result["aligned"],
            "conflicts":
                conflict_result["conflicts"],
            "explanation": self._explanation(
                repository=repository,
                lexical_result=lexical_result,
                phrase_result=phrase_result,
                capability_result=capability_result,
                technology_result=technology_result,
                purpose_result=purpose_result,
                conflict_result=conflict_result,
                score=adjusted_score,
                confidence=confidence,
                decision=decision,
            ),
        }

    def _build_query_profile(
        self,
        query: str,
        specification: dict,
    ) -> dict:

        query_text = self._normalize(query)

        core_capabilities = self._as_list(
            specification.get(
                "core_capabilities"
            )
        )

        optional_capabilities = self._as_list(
            specification.get(
                "optional_capabilities"
            )
        )

        technologies = self._as_list(
            specification.get(
                "technologies"
            )
        )

        architecture_preferences = self._as_list(
            specification.get(
                "architecture_preferences"
            )
        )

        project_type = str(
            specification.get(
                "project_type"
            )
            or ""
        )

        combined_parts = [
            query,
            project_type,
            *core_capabilities,
            *optional_capabilities,
            *technologies,
            *architecture_preferences,
        ]

        combined_text = self._normalize(
            " ".join(
                str(part)
                for part in combined_parts
                if part
            )
        )

        tokens = self._important_tokens(
            combined_text
        )

        phrases = self._extract_phrases(
            combined_text
        )

        detected_capabilities = (
            self._detect_groups(
                combined_text,
                self.CAPABILITY_GROUPS,
            )
        )

        for capability in core_capabilities:

            normalized_capability = self._normalize(
                capability
            )

            if normalized_capability:
                detected_capabilities.add(
                    normalized_capability
                )

        detected_technologies = (
            self._detect_technologies(
                combined_text
            )
        )

        detected_purposes = self._detect_groups(
            combined_text,
            self.PURPOSE_HINTS,
        )

        return {
            "raw_query": query,
            "query_text": query_text,
            "combined_text": combined_text,
            "tokens": tokens,
            "phrases": phrases,
            "capabilities": detected_capabilities,
            "technologies": detected_technologies,
            "purposes": detected_purposes,
            "core_capabilities": {
                self._normalize(item)
                for item in core_capabilities
                if self._normalize(item)
            },
        }

    def _build_repository_profile(
        self,
        repository: dict,
    ) -> dict:

        analysis = repository.get(
            "analysis"
        ) or {}

        architecture = repository.get(
            "architecture_intelligence"
        ) or {}

        repository_purpose = repository.get(
            "repository_purpose"
        ) or {}

        health = repository.get(
            "repository_health"
        ) or {}

        high_signal_parts = [
            repository.get("name"),
            repository.get("full_name"),
            repository.get("description"),
            " ".join(
                self._as_list(
                    repository.get("topics")
                )
            ),
        ]

        medium_signal_parts = [
            analysis.get("summary"),
            " ".join(
                self._as_list(
                    analysis.get("technologies")
                )
            ),
            " ".join(
                self._as_list(
                    architecture.get("frameworks")
                )
            ),
            " ".join(
                self._as_list(
                    architecture.get("architectures")
                )
            ),
        ]

        high_signal_text = self._normalize(
            " ".join(
                str(part)
                for part in high_signal_parts
                if part
            )
        )

        medium_signal_text = self._normalize(
            " ".join(
                str(part)
                for part in medium_signal_parts
                if part
            )
        )

        combined_text = self._normalize(
            high_signal_text
            + " "
            + medium_signal_text
        )

        tokens = self._important_tokens(
            combined_text
        )

        phrases = self._extract_phrases(
            combined_text
        )

        capabilities = self._detect_groups(
            combined_text,
            self.CAPABILITY_GROUPS,
        )

        technologies = self._detect_technologies(
            combined_text
        )

        return {
            "high_signal_text": high_signal_text,
            "medium_signal_text": medium_signal_text,
            "combined_text": combined_text,
            "tokens": tokens,
            "phrases": phrases,
            "capabilities": capabilities,
            "technologies": technologies,
            "primary_purpose":
                repository_purpose.get(
                    "primary_purpose",
                    "unknown",
                ),
            "purpose_data": repository_purpose,
            "health": health,
        }

    def _lexical_score(
        self,
        query_profile: dict,
        repository_profile: dict,
    ) -> dict:

        query_tokens = query_profile["tokens"]

        repository_tokens = (
            repository_profile["tokens"]
        )

        if not query_tokens:
            return {
                "score": 0.0,
                "matched_terms": [],
            }

        matched = (
            query_tokens
            & repository_tokens
        )

        weighted_match = 0.0
        total_weight = 0.0

        high_signal_tokens = self._important_tokens(
            repository_profile[
                "high_signal_text"
            ]
        )

        for token in query_tokens:

            weight = self._token_weight(token)

            total_weight += weight

            if token in repository_tokens:

                if token in high_signal_tokens:
                    weighted_match += (
                        weight * 1.25
                    )
                else:
                    weighted_match += weight

        score = (
            weighted_match
            / max(total_weight, 1.0)
        )

        return {
            "score": self._clamp(score),
            "matched_terms": sorted(matched),
        }

    def _phrase_score(
        self,
        query_profile: dict,
        repository_profile: dict,
    ) -> dict:

        query_phrases = query_profile["phrases"]

        if not query_phrases:
            return {
                "score": 0.0,
                "matched_phrases": [],
            }

        repository_text = (
            repository_profile["combined_text"]
        )

        matched = [
            phrase
            for phrase in query_phrases
            if self._contains_phrase(
                repository_text,
                phrase,
            )
        ]

        score = (
            len(matched)
            / max(len(query_phrases), 1)
        )

        return {
            "score": self._clamp(score),
            "matched_phrases": sorted(matched),
        }

    def _capability_score(
        self,
        query_profile: dict,
        repository_profile: dict,
    ) -> dict:

        required = set(
            query_profile["capabilities"]
        )

        repository_capabilities = set(
            repository_profile["capabilities"]
        )

        if not required:
            return {
                "score": 0.5,
                "matched": [],
                "missing": [],
            }

        matched = (
            required
            & repository_capabilities
        )

        missing = (
            required
            - repository_capabilities
        )

        score = (
            len(matched)
            / max(len(required), 1)
        )

        return {
            "score": self._clamp(score),
            "matched": sorted(matched),
            "missing": sorted(missing),
        }

    def _technology_score(
        self,
        query_profile: dict,
        repository_profile: dict,
    ) -> dict:

        required = set(
            query_profile["technologies"]
        )

        repository_technologies = set(
            repository_profile["technologies"]
        )

        if not required:
            return {
                "score": 0.5,
                "matched": [],
                "missing": [],
            }

        matched = (
            required
            & repository_technologies
        )

        missing = (
            required
            - repository_technologies
        )

        score = (
            len(matched)
            / max(len(required), 1)
        )

        return {
            "score": self._clamp(score),
            "matched": sorted(matched),
            "missing": sorted(missing),
        }

    def _purpose_score(
        self,
        query_profile: dict,
        repository_profile: dict,
    ) -> dict:

        desired = set(
            query_profile["purposes"]
        )

        repository_purpose = (
            repository_profile[
                "primary_purpose"
            ]
        )

        if not desired:

            return {
                "score": 0.5,
                "desired": [],
                "repository_purpose":
                    repository_purpose,
                "aligned": None,
            }

        aligned = (
            repository_purpose in desired
        )

        if aligned:
            score = 1.0
        elif repository_purpose == "unknown":
            score = 0.25
        else:
            score = 0.0

        return {
            "score": score,
            "desired": sorted(desired),
            "repository_purpose":
                repository_purpose,
            "aligned": aligned,
        }

    def _semantic_score(
        self,
        query_profile: dict,
        repository_profile: dict,
        query_embedding,
        repository_embedding,
    ) -> float:

        try:

            if query_embedding is None:

                query_embedding = (
                    self.embedding_generator
                    .generate(
                        query_profile[
                            "combined_text"
                        ]
                    )
                )

            if repository_embedding is None:

                repository_embedding = (
                    self.embedding_generator
                    .generate(
                        repository_profile[
                            "combined_text"
                        ]
                    )
                )

            return self._clamp(
                self._cosine_similarity(
                    query_embedding,
                    repository_embedding,
                )
            )

        except Exception:

            return 0.0

    def _specificity_score(
        self,
        query_profile: dict,
        repository_profile: dict,
    ) -> dict:

        query_tokens = query_profile["tokens"]

        repository_tokens = (
            repository_profile["tokens"]
        )

        specific_query_tokens = {
            token
            for token in query_tokens
            if token not in self.GENERIC_TERMS
        }

        if not specific_query_tokens:

            return {
                "score": 0.5,
                "generic_penalty": 0.0,
            }

        matched_specific = (
            specific_query_tokens
            & repository_tokens
        )

        score = (
            len(matched_specific)
            / max(
                len(specific_query_tokens),
                1,
            )
        )

        generic_penalty = 0.0

        if (
            score < 0.15
            and len(specific_query_tokens) >= 2
        ):
            generic_penalty = 0.10

        elif score < 0.30:
            generic_penalty = 0.05

        return {
            "score": self._clamp(score),
            "generic_penalty":
                generic_penalty,
        }

    def _conflict_score(
        self,
        query_profile: dict,
        repository_profile: dict,
    ) -> dict:

        desired_purposes = set(
            query_profile["purposes"]
        )

        repository_purpose = (
            repository_profile[
                "primary_purpose"
            ]
        )

        conflicts = []

        for desired in desired_purposes:

            conflicting_roles = (
                self.NEGATIVE_ROLE_CONFLICTS.get(
                    desired,
                    set(),
                )
            )

            if (
                repository_purpose
                in conflicting_roles
            ):

                conflicts.append(
                    (
                        f"{repository_purpose} "
                        f"conflicts with {desired}"
                    )
                )

        penalty = min(
            len(conflicts) * 0.15,
            0.30,
        )

        return {
            "penalty": penalty,
            "conflicts": conflicts,
        }

    def _evidence_score(
        self,
        lexical_score: float,
        phrase_score: float,
        capability_score: float,
        technology_score: float,
        purpose_score: float,
        semantic_score: float,
    ) -> float:

        active_signals = [
            lexical_score,
            phrase_score,
            capability_score,
            technology_score,
            purpose_score,
            semantic_score,
        ]

        strong_signals = sum(
            1
            for signal in active_signals
            if signal >= 0.60
        )

        medium_signals = sum(
            1
            for signal in active_signals
            if signal >= 0.35
        )

        return self._clamp(
            strong_signals * 0.12
            + medium_signals * 0.06
        )

    def _confidence_score(
        self,
        final_score: float,
        evidence_score: float,
        query_profile: dict,
        repository_profile: dict,
    ) -> float:

        query_complexity = min(
            (
                len(query_profile["tokens"])
                + len(
                    query_profile[
                        "capabilities"
                    ]
                ) * 2
                + len(
                    query_profile[
                        "technologies"
                    ]
                ) * 2
            )
            / 20.0,
            1.0,
        )

        repository_information = min(
            len(
                repository_profile[
                    "combined_text"
                ]
            )
            / 1000.0,
            1.0,
        )

        return self._clamp(
            final_score * 0.45
            + evidence_score * 0.30
            + query_complexity * 0.10
            + repository_information * 0.15
        )

    def _decision(
        self,
        score: float,
        confidence: float,
        conflict_penalty: float,
    ) -> str:

        if (
            score >= 0.72
            and confidence >= 0.55
            and conflict_penalty == 0
        ):
            return "strong_match"

        if score >= 0.55:
            return "good_match"

        if score >= 0.40:
            return "possible_match"

        return "weak_match"

    def _explanation(
        self,
        repository: dict,
        lexical_result: dict,
        phrase_result: dict,
        capability_result: dict,
        technology_result: dict,
        purpose_result: dict,
        conflict_result: dict,
        score: float,
        confidence: float,
        decision: str,
    ) -> dict:

        strengths = []
        weaknesses = []

        if lexical_result["matched_terms"]:
            strengths.append(
                "Matches important query terms: "
                + ", ".join(
                    lexical_result[
                        "matched_terms"
                    ][:8]
                )
            )

        if phrase_result["matched_phrases"]:
            strengths.append(
                "Matches query phrases: "
                + ", ".join(
                    phrase_result[
                        "matched_phrases"
                    ][:5]
                )
            )

        if capability_result["matched"]:
            strengths.append(
                "Supports requested capabilities: "
                + ", ".join(
                    capability_result[
                        "matched"
                    ]
                )
            )

        if technology_result["matched"]:
            strengths.append(
                "Matches requested technologies: "
                + ", ".join(
                    technology_result[
                        "matched"
                    ]
                )
            )

        if purpose_result["aligned"] is True:
            strengths.append(
                "Repository purpose matches the requested project type."
            )

        if capability_result["missing"]:
            weaknesses.append(
                "Missing capability evidence: "
                + ", ".join(
                    capability_result[
                        "missing"
                    ]
                )
            )

        if technology_result["missing"]:
            weaknesses.append(
                "Missing technology evidence: "
                + ", ".join(
                    technology_result[
                        "missing"
                    ]
                )
            )

        weaknesses.extend(
            conflict_result["conflicts"]
        )

        return {
            "repository":
                repository.get("full_name"),
            "decision": decision,
            "score": round(score, 4),
            "confidence": round(
                confidence,
                4,
            ),
            "strengths": strengths,
            "weaknesses": weaknesses,
        }

    def _detect_groups(
        self,
        text: str,
        groups: dict,
    ) -> set[str]:

        detected = set()

        for group, phrases in groups.items():

            for phrase in phrases:

                if self._contains_phrase(
                    text,
                    self._normalize(phrase),
                ):

                    detected.add(group)
                    break

        return detected

    def _detect_technologies(
        self,
        text: str,
    ) -> set[str]:

        detected = set()

        for technology, aliases in (
            self.TECHNOLOGY_ALIASES.items()
        ):

            for alias in aliases:

                if self._contains_phrase(
                    text,
                    self._normalize(alias),
                ):

                    detected.add(technology)
                    break

        return detected

    def _important_tokens(
        self,
        text: str,
    ) -> set[str]:

        tokens = re.findall(
            r"[a-z0-9+#.-]+",
            self._normalize(text),
        )

        return {
            token
            for token in tokens
            if (
                len(token) >= 2
                and token
                not in self.STOPWORDS
            )
        }

    def _extract_phrases(
        self,
        text: str,
    ) -> set[str]:

        tokens = [
            token
            for token in re.findall(
                r"[a-z0-9+#.-]+",
                self._normalize(text),
            )
            if (
                len(token) >= 2
                and token
                not in self.STOPWORDS
            )
        ]

        phrases = set()

        for size in (2, 3):

            for index in range(
                len(tokens) - size + 1
            ):

                phrase = " ".join(
                    tokens[
                        index:index + size
                    ]
                )

                phrases.add(phrase)

        return phrases

    def _token_weight(
        self,
        token: str,
    ) -> float:

        if token in self.GENERIC_TERMS:
            return 0.25

        if len(token) >= 10:
            return 1.5

        if len(token) >= 6:
            return 1.25

        return 1.0

    def _contains_phrase(
        self,
        text: str,
        phrase: str,
    ) -> bool:

        if not phrase:
            return False

        pattern = (
            r"(?<![a-z0-9])"
            + re.escape(phrase)
            + r"(?![a-z0-9])"
        )

        return bool(
            re.search(pattern, text)
        )

    def _cosine_similarity(
        self,
        vector_a,
        vector_b,
    ) -> float:

        if not vector_a or not vector_b:
            return 0.0

        if len(vector_a) != len(vector_b):
            return 0.0

        dot_product = sum(
            a * b
            for a, b in zip(
                vector_a,
                vector_b,
            )
        )

        norm_a = math.sqrt(
            sum(
                value * value
                for value in vector_a
            )
        )

        norm_b = math.sqrt(
            sum(
                value * value
                for value in vector_b
            )
        )

        if norm_a == 0 or norm_b == 0:
            return 0.0

        return (
            dot_product
            / (norm_a * norm_b)
        )

    def _normalize(
        self,
        text: Any,
    ) -> str:

        text = str(text or "").lower()

        text = re.sub(
            r"[^a-z0-9+#.-]+",
            " ",
            text,
        )

        return re.sub(
            r"\s+",
            " ",
            text,
        ).strip()

    def _as_list(
        self,
        value,
    ) -> list:

        if value is None:
            return []

        if isinstance(value, list):
            return value

        if isinstance(value, tuple):
            return list(value)

        if isinstance(value, set):
            return list(value)

        return [str(value)]

    def _clamp(
        self,
        value: float,
    ) -> float:

        return max(
            0.0,
            min(float(value), 1.0),
        )
