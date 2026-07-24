from backend.app.portfolio.duplication_intelligence import DuplicationIntelligenceService
from backend.app.portfolio.portfolio_intelligence import PortfolioIntelligenceService
from backend.app.portfolio.skill_gap_analysis import SkillGapAnalysisService
from backend.app.portfolio.technology_landscape import TechnologyLandscapeService


class OrganizationIntelligenceService:

    def __init__(self):
        self.portfolio = PortfolioIntelligenceService()
        self.skills = SkillGapAnalysisService()
        self.technologies = TechnologyLandscapeService()
        self.duplication = DuplicationIntelligenceService()

    def overview(self) -> dict:

        portfolio = self.portfolio.analyze()
        skills = self.skills.analyze()
        technologies = self.technologies.analyze()

        return {
            "status": "success",
            "intelligence_type": "organization_portfolio_intelligence",
            "portfolio": portfolio.get(
                "portfolio",
                {},
            ),
            "skills": skills.get(
                "skill_intelligence",
                {},
            ),
            "technologies": technologies.get(
                "technology_landscape",
                {},
            ),
        }

    def duplication_analysis(
        self,
        repository_name: str,
        limit: int = 5,
    ) -> dict:

        return self.duplication.analyze_repository(
            repository_name=repository_name,
            limit=limit,
        )
