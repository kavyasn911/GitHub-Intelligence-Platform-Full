import React, { useState } from "react";
import { Box, Text, Button } from "grommet";
import { useNavigate } from "react-router-dom";
import { StarOutline, Star, Github, LinkNext, Favorite, DocumentText } from "grommet-icons";
import { ScoreRing } from "../common/ScoreRing";
import { Badge } from "../common/Badge";
import { RepositoryIntelligenceToggle } from "./RepositoryIntelligencePanel";
import { formatCount, timeAgo, healthCopy } from "../../utils/format";

export function FeaturedRepositoryCard({ repository, isSaved, onToggleSave }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  if (!repository) return null;

  const health = healthCopy(repository.repository_health?.status);
  const matchPercent = Math.round((repository.ranking?.final_score ?? 0) * 100);
  const techs = repository.architecture_intelligence?.frameworks?.length
    ? repository.architecture_intelligence.frameworks
    : repository.analysis?.technologies || [];

  return (
    <Box
      background="bg-surface"
      round="12px"
      border={{ color: "accent-1", size: "1px" }}
      pad="large"
      gap="medium"
      style={{
        boxShadow:"0 0 0 1px rgba(0,199,129,0.08),0 8px 24px rgba(0,199,129,0.06)",
        overflow:"visible",
        position:"relative",
        minHeight:"fit-content"
      }}
    >
      <Box direction="row" align="center" justify="between" wrap gap="medium">
        <Box direction="row" align="center" gap="6px">
          <Star size="14px" color="accent-1" />
          <Text size="xsmall" weight={700} color="accent-1" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Best Match
          </Text>
        </Box>

        <Box
          direction="row"
          gap="small"
          wrap={false}
          flex={false}>
          <Button style={{flexShrink:0}}
            secondary
            icon={<Favorite size="16px" color={isSaved ? "accent-1" : "text-secondary"} />}
            label={isSaved ? "Saved" : "Save"}
            onClick={() => onToggleSave?.(repository)}
          />
          <Button style={{flexShrink:0}}
            secondary
            icon={<DocumentText size="16px" />}
            label="Full Details"
            onClick={() => navigate(`/repository/${repository.full_name}`, { state: { repository } })}
          />
          <Button style={{flexShrink:0}}
            primary
            icon={<Github size="16px" />}
            label="Open Repository"
            onClick={() => window.open(repository.html_url, "_blank", "noopener,noreferrer")}
          />
        </Box>
      </Box>

      <Box
        direction="row"
        wrap={false}
        gap="large"
        align="start">
        <Box align="center" gap="4px" flex={{ shrink: 0 }}>
          <ScoreRing value={matchPercent} size={64} stroke={5} />
          <Text size="xsmall" color="text-tertiary">Match Score</Text>
        </Box>

        <Box gap="12px" flex style={{
              flex:1,
              minWidth:0,
              overflow:"visible"
            }}>
          <Button
            plain
            onClick={() => window.open(repository.html_url, "_blank", "noopener,noreferrer")}
            a11yTitle={`Open ${repository.name} on Github`}
          >
            <Box direction="row" align="center" gap="6px">
              <Text size="20px" weight={700} color="text-primary">
                {repository.name}
              </Text>
              <LinkNext size="14px" color="text-tertiary" />
            </Box>
          </Button>

          {repository.description && (
            <Text size="small" color="text-secondary" style={{
                lineHeight:"24px",
                wordBreak:"break-word",
                overflowWrap:"anywhere"
              }}>
              {repository.description}
            </Text>
          )}

          {techs.length > 0 && (
            <Box direction="row" wrap gap="6px">
              {techs.slice(0, 8).map((tech) => (
                <Box key={tech} pad={{ vertical: "3px", horizontal: "10px" }} round="999px" background="accent-soft" border={{ color: "border-subtle" }}>
                  <Text size="xsmall" color="accent-1">{tech}</Text>
                </Box>
              ))}
            </Box>
          )}

          <Box direction="row" wrap align="center" gap="medium" pad={{ top: "4px" }}>
            <Box direction="row" align="center" gap="6px">
              <StarOutline size="14px" color="text-tertiary" />
              <Text size="small" color="text-secondary">{formatCount(repository.stars)}</Text>
            </Box>
            <Box direction="row" align="center" gap="6px">
              <Text size="small" color="text-secondary">{repository.language || "—"}</Text>
            </Box>
            <Text size="small" color="text-tertiary">Updated {timeAgo(repository.updated_at)}</Text>
            <Box direction="row" align="center" gap="6px">
              <Box width="8px" height="8px" round="full" background={health.tone === "accent" ? "accent-1" : health.tone} />
              <Text size="small" color="text-secondary">{health.label}</Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box border={{ side: "top", color: "border-subtle" }} margin={{ top: "xsmall" }}>
        <RepositoryIntelligenceToggle repository={repository} expanded={expanded} onToggle={() => setExpanded((v) => !v)} showBusinessValue />
      </Box>
    </Box>
  );
}
