import time
from collections import defaultdict
from threading import Lock


class PerformanceMonitor:

    _metrics = defaultdict(
        lambda: {
            "calls": 0,
            "total_duration_ms": 0.0,
            "minimum_duration_ms": None,
            "maximum_duration_ms": 0.0,
        }
    )

    _lock = Lock()

    @classmethod
    def record(
        cls,
        operation: str,
        duration_ms: float,
    ):

        with cls._lock:

            metric = cls._metrics[operation]

            metric["calls"] += 1
            metric["total_duration_ms"] += duration_ms

            if (
                metric["minimum_duration_ms"] is None
                or duration_ms
                < metric["minimum_duration_ms"]
            ):
                metric["minimum_duration_ms"] = (
                    duration_ms
                )

            if (
                duration_ms
                > metric["maximum_duration_ms"]
            ):
                metric["maximum_duration_ms"] = (
                    duration_ms
                )

    @classmethod
    def statistics(cls) -> dict:

        results = {}

        with cls._lock:

            for operation, metric in cls._metrics.items():

                calls = metric["calls"]

                results[operation] = {
                    "calls": calls,
                    "average_duration_ms": round(
                        metric["total_duration_ms"]
                        / calls,
                        2,
                    ) if calls else 0,
                    "minimum_duration_ms": round(
                        metric["minimum_duration_ms"],
                        2,
                    ) if metric[
                        "minimum_duration_ms"
                    ] is not None else 0,
                    "maximum_duration_ms": round(
                        metric["maximum_duration_ms"],
                        2,
                    ),
                }

        return {
            "status": "success",
            "operations": results,
        }


class PerformanceTimer:

    def __init__(self, operation: str):
        self.operation = operation
        self.started_at = None

    def __enter__(self):
        self.started_at = time.perf_counter()
        return self

    def __exit__(
        self,
        exc_type,
        exc_value,
        traceback,
    ):

        duration_ms = (
            time.perf_counter()
            - self.started_at
        ) * 1000

        PerformanceMonitor.record(
            operation=self.operation,
            duration_ms=duration_ms,
        )
