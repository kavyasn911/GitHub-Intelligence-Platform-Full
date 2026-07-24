import React, { useState } from "react";
import { Box, Heading, Text, TextInput, Button, CheckBox } from "grommet";
import { StatusGood, StatusWarning } from "grommet-icons";
import { checkHealth } from "../services/discoveryApi";
import { DEFAULT_BASE_URL } from "../services/apiClient";
import { useLocalStorage } from "../hooks/useLocalStorage";

function SettingsSection({ title, description, children }) {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="medium" gap="small">
      <Box gap="2px">
        <Text weight={600} color="text-primary">{title}</Text>
        {description && <Text size="small" color="text-secondary">{description}</Text>}
      </Box>
      {children}
    </Box>
  );
}

export function SettingsPage() {
  const [apiBaseUrl, setApiBaseUrl] = useLocalStorage("argus:apiBaseUrl", DEFAULT_BASE_URL);
  const [draftUrl, setDraftUrl] = useState(apiBaseUrl);
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState(null);
  const [notifications, setNotifications] = useLocalStorage("argus:notificationsEnabled", true);

  async function testConnection() {
    setChecking(true);
    setHealth(null);
    window.localStorage.setItem("argus:apiBaseUrl", JSON.stringify(draftUrl));
    try {
      const res = await checkHealth();
      setHealth({ ok: true, message: res.status || "healthy" });
    } catch (err) {
      setHealth({ ok: false, message: err.message });
    } finally {
      setChecking(false);
    }
  }

  function save() {
    setApiBaseUrl(draftUrl);
  }

  return (
    <Box pad={{ horizontal: "medium", vertical: "large" }} gap="medium" style={{ maxWidth: "640px" }}>
      <Box gap="4px">
        <Heading level={2} margin="none" color="text-primary">Settings</Heading>
        <Text color="text-secondary">Workspace and account preferences.</Text>
      </Box>

      <SettingsSection title="Backend Connection" description="The FastAPI service Argus talks to for discovery, ranking, and intelligence.">
        <TextInput value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)} placeholder={DEFAULT_BASE_URL} />
        <Box direction="row" align="center" gap="small">
          <Button label="Save" primary size="small" onClick={save} />
          <Button label={checking ? "Checking…" : "Test connection"} secondary size="small" onClick={testConnection} disabled={checking} />
          {health && (
            <Box direction="row" align="center" gap="6px">
              {health.ok ? <StatusGood color="accent-1" size="16px" /> : <StatusWarning color="critical" size="16px" />}
              <Text size="small" color={health.ok ? "text-secondary" : "critical"}>{health.message}</Text>
            </Box>
          )}
        </Box>
      </SettingsSection>

      <SettingsSection title="Notifications">
        <CheckBox
          checked={notifications}
          label="Notify me when a discovery search completes"
          onChange={(e) => setNotifications(e.target.checked)}
        />
      </SettingsSection>

      <SettingsSection title="About">
        <Text size="small" color="text-secondary">
          Argus — Repository Intelligence Platform. Frontend built with React, Vite, and Grommet.
        </Text>
      </SettingsSection>
    </Box>
  );
}
