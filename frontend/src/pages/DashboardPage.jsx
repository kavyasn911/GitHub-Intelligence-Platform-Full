import React from "react";
import { Box, Heading, Text, Button } from "grommet";
import { Search, StatusGood, StatusWarning, StatusCritical } from "grommet-icons";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSavedRepositories } from "../hooks/useSavedRepositories";
import { useAsyncData } from "../hooks/useAsyncData";
import { Badge } from "../components/common/Badge";
import { InlineSpinner } from "../components/common/StateViews";
import { timeAgo } from "../utils/format";
import {
  getPortfolioOverview,
  getSystemHealth,
  getPerformanceMetrics,
  getVectorStats,
  getAuditEvents,
} from "../services/systemApi";

function StatCard({ label, value, hint }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="medium" gap="4px" basis="180px" flex>
      <Text size="xsmall" color="text-tertiary">{label}</Text>
      <Text size="24px" weight={700} color="text-primary">{value}</Text>
      {hint && <Text size="10px" color="text-tertiary">{hint}</Text>}
    </Box>
  );
}

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

const HEALTH_ICON = {
  healthy: StatusGood,
  degraded: StatusWarning,
  unhealthy: StatusCritical,
};

function ServiceChip({ name, service }) {
  const Icon = HEALTH_ICON[service?.status] || StatusWarning;
  const tone = service?.status === "healthy" ? "accent" : service?.status === "unhealthy" ? "critical" : "warning";
  return (
    <Box direction="row" align="center" gap="6px" pad={{ vertical: "6px", horizontal: "10px" }} round="999px" background="bg-surface-hover" border={{ color: "border-subtle" }}>
      <Icon size="14px" color={tone === "accent" ? "accent-1" : tone} />
      <Text size="xsmall" weight={600} color="text-primary" style={{ textTransform: "capitalize" }}>{name}</Text>
      <Badge label={service?.status || "unknown"} tone={tone} />
    </Box>
  );
}

export function DashboardPage({ onNewSearch }) {
  const [history] = useLocalStorage("argus:history", []);
  const { saved } = useSavedRepositories();

  const portfolio = useAsyncData(getPortfolioOverview, []);
  const health = useAsyncData(getSystemHealth, []);
  const metrics = useAsyncData(getPerformanceMetrics, []);
  const vectors = useAsyncData(getVectorStats, []);
  const audit = useAsyncData(() => getAuditEvents(8), []);

  const portfolioData = portfolio.data?.portfolio || {};
  const skillsData = portfolio.data?.skills || {};
  const technologyData = portfolio.data?.technologies || {};
  const operations = metrics.data?.operations || {};
  const operationEntries = Object.entries(operations);

  return (
    <Box pad={{ horizontal: "medium", vertical: "large" }} gap="medium" style={{ maxWidth: "1080px", width: "100%" }}>
      <Box direction="row" align="center" justify="between">
        <Box gap="4px">
          <Heading level={2} margin="none" color="text-primary">Welcome back, Kavya</Heading>
          <Text color="text-secondary">Portfolio, system health, and discovery activity at a glance.</Text>
        </Box>
        <Button primary icon={<Search size="16px" />} label="New Search" onClick={onNewSearch} />
      </Box>

      <Box direction="row" wrap gap="small">
        <StatCard label="Searches run" value={history.length} />
        <StatCard label="Saved repositories" value={saved.length} />
        <StatCard
          label="Indexed repositories"
          value={portfolio.status === "loading" ? "…" : portfolioData.repository_count ?? "—"}
          hint="Portfolio Overview"
        />
        <StatCard
          label="Unique technologies"
          value={portfolio.status === "loading" ? "…" : technologyData.unique_technologies ?? "—"}
          hint="Technology Landscape"
        />
        <StatCard
          label="Vectors stored"
          value={vectors.status === "loading" ? "…" : vectors.data?.vectors_stored ?? "—"}
          hint={vectors.data?.collection}
        />
      </Box>

      <Panel title="System Health">
        {health.status === "loading" && <InlineSpinner label="Checking system health…" />}
        {health.status === "error" && (
          <Text size="small" color="text-tertiary">Backend is unreachable — {health.error}</Text>
        )}
        {health.status === "success" && (
          <Box gap="small">
            <Badge
              label={health.data.status === "healthy" ? "All systems healthy" : "Degraded"}
              tone={health.data.status === "healthy" ? "accent" : "warning"}
            />
            <Box direction="row" wrap gap="8px">
              {Object.entries(health.data.services || {}).map(([name, service]) => (
                <ServiceChip key={name} name={name} service={service} />
              ))}
            </Box>
          </Box>
        )}
      </Panel>

      <Box direction="row" wrap gap="medium">
        <Box flex basis="360px" gap="medium">
          <Panel title="Technology & Skill Intelligence">
            {portfolio.status === "loading" && <InlineSpinner label="Analyzing organization portfolio…" />}
            {portfolio.status === "error" && (
              <Text size="small" color="text-tertiary">Not available — {portfolio.error}</Text>
            )}
            {portfolio.status === "success" && (
              <Box gap="10px">
                <Box direction="row" gap="medium" wrap>
                  <Box gap="2px">
                    <Text size="xsmall" color="text-tertiary">Unique skills detected</Text>
                    <Text size="small" weight={600} color="text-primary">{skillsData.unique_skills ?? "—"}</Text>
                  </Box>
                  <Box gap="2px">
                    <Text size="xsmall" color="text-tertiary">Avg skills / repo</Text>
                    <Text size="small" weight={600} color="text-primary">{skillsData.average_skills_per_repository ?? "—"}</Text>
                  </Box>
                  <Box gap="2px">
                    <Text size="xsmall" color="text-tertiary">Graph nodes</Text>
                    <Text size="small" weight={600} color="text-primary">{portfolioData.total_graph_nodes ?? "—"}</Text>
                  </Box>
                  <Box gap="2px">
                    <Text size="xsmall" color="text-tertiary">Graph relationships</Text>
                    <Text size="small" weight={600} color="text-primary">{portfolioData.total_graph_relationships ?? "—"}</Text>
                  </Box>
                </Box>
                {skillsData.recommendations?.length > 0 && (
                  <Box gap="4px">
                    {skillsData.recommendations.map((r, i) => (
                      <Text key={i} size="small" color="text-secondary">• {r}</Text>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Panel>

          <Panel title="Performance Metrics">
            {metrics.status === "loading" && <InlineSpinner label="Collecting operation timings…" />}
            {metrics.status === "success" && operationEntries.length === 0 && (
              <Text size="small" color="text-tertiary">No operations recorded yet this session.</Text>
            )}
            {operationEntries.length > 0 && (
              <Box gap="6px">
                {operationEntries.map(([op, stat]) => (
                  <Box key={op} direction="row" align="center" justify="between" pad="6px" round="8px" background="bg-surface-hover">
                    <Text size="small" color="text-primary">{op}</Text>
                    <Text size="xsmall" color="text-tertiary">
                      {stat.calls} calls · avg {stat.average_duration_ms}ms
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Panel>
        </Box>

        <Box flex basis="360px" gap="medium">
          <Panel title="Recent Activity">
            {audit.status === "loading" && <InlineSpinner label="Loading recent activity…" />}
            {audit.status === "error" && (
              <Text size="small" color="text-tertiary">Not available — {audit.error}</Text>
            )}
            {audit.status === "success" && (audit.data.events?.length ?? 0) === 0 && (
              <Text size="small" color="text-tertiary">No recent audit events.</Text>
            )}
            {audit.status === "success" && audit.data.events?.length > 0 && (
              <Box gap="6px">
                {audit.data.events.map((event) => (
                  <Box key={event.event_id} pad="6px" round="8px" background="bg-surface-hover" gap="2px">
                    <Box direction="row" align="center" justify="between">
                      <Text size="small" weight={600} color="text-primary">{event.action}</Text>
                      <Badge label={event.status} tone={event.status === "success" ? "accent" : "critical"} />
                    </Box>
                    <Text size="10px" color="text-tertiary">{timeAgo(event.timestamp)}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Panel>

          <Panel title="Recent Searches">
            {history.length === 0 ? (
              <Text size="small" color="text-tertiary">No searches yet — try Repository Discovery.</Text>
            ) : (
              <Box gap="6px">
                {history.slice(0, 6).map((entry) => (
                  <Box key={entry.timestamp} pad="6px" round="8px" background="bg-surface-hover" gap="2px">
                    <Text size="small" weight={600} color="text-primary" truncate>{entry.query}</Text>
                    <Text size="10px" color="text-tertiary">
                      {entry.bestMatch ? `Best match: ${entry.bestMatch} · ` : ""}{timeAgo(entry.timestamp)}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Panel>
        </Box>
      </Box>
    </Box>
  );
}
