import React from "react";
import { Box, Heading, Text } from "grommet";
import { useNavigate } from "react-router-dom";
import { Package, StarOutline } from "grommet-icons";
import { ScoreRing } from "../common/ScoreRing";
import { EmptyState } from "../common/StateViews";
import { formatCount } from "../../utils/format";

// Renders results from GET /github/search/advanced — ranked semantic
// search over the *indexed* repository set (Qdrant), as opposed to the
// live-GitHub discovery flow. Each result is { id, score, payload, explanation }
// rather than a full repository object, so it needs its own row renderer.
export function AdvancedSearchResults({ results }) {
  const navigate = useNavigate();

  if (!results || results.length === 0) {
    return (
      <EmptyState
        title="No indexed repositories matched"
        subtitle="Nothing in your indexed portfolio matches this query yet — try Discover from GitHub instead, or reindex from the System page."
      />
    );
  }

  return (
    <Box gap="14px">
      <Heading level={3} margin="none" size="16px" color="text-primary">
        Matches in Your Indexed Portfolio
      </Heading>
      <Box gap="12px">
        {results.map((result) => {
          const repo = result.payload || {};
          const matchPercent = Math.round((result.score ?? 0) * 100);
          const [owner, name] = (repo.full_name || "").split("/");

          return (
            <Box
              key={result.id}
              background="bg-surface"
              round="12px"
              border={{ color: "border-subtle" }}
              pad="small"
              gap="6px"
              direction="row"
              align="start"
              justify="between"
              style={{ cursor: owner && name ? "pointer" : "default" }}
              onClick={() => owner && name && navigate(`/repository/${owner}/${name}`)}
            >
              <Box direction="row" align="center" gap="medium" flex>
                <Box background="bg-surface-hover" round="8px" pad="10px" flex={false}>
                  <Package size="16px" />
                </Box>
                <Box flex gap="2px">
                  <Text weight="bold">{repo.full_name || "Unknown repository"}</Text>
                  {repo.description && (
                    <Text size="small" color="text-secondary" style={{ overflowWrap: "anywhere" }}>
                      {repo.description}
                    </Text>
                  )}
                  <Box direction="row" gap="10px" align="center">
                    {repo.language && <Text size="xsmall" color="text-tertiary">{repo.language}</Text>}
                    {repo.stars != null && (
                      <Box direction="row" gap="4px" align="center">
                        <StarOutline size="12px" />
                        <Text size="xsmall" color="text-tertiary">{formatCount(repo.stars)}</Text>
                      </Box>
                    )}
                  </Box>
                  {result.explanation && (
                    <Text size="10px" color="text-tertiary" margin={{ top: "2px" }}>
                      {typeof result.explanation === "string" ? result.explanation : result.explanation.summary}
                    </Text>
                  )}
                </Box>
              </Box>
              <ScoreRing value={matchPercent} size={40} />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
