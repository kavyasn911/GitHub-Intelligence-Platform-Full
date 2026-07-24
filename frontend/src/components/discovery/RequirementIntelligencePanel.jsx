import React, { useState } from "react";
import { Box, Text, Button } from "grommet";
import { GenAI, FormDown, FormUp } from "grommet-icons";
import { Badge } from "../common/Badge";
import { requirementConfidence } from "../../utils/format";

function Chips({ items, tone = "text-tertiary" }) {
  if (!items || items.length === 0) return <Text size="small" color="text-tertiary">None detected</Text>;
  return (
    <Box direction="row" wrap gap="6px">
      {items.map((item) => (
        <Badge key={item} label={item} tone={tone} />
      ))}
    </Box>
  );
}

function Field({ label, children }) {
  return (
    <Box gap="6px" basis="220px" flex>
      <Text size="xsmall" color="text-tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </Text>
      {children}
    </Box>
  );
}

// Surfaces backend.app.discovery.requirement_intelligence + query_plan,
// which the /github/discovery response already includes on every search.
export function RequirementIntelligencePanel({ requirementIntelligence, queryPlan }) {
  const [expanded, setExpanded] = useState(true);

  if (!requirementIntelligence) return null;

  const spec = requirementIntelligence.specification || {};
  const confidence = requirementConfidence(requirementIntelligence.mode);

  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} overflow="visible">
      <Button plain onClick={() => setExpanded((v) => !v)} a11yTitle="Toggle requirement intelligence">
        <Box direction="row" align="center" justify="between" pad="medium">
          <Box direction="row" align="center" gap="8px">
            <GenAI size="16px" color="accent-1" />
            <Text size="small" weight={600} color="text-primary">
              AI Understood Your Requirement
            </Text>
            <Badge label={confidence.label} tone={confidence.tone} />
          </Box>
          {expanded ? <FormUp color="text-tertiary" size="18px" /> : <FormDown color="text-tertiary" size="18px" />}
        </Box>
      </Button>

      {expanded && (
        <Box pad={{ horizontal: "medium", bottom: "medium" }} gap="medium">
          {spec.summary && (
            <Text size="small" color="text-secondary" style={{ lineHeight: "1.55" }}>
              {spec.summary}
            </Text>
          )}

          <Box direction="row" wrap gap="medium">
            <Field label="Project Type">
              <Text size="small" color="text-primary">{spec.project_type || "—"}</Text>
            </Field>
            <Field label="Core Capabilities">
              <Chips items={spec.core_capabilities} tone="accent" />
            </Field>
            <Field label="Optional Capabilities">
              <Chips items={spec.optional_capabilities} />
            </Field>
            <Field label="Detected Technologies">
              <Chips items={spec.technologies} tone="info" />
            </Field>
            <Field label="Architecture Preferences">
              <Chips items={spec.architecture_preferences} />
            </Field>
            <Field label="Search Concepts">
              <Chips items={spec.search_concepts} />
            </Field>
          </Box>

          {queryPlan?.search_queries?.length > 0 && (
            <Box gap="6px" border={{ side: "top", color: "border-subtle" }} pad={{ top: "small" }}>
              <Text size="xsmall" color="text-tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Searches Executed ({queryPlan.query_count ?? queryPlan.search_queries.length})
              </Text>
              <Box direction="row" wrap gap="6px">
                {queryPlan.search_queries.map((q, i) => (
                  <Box key={`${q}-${i}`} pad={{ vertical: "3px", horizontal: "10px" }} round="999px" background="bg-surface-hover" border={{ color: "border-subtle" }}>
                    <Text size="xsmall" color="text-secondary">{q}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
