import json
from typing import Any, Optional

from backend.app.core.redis import redis_client


class CacheService:

    DEFAULT_TTL = 300
    PREFIX = "github-intelligence"

    def _key(self, key: str) -> str:
        return f"{self.PREFIX}:{key}"

    def get(self, key: str) -> Optional[Any]:

        try:
            value = redis_client.get(self._key(key))

            if value is None:
                return None

            return json.loads(value)

        except Exception:
            return None

    def set(
        self,
        key: str,
        value: Any,
        ttl: int = DEFAULT_TTL,
    ) -> bool:

        try:
            redis_client.setex(
                self._key(key),
                ttl,
                json.dumps(value, default=str),
            )

            return True

        except Exception:
            return False

    def delete(self, key: str) -> bool:

        try:
            redis_client.delete(self._key(key))
            return True

        except Exception:
            return False

    def clear(self) -> dict:

        deleted = 0

        try:
            pattern = self._key("*")

            for key in redis_client.scan_iter(
                match=pattern
            ):
                deleted += redis_client.delete(key)

            return {
                "status": "success",
                "deleted_keys": deleted,
            }

        except Exception as exc:

            return {
                "status": "degraded",
                "deleted_keys": deleted,
                "error": str(exc),
            }

    def statistics(self) -> dict:

        try:
            keys = list(
                redis_client.scan_iter(
                    match=self._key("*")
                )
            )

            info = redis_client.info()

            return {
                "status": "healthy",
                "redis_version": info.get(
                    "redis_version"
                ),
                "connected_clients": info.get(
                    "connected_clients"
                ),
                "used_memory_human": info.get(
                    "used_memory_human"
                ),
                "total_commands_processed": info.get(
                    "total_commands_processed"
                ),
                "application_cache_keys": len(keys),
            }

        except Exception as exc:

            return {
                "status": "unavailable",
                "error": str(exc),
                "application_cache_keys": 0,
            }
