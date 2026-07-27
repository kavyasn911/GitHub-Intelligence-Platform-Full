import React, { useState } from "react";
import { Box, Heading, Text, TextInput, Button, Select } from "grommet";
import { Chat, Send, StatusGood, StatusWarning, Refresh } from "grommet-icons";
import { Badge } from "../components/common/Badge";
import { InlineSpinner, EmptyState } from "../components/common/StateViews";
import { useAsyncData } from "../hooks/useAsyncData";
import {
  askRepositoryAgent,
  compareRepositoryAgent,
  getAgentLlmHealth,
} from "../services/intelligenceApi";

const MODES = [
  { key: "ask", label: "Ask about repositories" },
  { key: "compare", label: "Compare a repository" },
];

const AGENT_LABEL = {
  portfolio_intelligence_agent: "Portfolio Agent",
  skill_intelligence_agent: "Skill Agent",
  technology_intelligence_agent: "Technology Agent",
  repository_intelligence_agent: "Repository Agent",
  repository_comparison_agent: "Comparison Agent",
};

function Turn({ turn }) {
  if (turn.role === "user") {
    return (
      <Box align="end">
        <Box background="accent-soft" round="12px" pad={{ vertical: "10px", horizontal: "14px" }} style={{ maxWidth: "80%" }}>
          <Text size="small" color="text-primary">{turn.text}</Text>
        </Box>
      </Box>
    );
  }

  if (turn.role === "error") {
    return (
      <Box align="start">
        <Box background="critical-soft" round="12px" pad={{ vertical: "10px", horizontal: "14px" }} style={{ maxWidth: "80%" }}>
          <Text size="small" color="critical">{turn.text}</Text>
        </Box>
      </Box>
    );
  }

  const agentKey = turn.data?.agent;
  const answer = turn.data?.response?.answer || "No answer returned.";
  const mode = turn.data?.response?.mode;
  const meta = turn.data?.execution_metadata;

  return (
    <Box align="start" gap="6px" style={{ maxWidth: "85%" }}>
      <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad={{ vertical: "10px", horizontal: "14px" }} gap="6px">
        <Text size="small" color="text-primary" style={{ whiteSpace: "pre-wrap" }}>{answer}</Text>
      </Box>
      <Box direction="row" wrap gap="6px">
        {agentKey && <Badge label={AGENT_LABEL[agentKey] || agentKey} tone="accent" />}
        {mode && <Badge label={mode === "llm" ? "LLM-generated" : "Deterministic fallback"} tone={mode === "llm" ? "info" : "text-tertiary"} />}
        {meta?.llm_model && <Badge label={meta.llm_model} tone="text-tertiary" />}
        {meta?.repositories_analyzed != null && (
          <Badge label={`${meta.repositories_analyzed} repos analyzed`} tone="text-tertiary" />
        )}
      </Box>
    </Box>
  );
}

export function AIWorkspacePage() {
  const [mode, setMode] = useState(MODES[0]);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState([]);
  const [pending, setPending] = useState(false);

  const llmHealth = useAsyncData(getAgentLlmHealth, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const value = input.trim();
    if (!value || pending) return;

    setTurns((prev) => [...prev, { role: "user", text: value }]);
    setInput("");
    setPending(true);

    try {
      const data = mode.key === "ask" ? await askRepositoryAgent(value, 5) : await compareRepositoryAgent(value, 5);
      setTurns((prev) => [...prev, { role: "agent", data }]);
    } catch (err) {
      setTurns((prev) => [...prev, { role: "error", text: err.message || "The agent request failed." }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <Box gap="24px" style={{ maxWidth: "880px", width: "100%" }}>
      <Box direction="row" align="center" justify="between">
        <Box gap="4px">
          <Heading level={2} margin="none" color="text-primary">AI Workspace</Heading>
          <Text color="text-secondary">Ask the intelligence supervisor about repositories, skills, and technologies — grounded in your indexed portfolio.</Text>
        </Box>
        {llmHealth.status === "success" && (
          <Box direction="row" align="center" gap="6px">
            {llmHealth.data.status === "healthy" ? <StatusGood color="accent-1" size="16px" /> : <StatusWarning color="warning" size="16px" />}
            <Text size="xsmall" color="text-tertiary">{llmHealth.data.model || "LLM"} · {llmHealth.data.status}</Text>
          </Box>
        )}
      </Box>

      <Box direction="row" gap="8px" align="center">
        {MODES.map((m) => (
          <Button
            key={m.key}
            size="small"
            label={m.label}
            primary={mode.key === m.key}
            secondary={mode.key !== m.key}
            onClick={() => setMode(m)}
          />
        ))}
      </Box>

      <Box background="bg-surface" round="16px" border={{ color: "border-subtle" }} pad="24px" gap="16px" style={{ minHeight: "420px" }}>
        {turns.length === 0 ? (
          <EmptyState
            icon={Chat}
            title={mode.key === "ask" ? "Ask a question about your repositories" : "Compare a repository against the portfolio"}
            subtitle={
              mode.key === "ask"
                ? "e.g. \"which repositories use FastAPI and Redis together?\" or \"what skills are strongest across the portfolio?\""
                : "Enter a repository name (e.g. \"fastapi-auth-service\") to see how it compares against related repositories in the knowledge graph."
            }
          />
        ) : (
          <Box gap="16px">
            {turns.map((turn, i) => (
              <Turn key={i} turn={turn} />
            ))}
          </Box>
        )}
        {pending && <InlineSpinner label={mode.key === "ask" ? "Routing to the right agent…" : "Comparing against the graph…"} />}
      </Box>

      <Box as="form" onSubmit={handleSubmit} direction="row" gap="8px">
        <Box flex>
          <TextInput
            placeholder={mode.key === "ask" ? "Ask about repositories, skills, or technologies…" : "Repository name to compare…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Box>
        <Button type="submit" primary icon={<Send size="16px" />} label="Send" disabled={pending || !input.trim()} />
      </Box>
    </Box>
  );
}
