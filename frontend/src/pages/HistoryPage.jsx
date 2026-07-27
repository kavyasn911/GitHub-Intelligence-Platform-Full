import React from "react";
import { Box, Heading, Text, Button } from "grommet";
import { Search, Trash } from "grommet-icons";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { EmptyState } from "../components/common/StateViews";

export function HistoryPage({ onRerun }) {
  const [history, setHistory] = useLocalStorage("argus:history", []);

  return (
    <Box gap="medium" style={{ maxWidth: "780px" }}>
      <Box direction="row" justify="between" align="center">
        <Box gap="4px">
          <Heading level={2} margin="none" color="text-primary">History</Heading>
          <Text color="text-secondary">Your past discovery sessions.</Text>
        </Box>
        {history.length > 0 && (
          <Button size="small" secondary label="Clear all" onClick={() => setHistory([])} />
        )}
      </Box>

      {history.length === 0 ? (
        <EmptyState title="No searches yet" subtitle="Run a discovery search and it'll show up here." />
      ) : (
        <Box gap="small">
          {history.map((item) => (
            <Box
              key={item.timestamp}
              direction="row"
              align="center"
              justify="between"
              background="bg-surface"
              round="10px"
              border={{ color: "border-subtle" }}
              pad="small"
            >
              <Box gap="2px" flex>
                <Text size="small" weight={600} color="text-primary" truncate>{item.query}</Text>
                <Text size="xsmall" color="text-tertiary">
                  {new Date(item.timestamp).toLocaleString()}
                  {item.bestMatch ? ` · best match: ${item.bestMatch}` : ""}
                </Text>
              </Box>
              <Box direction="row" gap="4px">
                <Button
                  icon={<Search size="16px" />}
                  plain
                  a11yTitle="Re-run search"
                  onClick={() => onRerun?.(item.query)}
                  hoverIndicator={{ color: "bg-surface-hover", round: "6px" }}
                  style={{ padding: "6px", borderRadius: "6px" }}
                />
                <Button
                  icon={<Trash size="16px" color="critical" />}
                  plain
                  a11yTitle="Remove"
                  onClick={() => setHistory((prev) => prev.filter((h) => h.timestamp !== item.timestamp))}
                  hoverIndicator={{ color: "bg-surface-hover", round: "6px" }}
                  style={{ padding: "6px", borderRadius: "6px" }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
