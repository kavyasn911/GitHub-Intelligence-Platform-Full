import { apiGet } from "./apiClient";

// Per-repository "deep dive" backend capabilities. These already exist on
// the backend (Component Intelligence, Graph Intelligence, Reports,
// Duplication, Agents) but had no frontend surface at all.
//
// Note: several of these (graph/report/duplication) only return data for
// repositories that have been synced into the knowledge graph — not every
// external GitHub discovery result will be. Callers should treat
// status !== "success" as "no data available" and hide the section,
// per the "only show sections if backend data exists" rule.

// GET /component/analyze/{owner}/{repo}
// Clones the repo live and detects components — works for ANY repo,
// internal or external, since it doesn't depend on the graph being synced.
// Takes owner/repo as two segments (matches the backend route exactly),
// rather than splitting a "full_name" string client-side.
export function analyzeComponents(owner, repo) {
  return apiGet(`/component/analyze/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
}

// The single-segment {repository_name} routes below are matched by the
// backend against EITHER the repository's short `name` OR its `full_name`
// (see graph_query.py: `toLower(r.name) = ... OR toLower(r.full_name) = ...`).
// We deliberately pass the short `name` here rather than "owner/repo",
// since a literal "/" inside a single path segment is unreliable across
// URL-encoding/proxy layers.

// GET /github/graph/repository/{repository_name}
export function getRepositoryGraph(repositoryName) {
  return apiGet(`/github/graph/repository/${encodeURIComponent(repositoryName)}`);
}

// GET /github/graph/related/{repository_name}
export function getRelatedRepositories(repositoryName, limit = 5) {
  return apiGet(`/github/graph/related/${encodeURIComponent(repositoryName)}`, { limit });
}

// GET /github/retrieval/graph-similar/{repository_name}
export function getGraphSimilarRepositories(repositoryName, limit = 5) {
  return apiGet(`/github/retrieval/graph-similar/${encodeURIComponent(repositoryName)}`, { limit });
}

// GET /github/reports/repository/{repository_name}/analysis (deterministic)
export function getRepositoryAnalysis(repositoryName) {
  return apiGet(`/github/reports/repository/${encodeURIComponent(repositoryName)}/analysis`);
}

// GET /github/reports/repository/{repository_name} (AI-grounded report)
export function getRepositoryReport(repositoryName) {
  return apiGet(`/github/reports/repository/${encodeURIComponent(repositoryName)}`);
}

// GET /github/portfolio/duplication/{repository_name}
export function getDuplicationAnalysis(repositoryName, limit = 5) {
  return apiGet(`/github/portfolio/duplication/${encodeURIComponent(repositoryName)}`, { limit });
}

// GET /github/agents/ask
export function askRepositoryAgent(query, limit = 5) {
  return apiGet("/github/agents/ask", { query, limit });
}

// GET /github/agents/compare/{repository_name}
export function compareRepositoryAgent(repositoryName, limit = 5) {
  return apiGet(`/github/agents/compare/${encodeURIComponent(repositoryName)}`, { limit });
}

// GET /github/agents/llm/health
export function getAgentLlmHealth() {
  return apiGet("/github/agents/llm/health");
}

// GET /github/agents/route — which agent would handle a query, without running it
export function routeAgentQuery(query) {
  return apiGet("/github/agents/route", { query });
}

// GET /github/intelligence/status
export function getIntelligenceStatus() {
  return apiGet("/github/intelligence/status");
}

// GET /github/recommendations/{repository_name} -> vector-similarity
// recommendations against the indexed repository set (distinct from
// getGraphSimilarRepositories, which walks the knowledge graph instead
// of the vector index).
export function getRepositoryRecommendations(repositoryName, limit = 5) {
  return apiGet(`/github/recommendations/${encodeURIComponent(repositoryName)}`, { limit });
}
