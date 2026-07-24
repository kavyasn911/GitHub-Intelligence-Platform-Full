from backend.app.agents.comparison_agent import RepositoryComparisonAgent
from backend.app.agents.context_service import AgentContextService
from backend.app.agents.intent_router import AgentIntentRouter
from backend.app.agents.portfolio_agent import PortfolioIntelligenceAgent
from backend.app.agents.repository_agent import RepositoryIntelligenceAgent
from backend.app.agents.skill_agent import SkillIntelligenceAgent
from backend.app.agents.technology_agent import TechnologyIntelligenceAgent
from backend.app.llm.generation_service import GroundedGenerationService


class GitHubIntelligenceSupervisor:

    def __init__(self):
        self.context_service = AgentContextService()
        self.intent_router = AgentIntentRouter()

        self.repository_agent = RepositoryIntelligenceAgent()
        self.comparison_agent = RepositoryComparisonAgent()
        self.portfolio_agent = PortfolioIntelligenceAgent()
        self.skill_agent = SkillIntelligenceAgent()
        self.technology_agent = TechnologyIntelligenceAgent()

        self.generation_service = GroundedGenerationService()

    def route(
        self,
        query: str,
    ):
        return self.intent_router.route(query)

    def ask(
        self,
        query: str,
        limit: int = 5,
    ):

        routing = self.intent_router.route(query)

        context = self.context_service.build_search_context(
            query=query,
            limit=limit,
        )

        intent = routing["intent"]

        if intent == "portfolio":
            deterministic_response = self.portfolio_agent.answer(
                query=query,
                context=context,
            )

        elif intent == "skill":
            deterministic_response = self.skill_agent.answer(
                query=query,
                context=context,
            )

        elif intent == "technology":
            deterministic_response = self.technology_agent.answer(
                query=query,
                context=context,
            )

        else:
            deterministic_response = self.repository_agent.answer(
                query=query,
                context=context,
            )

        generated_response = (
            self.generation_service.generate_repository_answer(
                query=query,
                context=context,
                fallback=deterministic_response,
            )
        )

        return {
            "status": "success",
            "supervisor": "github_intelligence_supervisor",
            "routing": routing,
            "agent": routing["agent"],
            "query": query,
            "response": generated_response,
            "execution_metadata": {
                "repositories_analyzed": len(
                    context.get("repositories", [])
                ),
                "llm_provider": generated_response.get("provider"),
                "llm_model": generated_response.get("model"),
                "fallback_used": generated_response.get(
                    "fallback_used"
                ),
            },
            "context": {
                "query_intelligence": context.get(
                    "query_intelligence",
                    {},
                ),
            },
        }

    def compare(
        self,
        repository_name: str,
        limit: int = 5,
    ):

        graph_context = (
            self.context_service.build_comparison_context(
                repository_name=repository_name,
                limit=limit,
            )
        )

        deterministic_response = (
            self.comparison_agent.compare(
                repository_name=repository_name,
                graph_context=graph_context,
            )
        )

        generated_response = (
            self.generation_service.generate_comparison_answer(
                repository_name=repository_name,
                graph_context=graph_context,
                fallback=deterministic_response,
            )
        )

        return {
            "status": "success",
            "supervisor": "github_intelligence_supervisor",
            "routing": {
                "intent": "comparison",
                "agent": "repository_comparison_agent",
            },
            "agent": "repository_comparison_agent",
            "response": generated_response,
        }

    def llm_health(self):
        return self.generation_service.health()
