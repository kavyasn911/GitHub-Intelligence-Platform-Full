from datetime import datetime, timezone


class RepositoryHealthAnalyzer:

    def analyze(self, repository: dict) -> dict:

        stars = repository.get("stars") or 0
        forks = repository.get("forks") or 0
        open_issues = repository.get("open_issues") or 0
        archived = repository.get("archived", False)
        readme_available = repository.get("readme_available", False)

        activity_score = self._activity_score(
            repository.get("updated_at")
        )

        popularity_score = min(
            (stars + forks * 2) / 1000,
            1.0,
        )

        documentation_score = (
            1.0 if readme_available else 0.0
        )

        maintenance_score = 0.0

        if not archived:
            maintenance_score += 0.5

        maintenance_score += activity_score * 0.5

        health_score = (
            activity_score * 0.35
            + popularity_score * 0.20
            + documentation_score * 0.20
            + maintenance_score * 0.25
        )

        if archived:
            status = "archived"
        elif health_score >= 0.75:
            status = "excellent"
        elif health_score >= 0.55:
            status = "healthy"
        elif health_score >= 0.35:
            status = "moderate"
        else:
            status = "weak"

        return {
            "health_score": round(health_score, 4),
            "health_percentage": round(
                health_score * 100,
                2,
            ),
            "status": status,
            "activity_score": round(
                activity_score,
                4,
            ),
            "popularity_score": round(
                popularity_score,
                4,
            ),
            "maintenance_score": round(
                maintenance_score,
                4,
            ),
            "documentation_score":
                documentation_score,
            "stars": stars,
            "forks": forks,
            "open_issues": open_issues,
            "archived": archived,
        }

    def _activity_score(self, updated_at):

        if not updated_at:
            return 0.0

        try:
            updated = datetime.fromisoformat(
                str(updated_at)
            )

            if updated.tzinfo is None:
                updated = updated.replace(
                    tzinfo=timezone.utc
                )

            now = datetime.now(timezone.utc)

            days = max(
                (now - updated).days,
                0,
            )

            if days <= 30:
                return 1.0

            if days <= 90:
                return 0.8

            if days <= 180:
                return 0.6

            if days <= 365:
                return 0.4

            if days <= 730:
                return 0.2

            return 0.05

        except Exception:
            return 0.0
