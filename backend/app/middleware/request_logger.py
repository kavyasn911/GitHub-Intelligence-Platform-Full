import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware

from backend.app.audit.audit_service import AuditService
from backend.app.core.logging import app_logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(
        self,
        request,
        call_next,
    ):

        start = time.perf_counter()

        correlation_id = (
            request.headers.get(
                "X-Correlation-ID"
            )
            or str(uuid.uuid4())
        )

        request.state.correlation_id = (
            correlation_id
        )

        try:

            response = await call_next(
                request
            )

            status_code = (
                response.status_code
            )

            status = (
                "success"
                if status_code < 500
                else "failed"
            )

        except Exception:

            duration = round(
                (
                    time.perf_counter()
                    - start
                )
                * 1000,
                2,
            )

            AuditService().record(
                event_type="http_request",
                action=(
                    f"{request.method} "
                    f"{request.url.path}"
                ),
                status="failed",
                correlation_id=correlation_id,
                metadata={
                    "duration_ms": duration,
                },
            )

            raise

        duration = round(
            (
                time.perf_counter()
                - start
            )
            * 1000,
            2,
        )

        response.headers[
            "X-Correlation-ID"
        ] = correlation_id

        app_logger.info(
            f"[{correlation_id}] "
            f"{request.method} "
            f"{request.url.path} "
            f"{status_code} "
            f"{duration} ms"
        )

        AuditService().record(
            event_type="http_request",
            action=(
                f"{request.method} "
                f"{request.url.path}"
            ),
            status=status,
            correlation_id=correlation_id,
            metadata={
                "status_code": status_code,
                "duration_ms": duration,
            },
        )

        return response
