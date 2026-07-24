
import re


class RepositoryExclusionEngine:

    EXCLUDED_NAME_PATTERNS = {
        "awesome",
        "tutorial",
        "example",
        "examples",
        "demo",
        "sample",
        "samples",
        "template",
        "boilerplate",
        "cheatsheet",
        "cheat-sheet",
    }

    def evaluate(self, repository: dict) -> dict:

        score = 1.0
        reasons = []

        name = self._normalize(
            repository.get("name") or ""
        )

        description = self._normalize(
            repository.get("description") or ""
        )

        text = f"{name} {description}"

        for pattern in self.EXCLUDED_NAME_PATTERNS:

            if pattern in text:
                score -= 0.25
                reasons.append(pattern)

        if repository.get("archived"):
            score -= 0.40
            reasons.append("archived")

        if repository.get("fork"):
            score -= 0.15
            reasons.append("fork")

        stars = repository.get("stars") or 0

        if stars < 5:
            score -= 0.10
            reasons.append("very_low_stars")

        score = max(score,0.0)

        return {
            "quality_score": round(score,4),
            "exclude": score < 0.35,
            "reasons": sorted(set(reasons)),
        }

    def _normalize(self,text):

        text=str(text).lower()

        text=re.sub(
            r"[^a-z0-9]+",
            " ",
            text,
        )

        return re.sub(
            r"\s+",
            " ",
            text,
        ).strip()
