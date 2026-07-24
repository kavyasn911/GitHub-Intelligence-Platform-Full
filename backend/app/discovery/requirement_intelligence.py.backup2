import json
import re

from backend.app.llm.ollama_provider import OllamaProvider


class RequirementIntelligenceService:

    SYSTEM_PROMPT = """
You are an enterprise software requirement intelligence engine.

Convert any user request into a precise structured specification for
GitHub repository discovery.

Return ONLY valid JSON:

{
  "project_type": "specific project category",
  "summary": "concise normalized software requirement",
  "core_capabilities": ["specific functional capability"],
  "optional_capabilities": ["closely related optional capability"],
  "technologies": ["explicitly requested technology"],
  "architecture_preferences": ["explicitly requested architecture"],
  "search_concepts": ["precise GitHub search phrase"]
}

RULES:

1. Understand complete semantic intent.
2. Never extract isolated words as capabilities.
3. Preserve multi-word technologies and concepts.
4. Core capabilities must describe actual functionality.
5. Technologies must only contain explicitly requested technologies.
6. Search concepts must be concise GitHub search queries.
7. Generate 2 to 5 distinct search concepts.
8. Correct obvious spelling mistakes.
9. Reduce paragraphs to essential engineering requirements.
10. Return JSON only.
"""

    TECHNOLOGY_PATTERNS = {
        "power bi": "Power BI",
        "powerbi": "Power BI",
        "node.js": "Node.js",
        "nodejs": "Node.js",
        "next.js": "Next.js",
        "nextjs": "Next.js",
        "spring boot": "Spring Boot",
        "github actions": "GitHub Actions",
        "machine learning": "Machine Learning",
        "artificial intelligence": "Artificial Intelligence",
        "python": "Python",
        "java": "Java",
        "javascript": "JavaScript",
        "typescript": "TypeScript",
        "react": "React",
        "fastapi": "FastAPI",
        "docker": "Docker",
        "kubernetes": "Kubernetes",
        "redis": "Redis",
        "postgresql": "PostgreSQL",
        "postgres": "PostgreSQL",
        "neo4j": "Neo4j",
        "grafana": "Grafana",
        "prometheus": "Prometheus",
        "django": "Django",
        "flask": "Flask",
        "vite": "Vite",
        "ollama": "Ollama",
        "langchain": "LangChain",
    }

    CAPABILITY_PATTERNS = {
        "sales": "sales analytics",
        "revenue": "revenue trend analysis",
        "regional performance": "regional performance analysis",
        "kpi": "KPI visualization",
        "kpis": "KPI visualization",
        "filter": "interactive report filtering",
        "multiple sources": "multi-source data integration",
        "data sources": "multi-source data integration",

        "login": "user authentication",
        "authentication": "user authentication",
        "secure": "secure authentication",
        "signup": "user registration",
        "sign up": "user registration",
        "password reset": "password recovery",
        "forgot password": "password recovery",
        "email verification": "email verification",
        "role based": "role-based access control",
        "rbac": "role-based access control",

        "monitor": "system monitoring",
        "monitoring": "system monitoring",
        "metrics": "metrics collection",
        "logs": "log analysis",
        "alert": "alert management",
        "alerts": "alert management",
        "anomaly": "anomaly detection",

        "recommend": "recommendation engine",
        "recommendation": "recommendation engine",
        "similar projects": "similarity search",
        "duplicate": "duplicate detection",
        "semantic search": "semantic search",

        "chatbot": "conversational AI",
        "question answering": "question answering",
        "rag": "retrieval augmented generation",

        "upload": "file upload",
        "search": "search functionality",
        "dashboard": "interactive dashboard",
        "visualization": "data visualization",
        "analytics": "data analytics",
        "report": "report generation",
        "reports": "report generation",
    }

    PROJECT_PATTERNS = [
        (
            ["power bi", "dashboard"],
            "Business Intelligence Dashboard",
        ),
        (
            ["sales", "dashboard"],
            "Sales Analytics Dashboard",
        ),
        (
            ["login"],
            "Authentication System",
        ),
        (
            ["authentication"],
            "Authentication System",
        ),
        (
            ["monitor"],
            "Monitoring System",
        ),
        (
            ["observability"],
            "Observability Platform",
        ),
        (
            ["recommendation"],
            "Recommendation System",
        ),
        (
            ["ecommerce"],
            "E-Commerce Application",
        ),
        (
            ["e-commerce"],
            "E-Commerce Application",
        ),
        (
            ["chatbot"],
            "AI Chatbot",
        ),
        (
            ["dashboard"],
            "Analytics Dashboard",
        ),
        (
            ["api"],
            "API Service",
        ),
        (
            ["automation"],
            "Automation Platform",
        ),
    ]

    GENERIC_TERMS = {
        "i", "me", "my", "we", "our",
        "need", "want", "would", "like",
        "build", "create", "develop", "make",
        "please", "help",
        "page", "app", "application",
        "platform", "system", "project",
        "software", "website", "tool",
        "solution",
    }

    STOP_WORDS = {
        "the", "a", "an", "and", "or", "to",
        "for", "of", "in", "on", "with",
        "that", "this", "it", "is", "are",
        "be", "from", "into", "using",
        "should", "can", "could", "will",
        "have", "has", "do", "does",
        "allows", "display", "displays",
        "executives", "business", "decisions",
    }

    def __init__(self):
        self.provider = OllamaProvider()

    def analyze(self, query: str) -> dict:

        normalized_query = self._normalize_query(query)

        prompt = f"""
Analyze this complete software requirement:

{normalized_query}

Return only the required JSON.
"""

        result = self.provider.generate(
            prompt=prompt,
            system_prompt=self.SYSTEM_PROMPT,
        )

        if result.get("status") == "success":

            parsed = self._parse_json(
                result.get("response", "")
            )

            if parsed:

                specification = self._normalize_specification(
                    query,
                    parsed,
                )

                specification = self._ground_specification(
                    query,
                    specification,
                )

                specification = self._ensure_search_concepts(
                    query,
                    specification,
                )

                return {
                    "status": "success",
                    "mode": "llm",
                    "provider": result.get("provider"),
                    "model": result.get("model"),
                    "specification": specification,
                }

        fallback = self._intelligent_fallback(query)

        return {
            "status": "success",
            "mode": "intelligent_fallback",
            "provider": result.get("provider"),
            "model": result.get("model"),
            "specification": fallback,
            "llm_error": result.get("error"),
        }

    def build_semantic_query(self, intelligence: dict) -> str:

        specification = intelligence.get(
            "specification",
            {},
        )

        parts = [
            specification.get("project_type", ""),
            specification.get("summary", ""),
            " ".join(
                specification.get(
                    "core_capabilities",
                    [],
                )
            ),
            " ".join(
                specification.get(
                    "technologies",
                    [],
                )
            ),
        ]

        return " ".join(
            part.strip()
            for part in parts
            if part and part.strip()
        )

    def _normalize_query(self, query: str) -> str:

        query = re.sub(
            r"\s+",
            " ",
            query,
        ).strip()

        replacements = {
            r"\bdasboard\b": "dashboard",
            r"\bdashbord\b": "dashboard",
            r"\bpowerbi\b": "Power BI",
            r"\bloginpage\b": "login page",
            r"\bwebapp\b": "web application",
        }

        for pattern, replacement in replacements.items():

            query = re.sub(
                pattern,
                replacement,
                query,
                flags=re.IGNORECASE,
            )

        return query

    def _parse_json(self, response: str):

        text = response.strip()

        text = re.sub(
            r"^```(?:json)?\s*",
            "",
            text,
            flags=re.IGNORECASE,
        )

        text = re.sub(
            r"\s*```$",
            "",
            text,
        )

        try:
            return json.loads(text)

        except json.JSONDecodeError:

            match = re.search(
                r"\{.*\}",
                text,
                flags=re.DOTALL,
            )

            if not match:
                return None

            try:
                return json.loads(
                    match.group(0)
                )

            except json.JSONDecodeError:
                return None

    def _clean_list(self, value):

        if not isinstance(value, list):
            return []

        cleaned = []

        for item in value:

            item = re.sub(
                r"\s+",
                " ",
                str(item),
            ).strip()

            if item:
                cleaned.append(item)

        return list(dict.fromkeys(cleaned))

    def _normalize_specification(
        self,
        query,
        specification,
    ):

        return {
            "original_query": query,
            "project_type": str(
                specification.get(
                    "project_type",
                    "Software Project",
                )
            ).strip(),
            "summary": str(
                specification.get(
                    "summary",
                    query,
                )
            ).strip(),
            "core_capabilities": self._clean_list(
                specification.get(
                    "core_capabilities",
                    [],
                )
            ),
            "optional_capabilities": self._clean_list(
                specification.get(
                    "optional_capabilities",
                    [],
                )
            ),
            "technologies": self._clean_list(
                specification.get(
                    "technologies",
                    [],
                )
            ),
            "architecture_preferences": self._clean_list(
                specification.get(
                    "architecture_preferences",
                    [],
                )
            ),
            "search_concepts": self._clean_list(
                specification.get(
                    "search_concepts",
                    [],
                )
            ),
            "generic_terms": [],
        }

    def _detect_technologies(self, query):

        query_lower = query.lower()

        detected = []

        for pattern, technology in (
            self.TECHNOLOGY_PATTERNS.items()
        ):

            if pattern in query_lower:
                detected.append(technology)

        return list(dict.fromkeys(detected))

    def _detect_project_type(self, query):

        query_lower = query.lower()

        for patterns, project_type in (
            self.PROJECT_PATTERNS
        ):

            if all(
                pattern in query_lower
                for pattern in patterns
            ):
                return project_type

        return "Software Project"

    def _detect_capabilities(self, query):

        query_lower = query.lower()

        capabilities = []

        for pattern, capability in (
            self.CAPABILITY_PATTERNS.items()
        ):

            if pattern in query_lower:
                capabilities.append(capability)

        return list(dict.fromkeys(capabilities))

    def _ground_specification(
        self,
        query,
        specification,
    ):

        specification["technologies"] = (
            self._detect_technologies(query)
        )

        return specification

    def _ensure_search_concepts(
        self,
        query,
        specification,
    ):

        concepts = self._clean_list(
            specification.get(
                "search_concepts",
                [],
            )
        )

        technologies = specification.get(
            "technologies",
            [],
        )

        capabilities = specification.get(
            "core_capabilities",
            [],
        )

        project_type = specification.get(
            "project_type",
            "",
        )

        generated = list(concepts)

        for technology in technologies[:2]:

            for capability in capabilities[:2]:

                generated.append(
                    f"{technology} {capability}"
                )

        for capability in capabilities[:3]:

            generated.append(capability)

        if project_type != "Software Project":

            generated.append(project_type)

        specification["search_concepts"] = list(
            dict.fromkeys(
                concept.strip()
                for concept in generated
                if concept and concept.strip()
            )
        )[:5]

        return specification

    def _build_summary(
        self,
        project_type,
        technologies,
        capabilities,
    ):

        parts = [project_type]

        if technologies:
            parts.append(
                "using " +
                ", ".join(technologies)
            )

        if capabilities:
            parts.append(
                "for " +
                ", ".join(capabilities[:4])
            )

        return " ".join(parts)

    def _intelligent_fallback(self, query):

        normalized_query = self._normalize_query(query)

        technologies = self._detect_technologies(
            normalized_query
        )

        project_type = self._detect_project_type(
            normalized_query
        )

        capabilities = self._detect_capabilities(
            normalized_query
        )

        if not capabilities:

            keyword_query = self._build_keyword_query(
                normalized_query
            )

            if keyword_query:
                capabilities = [keyword_query]

        summary = self._build_summary(
            project_type,
            technologies,
            capabilities,
        )

        search_concepts = []

        for technology in technologies[:2]:

            for capability in capabilities[:2]:

                search_concepts.append(
                    f"{technology} {capability}"
                )

        for capability in capabilities[:3]:

            search_concepts.append(capability)

        if project_type != "Software Project":

            search_concepts.append(project_type)

        search_concepts = list(
            dict.fromkeys(search_concepts)
        )[:5]

        return {
            "original_query": query,
            "project_type": project_type,
            "summary": summary,
            "core_capabilities": capabilities,
            "optional_capabilities": [],
            "technologies": technologies,
            "architecture_preferences": [],
            "search_concepts": search_concepts,
            "generic_terms": [],
        }

    def _build_keyword_query(self, query):

        words = re.findall(
            r"[A-Za-z0-9+#.-]+",
            query.lower(),
        )

        useful_words = []

        for word in words:

            if word in self.GENERIC_TERMS:
                continue

            if word in self.STOP_WORDS:
                continue

            if len(word) <= 2:
                continue

            useful_words.append(word)

        return " ".join(
            list(
                dict.fromkeys(useful_words)
            )[:6]
        )
