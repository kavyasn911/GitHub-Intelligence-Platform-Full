import { apiGet, apiDelete } from "./apiClient";

// Maps 1:1 to backend.app.api.v1.github — organization / system intelligence
// endpoints that already exist on the backend but aren't called anywhere
// in the current frontend.

// GET /github/portfolio/overview -> portfolio + skills + technology landscape
export function getPortfolioOverview() {
  return apiGet("/github/portfolio/overview");
}

// GET /github/performance/health -> redis/qdrant/neo4j/llm health
export function getSystemHealth() {
  return apiGet("/github/performance/health");
}

// GET /github/performance/metrics -> per-operation timing stats
export function getPerformanceMetrics() {
  return apiGet("/github/performance/metrics");
}

// GET /github/vectors/stats -> vector DB collection stats
export function getVectorStats() {
  return apiGet("/github/vectors/stats");
}

// GET /github/audit/events -> recent audit log
export function getAuditEvents(limit = 8) {
  return apiGet("/github/audit/events", { limit });
}

// GET /github/graph/stats -> Neo4j node/relationship counts by label/type
export function getGraphStatistics() {
  return apiGet("/github/graph/stats");
}

// GET /github/performance/cache/stats -> Redis key count + server info
export function getCacheStatistics() {
  return apiGet("/github/performance/cache/stats");
}

// DELETE /github/performance/cache -> flush all app-namespaced Redis keys
export function clearCache() {
  return apiDelete("/github/performance/cache");
}

// GET /github/evaluation/liveness -> lightweight "is the app up" probe
export function getLiveness() {
  return apiGet("/github/evaluation/liveness");
}

// GET /github/evaluation/readiness -> "is the app ready to serve" probe,
// derived from the same health check as performance/health
export function getReadiness() {
  return apiGet("/github/evaluation/readiness");
}

// GET /github/evaluation/system -> composite evaluation (health + graph + vectors)
export function getSystemEvaluation() {
  return apiGet("/github/evaluation/system");
}

// GET /github/index/jobs -> last 20 indexing job runs
export function getIndexingJobs() {
  return apiGet("/github/index/jobs");
}
