import React from "react";
import { Box, Heading, Text, Grid, Button } from "grommet";
import { Github, Trash } from "grommet-icons";
import { useSavedRepositories } from "../hooks/useSavedRepositories";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { EmptyState } from "../components/common/StateViews";
import { formatCount } from "../utils/format";

export function SavedDiscoveriesPage({ onRerun }) {
  const { saved, toggleSave } = useSavedRepositories();
  const [history] = useLocalStorage("argus:history", []);
  const recent = history.slice(0, 5);

  return (
    <Box gap="large" style={{ maxWidth: "980px" }}>
      <Box gap="4px">
        <Heading level={2} margin="none" color="text-primary">Saved Discoveries</Heading>
        <Text color="text-secondary">Recent searches and saved repositories.</Text>
      </Box>

      <Box gap="small">
        <Heading level={3} margin="none" size="16px" color="text-primary">Recent Searches</Heading>
        {recent.length === 0 ? (
          <Text size="small" color="text-tertiary">No recent searches yet.</Text>
        ) : (
          <Box direction="row" wrap gap="8px">
            {recent.map((item) => (
              <Button key={item.timestamp} plain onClick={() => onRerun?.(item.query)}>
                <Box pad={{ vertical: "6px", horizontal: "12px" }} round="999px" background="bg-surface-raised" border={{ color: "border-subtle" }}>
                  <Text size="xsmall" color="text-secondary">{item.query}</Text>
                </Box>
              </Button>
            ))}
          </Box>
        )}
      </Box>

      <Box gap="small">
        <Heading level={3} margin="none" size="16px" color="text-primary">Saved Repositories</Heading>
        {saved.length === 0 ? (
          <EmptyState title="No saved repositories" subtitle="Save a repository from your discovery results to find it here." />
        ) : (
          <Grid columns={{ count: "fit", size: "260px" }} gap="small">
            {saved.map((repo) => (
              <Box key={repo.full_name} background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="small" gap="6px">
                <Text weight={600} size="small" color="text-primary" truncate>{repo.name}</Text>
                {repo.description && (
                  <Text size="xsmall" color="text-secondary" truncate="tip">{repo.description}</Text>
                )}
                <Text size="xsmall" color="text-tertiary">
                  {formatCount(repo.stars)} stars · {repo.language || "—"}
                </Text>
                <Box direction="row" gap="6px" pad={{ top: "4px" }} border={{ side: "top", color: "border-subtle" }}>
                  <Button
                    size="small"
                    icon={<Github size="14px" />}
                    label="Open"
                    onClick={() => window.open(repo.html_url, "_blank", "noopener,noreferrer")}
                  />
                  <Button
                    size="small"
                    icon={<Trash size="14px" color="critical" />}
                    onClick={() => toggleSave(repo)}
                    a11yTitle="Remove from saved"
                  />
                </Box>
              </Box>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
}
