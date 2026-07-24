import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock


class AuditService:

    AUDIT_DIRECTORY = Path("backend/audit_logs")
    AUDIT_FILE = AUDIT_DIRECTORY / "audit.jsonl"

    _lock = Lock()

    def __init__(self):

        self.AUDIT_DIRECTORY.mkdir(
            parents=True,
            exist_ok=True,
        )

    def record(
        self,
        event_type: str,
        action: str,
        status: str = "success",
        metadata: dict | None = None,
        correlation_id: str | None = None,
    ) -> dict:

        event = {
            "event_id": str(uuid.uuid4()),
            "correlation_id": correlation_id,
            "timestamp": datetime.now(
                timezone.utc
            ).isoformat(),
            "event_type": event_type,
            "action": action,
            "status": status,
            "metadata": metadata or {},
        }

        with self._lock:

            with self.AUDIT_FILE.open(
                "a",
                encoding="utf-8",
            ) as file:

                file.write(
                    json.dumps(
                        event,
                        default=str,
                    )
                    + "\n"
                )

        return event

    def recent(
        self,
        limit: int = 50,
    ) -> dict:

        if not self.AUDIT_FILE.exists():

            return {
                "status": "success",
                "count": 0,
                "events": [],
            }

        with self.AUDIT_FILE.open(
            "r",
            encoding="utf-8",
        ) as file:

            lines = file.readlines()

        events = []

        for line in lines[-limit:]:

            try:
                events.append(
                    json.loads(line)
                )

            except Exception:
                continue

        events.reverse()

        return {
            "status": "success",
            "count": len(events),
            "events": events,
        }
