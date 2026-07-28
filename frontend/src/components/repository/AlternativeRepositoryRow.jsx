import React, { useState } from "react";
import { Box, Text, Button } from "grommet";
import { useNavigate } from "react-router-dom";
import {
  Package,
  FormDown,
  FormUp,
  Favorite,
  Github,
  DocumentText,
} from "grommet-icons";
import { ScoreRing } from "../common/ScoreRing";
import { RepositoryIntelligenceContent } from "./RepositoryIntelligencePanel";
import { formatCount, timeAgo } from "../../utils/format";

export function AlternativeRepositoryRow({
  repository,
  isSaved,
  onToggleSave,
}) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const matchPercent = Math.round(
    (repository.ranking?.final_score ?? 0) * 100
  );

  return (
    <Box
      background="bg-surface"
      round="12px"
      border={{ color: "border-subtle" }}
      overflow="visible"
    >
      <Box
        direction="row"
        align="start"
        justify="between"
        pad="small"
        gap="small"
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        <Box direction="row" align="center" gap="medium" flex>
          <Box
            background="bg-surface-hover"
            round="8px"
            pad="10px"
            flex={false}
          >
            <Package size="16px" />
          </Box>

          <Box flex>
            <Text
              weight="bold"
              style={{
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {repository.full_name}
            </Text>

            {repository.description && (
              <Text
                size="small"
                color="text-secondary"
                style={{
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",

                  ...(expanded
                    ? {}
                    : {
                        display: "-webkit-box",
                        WebkitLineClamp: 4,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }),
                }}
              >
                {repository.description}
              </Text>
            )}

            <Box direction="row" gap="small" margin={{ top: "6px" }}>
              <Text size="small">{formatCount(repository.stars)}</Text>

              <Text size="small">{repository.language}</Text>

              <Text size="small">
                Updated {timeAgo(repository.updated_at)}
              </Text>
            </Box>
          </Box>
        </Box>

        <Box direction="row" align="center" gap="medium">
          <Button
            plain
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(repository);
            }}
            icon={
              <Favorite
                color={isSaved ? "accent-1" : "text-tertiary"}
              />
            }
          />

          <Button
            plain
            icon={<Github />}
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                repository.html_url,
                "_blank",
                "noopener,noreferrer"
              );
            }}
          />

          <Button
            plain
            icon={<DocumentText />}
            a11yTitle="Full Details"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/repository/${repository.full_name}`, {
                state: { repository },
              });
            }}
          />

          <ScoreRing
            value={matchPercent}
            size={44}
            stroke={5}
          />

          {expanded ? <FormUp /> : <FormDown />}
        </Box>
      </Box>

      {expanded && (
        <Box
          border={{ side: "top", color: "border-subtle" }}
          pad="medium"
        >
          <RepositoryIntelligenceContent repository={repository} />
        </Box>
      )}
    </Box>
  );
}