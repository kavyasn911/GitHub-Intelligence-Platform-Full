import json
import os
import urllib.error
import urllib.request

from backend.app.llm.base import LLMProvider


class OllamaProvider(LLMProvider):

    def __init__(
        self,
        base_url: str | None = None,
        model: str | None = None,
        timeout: int | None = None,
    ):
        self.base_url = (
            base_url
            or os.getenv(
                "OLLAMA_BASE_URL",
                "http://localhost:11434",
            )
        ).rstrip("/")

        self.model = (
            model
            or os.getenv(
                "OLLAMA_MODEL",
                "qwen3:0.6b",
            )
        )

        self.timeout = (
            timeout
            if timeout is not None
            else int(
                os.getenv(
                    "OLLAMA_TIMEOUT",
                    "300",
                )
            )
        )

    def _request(
        self,
        endpoint: str,
        payload: dict | None = None,
        method: str = "GET",
    ):

        url = f"{self.base_url}{endpoint}"

        data = None

        headers = {
            "Content-Type": "application/json",
        }

        if payload is not None:
            data = json.dumps(payload).encode("utf-8")

        request = urllib.request.Request(
            url=url,
            data=data,
            headers=headers,
            method=method,
        )

        with urllib.request.urlopen(
            request,
            timeout=self.timeout,
        ) as response:

            return json.loads(
                response.read().decode("utf-8")
            )

    def health(self) -> dict:

        try:

            result = self._request("/api/tags")

            models = [
                model.get("name")
                for model in result.get("models", [])
            ]

            model_available = any(
                name == self.model
                or (
                    name
                    and name.startswith(
                        f"{self.model}:"
                    )
                )
                for name in models
            )

            return {
                "status": "healthy",
                "provider": "ollama",
                "base_url": self.base_url,
                "model": self.model,
                "model_available": model_available,
                "available_models": models,
            }

        except Exception as exc:

            return {
                "status": "unavailable",
                "provider": "ollama",
                "base_url": self.base_url,
                "model": self.model,
                "error": str(exc),
            }

    def generate(
        self,
        prompt: str,
        system_prompt: str = "",
    ) -> dict:

        try:

            payload = {
                "model": self.model,
                "prompt": prompt,
                "system": system_prompt,
                "stream": False,
                "think": False,
                "format": "json",
                "options": {
                    "temperature": 0.2,
                    "num_predict": 2000,
                },
            }

            result = self._request(
                endpoint="/api/generate",
                payload=payload,
                method="POST",
            )


            response = (
                result.get("response")
                or ""
            ).strip()

            if not response:
                return {
                    "status": "failed",
                    "provider": "ollama",
                    "model": self.model,
                    "error": "LLM returned an empty response.",
                }

            return {
                "status": "success",
                "provider": "ollama",
                "model": self.model,
                "response": response,
                "done": result.get("done", False),
                "total_duration": result.get(
                    "total_duration"
                ),
                "eval_count": result.get(
                    "eval_count"
                ),
            }

        except urllib.error.URLError as exc:

            return {
                "status": "failed",
                "provider": "ollama",
                "model": self.model,
                "error": str(exc),
            }

        except Exception as exc:

            return {
                "status": "failed",
                "provider": "ollama",
                "model": self.model,
                "error": str(exc),
            }





