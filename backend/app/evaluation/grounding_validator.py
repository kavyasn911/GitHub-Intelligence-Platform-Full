import re


class GroundingValidator:

    def validate(
        self,
        answer: str,
        evidence: dict,
    ) -> dict:

        answer = answer or ""

        allowed_terms = set()

        def collect(value):

            if isinstance(value, dict):
                for item in value.values():
                    collect(item)

            elif isinstance(value, list):
                for item in value:
                    collect(item)

            elif value is not None:
                allowed_terms.add(
                    str(value).strip().lower()
                )

        collect(evidence)

        suspicious_terms = []

        capitalized_terms = re.findall(
            r"\b[A-Z][A-Za-z0-9+#.-]{2,}\b",
            answer,
        )

        ignored = {
            "the",
            "this",
            "based",
            "repository",
            "repositories",
            "engineering",
            "intelligence",
            "report",
            "executive",
            "summary",
            "quality",
            "architecture",
            "complexity",
            "technology",
            "technologies",
            "strengths",
            "risks",
            "recommendations",
        }

        evidence_text = " ".join(allowed_terms)

        for term in capitalized_terms:

            normalized = term.lower()

            if normalized in ignored:
                continue

            if normalized not in evidence_text:
                suspicious_terms.append(term)

        suspicious_terms = sorted(
            set(suspicious_terms)
        )

        grounded = len(suspicious_terms) == 0

        return {
            "status": "success",
            "grounded": grounded,
            "grounding_score": round(
                max(
                    0.0,
                    1.0
                    - (
                        len(suspicious_terms)
                        / max(
                            len(capitalized_terms),
                            1,
                        )
                    ),
                ),
                4,
            ),
            "unsupported_terms": suspicious_terms,
        }
