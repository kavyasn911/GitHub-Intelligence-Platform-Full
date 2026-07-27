import React, { useState } from "react";
import { Box, Heading, Text, TextInput, Button, Tabs, Tab } from "grommet";
import { Nodes, Refresh, Search } from "grommet-icons";
import { Badge } from "../components/common/Badge";
import { InlineSpinner, EmptyState, ErrorState } from "../components/common/StateViews";
import { useAsyncData } from "../hooks/useAsyncData";
import { getGraphStatistics, synchronizeGraph, getTechnologyRepositories } from "../services/systemApi";
import { getRepositoryGraph, getRelatedRepositories } from "../services/intelligenceApi";

function StatCard({ label, value }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="4px" basis="160px" flex>
      <Text size="xsmall" color="text-tertiary">{label}</Text>
      <Text size="24px" weight={700} color="text-primary">{value ?? "—"}</Text>
    </Box>
  );
}

function CountBar({ entries, tone = "accent-1" }) {
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return (
    <Box gap="8px">
      {entries.map(([label, count]) => (
        <Box key={label} gap="4px">
          <Box direction="row" justify="between">
            <Text size="small" color="text-primary">{label}</Text>
            <Text size="small" color="text-tertiary">{count}</Text>
          </Box>
          <Box height="6px" round="999px" background="bg-surface-hover" overflow="hidden">
            <Box height="6px" width={`${Math.max(4, (count / max) * 100)}%`} background={tone} round="999px" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function RepositoryExplorer() {
  const [name, setName] = useState("");
  const [activeName, setActiveName] = useState(null);

  const graph = useAsyncData(() => (activeName ? getRepositoryGraph(activeName) : Promise.resolve(null)), [activeName]);
  const related = useAsyncData(() => (activeName ? getRelatedRepositories(activeName, 6) : Promise.resolve(null)), [activeName]);

  function submit(e) {
    e.preventDefault();
    if (name.trim()) setActiveName(name.trim());
  }

  return (
    <Box gap="16px">
      <Box as="form" onSubmit={submit} direction="row" gap="8px">
        <Box flex>
          <TextInput placeholder="Repository name (e.g. fastapi-auth-service)" value={name} onChange={(e) => setName(e.target.value)} />
        </Box>
        <Button type="submit" primary icon={<Search size="16px" />} label="Explore" disabled={!name.trim()} />
      </Box>

      {!activeName && (
        <EmptyState title="Look up a repository" subtitle="Enter a repository name to see its graph connections and related repositories." icon={Nodes} />
      )}

      {activeName && graph.status === "loading" && <InlineSpinner label={`Querying graph for ${activeName}…`} />}
      {activeName && graph.status === "error" && <ErrorState message={graph.error} onRetry={() => setActiveName(name.trim())} />}

      {activeName && graph.status === "success" && (
        <Box gap="16px">
          <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="10px">
            <Text weight={700} color="text-primary">Graph connections</Text>
            {graph.data?.status === "not_found" || !graph.data?.repository ? (
              <Text size="small" color="text-tertiary">Not found in the synced knowledge graph yet — try syncing the graph, or this repository hasn't been indexed.</Text>
            ) : (
              <Box gap="8px">
                <Text size="small" color="text-secondary">{graph.data.repository?.full_name || graph.data.repository?.name}</Text>
                {Object.entries(graph.data.connections || graph.data.relationships || {}).map(([type, items]) => (
                  <Box key={type} gap="4px">
                    <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>{type}</Text>
                    <Box direction="row" wrap gap="6px">
                      {(Array.isArray(items) ? items : []).slice(0, 12).map((item, i) => (
                        <Badge key={i} label={typeof item === "string" ? item : item?.name || JSON.stringify(item)} tone="info" />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="10px">
            <Text weight={700} color="text-primary">Related repositories</Text>
            {related.status === "loading" && <InlineSpinner label="Finding related repositories…" />}
            {related.status === "success" && (related.data?.related_repositories?.length ?? related.data?.results?.length ?? 0) === 0 && (
              <Text size="small" color="text-tertiary">No related repositories found in the graph.</Text>
            )}
            {related.status === "success" && (
              <Box gap="6px">
                {(related.data?.related_repositories || related.data?.results || []).map((repo, i) => (
                  <Box key={i} direction="row" align="center" justify="between" pad="8px" round="8px" background="bg-surface-hover">
                    <Text size="small" color="text-primary">{repo.name || repo.full_name || repo}</Text>
                    {repo.shared_technologies && <Badge label={`${repo.shared_technologies} shared`} tone="text-tertiary" />}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function TechnologyExplorer() {
  const [tech, setTech] = useState("");
  const [activeTech, setActiveTech] = useState(null);

  const result = useAsyncData(() => (activeTech ? getTechnologyRepositories(activeTech) : Promise.resolve(null)), [activeTech]);

  function submit(e) {
    e.preventDefault();
    if (tech.trim()) setActiveTech(tech.trim());
  }

  const repos = result.data?.repositories || result.data?.results || [];

  return (
    <Box gap="16px">
      <Box as="form" onSubmit={submit} direction="row" gap="8px">
        <Box flex>
          <TextInput placeholder="Technology name (e.g. FastAPI, Redis, React)" value={tech} onChange={(e) => setTech(e.target.value)} />
        </Box>
        <Button type="submit" primary icon={<Search size="16px" />} label="Explore" disabled={!tech.trim()} />
      </Box>

      {!activeTech && (
        <EmptyState title="Look up a technology" subtitle="See every indexed repository that uses a given technology, via the technology graph." icon={Nodes} />
      )}

      {activeTech && result.status === "loading" && <InlineSpinner label={`Querying repositories using ${activeTech}…`} />}
      {activeTech && result.status === "error" && <ErrorState message={result.error} onRetry={() => setActiveTech(tech.trim())} />}
      {activeTech && result.status === "success" && repos.length === 0 && (
        <Text size="small" color="text-tertiary">No repositories found using "{activeTech}" in the graph.</Text>
      )}
      {activeTech && result.status === "success" && repos.length > 0 && (
        <Box gap="6px">
          {repos.map((repo, i) => (
            <Box key={i} direction="row" align="center" justify="between" pad="10px" round="8px" background="bg-surface" border={{ color: "border-subtle" }}>
              <Text size="small" color="text-primary">{repo.name || repo.full_name || repo}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export function KnowledgeGraphPage() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [statsVersion, setStatsVersion] = useState(0);

  const stats = useAsyncData(getGraphStatistics, [statsVersion]);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await synchronizeGraph();
      setSyncResult({ ok: true, message: res.message || "Graph synchronized." });
      setStatsVersion((v) => v + 1);
    } catch (err) {
      setSyncResult({ ok: false, message: err.message || "Sync failed." });
    } finally {
      setSyncing(false);
    }
  }

  const nodeEntries = Object.entries(stats.data?.nodes || {});
  const relEntries = Object.entries(stats.data?.relationships || {});

  return (
    <Box gap="24px" style={{ maxWidth: "1000px", width: "100%" }}>
      <Box direction="row" align="center" justify="between">
        <Box gap="4px">
          <Heading level={2} margin="none" color="text-primary">Knowledge Graph</Heading>
          <Text color="text-secondary">Repositories, technologies, and skills connected through the Neo4j graph.</Text>
        </Box>
        <Button
          secondary
          icon={<Refresh size="16px" />}
          label={syncing ? "Syncing…" : "Sync graph"}
          onClick={handleSync}
          disabled={syncing}
        />
      </Box>

      {syncResult && (
        <Text size="small" color={syncResult.ok ? "text-secondary" : "critical"}>{syncResult.message}</Text>
      )}

      {stats.status === "loading" && <InlineSpinner label="Loading graph statistics…" />}
      {stats.status === "error" && <ErrorState message={stats.error} onRetry={() => setStatsVersion((v) => v + 1)} />}

      {stats.status === "success" && (
        <>
          <Box direction="row" wrap gap="12px">
            <StatCard label="Total nodes" value={stats.data.total_nodes} />
            <StatCard label="Total relationships" value={stats.data.total_relationships} />
            <StatCard label="Node types" value={nodeEntries.length} />
            <StatCard label="Relationship types" value={relEntries.length} />
          </Box>

          <Box direction="row" wrap gap="16px">
            <Box flex basis="360px" background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="12px">
              <Text weight={700} color="text-primary">Nodes by type</Text>
              {nodeEntries.length === 0 ? (
                <Text size="small" color="text-tertiary">No nodes recorded — try syncing the graph.</Text>
              ) : (
                <CountBar entries={nodeEntries} tone="accent-1" />
              )}
            </Box>
            <Box flex basis="360px" background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="12px">
              <Text weight={700} color="text-primary">Relationships by type</Text>
              {relEntries.length === 0 ? (
                <Text size="small" color="text-tertiary">No relationships recorded — try syncing the graph.</Text>
              ) : (
                <CountBar entries={relEntries} tone="info" />
              )}
            </Box>
          </Box>
        </>
      )}

      <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px">
        <Tabs>
          <Tab title="Explore by repository">
            <Box pad={{ top: "16px" }}>
              <RepositoryExplorer />
            </Box>
          </Tab>
          <Tab title="Explore by technology">
            <Box pad={{ top: "16px" }}>
              <TechnologyExplorer />
            </Box>
          </Tab>
        </Tabs>
      </Box>
    </Box>
  );
}
