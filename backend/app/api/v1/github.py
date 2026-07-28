from fastapi import APIRouter, Query

from backend.app.github.index_service import RepositoryIndexService
from backend.app.services.repository_persistence import RepositoryPersistenceService


router = APIRouter(
    prefix="/github",
    tags=["GitHub Intelligence"],
)


@router.get("/repositories")
def get_repositories():

    service = RepositoryIndexService()

    return service.build_index()


@router.post("/index")
def index_repositories():

    from backend.app.indexing.repository_indexer import RepositoryIntelligenceIndexer

    return RepositoryIntelligenceIndexer().build()


@router.get("/index/jobs")
def get_indexing_jobs():

    return {
        "jobs": RepositoryPersistenceService().get_jobs()
    }


@router.get("/search")
def semantic_search(
    query: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20),
):

    from backend.app.search.semantic_search import SemanticSearchService

    return SemanticSearchService().search(
        query=query,
        limit=limit,
    )


@router.get("/search/advanced")
def advanced_search(
    query: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20),
):

    from backend.app.search.advanced_search import AdvancedSearchService

    return AdvancedSearchService().search(
        query=query,
        limit=limit,
    )


@router.get("/search/parse")
def parse_search_query(
    query: str = Query(..., min_length=1),
):

    from backend.app.search.query_intelligence import QueryIntelligenceEngine

    return QueryIntelligenceEngine().parse(query)


@router.get("/recommendations/{repository_name}")
def repository_recommendations(
    repository_name: str,
    limit: int = Query(5, ge=1, le=20),
):

    from backend.app.recommendations.repository_recommendation import RepositoryRecommendationService

    return RepositoryRecommendationService().recommend(
        repository_name=repository_name,
        limit=limit,
    )


@router.get("/vectors/stats")
def vector_stats():

    from backend.app.indexing.vector_store import RepositoryVectorStore

    service = RepositoryVectorStore()

    return {
        "status": "success",
        "collection": service.COLLECTION_NAME,
        "vectors_stored": service.count(),
        "vector_dimension": service.VECTOR_SIZE,
    }


@router.post("/graph/sync")
def synchronize_graph():

    from backend.app.graph.graph_sync import GraphSynchronizationService

    return GraphSynchronizationService().synchronize()


@router.get("/graph/stats")
def graph_statistics():

    from backend.app.graph.graph_query import GraphQueryService

    return GraphQueryService().statistics()


@router.get("/graph/repository/{repository_name}")
def repository_graph(
    repository_name: str,
):

    from backend.app.graph.graph_query import GraphQueryService

    return GraphQueryService().repository_graph(
        repository_name
    )


@router.get("/graph/related/{repository_name}")
def related_graph_repositories(
    repository_name: str,
    limit: int = Query(5, ge=1, le=20),
):

    from backend.app.graph.graph_query import GraphQueryService

    return GraphQueryService().related_repositories(
        repository_name=repository_name,
        limit=limit,
    )


@router.get("/graph/technology/{technology}")
def technology_graph_repositories(
    technology: str,
):

    from backend.app.graph.graph_query import GraphQueryService

    return GraphQueryService().technology_repositories(
        technology
    )


@router.get("/retrieval/graph-augmented")
def graph_augmented_retrieval(
    query: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20),
):

    from backend.app.retrieval.graph_augmented_search import GraphAugmentedRetrievalService

    return GraphAugmentedRetrievalService().search(
        query=query,
        limit=limit,
    )


@router.get("/retrieval/graph-similar/{repository_name}")
def graph_similar_repositories(
    repository_name: str,
    limit: int = Query(5, ge=1, le=20),
):

    from backend.app.retrieval.graph_similarity import GraphSimilarityService

    return GraphSimilarityService().similar_repositories(
        repository_name=repository_name,
        limit=limit,
    )


@router.get("/intelligence/status")
def intelligence_status():

    from backend.app.indexing.vector_store import RepositoryVectorStore

    vector_store = RepositoryVectorStore()

    return {
        "status": "operational",
        "current_sprint": 7,
        "capabilities": {
            "github_repository_discovery": True,
            "repository_intelligence": True,
            "vector_storage": True,
            "semantic_search": True,
            "hybrid_search": True,
            "recommendations": True,
            "knowledge_graph": True,
            "repository_relationships": True,
            "technology_graph": True,
            "skill_graph": True,
            "graph_traversal": True,
            "graph_recommendations": True,
        },
        "vector_database": {
            "collection": vector_store.COLLECTION_NAME,
            "vectors_stored": vector_store.count(),
            "dimension": vector_store.VECTOR_SIZE,
        },
    }



@router.get("/agents/ask")
def ask_repository_agent(
    query: str = Query(..., min_length=1),
    limit: int = Query(5, ge=1, le=20),
):

    from backend.app.agents.supervisor import GitHubIntelligenceSupervisor

    return GitHubIntelligenceSupervisor().ask(
        query=query,
        limit=limit,
    )


@router.get("/agents/compare/{repository_name}")
def compare_repository_agent(
    repository_name: str,
    limit: int = Query(5, ge=1, le=20),
):

    from backend.app.agents.supervisor import GitHubIntelligenceSupervisor

    return GitHubIntelligenceSupervisor().compare(
        repository_name=repository_name,
        limit=limit,
    )


@router.get("/agents/llm/health")
def get_agent_llm_health():

    from backend.app.agents.supervisor import GitHubIntelligenceSupervisor

    return GitHubIntelligenceSupervisor().llm_health()


@router.get("/agents/route")
def route_agent_query(
    query: str = Query(..., min_length=1),
):

    from backend.app.agents.supervisor import GitHubIntelligenceSupervisor

    return GitHubIntelligenceSupervisor().route(query)


@router.get("/reports/repository/{repository_name}/analysis")
def get_repository_analysis(
    repository_name: str,
):

    from backend.app.reports.repository_report_service import RepositoryReportService

    return RepositoryReportService().analyze(
        repository_name=repository_name
    )


@router.get("/reports/repository/{repository_name}")
def generate_repository_report(
    repository_name: str,
):

    from backend.app.reports.repository_report_service import RepositoryReportService

    return RepositoryReportService().generate(
        repository_name=repository_name
    )


@router.get("/portfolio/overview")
def get_portfolio_overview():

    from backend.app.portfolio.organization_intelligence import OrganizationIntelligenceService

    return OrganizationIntelligenceService().overview()


@router.get("/portfolio/duplication/{repository_name}")
def get_repository_duplication_intelligence(
    repository_name: str,
    limit: int = 5,
):

    from backend.app.portfolio.organization_intelligence import OrganizationIntelligenceService

    return OrganizationIntelligenceService().duplication_analysis(
        repository_name=repository_name,
        limit=limit,
    )


@router.get("/performance/health")
def get_system_health():

    from backend.app.performance.health_service import SystemHealthService

    return SystemHealthService().health()


@router.get("/performance/cache/stats")
def get_cache_statistics():

    from backend.app.performance.cache_service import CacheService

    return CacheService().statistics()


@router.delete("/performance/cache")
def clear_application_cache():

    from backend.app.performance.cache_service import CacheService

    return CacheService().clear()


@router.get("/performance/metrics")
def get_performance_metrics():

    from backend.app.performance.performance_monitor import PerformanceMonitor

    return PerformanceMonitor.statistics()


@router.get("/performance/portfolio")
def get_cached_portfolio_overview(
    force_refresh: bool = False,
):

    from backend.app.performance.cached_intelligence import CachedIntelligenceService

    return CachedIntelligenceService().portfolio_overview(
        force_refresh=force_refresh,
    )


@router.get("/performance/duplication/{repository_name}")
def get_cached_duplication_analysis(
    repository_name: str,
    limit: int = 5,
    force_refresh: bool = False,
):

    from backend.app.performance.cached_intelligence import CachedIntelligenceService

    return CachedIntelligenceService().duplication_analysis(
        repository_name=repository_name,
        limit=limit,
        force_refresh=force_refresh,
    )


@router.get("/evaluation/system")
def get_system_evaluation():

    from backend.app.evaluation.system_evaluation import SystemEvaluationService

    return SystemEvaluationService().evaluate()


@router.get("/evaluation/liveness")
def get_application_liveness():

    from backend.app.evaluation.system_evaluation import SystemEvaluationService

    return SystemEvaluationService().liveness()


@router.get("/evaluation/readiness")
def get_application_readiness():

    from backend.app.evaluation.system_evaluation import SystemEvaluationService

    return SystemEvaluationService().readiness()


@router.get("/evaluation/grounding")
def evaluate_grounding(
    answer: str = Query(
        ...,
        min_length=1,
    ),
):

    from backend.app.evaluation.grounding_validator import GroundingValidator

    evidence = {
        "repositories": [
            "NEXUSOPS",
            "Self-Structuring-Database",
        ],
        "technologies": [
            "Python",
            "Docker",
            "Neo4j",
            "FastAPI",
        ],
    }

    return GroundingValidator().validate(
        answer=answer,
        evidence=evidence,
    )


@router.get("/audit/events")
def get_recent_audit_events(
    limit: int = 50,
):

    from backend.app.audit.audit_service import AuditService

    return AuditService().recent(
        limit=limit,
    )


@router.get("/discovery")
def discover_global_repositories(
    query: str = Query(..., min_length=2),
    internal_limit: int = Query(5, ge=1, le=20),
    external_limit: int = Query(10, ge=1, le=30),
    result_limit: int = Query(5, ge=1, le=20),
):

    from backend.app.discovery.query_validator import QueryValidator
    from backend.app.discovery.discovery_service import RepositoryDiscoveryService

    validation = QueryValidator().validate(query)

    if validation.get("status") != "valid":
        return {
            "status": validation.get("status"),
            "query": query,
            "message": validation.get("message"),
        }

    return RepositoryDiscoveryService().discover(
        query=query,
        internal_limit=internal_limit,
        external_limit=external_limit,
        result_limit=result_limit,
    )
