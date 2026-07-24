import { apiGet } from "./apiClient";
import { buildMockDiscoveryResponse } from "./mockDiscoveryData";

// Swap point: flip this to false (or wire it to an env var) once the
// backend is reachable. Every component consumes the same response shape
// either way, so nothing else needs to change.
const MOCK_MODE = false;
const MOCK_DELAY_MS = 1800;

// Maps 1:1 to backend.app.api.v1.github: GET /github/discovery
export function discoverRepositories({
  query,
  internalLimit = 5,
  externalLimit = 10,
  resultLimit = 5,
}) {
  if (MOCK_MODE) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(buildMockDiscoveryResponse(query)), MOCK_DELAY_MS);
    });
  }

  return apiGet("/github/discovery", {
    query,
    internal_limit: internalLimit,
    external_limit: externalLimit,
    result_limit: resultLimit,
  });
}

export function checkHealth() {
  if (MOCK_MODE) {
    return Promise.resolve({ status: "mock mode — no backend connected" });
  }
  return apiGet("/health");
}

// GET /github/search/advanced -> ranked semantic search over the *indexed*
// repository set (Qdrant), distinct from /github/discovery which also
// reaches out to live GitHub. Each result includes a query_intelligence
// breakdown (detected language/technologies/complexity/intent) and a
// per-result explanation from the backend's ranking engine.
export function advancedSearch(query, limit = 8) {
  return apiGet("/github/search/advanced", { query, limit });
}

// GET /github/search/parse -> the same query-intelligence parser used by
// advanced search, exposed standalone so the UI can preview detected
// filters (language, technologies, complexity, intent) before running
// a search.
export function parseSearchQuery(query) {
  return apiGet("/github/search/parse", { query });
}
