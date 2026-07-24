class AgentIntentRouter:

    ROUTES = {
        "comparison": [
            "compare",
            "comparison",
            "difference",
            "differences",
            "versus",
            " vs ",
            "similar",
            "related",
        ],
        "portfolio": [
            "portfolio",
            "all repositories",
            "my repositories",
            "overall",
            "best project",
            "strongest project",
        ],
        "skill": [
            "skill",
            "skills",
            "learn",
            "learning",
            "improve",
            "knowledge gap",
        ],
        "technology": [
            "technology",
            "technologies",
            "tech stack",
            "framework",
            "database",
        ],
    }

    def route(self, query: str) -> dict:

        normalized = f" {query.lower().strip()} "

        scores = {
            intent: sum(
                1
                for keyword in keywords
                if keyword in normalized
            )
            for intent, keywords in self.ROUTES.items()
        }

        selected_intent = max(
            scores,
            key=scores.get,
        )

        if scores[selected_intent] == 0:
            selected_intent = "repository"

        agent_map = {
            "repository": "repository_intelligence_agent",
            "comparison": "repository_comparison_agent",
            "portfolio": "portfolio_intelligence_agent",
            "skill": "skill_intelligence_agent",
            "technology": "technology_intelligence_agent",
        }

        return {
            "intent": selected_intent,
            "agent": agent_map[selected_intent],
            "scores": scores,
        }
