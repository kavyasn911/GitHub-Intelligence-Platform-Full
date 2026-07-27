import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Box, Heading, Text, Button } from "grommet";
import { FormPrevious, Github, Cubes, ShareOption, DocumentText, Group, Star, Compare } from "grommet-icons";
import { Badge } from "../components/common/Badge";
import { InlineSpinner, ErrorState } from "../components/common/StateViews";
import {
  getRepositoryReport,
  getRepositoryAnalysis,
  getRepositoryGraph,
  getDuplicationAnalysis,
  analyzeComponents,
  getRepositoryRecommendations,
  compareRepositoryAgent,
} from "../services/intelligenceApi";

function Panel({ title, icon: Icon, children }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="medium" gap="small">
      <Box direction="row" align="center" gap="8px">
        {Icon && <Icon size="16px" color="accent-1" />}
        <Text weight={700} color="text-primary">{title}</Text>
      </Box>
      {children}
    </Box>
  );
}

function useLazyResource(fetcher, deps) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading", data: null, error: null });
    fetcher()
      .then((data) => !cancelled && setState({ status: "success", data, error: null }))
      .catch((err) => !cancelled && setState({ status: "error", data: null, error: err.message }));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export function RepositoryDetailsPage() {
  const { owner, repo } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fullName = `${owner}/${repo}`;
  const passedRepository = location.state?.repository;

  // The graph/report/duplication routes take a single {repository_name}
  // path segment and are matched server-side against the short repo name
  // OR full_name — we pass the short name (`repo`) to avoid a literal "/"
  // inside one URL segment. Component analysis takes owner/repo as two
  // real segments, matching the backend route exactly.
  const report = useLazyResource(() => getRepositoryReport(repo), [repo]);
  const analysis = useLazyResource(() => getRepositoryAnalysis(repo), [repo]);
  const graph = useLazyResource(() => getRepositoryGraph(repo), [repo]);
  const duplication = useLazyResource(() => getDuplicationAnalysis(repo), [repo]);
  const components = useLazyResource(() => analyzeComponents(owner, repo), [owner, repo]);
  const recommendations = useLazyResource(() => getRepositoryRecommendations(repo), [repo]);
  const compare = useLazyResource(() => compareRepositoryAgent(repo), [repo]);

  const recommendationsAvailable = recommendations.status === "success" && recommendations.data?.recommendations?.length > 0;
  const compareAvailable = compare.status === "success" && compare.data?.response;

  const graphAvailable = graph.status === "success" && graph.data?.status === "success";
  const analysisAvailable = analysis.status === "success" && analysis.data?.status === "success";
  const reportAvailable = report.status === "success" && report.data?.status === "success";
  const duplicationAvailable = duplication.status === "success" && duplication.data?.status === "success" && duplication.data?.candidate_count > 0;
  const componentsAvailable = components.status === "success" && components.data?.components;

  return (
    <Box gap="18px" style={{ maxWidth: "1100px", width: "100%" }}>
      <Box direction="row" align="center" gap="small">
        <Button plain icon={<FormPrevious size="16px" />} onClick={() => navigate(-1)} a11yTitle="Back" />
        <Box gap="2px" flex>
          <Heading level={2} margin="none" color="text-primary" size="24px">
            {fullName}
          </Heading>
          <Text size="small" color="text-secondary">
            Full Repository Intelligence — reports, relationships, duplication, and component analysis.
          </Text>
        </Box>
        <Button
          secondary
          icon={<Github size="16px" />}
          label="Open on GitHub"
          onClick={() => window.open(passedRepository?.html_url || `https://github.com/${fullName}`, "_blank", "noopener,noreferrer")}
        />
      </Box>

      {/* Deterministic + AI-grounded Repository Report */}
      <Panel title="Repository Report" icon={DocumentText}>
        {report.status === "loading" && <InlineSpinner label="Generating grounded repository report…" />}
        {reportAvailable ? (
          <Box gap="10px">
            <Text size="small" color="text-secondary" style={{ lineHeight: "1.55", whiteSpace: "pre-wrap" }}>
              {typeof report.data.response === "string"
                ? report.data.response
                : report.data.response?.answer || JSON.stringify(report.data.response)}
            </Text>
          </Box>
        ) : analysisAvailable ? (
          <Box gap="10px">
            <Text size="small" color="text-secondary" style={{ lineHeight: "1.55" }}>
              {analysis.data.report?.executive_summary}
            </Text>
            {analysis.data.report?.engineering_assessment?.strengths?.length > 0 && (
              <Box gap="4px">
                <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>Strengths</Text>
                {analysis.data.report.engineering_assessment.strengths.map((s, i) => (
                  <Text key={i} size="small" color="text-secondary">• {s}</Text>
                ))}
              </Box>
            )}
            {analysis.data.report?.engineering_assessment?.risks?.length > 0 && (
              <Box gap="4px">
                <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>Risks</Text>
                {analysis.data.report.engineering_assessment.risks.map((s, i) => (
                  <Text key={i} size="small" color="text-secondary">• {s}</Text>
                ))}
              </Box>
            )}
            {analysis.data.report?.recommendations?.length > 0 && (
              <Box gap="4px">
                <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>Recommendations</Text>
                {analysis.data.report.recommendations.map((s, i) => (
                  <Text key={i} size="small" color="text-secondary">• {s}</Text>
                ))}
              </Box>
            )}
          </Box>
        ) : report.status !== "loading" && (
          <Text size="small" color="text-tertiary">
            This repository hasn't been synced into the knowledge graph, so a report can't be generated yet.
          </Text>
        )}
      </Panel>

      {/* Graph Intelligence */}
      <Panel title="Repository Relationships" icon={ShareOption}>
        {graph.status === "loading" && <InlineSpinner label="Querying the knowledge graph…" />}
        {graphAvailable ? (
          <Box gap="8px">
            <Text size="small" color="text-secondary">
              {graph.data.connections?.length || 0} connected graph entities.
            </Text>
            <Box direction="row" wrap gap="6px">
              {(graph.data.connections || []).slice(0, 20).map((c, i) => (
                <Badge key={i} label={`${c.relationship}: ${c.name}`} tone="info" />
              ))}
            </Box>
          </Box>
        ) : graph.status !== "loading" && (
          <Text size="small" color="text-tertiary">Not represented in the knowledge graph yet.</Text>
        )}
      </Panel>

      {/* Duplication Intelligence */}
      <Panel title="Duplication Intelligence" icon={Group}>
        {duplication.status === "loading" && <InlineSpinner label="Checking for overlapping repositories…" />}
        {duplicationAvailable ? (
          <Box gap="6px">
            <Text size="small" color="text-secondary">
              {duplication.data.high_risk_count} high-risk overlap(s) out of {duplication.data.candidate_count} candidates.
            </Text>
            {duplication.data.duplication_candidates.slice(0, 5).map((c, i) => (
              <Box key={i} direction="row" align="center" justify="between" pad="6px" round="8px" background="bg-surface-hover">
                <Text size="small" color="text-primary">{c.full_name || c.repository}</Text>
                <Badge label={`${c.duplication_risk} · ${c.duplication_percentage}%`} tone={c.duplication_risk === "high" ? "critical" : c.duplication_risk === "medium" ? "warning" : "accent"} />
              </Box>
            ))}
          </Box>
        ) : duplication.status !== "loading" && (
          <Text size="small" color="text-tertiary">No overlapping repositories detected.</Text>
        )}
      </Panel>

      {/* Component Intelligence */}
      <Panel title="Component Intelligence" icon={Cubes}>
        {components.status === "loading" && <InlineSpinner label="Cloning repository and detecting components…" />}
        {components.status === "error" && <ErrorState message={components.error} />}
        {componentsAvailable ? (
          <Box gap="8px">
            {components.data.tree_summary?.total_items != null && (
              <Text size="small" color="text-secondary">Scanned {components.data.tree_summary.total_items} files/directories.</Text>
            )}
            {Object.entries(components.data.components).map(([key, value]) => (
              <Box key={key} gap="4px">
                <Text size="xsmall" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>{key.replace(/_/g, " ")}</Text>
                {Array.isArray(value) && value.length > 0 ? (
                  <Box direction="row" wrap gap="6px">
                    {value.map((v, i) => (
                      <Badge key={i} label={typeof v === "string" ? v : JSON.stringify(v)} tone="info" />
                    ))}
                  </Box>
                ) : (
                  <Text size="small" color="text-tertiary">None detected</Text>
                )}
              </Box>
            ))}
          </Box>
        ) : null}
      </Panel>

      {/* Recommendations */}
      <Panel title="Similar Repositories" icon={Star}>
        {recommendations.status === "loading" && <InlineSpinner label="Finding similar indexed repositories…" />}
        {recommendationsAvailable ? (
          <Box gap="6px">
            {recommendations.data.recommendations.map((rec) => {
              const rrepo = rec.repository || {};
              return (
                <Box key={rec.id} direction="row" align="center" justify="between" pad="6px" round="8px" background="bg-surface-hover">
                  <Text size="small" color="text-primary">{rrepo.full_name || rrepo.name || "Unknown repository"}</Text>
                  <Badge label={`${Math.round((rec.similarity_score || 0) * 100)}% similar`} tone="accent" />
                </Box>
              );
            })}
          </Box>
        ) : recommendations.status !== "loading" && (
          <Text size="small" color="text-tertiary">Not in the indexed vector set yet, so no similarity recommendations are available.</Text>
        )}
      </Panel>

      {/* Compare Agent */}
      <Panel title="Comparison Insight" icon={Compare}>
        {compare.status === "loading" && <InlineSpinner label="Comparing against related repositories…" />}
        {compare.status === "error" && <ErrorState message={compare.error} />}
        {compareAvailable ? (
          <Box gap="8px">
            {compare.data.agent && <Badge label={`Agent: ${compare.data.agent}`} tone="info" />}
            <Text size="small" color="text-secondary" style={{ lineHeight: "1.55", whiteSpace: "pre-wrap" }}>
              {typeof compare.data.response === "string"
                ? compare.data.response
                : compare.data.response?.answer || compare.data.response?.text || JSON.stringify(compare.data.response)}
            </Text>
          </Box>
        ) : null}
      </Panel>
    </Box>
  );
}
