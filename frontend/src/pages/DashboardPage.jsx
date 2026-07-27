import React from "react";
import { Box, Heading, Text, Button } from "grommet";
import {
  Search, StatusGood, StatusWarning, StatusCritical,
  Chat, Nodes, Bookmark, System as SystemIcon, FormNext,
} from "grommet-icons";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSavedRepositories } from "../hooks/useSavedRepositories";
import { useAsyncData } from "../hooks/useAsyncData";
import { Badge } from "../components/common/Badge";
import { InlineSpinner } from "../components/common/StateViews";
import { Donut } from "../components/common/Donut";
import { timeAgo } from "../utils/format";
import {
  getPortfolioOverview,
  getSystemHealth,
  getVectorStats,
  getAuditEvents,
  getGraphStatistics,
} from "../services/systemApi";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StatCard({ label, value, hint }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="4px" basis="180px" flex>
      <Text size="xsmall" color="text-tertiary">{label}</Text>
      <Text size="24px" weight={700} color="text-primary">{value}</Text>
      {hint && <Text size="10px" color="text-tertiary">{hint}</Text>}
    </Box>
  );
}

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

function QuickAction({ icon: Icon, label, hint, onClick }) {
  return (
    <Button plain onClick={onClick} style={{ flex: "1 1 220px" }}>
      <Box
        direction="row"
        align="center"
        gap="12px"
        pad="16px"
        round="12px"
        background="bg-surface"
        border={{ color: "border-subtle" }}
        className="quick-action-card"
      >
        <Box background="accent-soft" round="8px" pad="8px">
          <Icon size="18px" color="accent-1" />
        </Box>
        <Box flex>
          <Text size="small" weight={700} color="text-primary">{label}</Text>
          <Text size="10px" color="text-tertiary">{hint}</Text>
        </Box>
        <FormNext size="16px" color="text-tertiary" />
      </Box>
    </Button>
  );
}

export function DashboardPage({ onNewSearch, onNavigate }) {
  const [history] = useLocalStorage("argus:history", []);
  const { saved } = useSavedRepositories();

  const portfolio = useAsyncData(getPortfolioOverview, []);
  const health = useAsyncData(getSystemHealth, []);
  const vectors = useAsyncData(getVectorStats, []);
  const audit = useAsyncData(() => getAuditEvents(6), []);
  const graph = useAsyncData(getGraphStatistics, []);

  const portfolioData = portfolio.data?.portfolio || {};
  const skillsData = portfolio.data?.skills || {};
  const technologyData = portfolio.data?.technologies || {};
  const nodeEntries = Object.entries(graph.data?.nodes || {}).sort((a, b) => b[1] - a[1]);

  return (
    <Box gap="24px" style={{ width: "100%" }}>
      <Box direction="row" align="center" justify="between" wrap gap="12px">
        <Box gap="4px">
          <Heading level={2} margin="none" color="text-primary">{greeting()}, Kavya</Heading>
          <Text color="text-secondary">Portfolio, system health, and discovery activity at a glance.</Text>
        </Box>
        <Button primary icon={<Search size="16px" />} label="New Search" onClick={onNewSearch} />
      </Box>

      <Box direction="row" wrap gap="12px">
        <StatCard label="Searches run" value={history.length} />
        <StatCard label="Saved repositories" value={saved.length} />
        <StatCard
          label="Indexed repositories"
          value={portfolio.status === "loading" ? "…" : portfolioData.repository_count ?? "—"}
          hint="Portfolio overview"
        />
        <StatCard
          label="Unique technologies"
          value={portfolio.status === "loading" ? "…" : technologyData.unique_technologies ?? "—"}
          hint="Technology landscape"
        />
        <StatCard
          label="Vectors stored"
          value={vectors.status === "loading" ? "…" : vectors.data?.vectors_stored ?? "—"}
          hint={vectors.data?.collection}
        />
      </Box>

      <Panel title="System health" right={onNavigate && <Button size="small" plain label="View system status" onClick={() => onNavigate("system")} />}>
        {health.status === "loading" && <InlineSpinner label="Checking system health…" />}
        {health.status === "error" && <Text size="small" color="text-tertiary">Backend is unreachable — {health.error}</Text>}
        {health.status === "success" && (
          <Box gap="small">
            <Badge label={health.data.status === "healthy" ? "All systems healthy" : "Degraded"} tone={health.data.status === "healthy" ? "accent" : "warning"} />
            <Box direction="row" wrap gap="8px">
              {Object.entries(health.data.services || {}).map(([name, service]) => (
                <ServiceChip key={name} name={name} service={service} />
              ))}
            </Box>
          </Box>
        )}
      </Panel>

      <Box direction="row" wrap gap="16px">
        <Box flex basis="380px" gap="16px">
          <Panel title="Technology & skill intelligence">
            {portfolio.status === "loading" && <InlineSpinner label="Analyzing organization portfolio…" />}
            {portfolio.status === "error" && <Text size="small" color="text-tertiary">Not available — {portfolio.error}</Text>}
            {portfolio.status === "success" && (
              <Box gap="10px">
                <Box direction="row" gap="24px" wrap>
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
                    {skillsData.recommendations.slice(0, 3).map((r, i) => (
                      <Text key={i} size="small" color="text-secondary">• {r}</Text>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Panel>

          <Panel title="Knowledge graph composition" right={onNavigate && <Button size="small" plain label="Explore" onClick={() => onNavigate("knowledge-graph")} />}>
            {graph.status === "loading" && <InlineSpinner label="Loading graph statistics…" />}
            {graph.status === "error" && <Text size="small" color="text-tertiary">Not available — {graph.error}</Text>}
            {graph.status === "success" && nodeEntries.length === 0 && (
              <Text size="small" color="text-tertiary">No graph data yet — sync the knowledge graph to populate this.</Text>
            )}
            {nodeEntries.length > 0 && (
              <Donut entries={nodeEntries} centerValue={graph.data.total_nodes} centerLabel="nodes" size={132} thickness={18} />
            )}
          </Panel>
        </Box>

        <Box flex basis="380px" gap="16px">
          <Panel title="Recent activity">
            {audit.status === "loading" && <InlineSpinner label="Loading recent activity…" />}
            {audit.status === "error" && <Text size="small" color="text-tertiary">Not available — {audit.error}</Text>}
            {audit.status === "success" && (audit.data.events?.length ?? 0) === 0 && (
              <Text size="small" color="text-tertiary">No recent audit events.</Text>
            )}
            {audit.status === "success" && audit.data.events?.length > 0 && (
              <Box gap="6px">
                {audit.data.events.map((event) => (
                  <Box key={event.event_id} pad="8px" round="8px" background="bg-surface-hover" gap="2px">
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

          <Panel title="Recent discoveries" right={<Button size="small" plain label="View all" onClick={() => onNavigate?.("history")} />}>
            {history.length === 0 ? (
              <Text size="small" color="text-tertiary">No searches yet — try Repository Discovery.</Text>
            ) : (
              <Box gap="6px">
                {history.slice(0, 5).map((entry) => (
                  <Box key={entry.timestamp} pad="8px" round="8px" background="bg-surface-hover" gap="2px">
                    <Text size="small" weight={600} color="text-primary" truncate>{entry.query}</Text>
                    <Text size="10px" color="text-tertiary">
                      {entry.bestMatch ? `Best match: ${entry.bestMatch} · ` : ""}{timeAgo(entry.timestamp)}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Panel>

          <Panel title="Recently saved" right={<Button size="small" plain label="View all" onClick={() => onNavigate?.("saved")} />}>
            {saved.length === 0 ? (
              <Text size="small" color="text-tertiary">Save a repository from Discovery to see it here.</Text>
            ) : (
              <Box gap="6px">
                {saved.slice(0, 5).map((repo) => (
                  <Box key={repo.full_name} pad="8px" round="8px" background="bg-surface-hover" gap="2px">
                    <Text size="small" weight={600} color="text-primary" truncate>{repo.full_name}</Text>
                    <Text size="10px" color="text-tertiary">{repo.language ? `${repo.language} · ` : ""}{timeAgo(repo.savedAt)}</Text>
                  </Box>
                ))}
              </Box>
            )}
          </Panel>
        </Box>
      </Box>

      <Box gap="12px">
        <Text weight={700} color="text-primary">Quick actions</Text>
        <Box direction="row" wrap gap="12px">
          <QuickAction icon={Search} label="New Search" hint="Discover repositories to reuse" onClick={onNewSearch} />
          <QuickAction icon={Chat} label="AI Workspace" hint="Chat with the intelligence agents" onClick={() => onNavigate?.("ai-workspace")} />
          <QuickAction icon={Nodes} label="Knowledge Graph" hint="Explore repository relationships" onClick={() => onNavigate?.("knowledge-graph")} />
          <QuickAction icon={Bookmark} label="Saved Repositories" hint="View and manage saved repos" onClick={() => onNavigate?.("saved")} />
          <QuickAction icon={SystemIcon} label="System Status" hint="Check platform health" onClick={() => onNavigate?.("system")} />
        </Box>
      </Box>
    </Box>
  );
}
