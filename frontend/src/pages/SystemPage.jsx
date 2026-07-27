import React, { useState } from "react";
import { Box, Heading, Text, Button } from "grommet";
import { Trash, StatusGood, StatusWarning, StatusCritical } from "grommet-icons";
import { Badge } from "../components/common/Badge";
import { InlineSpinner, ErrorState } from "../components/common/StateViews";
import { useAsyncData } from "../hooks/useAsyncData";
import { timeAgo } from "../utils/format";
import {
  getSystemHealth,
  getCacheStatistics,
  clearCache,
  getLiveness,
  getReadiness,
  getIndexingJobs,
  getPerformanceMetrics,
} from "../services/systemApi";

function Panel({ title, children, right }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="10px">
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

const STATUS_ICON = {
  healthy: StatusGood,
  degraded: StatusWarning,
  unhealthy: StatusCritical,
};
const STATUS_TONE = {
  healthy: "accent",
  degraded: "warning",
  unhealthy: "critical",
};

function ServiceCard({ name, service }) {
  const status = service?.status || "unknown";
  const Icon = STATUS_ICON[status] || StatusWarning;
  const tone = STATUS_TONE[status] || "warning";
  return (
    <Box background="bg-surface-hover" round="10px" pad="12px" gap="6px" basis="180px" flex>
      <Box direction="row" align="center" justify="between">
        <Text size="small" weight={700} color="text-primary" style={{ textTransform: "capitalize" }}>{name}</Text>
        <Icon size="16px" color={tone === "accent" ? "accent-1" : tone} />
      </Box>
      <Badge label={status} tone={tone} />
      {service?.error && <Text size="10px" color="critical">{service.error}</Text>}
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

  const health = useAsyncData(getSystemHealth, []);
  const cache = useAsyncData(getCacheStatistics, [cacheVersion]);
  const liveness = useAsyncData(getLiveness, []);
  const readiness = useAsyncData(getReadiness, []);
  const jobs = useAsyncData(getIndexingJobs, []);
  const metrics = useAsyncData(getPerformanceMetrics, []);

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

  const jobList = jobs.data?.jobs || [];
  const operationEntries = Object.entries(metrics.data?.operations || {});

  return (
    <Box gap="24px" style={{ maxWidth: "1080px", width: "100%" }}>
      <Box gap="4px">
        <Heading level={2} margin="none" color="text-primary">System Status</Heading>
        <Text color="text-secondary">Live health of every backing service, plus cache, indexing, and performance operations.</Text>
      </Box>

      <Panel
        title="Service health"
        right={health.status === "success" && (
          <Badge label={health.data.status === "healthy" ? "All systems healthy" : "Degraded"} tone={health.data.status === "healthy" ? "accent" : "warning"} />
        )}
      >
        {health.status === "loading" && <InlineSpinner label="Checking system health…" />}
        {health.status === "error" && <ErrorState message={health.error} />}
        {health.status === "success" && (
          <Box direction="row" wrap gap="10px">
            {Object.entries(health.data.services || {}).map(([name, service]) => (
              <ServiceCard key={name} name={name} service={service} />
            ))}
          </Box>
        )}
      </Panel>

      <Box direction="row" wrap gap="16px">
        <Box flex basis="320px">
          <Panel title="Liveness & readiness">
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
          </Panel>
        </Box>

        <Box flex basis="320px">
          <Panel
            title="Cache"
            right={
              <Button
                size="small"
                secondary
                icon={<Trash size="14px" />}
                label={clearing ? "Clearing…" : "Clear cache"}
                disabled={clearing}
                onClick={handleClearCache}
              />
            }
          >
            {cache.status === "loading" && <InlineSpinner label="Reading cache stats…" />}
            {cache.status === "error" && <Text size="small" color="text-tertiary">Not available — {cache.error}</Text>}
            {cache.status === "success" && (
              <Box direction="row" wrap gap="12px">
                {Object.entries(cache.data || {}).filter(([k]) => k !== "status").map(([k, v]) => (
                  <StatPair key={k} label={k.replace(/_/g, " ")} value={typeof v === "object" ? JSON.stringify(v) : String(v)} />
                ))}
              </Box>
            )}
            {clearResult && (
              <Text size="xsmall" color={clearResult.status === "error" ? "critical" : "text-tertiary"}>
                {clearResult.status === "error" ? `Clear failed: ${clearResult.error}` : `Cleared ${clearResult.deleted_keys ?? 0} cache key(s).`}
              </Text>
            )}
          </Panel>
        </Box>
      </Box>

      <Panel title="Performance metrics">
        {metrics.status === "loading" && <InlineSpinner label="Collecting operation timings…" />}
        {metrics.status === "success" && operationEntries.length === 0 && (
          <Text size="small" color="text-tertiary">No operations recorded yet this session.</Text>
        )}
        {operationEntries.length > 0 && (
          <Box gap="6px">
            {operationEntries.map(([op, stat]) => (
              <Box key={op} direction="row" align="center" justify="between" pad="8px" round="8px" background="bg-surface-hover">
                <Text size="small" color="text-primary">{op}</Text>
                <Text size="xsmall" color="text-tertiary">{stat.calls} calls · avg {stat.average_duration_ms}ms</Text>
              </Box>
            ))}
          </Box>
        )}
      </Panel>

      <Panel title="Indexing jobs">
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
                {job.started_at && <Text size="10px" color="text-tertiary">Started {timeAgo(job.started_at)}</Text>}
                {job.error_message && <Text size="xsmall" color="critical">{job.error_message}</Text>}
              </Box>
            ))}
          </Box>
        )}
      </Panel>
    </Box>
  );
}
