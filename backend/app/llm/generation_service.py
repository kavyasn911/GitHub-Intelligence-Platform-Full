from backend.app.llm.ollama_provider import OllamaProvider
from backend.app.llm.prompt_builder import GroundedPromptBuilder


class GroundedGenerationService:

    def __init__(self):
        self.provider = OllamaProvider()
        self.prompt_builder = GroundedPromptBuilder()

    def health(self) -> dict:
        return self.provider.health()

    def generate_repository_answer(
        self,
        query: str,
        context: dict,
        fallback: dict,
    ) -> dict:

        prompt = (
            self.prompt_builder.build_repository_prompt(
                query=query,
                context=context,
            )
        )

        result = self.provider.generate(
            prompt=prompt,
            system_prompt=self.prompt_builder.SYSTEM_PROMPT,
        )

        if result.get("status") == "success":

            return {
                "mode": "llm",
                "answer": result.get("response"),
                "provider": result.get("provider"),
                "model": result.get("model"),
                "fallback_used": False,
                "generation_metadata": {
                    "eval_count": result.get(
                        "eval_count"
                    ),
                    "total_duration": result.get(
                        "total_duration"
                    ),
                },
                "deterministic_evidence": fallback,
            }

        return {
            "mode": "deterministic_fallback",
            "answer": fallback.get("answer"),
            "provider": result.get("provider"),
            "model": result.get("model"),
            "fallback_used": True,
            "llm_error": result.get("error"),
            "deterministic_evidence": fallback,
        }

    def generate_comparison_answer(
        self,
        repository_name: str,
        graph_context: dict,
        fallback: dict,
    ) -> dict:

        prompt = (
            self.prompt_builder.build_comparison_prompt(
                repository_name=repository_name,
                graph_context=graph_context,
            )
        )

        result = self.provider.generate(
            prompt=prompt,
            system_prompt=self.prompt_builder.SYSTEM_PROMPT,
        )

        if result.get("status") == "success":

            return {
                "mode": "llm",
                "answer": result.get("response"),
                "provider": result.get("provider"),
                "model": result.get("model"),
                "fallback_used": False,
                "generation_metadata": {
                    "eval_count": result.get(
                        "eval_count"
                    ),
                    "total_duration": result.get(
                        "total_duration"
                    ),
                },
                "deterministic_evidence": fallback,
            }

        return {
            "mode": "deterministic_fallback",
            "answer": fallback.get("answer"),
            "provider": result.get("provider"),
            "model": result.get("model"),
            "fallback_used": True,
            "llm_error": result.get("error"),
            "deterministic_evidence": fallback,
        }
