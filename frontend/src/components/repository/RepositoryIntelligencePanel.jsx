import React from "react";
import { Box, Button, Text } from "grommet";
import { GenAI, FormDown, FormUp } from "grommet-icons";
import { Badge } from "../common/Badge";
import { strategyCopy, savingsFromScore, riskFromSignals } from "../../utils/format";
import { DeepIntelligenceTabs } from "./DeepIntelligenceTabs";


function cleanSummary(text){
  if(!text) return "";

  return String(text)
    .replace(/<[^>]*>/g," ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g," ")
    .replace(/\[[^\]]*\]\([^)]*\)/g," ")
    .replace(/[`#>*_~-]/g," ")
    .replace(/\s+/g," ")
    .trim()
    .slice(0,300);
}

function Section({ title, children }) {
  return (
    <Box gap="6px">
      <Text size="xsmall" color="text-tertiary" style={{ textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {title}
      </Text>
      {children}
    </Box>
  );
}

// The inline "Repository Intelligence" expand/collapse used on both the
// featured recommendation card and each alternative row — no drawer, no
// navigation, everything stays inside the card per the design spec.
// `showBusinessValue` is only ever true for the Featured (Best Match) card.
export function RepositoryIntelligenceContent({ repository, showBusinessValue = false }) {
  const reuse = repository.reuse_intelligence || {};
  const architecture = repository.architecture_intelligence || {};
  const analysis = repository.analysis || {};
  const capabilityGap = repository.requirement_match?.capability_gap || reuse.decision_intelligence || {};
  const plan = reuse.implementation_plan || {};
  const strategy = strategyCopy(reuse.strategy);
  const savings = savingsFromScore(reuse.reuse_score);
  const risk = riskFromSignals({ risks: reuse.risks, healthPercent: reuse.repository_health ?? 0 });

  return (
    <Box gap="medium" pad={{ horizontal: "small", top: "xsmall", bottom: "small" }}>
          <Section title="Summary">
            <Text size="small" color="text-secondary" style={{
            lineHeight:"1.55",
            whiteSpace:"pre-wrap",
            wordBreak:"break-word",
            overflowWrap:"anywhere"
        }}>
              {cleanSummary(analysis.summary) || repository.description || "No summary available for this repository."}
            </Text>
          </Section>

          <Section title="Architecture">
            {architecture.architectures?.length ? (
              <Box direction="row" wrap gap="6px">
                {architecture.architectures.map((item) => (
                  <Box key={item} pad={{ vertical: "3px", horizontal: "10px" }} round="999px" background="bg-surface-hover" border={{ color: "border-subtle" }}>
                    <Text size="xsmall" color="text-secondary">{item}</Text>
                  </Box>
                ))}
              </Box>
            ) : (
              <Text size="small" color="text-tertiary">No architecture pattern detected.</Text>
            )}
          </Section>

          <Section title="Reuse Decision">
            <Box direction="row" align="center" gap="small" wrap>
              <Badge label={strategy.label} tone={strategy.tone} />
              {typeof reuse.reuse_score === "number" && (
                <Text size="small" color="text-secondary">
                  Reuse score {Math.round(reuse.reuse_score)}%
                </Text>
              )}
              {typeof reuse.requirement_coverage === "number" && (
                <Text size="small" color="text-secondary">
                  · Coverage {Math.round(reuse.requirement_coverage)}%
                </Text>
              )}
            </Box>
          </Section>

          <Section title="Why This Repository Matches">
            {repository.ai_answer && (
              <Text size="small" color="text-secondary" style={{
            lineHeight:"1.55",
            whiteSpace:"pre-wrap",
            wordBreak:"break-word",
            overflowWrap:"anywhere"
        }}>
                {repository.ai_answer}
              </Text>
            )}
            {reuse.matched_requirements?.length > 0 && (
              <Box direction="row" wrap gap="6px" margin={{ top: "4px" }}>
                {reuse.matched_requirements.map((item) => (
                  <Badge key={item} label={item} tone="accent" />
                ))}
              </Box>
            )}
            {reuse.missing_requirements?.length > 0 && (
              <Box direction="row" wrap gap="6px" margin={{ top: "4px" }}>
                {reuse.missing_requirements.map((item) => (
                  <Badge key={item} label={`Missing: ${item}`} tone="warning" />
                ))}
              </Box>
            )}
          </Section>

          {(capabilityGap.matched_core_capabilities?.length || capabilityGap.missing_core_capabilities?.length ||
            capabilityGap.matched_technologies?.length || capabilityGap.missing_technologies?.length) ? (
            <Section title="Capability Gap Analysis">
              <Box gap="8px">
                {capabilityGap.matched_core_capabilities?.length > 0 && (
                  <Box direction="row" wrap gap="6px">
                    {capabilityGap.matched_core_capabilities.map((item) => (
                      <Badge key={`m-${item}`} label={item} tone="accent" />
                    ))}
                  </Box>
                )}
                {capabilityGap.missing_core_capabilities?.length > 0 && (
                  <Box direction="row" wrap gap="6px">
                    {capabilityGap.missing_core_capabilities.map((item) => (
                      <Badge key={`x-${item}`} label={`Missing: ${item}`} tone="warning" />
                    ))}
                  </Box>
                )}
                {capabilityGap.missing_technologies?.length > 0 && (
                  <Box direction="row" wrap gap="6px">
                    {capabilityGap.missing_technologies.map((item) => (
                      <Badge key={`t-${item}`} label={`Tech gap: ${item}`} tone="critical" />
                    ))}
                  </Box>
                )}
              </Box>
            </Section>
          ) : null}

          {(plan.steps?.length > 0 || reuse.reusable_components?.length > 0) && (
            <Section title="Implementation Plan">
              <Box gap="8px">
                {plan.recommended_action && (
                  <Text size="small" color="text-secondary">
                    Recommended action: <Text as="span" weight={600} color="text-primary">{plan.recommended_action.replace(/_/g, " ")}</Text>
                  </Text>
                )}
                {plan.steps?.length > 0 && (
                  <Box gap="4px">
                    {plan.steps.map((step, i) => (
                      <Text key={i} size="small" color="text-secondary">{i + 1}. {step}</Text>
                    ))}
                  </Box>
                )}
                {reuse.reusable_components?.length > 0 && (
                  <Box direction="row" wrap gap="6px" margin={{ top: "4px" }}>
                    {reuse.reusable_components.map((item, i) => (
                      <Badge key={i} label={item} tone="info" />
                    ))}
                  </Box>
                )}
              </Box>
            </Section>
          )}

          {showBusinessValue && (
            <Section title="Business Value">
              <Box direction="row" wrap gap="medium">
                <Box gap="2px" basis="180px" flex>
                  <Text size="xsmall" color="text-tertiary">Estimated Savings</Text>
                  <Text size="small" weight={600} color="text-primary">{savings}</Text>
                </Box>
                <Box gap="2px" basis="120px" flex>
                  <Text size="xsmall" color="text-tertiary">Risk Level</Text>
                  <Badge label={risk.label} tone={risk.tone} />
                </Box>
              </Box>
            </Section>
          )}

          <DeepIntelligenceTabs repository={repository} />
    </Box>
  );
}

export function RepositoryIntelligenceToggle({ repository, expanded, onToggle, showBusinessValue = false }) {
  return (
    <Box>
      <Button plain onClick={onToggle} a11yTitle="Toggle repository intelligence">
        <Box
          direction="row"
          align="center"
          justify="between"
          pad={{ vertical: "small", horizontal: "small" }}
          round="8px"
          hoverIndicator={{ color: "bg-surface-hover" }}
        >
          <Box direction="row" align="center" gap="8px">
            <GenAI size="16px" color="accent-1" />
            <Text size="small" weight={600} color="text-primary">
              Repository Intelligence
            </Text>
          </Box>
          {expanded ? <FormUp color="text-tertiary" size="18px" /> : <FormDown color="text-tertiary" size="18px" />}
        </Box>
      </Button>

      {expanded && <RepositoryIntelligenceContent repository={repository} showBusinessValue={showBusinessValue} />}
    </Box>
  );
}
