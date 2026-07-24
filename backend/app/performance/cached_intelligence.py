from backend.app.performance.cache_service import CacheService
from backend.app.performance.performance_monitor import PerformanceTimer
from backend.app.portfolio.organization_intelligence import OrganizationIntelligenceService


class CachedIntelligenceService:

    PORTFOLIO_TTL = 300
    DUPLICATION_TTL = 300

    def __init__(self):
        self.cache = CacheService()
        self.intelligence = (
            OrganizationIntelligenceService()
        )

    def portfolio_overview(
        self,
        force_refresh: bool = False,
    ):

        cache_key = "portfolio:overview"

        if not force_refresh:

            cached = self.cache.get(cache_key)

            if cached is not None:

                cached["cache"] = {
                    "hit": True,
                    "key": cache_key,
                }

                return cached

        with PerformanceTimer(
            "portfolio_overview"
        ):
            result = self.intelligence.overview()

        self.cache.set(
            cache_key,
            result,
            self.PORTFOLIO_TTL,
        )

        result["cache"] = {
            "hit": False,
            "key": cache_key,
            "ttl": self.PORTFOLIO_TTL,
        }

        return result

    def duplication_analysis(
        self,
        repository_name: str,
        limit: int = 5,
        force_refresh: bool = False,
    ):

        normalized_name = (
            repository_name
            .strip()
            .lower()
        )

        cache_key = (
            f"duplication:"
            f"{normalized_name}:"
            f"{limit}"
        )

        if not force_refresh:

            cached = self.cache.get(cache_key)

            if cached is not None:

                cached["cache"] = {
                    "hit": True,
                    "key": cache_key,
                }

                return cached

        with PerformanceTimer(
            "duplication_analysis"
        ):
            result = (
                self.intelligence
                .duplication_analysis(
                    repository_name=repository_name,
                    limit=limit,
                )
            )

        self.cache.set(
            cache_key,
            result,
            self.DUPLICATION_TTL,
        )

        result["cache"] = {
            "hit": False,
            "key": cache_key,
            "ttl": self.DUPLICATION_TTL,
        }

        return result
