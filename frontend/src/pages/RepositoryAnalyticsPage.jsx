import React, { useState } from "react";
import { Box, Heading, Text, TextInput, Button, Tabs, Tab } from "grommet";
import { Analytics, Search } from "grommet-icons";
import { Badge } from "../components/common/Badge";
import { InlineSpinner, EmptyState, ErrorState } from "../components/common/StateViews";
import { useAsyncData } from "../hooks/useAsyncData";
import { getPortfolioOverview } from "../services/systemApi";
import {
  getRepositoryAnalysis,
  getRepositoryReport,
  getDuplicationAnalysis,
} from "../services/intelligenceApi";

function StatCard({ label, value }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="4px" basis="160px" flex>
      <Text size="xsmall" color="text-tertiary">{label}</Text>
      <Text size="24px" weight={700} color="text-primary">{value ?? "—"}</Text>
    </Box>
  );
}

function Panel({ title, children }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px" gap="10px">
      <Text weight={700} color="text-primary">{title}</Text>
      {children}
    </Box>
  );
}

function RepositoryLookup() {
  const [name, setName] = useState("");
  const [activeName, setActiveName] = useState(null);

  const analysis = useAsyncData(() => (activeName ? getRepositoryAnalysis(activeName) : Promise.resolve(null)), [activeName]);
  const report = useAsyncData(() => (activeName ? getRepositoryReport(activeName) : Promise.resolve(null)), [activeName]);
  const duplication = useAsyncData(() => (activeName ? getDuplicationAnalysis(activeName, 5) : Promise.resolve(null)), [activeName]);

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
        <Button type="submit" primary icon={<Search size="16px" />} label="Analyze" disabled={!name.trim()} />
      </Box>

      {!activeName && (
        <EmptyState title="Look up a repository" subtitle="Enter a repository name to see its deterministic analysis, an AI-grounded report, and duplication overlap with the rest of the portfolio." icon={Analytics} />
      )}

      {activeName && (analysis.status === "loading" || report.status === "loading") && (
        <InlineSpinner label={`Analyzing ${activeName}…`} />
      )}

      {activeName && analysis.status === "success" && (
        <Panel title="Deterministic analysis">
          {analysis.data?.status === "not_found" || !analysis.data ? (
            <Text size="small" color="text-tertiary">Not available for this repository.</Text>
          ) : (
            <Box gap="6px">
              {Object.entries(analysis.data.analysis || analysis.data).filter(([k]) => k !== "status").map(([k, v]) => (
                <Box key={k} direction="row" justify="between" gap="16px">
                  <Text size="small" color="text-secondary" style={{ textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</Text>
                  <Text size="small" color="text-primary" style={{ textAlign: "right" }}>
                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Panel>
      )}

      {activeName && report.status === "success" && (
        <Panel title="AI-grounded report">
          {report.data?.response?.answer ? (
            <Box gap="8px">
              <Text size="small" color="text-primary" style={{ whiteSpace: "pre-wrap" }}>{report.data.response.answer}</Text>
              {report.data.response.mode && (
                <Badge label={report.data.response.mode === "llm" ? "LLM-generated" : "Deterministic fallback"} tone={report.data.response.mode === "llm" ? "info" : "text-tertiary"} />
              )}
            </Box>
          ) : (
            <Text size="small" color="text-tertiary">No report available for this repository.</Text>
          )}
        </Panel>
      )}

      {activeName && duplication.status === "success" && (
        <Panel title="Duplication overlap">
          {(duplication.data?.overlapping_repositories?.length ?? duplication.data?.results?.length ?? 0) === 0 ? (
            <Text size="small" color="text-tertiary">No overlapping repositories found in the portfolio.</Text>
          ) : (
            <Box gap="6px">
              {(duplication.data.overlapping_repositories || duplication.data.results || []).map((repo, i) => (
                <Box key={i} direction="row" align="center" justify="between" pad="8px" round="8px" background="bg-surface-hover">
                  <Text size="small" color="text-primary">{repo.name || repo.full_name || repo}</Text>
                  {repo.similarity_score != null && <Badge label={`${Math.round(repo.similarity_score * 100)}% overlap`} tone="warning" />}
                </Box>
              ))}
            </Box>
          )}
        </Panel>
      )}
    </Box>
  );
}

export function RepositoryAnalyticsPage() {
  const portfolio = useAsyncData(getPortfolioOverview, []);

  const portfolioData = portfolio.data?.portfolio || {};
  const skillsData = portfolio.data?.skills || {};
  const technologyData = portfolio.data?.technologies || {};

  return (
    <Box gap="24px" style={{ maxWidth: "1000px", width: "100%" }}>
      <Box gap="4px">
        <Heading level={2} margin="none" color="text-primary">Repository Analytics</Heading>
        <Text color="text-secondary">Organization-wide portfolio intelligence, plus deep dives into any single repository.</Text>
      </Box>

      {portfolio.status === "loading" && <InlineSpinner label="Analyzing organization portfolio…" />}
      {portfolio.status === "error" && <ErrorState message={portfolio.error} />}

      {portfolio.status === "success" && (
        <>
          <Box direction="row" wrap gap="12px">
            <StatCard label="Indexed repositories" value={portfolioData.repository_count} />
            <StatCard label="Unique technologies" value={technologyData.unique_technologies} />
            <StatCard label="Unique skills" value={skillsData.unique_skills} />
            <StatCard label="Avg skills / repo" value={skillsData.average_skills_per_repository} />
          </Box>

          {skillsData.recommendations?.length > 0 && (
            <Panel title="Portfolio recommendations">
              <Box gap="4px">
                {skillsData.recommendations.map((r, i) => (
                  <Text key={i} size="small" color="text-secondary">• {r}</Text>
                ))}
              </Box>
            </Panel>
          )}
        </>
      )}

      <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="16px">
        <Tabs>
          <Tab title="Repository deep dive">
            <Box pad={{ top: "16px" }}>
              <RepositoryLookup />
            </Box>
          </Tab>
        </Tabs>
      </Box>
    </Box>
  );
}
