import React, { useState } from "react";
import { Box, Heading, Text, Button } from "grommet";
import { Trash, StatusGood, StatusWarning, StatusCritical } from "grommet-icons";
import { Badge } from "../components/common/Badge";
import { InlineSpinner } from "../components/common/StateViews";
import { useAsyncData } from "../hooks/useAsyncData";
import { timeAgo } from "../utils/format";
import {
  getGraphStatistics,
  getCacheStatistics,
  clearCache,
  getLiveness,
  getReadiness,
  getIndexingJobs,
} from "../services/systemApi";

function Panel({ title, children, right }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="medium" gap="small">
      <Box direction="row" align="center" justify="between">
        <Text weight={700} color="text-primary">{title}</Text>
        {right}
      </Box>
      {children}
    </Box>
  );
}

function StatPair({ label, value }) {
  return (
    <Box gap="2px" basis="140px" flex>
      <Text size="xsmall" color="text-tertiary">{label}</Text>
      <Text size="small" weight={600} color="text-primary">{value ?? "—"}</Text>
    </Box>
  );
}

const JOB_TONE = {
  completed: "accent",
  success: "accent",
  running: "info",
  failed: "critical",
  pending: "warning",
};

export function SystemPage() {
  const [cacheVersion, setCacheVersion] = useState(0);
  const [clearing, setClearing] = useState(false);
  const [clearResult, setClearResult] = useState(null);

  const graph = useAsyncData(getGraphStatistics, []);
  const cache = useAsyncData(getCacheStatistics, [cacheVersion]);
  const liveness = useAsyncData(getLiveness, []);
  const readiness = useAsyncData(getReadiness, []);
  const jobs = useAsyncData(getIndexingJobs, []);

  async function handleClearCache() {
    setClearing(true);
    setClearResult(null);
    try {
      const result = await clearCache();
      setClearResult(result);
      setCacheVersion((v) => v + 1);
    } catch (err) {
      setClearResult({ status: "error", error: err.message });
    } finally {
      setClearing(false);
    }
  }

  const nodeEntries = Object.entries(graph.data?.nodes || {});
  const relEntries = Object.entries(graph.data?.relationships || {});
  const jobList = jobs.data?.jobs || [];

  return (
    <Box pad={{ horizontal: "medium", vertical: "large" }} gap="medium" style={{ maxWidth: "1080px", width: "100%" }}>
      <Box gap="4px">
        <Heading level={2} margin="none" color="text-primary">System</Heading>
        <Text color="text-secondary">Knowledge graph, cache, indexing, and readiness — the operational side of the platform.</Text>
      </Box>

      <Box direction="row" wrap gap="medium">
        <Panel title="Liveness & Readiness">
          {(liveness.status === "loading" || readiness.status === "loading") && <InlineSpinner label="Checking probes…" />}
          <Box direction="row" wrap gap="8px">
            {liveness.status === "success" && (
              <Badge label={`Liveness: ${liveness.data.status}`} tone={liveness.data.status === "alive" ? "accent" : "critical"} />
            )}
            {readiness.status === "success" && (
              <Badge label={`Readiness: ${readiness.data.status}`} tone={readiness.data.ready ? "accent" : "warning"} />
            )}
            {liveness.status === "error" && <Badge label="Liveness: unreachable" tone="critical" />}
            {readiness.status === "error" && <Badge label="Readiness: unreachable" tone="critical" />}
          </Box>
          {readiness.status === "success" && Object.keys(readiness.data.services || {}).length > 0 && (
            <Box direction="row" wrap gap="8px" margin={{ top: "6px" }}>
              {Object.entries(readiness.data.services).map(([name, service]) => {
                const Icon = service?.status === "healthy" ? StatusGood : service?.status === "unhealthy" ? StatusCritical : StatusWarning;
                return (
                  <Box key={name} direction="row" align="center" gap="6px" pad={{ vertical: "6px", horizontal: "10px" }} round="999px" background="bg-surface-hover" border={{ color: "border-subtle" }}>
                    <Icon size="14px" color={service?.status === "healthy" ? "accent-1" : service?.status === "unhealthy" ? "critical" : "warning"} />
                    <Text size="xsmall" weight={600} color="text-primary" style={{ textTransform: "capitalize" }}>{name}</Text>
                  </Box>
                );
              })}
            </Box>
          )}
        </Panel>

        <Panel
          title="Cache"
          right={
            <Button
              size="small"
              secondary
              icon={<Trash size="14px" />}
              label={clearing ? "Clearing…" : "Clear Cache"}
              disabled={clearing}
              onClick={handleClearCache}
            />
          }
        >
          {cache.status === "loading" && <InlineSpinner label="Reading cache stats…" />}
          {cache.status === "error" && <Text size="small" color="text-tertiary">Not available — {cache.error}</Text>}
          {cache.status === "success" && (
            <Box direction="row" wrap gap="medium">
              {Object.entries(cache.data || {}).filter(([k]) => k !== "status").map(([k, v]) => (
                <StatPair key={k} label={k.replace(/_/g, " ")} value={typeof v === "object" ? JSON.stringify(v) : String(v)} />
              ))}
            </Box>
          )}
          {clearResult && (
            <Text size="xsmall" color={clearResult.status === "error" ? "critical" : "text-tertiary"}>
              {clearResult.status === "error"
                ? `Clear failed: ${clearResult.error}`
                : `Cleared ${clearResult.deleted_keys ?? 0} cache key(s).`}
            </Text>
          )}
        </Panel>
      </Box>

      <Panel title="Knowledge Graph">
        {graph.status === "loading" && <InlineSpinner label="Querying graph statistics…" />}
        {graph.status === "error" && <Text size="small" color="text-tertiary">Not available — {graph.error}</Text>}
        {graph.status === "success" && (
          <Box gap="10px">
            <Box direction="row" gap="medium" wrap>
              <StatPair label="Total nodes" value={graph.data.total_nodes} />
              <StatPair label="Total relationships" value={graph.data.total_relationships} />
            </Box>
            {nodeEntries.length > 0 && (
              <Box gap="4px">
                <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>Nodes by label</Text>
                <Box direction="row" wrap gap="6px">
                  {nodeEntries.map(([label, count]) => (
                    <Badge key={label} label={`${label}: ${count}`} tone="info" />
                  ))}
                </Box>
              </Box>
            )}
            {relEntries.length > 0 && (
              <Box gap="4px">
                <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>Relationships by type</Text>
                <Box direction="row" wrap gap="6px">
                  {relEntries.map(([type, count]) => (
                    <Badge key={type} label={`${type}: ${count}`} tone="text-tertiary" />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Panel>

      <Panel title="Indexing Jobs">
        {jobs.status === "loading" && <InlineSpinner label="Loading indexing jobs…" />}
        {jobs.status === "error" && <Text size="small" color="text-tertiary">Not available — {jobs.error}</Text>}
        {jobs.status === "success" && jobList.length === 0 && (
          <Text size="small" color="text-tertiary">No indexing jobs recorded yet.</Text>
        )}
        {jobList.length > 0 && (
          <Box gap="6px">
            {jobList.map((job) => (
              <Box key={job.id} pad="8px" round="8px" background="bg-surface-hover" gap="2px">
                <Box direction="row" align="center" justify="between">
                  <Text size="small" weight={600} color="text-primary">Job #{job.id}</Text>
                  <Badge label={job.status} tone={JOB_TONE[job.status] || "text-tertiary"} />
                </Box>
                <Text size="xsmall" color="text-secondary">
                  {job.indexed_repositories ?? 0} indexed · {job.skipped_repositories ?? 0} skipped · {job.failed_repositories ?? 0} failed
                  {job.total_repositories != null ? ` (of ${job.total_repositories})` : ""}
                </Text>
                {job.started_at && (
                  <Text size="10px" color="text-tertiary">Started {timeAgo(job.started_at)}</Text>
                )}
                {job.error_message && (
                  <Text size="xsmall" color="critical">{job.error_message}</Text>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Panel>
    </Box>
  );
}
