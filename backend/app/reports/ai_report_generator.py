import json

from backend.app.llm.ollama_provider import OllamaProvider


class AIReportGenerator:

    SYSTEM_PROMPT = """
You are a grounded GitHub repository intelligence analyst.

Generate a concise professional engineering report using ONLY the
provided repository evidence.

Rules:
1. Never invent technologies, scores, architectures, risks, or facts.
2. Clearly separate strengths, risks, and recommendations.
3. Preserve numerical scores exactly.
4. If evidence is unavailable, say that it is unavailable.
5. Produce a professional report suitable for an engineering team.
"""

    def __init__(self):
        self.provider = OllamaProvider()

    def generate(
        self,
        repository_name: str,
        report: dict,
    ) -> dict:

        prompt = f"""
Repository:
{repository_name}

Grounded Repository Intelligence:
{json.dumps(report, indent=2, default=str)}

Generate a concise engineering intelligence report.

Include:
- Executive Summary
- Repository Quality
- Architecture and Complexity
- Technology Profile
- Strengths
- Risks
- Recommendations
- Related Repository Context
"""

        result = self.provider.generate(
            prompt=prompt,
            system_prompt=self.SYSTEM_PROMPT,
        )

        if result.get("status") == "success":

            return {
                "mode": "llm",
                "answer": result.get("response"),
                "provider": result.get("provider"),
                "model": result.get("model"),
                "fallback_used": False,
                "generation_metadata": {
                    "eval_count": result.get("eval_count"),
                    "total_duration": result.get(
                        "total_duration"
                    ),
                },
                "grounded_report": report,
            }

        return {
            "mode": "deterministic_fallback",
            "answer": report.get("executive_summary"),
            "provider": result.get("provider"),
            "model": result.get("model"),
            "fallback_used": True,
            "llm_error": result.get("error"),
            "grounded_report": report,
        }
