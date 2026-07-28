import React, { useCallback, useEffect, useRef } from "react";
import { Box, Heading, Text, Button } from "grommet";
import { GenAI } from "grommet-icons";
import { SearchWorkspace } from "../components/discovery/SearchWorkspace";
import { RequirementIntelligencePanel } from "../components/discovery/RequirementIntelligencePanel";
import { ThinkingTimeline } from "../components/timeline/ThinkingTimeline";
import { FeaturedRepositoryCard } from "../components/repository/FeaturedRepositoryCard";
import { RepositoryList } from "../components/repository/RepositoryList";
import { RepositorySkeletonList } from "../components/repository/RepositorySkeleton";
import { AdvancedSearchResults } from "../components/discovery/AdvancedSearchResults";
import { EmptyState, ErrorState } from "../components/common/StateViews";
import { discoverRepositories, advancedSearch } from "../services/discoveryApi";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSessionStorage } from "../hooks/useSessionStorage";
import { useSavedRepositories } from "../hooks/useSavedRepositories";

export function DiscoveryPage({ initialQuery }) {
  // Persisted to sessionStorage (not plain useState) so that navigating to
  // another page and back doesn't wipe the last search — this was resetting
  // to a blank "new search" state before, since React unmounts this page's
  // component state entirely on route change.
  const [searchState, setSearchState] = useSessionStorage("argus:lastSearch", {
    status: "idle", // idle | loading | success | error
    result: null,
    searchMode: "discover", // discover | portfolio
    error: null,
    activeQuery: initialQuery || "",
  });
  const { status, result, searchMode, error, activeQuery } = searchState;

  const patchSearchState = (patch) => setSearchState((prev) => ({ ...prev, ...patch }));

  const [, setHistory] = useLocalStorage("argus:history", []);
  const { isSaved, toggleSave } = useSavedRepositories();

const resultsRef = useRef(null);
const alternativesRef = useRef(null);

  const runSearch = useCallback(
    async ({ query, resultLimit, mode = "discover" }) => {
      patchSearchState({ status: "loading", error: null, activeQuery: query, searchMode: mode });

      try {
        if (mode === "portfolio") {
          // Ranked semantic search over the indexed repository set —
          // distinct response shape from /github/discovery, so it's kept
          // in its own branch rather than forced into the discovery UI.
          const data = await advancedSearch(query, resultLimit || 8);
          patchSearchState({ result: data, status: "success" });

          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 250);

          setHistory((prev) => [
            { query, timestamp: new Date().toISOString(), bestMatch: data.results?.[0]?.payload?.full_name || null },
            ...prev.filter((h) => h.query !== query),
          ].slice(0, 25));
          return;
        }

        const data = await discoverRepositories({ query, resultLimit });

        patchSearchState({ result: data, status: "success" });

        setTimeout(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }, 250);

        setHistory((prev) => [
          { query, timestamp: new Date().toISOString(), bestMatch: data.best_external_candidate?.full_name || null },
          ...prev.filter((h) => h.query !== query),
        ].slice(0, 25));
      } catch (err) {
        patchSearchState({ error: err.message || "Search failed.", status: "error" });
      }
    },
    [setHistory]
  );

  useEffect(() => {
  if (initialQuery === "") {
    patchSearchState({ activeQuery: "", result: null, error: null, status: "idle" });
    return;
  }

  if (initialQuery) {
    patchSearchState({ activeQuery: initialQuery });
  }
}, [initialQuery]);

  const alternatives = (result?.external_recommendations || []).filter(
    (repo) => repo.full_name !== result?.best_external_candidate?.full_name
  );

  return (
    <Box pad={{ horizontal: "large", vertical: "large" }} gap="18px" style={{ maxWidth: "1200px", width:"100%" }}>
      <Box gap="6px">
        <Heading level={2} margin="none" color="text-primary" size="26px">
          Repository Discovery
        </Heading>
        <Text color="text-secondary" size="15px">Find and reuse the best existing repositories for your project.</Text>
      </Box>

      <SearchWorkspace onSearch={runSearch} loading={status === "loading"} initialQuery={activeQuery} />

      {status === "loading" && (
        <Box gap="18px">
          <ThinkingTimeline active />
          <RepositorySkeletonList count={4} />
        </Box>
      )}

      {status === "error" && (
        <ErrorState message={error} onRetry={() => runSearch({ query: activeQuery, resultLimit: 5, mode: searchMode })} />
      )}

      {status === "idle" && activeQuery.trim() === "" && (
        <EmptyState
          icon={GenAI}
          title="Describe what you're building"
          subtitle="Argus will search GitHub and recommend repositories you can reuse, fork, or reference — instead of building from scratch."
        />
      )}

      {status === "success" && result && searchMode === "portfolio" && (
        <Box ref={resultsRef} gap="18px">
          <AdvancedSearchResults results={result.results} />
        </Box>
      )}

      {status === "success" && result && searchMode === "discover" && (
        <Box
          ref={resultsRef}
          gap="18px"
        >
          <RequirementIntelligencePanel
            requirementIntelligence={result.requirement_intelligence}
            queryPlan={result.query_plan}
          />

          {result.best_external_candidate ? (
            <FeaturedRepositoryCard
              repository={result.best_external_candidate}
              isSaved={isSaved(result.best_external_candidate.full_name)}
              onToggleSave={toggleSave}
            />
          ) : (
            <EmptyState title="No strong match found" subtitle="Consider building this capability new, or broadening your query." />
          )}

          {alternatives.length > 0 && (
            <Button
              secondary
              label="View Alternative Repositories"
              onClick={() =>
                alternativesRef.current?.scrollIntoView({
                  behavior:"smooth",
                  block:"start"
                })
              }
            />
          )}

          <Box ref={alternativesRef}>
            <RepositoryList
              repositories={alternatives}
              isSaved={isSaved}
              onToggleSave={toggleSave}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

