import React, { useCallback, useEffect, useState, useRef } from "react";
import { Box, Heading, Text, Button } from "grommet";
import { GenAI } from "grommet-icons";
import { SearchWorkspace } from "../components/discovery/SearchWorkspace";
import { RequirementIntelligencePanel } from "../components/discovery/RequirementIntelligencePanel";
import { ThinkingTimeline } from "../components/timeline/ThinkingTimeline";
import { FeaturedRepositoryCard } from "../components/repository/FeaturedRepositoryCard";
import { RepositoryList } from "../components/repository/RepositoryList";
import { RepositorySkeletonList } from "../components/repository/RepositorySkeleton";
import { EmptyState, ErrorState } from "../components/common/StateViews";
import { discoverRepositories } from "../services/discoveryApi";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSavedRepositories } from "../hooks/useSavedRepositories";

export function DiscoveryPage({ initialQuery }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeQuery, setActiveQuery] = useState(initialQuery || "");
  const [, setHistory] = useLocalStorage("argus:history", []);
  const { isSaved, toggleSave } = useSavedRepositories();

const resultsRef = useRef(null);
const alternativesRef = useRef(null);

  const runSearch = useCallback(
    async ({ query, resultLimit }) => {
      setStatus("loading");
      setError(null);
      setActiveQuery(query);

      try {
        const data = await discoverRepositories({ query, resultLimit });

        setResult(data);
        setStatus("success");

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
        setError(err.message || "Discovery failed.");
        setStatus("error");
      }
    },
    [setHistory]
  );

  useEffect(() => {
  if (initialQuery === "") {
    setActiveQuery("");
    setResult(null);
    setError(null);
    setStatus("idle");
    return;
  }

  if (initialQuery) {
    setActiveQuery(initialQuery);
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
        <ErrorState message={error} onRetry={() => runSearch({ query: activeQuery, resultLimit: 5 })} />
      )}

      {status === "idle" && activeQuery.trim() === "" && (
        <EmptyState
          icon={GenAI}
          title="Describe what you're building"
          subtitle="Argus will search GitHub and recommend repositories you can reuse, fork, or reference — instead of building from scratch."
        />
      )}

      {status === "success" && result && (
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

