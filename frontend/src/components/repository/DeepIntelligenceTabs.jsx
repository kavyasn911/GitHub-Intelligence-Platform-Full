import React, { useState } from "react";
import { Box, Text, Button, TextInput } from "grommet";
import { Cubes, ShareOption, Chat, Send, Compare, Star } from "grommet-icons";
import { Badge } from "../common/Badge";
import { InlineSpinner, ErrorState } from "../common/StateViews";
import {
  analyzeComponents,
  getRelatedRepositories,
  getGraphSimilarRepositories,
  askRepositoryAgent,
  compareRepositoryAgent,
  getRepositoryRecommendations,
} from "../../services/intelligenceApi";

const TABS = [
  { key: "components", label: "Component Intelligence", icon: Cubes },
  { key: "graph", label: "Relationships", icon: ShareOption },
  { key: "recommendations", label: "Recommendations", icon: Star },
  { key: "compare", label: "Compare", icon: Compare },
  { key: "ask", label: "Ask AI", icon: Chat },
];

function TabButton({ tab, active, onClick }) {
  const Icon = tab.icon;
  return (
    <Button plain onClick={onClick}>
      <Box
        direction="row"
        align="center"
        gap="6px"
        pad={{ vertical: "6px", horizontal: "10px" }}
        round="999px"
        background={active ? "accent-soft" : "bg-surface-hover"}
        border={{ color: active ? "accent-1" : "border-subtle" }}
      >
        <Icon size="12px" color={active ? "accent-1" : "text-tertiary"} />
        <Text size="xsmall" weight={600} color={active ? "accent-1" : "text-secondary"}>
          {tab.label}
        </Text>
      </Box>
    </Button>
  );
}

function ComponentIntelligencePane({ fullName }) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });
  const [owner, repo] = (fullName || "").split("/");

  React.useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });
    analyzeComponents(owner, repo)
      .then((data) => !cancelled && setState({ status: "success", data, error: null }))
      .catch((err) => !cancelled && setState({ status: "error", data: null, error: err.message }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName]);

  if (state.status === "loading") return <InlineSpinner label="Cloning repository and detecting components…" />;
  if (state.status === "error") return <ErrorState message={state.error} />;

  const components = state.data?.components;
  const treeSummary = state.data?.tree_summary;

  const entries = components && typeof components === "object" ? Object.entries(components) : [];

  return (
    <Box gap="10px">
      {treeSummary?.total_items != null && (
        <Text size="small" color="text-secondary">
          Scanned {treeSummary.total_items} files/directories.
        </Text>
      )}
      {entries.length === 0 ? (
        <Text size="small" color="text-tertiary">No components detected for this repository.</Text>
      ) : (
        entries.map(([key, value]) => (
          <Box key={key} gap="4px">
            <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>
              {key.replace(/_/g, " ")}
            </Text>
            {Array.isArray(value) ? (
              value.length ? (
                <Box direction="row" wrap gap="6px">
                  {value.map((v, i) => (
                    <Badge key={i} label={typeof v === "string" ? v : JSON.stringify(v)} tone="info" />
                  ))}
                </Box>
              ) : (
                <Text size="small" color="text-tertiary">None detected</Text>
              )
            ) : (
              <Text size="small" color="text-secondary">{String(value)}</Text>
            )}
          </Box>
        ))
      )}
    </Box>
  );
}

function GraphRelationshipsPane({ repositoryName }) {
  const [state, setState] = useState({ status: "idle", related: null, similar: null, error: null });

  React.useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", related: null, similar: null, error: null });
    Promise.allSettled([
      getRelatedRepositories(repositoryName),
      getGraphSimilarRepositories(repositoryName),
    ]).then(([relatedRes, similarRes]) => {
      if (cancelled) return;
      const related = relatedRes.status === "fulfilled" ? relatedRes.value : null;
      const similar = similarRes.status === "fulfilled" ? similarRes.value : null;
      setState({ status: "success", related, similar, error: null });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryName]);

  if (state.status === "loading") return <InlineSpinner label="Querying the knowledge graph…" />;

  const relatedRepos = state.related?.status === "success" ? state.related.repositories : [];
  const similarRepos = state.similar?.status === "success" ? (state.similar.repositories || state.similar.results || []) : [];
  const graphAvailable = state.related?.status === "success" || state.similar?.status === "success";

  if (!graphAvailable) {
    return (
      <Text size="small" color="text-tertiary">
        This repository hasn't been synced into the knowledge graph yet, so relationship data isn't available.
      </Text>
    );
  }

  return (
    <Box gap="12px">
      <Box gap="6px">
        <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>
          Related via shared graph entities
        </Text>
        {relatedRepos?.length ? (
          <Box gap="6px">
            {relatedRepos.map((r) => (
              <Box key={r.full_name || r.name} direction="row" align="center" justify="between" pad="6px" round="8px" background="bg-surface-hover">
                <Text size="small" color="text-primary">{r.full_name || r.name}</Text>
                <Text size="xsmall" color="text-tertiary">{r.shared_connections ?? 0} shared</Text>
              </Box>
            ))}
          </Box>
        ) : (
          <Text size="small" color="text-tertiary">No related repositories found in the graph.</Text>
        )}
      </Box>

      <Box gap="6px">
        <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>
          Graph-similar repositories
        </Text>
        {similarRepos?.length ? (
          <Box gap="6px">
            {similarRepos.map((r) => (
              <Box key={r.full_name || r.name} direction="row" align="center" justify="between" pad="6px" round="8px" background="bg-surface-hover">
                <Text size="small" color="text-primary">{r.full_name || r.name}</Text>
                {r.grade && <Badge label={r.grade} tone="accent" />}
              </Box>
            ))}
          </Box>
        ) : (
          <Text size="small" color="text-tertiary">No graph-similar repositories found.</Text>
        )}
      </Box>
    </Box>
  );
}

function RecommendationsPane({ repositoryName }) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  React.useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });
    getRepositoryRecommendations(repositoryName)
      .then((data) => !cancelled && setState({ status: "success", data, error: null }))
      .catch((err) => !cancelled && setState({ status: "error", data: null, error: err.message }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryName]);

  if (state.status === "loading") return <InlineSpinner label="Finding similar indexed repositories…" />;
  if (state.status === "error") return <ErrorState message={state.error} />;

  if (state.data?.status === "not_found" || !state.data?.recommendations?.length) {
    return (
      <Text size="small" color="text-tertiary">
        No recommendations available — this repository isn't in the indexed vector set yet.
      </Text>
    );
  }

  return (
    <Box gap="6px">
      {state.data.recommendations.map((rec) => {
        const repo = rec.repository || {};
        return (
          <Box key={rec.id} direction="row" align="center" justify="between" pad="6px" round="8px" background="bg-surface-hover">
            <Text size="small" color="text-primary">{repo.full_name || repo.name || "Unknown repository"}</Text>
            <Badge label={`${Math.round((rec.similarity_score || 0) * 100)}% similar`} tone="accent" />
          </Box>
        );
      })}
    </Box>
  );
}

function ComparePane({ repositoryName }) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });

  function runCompare() {
    setState({ status: "loading", data: null, error: null });
    compareRepositoryAgent(repositoryName)
      .then((data) => setState({ status: "success", data, error: null }))
      .catch((err) => setState({ status: "error", data: null, error: err.message }));
  }

  React.useEffect(() => {
    runCompare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryName]);

  if (state.status === "loading") return <InlineSpinner label="Comparing against related repositories…" />;
  if (state.status === "error") return <ErrorState message={state.error} onRetry={runCompare} />;

  const response = state.data?.response;
  const text = typeof response === "string" ? response : response?.answer || response?.text || JSON.stringify(response);

  return (
    <Box gap="6px">
      {state.data?.agent && <Badge label={`Agent: ${state.data.agent}`} tone="info" />}
      <Text size="small" color="text-secondary" style={{ lineHeight: "1.55", whiteSpace: "pre-wrap" }}>
        {text}
      </Text>
    </Box>
  );
}

function AskAiPane({ fullName }) {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState({ status: "idle", answer: null, error: null });

  function ask() {
    if (!question.trim()) return;
    setState({ status: "loading", answer: null, error: null });
    askRepositoryAgent(`${question} (about ${fullName})`)
      .then((data) => setState({ status: "success", answer: data, error: null }))
      .catch((err) => setState({ status: "error", answer: null, error: err.message }));
  }

  return (
    <Box gap="10px">
      <Box direction="row" gap="6px">
        <TextInput
          size="small"
          placeholder={`Ask the AI agent about ${fullName}…`}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
        />
        <Button icon={<Send size="14px" />} onClick={ask} secondary a11yTitle="Ask" />
      </Box>

      {state.status === "loading" && <InlineSpinner label="Routing to the intelligence agent…" />}
      {state.status === "error" && <ErrorState message={state.error} />}
      {state.status === "success" && (
        <Box gap="6px">
          {state.answer?.agent && <Badge label={`Agent: ${state.answer.agent}`} tone="info" />}
          <Text size="small" color="text-secondary" style={{ lineHeight: "1.55", whiteSpace: "pre-wrap" }}>
            {state.answer?.response?.answer || state.answer?.response?.text || JSON.stringify(state.answer?.response)}
          </Text>
        </Box>
      )}
    </Box>
  );
}

// Lazy on-demand access to backend capabilities that are expensive/slow
// (cloning a repo, graph traversal, LLM calls) — fetched only when the
// user opts into a specific tab, not on every card render.
export function DeepIntelligenceTabs({ repository }) {
  const [activeTab, setActiveTab] = useState(null);
  const fullName = repository.full_name;
  const repositoryName = repository.name || fullName;

  return (
    <Box gap="10px" border={{ side: "top", color: "border-subtle" }} pad={{ top: "small" }}>
      <Box direction="row" wrap gap="6px">
        {TABS.map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            active={activeTab === tab.key}
            onClick={() => setActiveTab(activeTab === tab.key ? null : tab.key)}
          />
        ))}
      </Box>

      {activeTab === "components" && <ComponentIntelligencePane fullName={fullName} />}
      {activeTab === "graph" && <GraphRelationshipsPane repositoryName={repositoryName} />}
      {activeTab === "recommendations" && <RecommendationsPane repositoryName={repositoryName} />}
      {activeTab === "compare" && <ComparePane repositoryName={repositoryName} />}
      {activeTab === "ask" && <AskAiPane fullName={fullName} />}
    </Box>
  );
}
