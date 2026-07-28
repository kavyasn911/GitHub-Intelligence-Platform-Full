import React, { useEffect, useState } from "react";
import { Box, Text } from "grommet";
import { Badge } from "../common/Badge";
import { parseSearchQuery } from "../../services/discoveryApi";

const DEBOUNCE_MS = 400;

// Debounced preview of what the backend's query parser detects from the
// user's free-text query, before any search actually runs. Powered by
// GET /github/search/parse (QueryIntelligenceEngine.parse), which was
// previously wired in discoveryApi.js but never called from the UI.
export function QueryIntelligencePreview({ query }) {
  const [parsed, setParsed] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      setParsed(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const timer = setTimeout(() => {
      parseSearchQuery(trimmed)
        .then((data) => {
          if (!cancelled) {
            setParsed(data);
            setStatus("success");
          }
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (status === "idle" || status === "error") return null;

  const filters = parsed?.filters || {};
  const chips = [];

  if (parsed?.intent) chips.push({ label: `Intent: ${parsed.intent.replace(/_/g, " ")}`, tone: "info" });
  if (filters.language) chips.push({ label: `Language: ${filters.language}`, tone: "accent" });
  if (filters.complexity) chips.push({ label: `Complexity: ${filters.complexity}`, tone: "accent" });
  if (filters.architecture) chips.push({ label: `Architecture: ${filters.architecture}`, tone: "accent" });
  if (filters.minimum_score != null) chips.push({ label: `Min score: ${filters.minimum_score}`, tone: "accent" });
  (filters.technologies || []).forEach((tech) => chips.push({ label: tech, tone: "text-tertiary" }));

  return (
    <Box gap="6px" pad={{ top: "4px" }}>
      <Text size="10px" weight={700} color="text-tertiary" style={{ textTransform: "uppercase" }}>
        {status === "loading" ? "Reading your query…" : "Detected from your query"}
      </Text>
      {chips.length > 0 && (
        <Box direction="row" wrap gap="6px">
          {chips.map((chip, i) => (
            <Badge key={`${chip.label}-${i}`} label={chip.label} tone={chip.tone} />
          ))}
        </Box>
      )}
      {status === "success" && chips.length === 0 && (
        <Text size="xsmall" color="text-tertiary">No specific filters detected — this will run as a broad semantic search.</Text>
      )}
    </Box>
  );
}
