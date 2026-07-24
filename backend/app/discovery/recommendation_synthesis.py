from backend.app.llm.ollama_provider import OllamaProvider

from backend.app.discovery.recommendation_prompt import (
    DiscoveryRecommendationPromptBuilder,
)


class DiscoveryRecommendationSynthesisService:

    def __init__(self):

        self.provider = OllamaProvider()

        self.prompt_builder = (
            DiscoveryRecommendationPromptBuilder()
        )

    def synthesize(
        self,
        query: str,
        discovery_result: dict,
    ) -> dict:

        fallback = self._build_fallback(
            discovery_result
        )

        prompt = self.prompt_builder.build(
            query=query,
            discovery_result=discovery_result,
        )

        result = self.provider.generate(
            prompt=prompt,
            system_prompt=(
                self.prompt_builder.SYSTEM_PROMPT
            ),
        )

        if result.get("status") == "success":

            return {
                "mode": "llm",
                "answer":
                    result.get("response"),
                "provider":
                    result.get("provider"),
                "model":
                    result.get("model"),
                "fallback_used": False,
                "generation_metadata": {
                    "eval_count":
                        result.get("eval_count"),
                    "total_duration":
                        result.get(
                            "total_duration"
                        ),
                },
                "deterministic_recommendation":
                    fallback,
            }

        return {
            "mode":
                "deterministic_fallback",
            "answer":
                fallback.get("answer"),
            "provider":
                result.get("provider"),
            "model":
                result.get("model"),
            "fallback_used": True,
            "llm_error":
                result.get("error"),
            "deterministic_recommendation":
                fallback,
        }

    def _build_fallback(
        self,
        discovery_result: dict,
    ) -> dict:

        candidate = discovery_result.get(
            "best_external_candidate"
        )

        if not candidate:

            return {
                "answer": (
                    "No suitable external GitHub "
                    "repository was discovered."
                ),
                "decision": "build_new",
            }

        reuse = candidate.get(
            "reuse_intelligence",
            {},
        )

        architecture = candidate.get(
            "architecture_intelligence",
            {},
        )

        name = candidate.get(
            "full_name"
        )

        strategy = reuse.get(
            "strategy",
            "build_new",
        )

        missing = reuse.get(
            "missing_requirements",
            [],
        )

        frameworks = architecture.get(
            "frameworks",
            [],
        )

        answer = (
            f"The strongest discovered repository is "
            f"{name}. The recommended strategy is "
            f"{strategy}. "
        )

        if frameworks:

            answer += (
                "Reusable frameworks include "
                + ", ".join(frameworks)
                + ". "
            )

        if missing:

            answer += (
                "Missing capabilities that must be "
                "implemented include "
                + ", ".join(missing)
                + "."
            )

        return {
            "answer": answer,
            "repository": name,
            "decision": strategy,
            "reuse_score":
                reuse.get("reuse_score"),
            "requirement_coverage":
                reuse.get(
                    "requirement_coverage"
                ),
            "frameworks": frameworks,
            "technologies":
                architecture.get(
                    "technologies",
                    [],
                ),
            "architectures":
                architecture.get(
                    "architectures",
                    [],
                ),
            "missing_requirements":
                missing,
            "risks":
                reuse.get("risks", []),
            "implementation_plan":
                reuse.get(
                    "implementation_plan",
                    {},
                ),
        }
