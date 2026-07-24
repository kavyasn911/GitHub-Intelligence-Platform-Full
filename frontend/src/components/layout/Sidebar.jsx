import React from "react";
import { Box, Button, Text, Avatar } from "grommet";
import { Add, Dashboard, Search, Save, Configure, FormPrevious, Folder, FormDown, Trash, Cluster } from "grommet-icons";
import { layout } from "../../theme/tokens";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { timeAgo } from "../../utils/format";

function SectionLabel({ children, collapsed }) {
  if (collapsed) return null;
  return (
    <Text
      size="10px"
      weight={700}
      color="text-tertiary"
      style={{ textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px" }}
    >
      {children}
    </Text>
  );
}

function NavItem({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <Button plain onClick={onClick} a11yTitle={item.label}>
      <Box
        direction="row"
        align="center"
        gap="small"
        pad={{ vertical: "10px", horizontal: collapsed ? "small" : "medium" }}
        round="8px"
        justify={collapsed ? "center" : "start"}
        background={active ? "accent-1" : "transparent"}
        style={{ transition: "background-color 200ms ease" }}
        title={collapsed ? item.label : undefined}
        className="sidebar-nav-item"
      >
        <Icon size="18px" color={active ? "#04231A" : "text-secondary"} />
        {!collapsed && (
          <Text size="small" weight={active ? 700 : 500} color={active ? "#04231A" : "text-secondary"}>
            {item.label}
          </Text>
        )}
      </Box>
    </Button>
  );
}

function HistoryItem({ entry, collapsed, onClick }) {
  if (collapsed) return null;
  return (
    <Button plain onClick={onClick} a11yTitle={entry.query}>
      <Box direction="row" align="start" gap="small" pad={{ vertical: "small", horizontal: "medium" }} round="8px" hoverIndicator={{ color: "bg-surface-hover" }}>
        <Box background="bg-surface-hover" round="6px" pad="6px" flex={{ shrink: 0 }}>
          <Folder size="14px" color="text-tertiary" />
        </Box>
        <Box gap="1px" style={{ minWidth: 0 }}>
          <Text size="small" weight={500} color="text-secondary" truncate>
            {entry.query}
          </Text>
          <Text size="10px" color="text-tertiary">
            {timeAgo(entry.timestamp)}
          </Text>
        </Box>
      </Box>
    </Button>
  );
}

export function Sidebar({ collapsed, activePage, onNavigate, onNewSearch, onToggleCollapse, onRerunHistory, user }) {
  const [history, setHistory] = useLocalStorage("argus:history", []);
  const recentHistory = history.slice(0, 3);

  return (
    <Box
      as="nav"
      width={collapsed ? layout.sidebarCollapsed : layout.sidebarExpanded}
      flex={{ shrink: 0 }}
      background="bg-surface"
      border={{ side: "right", color: "border-subtle" }}
      style={{ transition: `width ${layout.transition}`, overflow: "hidden" }}
      height="100%"
    >
      <Box flex overflow={{ vertical: "auto" }} pad={{ vertical: "medium", horizontal: collapsed ? "small" : "medium" }} gap="28px">
        <Button
          primary
          icon={<Add size="16px" />}
          label={collapsed ? undefined : "New Search"}
          onClick={onNewSearch}
          a11yTitle="New search"
          style={{
            justifyContent: collapsed ? "center" : "flex-start",
            paddingLeft: collapsed ? "0" : undefined,
            width: "100%",
          }}
        />

        <Box gap="10px">
          <SectionLabel collapsed={collapsed}>Discover</SectionLabel>
          <Box gap="4px">
            <NavItem item={{ key: "dashboard", label: "Dashboard", icon: Dashboard }} collapsed={collapsed} active={activePage === "dashboard"} onClick={() => onNavigate("dashboard")} />
            <NavItem item={{ key: "discovery", label: "Repository Discovery", icon: Search }} collapsed={collapsed} active={activePage === "discovery"} onClick={() => onNavigate("discovery")} />
          </Box>
        </Box>

        <Box gap="10px">
          <SectionLabel collapsed={collapsed}>Saved</SectionLabel>
          <Box gap="4px">
            <NavItem item={{ key: "saved", label: "Saved Repositories", icon: Save }} collapsed={collapsed} active={activePage === "saved"} onClick={() => onNavigate("saved")} />
          </Box>
        </Box>

        {recentHistory.length > 0 && (
          <Box gap="10px">
            <SectionLabel collapsed={collapsed}>History</SectionLabel>
            <Box gap="2px">
              <Button
plain
label="Clear History"
icon={<Trash size="14px" />}
onClick={() => setHistory([])}
margin={{ bottom: "8px" }}
/>

{recentHistory.map((entry) => (
                <HistoryItem key={entry.timestamp} entry={entry} collapsed={collapsed} onClick={() => onRerunHistory?.(entry.query)} />
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Box flex={{ shrink: 0 }} pad={{ horizontal: collapsed ? "small" : "medium", bottom: "medium" }} gap="4px">
        <SectionLabel collapsed={collapsed}>System</SectionLabel>
        <NavItem item={{ key: "system", label: "System Health", icon: Cluster }} collapsed={collapsed} active={activePage === "system"} onClick={() => onNavigate("system")} />
        <NavItem item={{ key: "settings", label: "Settings", icon: Configure }} collapsed={collapsed} active={activePage === "settings"} onClick={() => onNavigate("settings")} />

        <Button plain onClick={onToggleCollapse} a11yTitle="Collapse sidebar">
          <Box direction="row" align="center" gap="small" pad={{ vertical: "small", horizontal: collapsed ? "small" : "medium" }} round="8px" justify={collapsed ? "center" : "start"} hoverIndicator={{ color: "bg-surface-hover" }}>
            <FormPrevious size="18px" color="text-secondary" style={{ transform: collapsed ? "rotate(180deg)" : undefined }} />
            {!collapsed && (
              <Text size="small" weight={500} color="text-secondary">
                Collapse
              </Text>
            )}
          </Box>
        </Button>

        <Box border={{ side: "top", color: "border-subtle" }} margin={{ top: "small" }} pad={{ top: "small" }}>
          <Box direction="row" align="center" gap="small" pad={{ vertical: "6px", horizontal: collapsed ? "small" : "small" }} round="8px" justify={collapsed ? "center" : "start"} style={{ cursor: "pointer" }} hoverIndicator={{ color: "bg-surface-hover" }}>
            <Avatar size="28px" background="accent-soft" flex={{ shrink: 0 }}>
              <Text size="xsmall" weight={700} color="accent-1">
                {user?.initials || "KS"}
              </Text>
            </Avatar>
            {!collapsed && (
              <>
                <Box style={{ minWidth: 0 }}>
                  <Text size="small" weight={600} color="text-primary" truncate>
                    {user?.name || "Kavya S N"}
                  </Text>
                  <Text size="10px" color="text-tertiary" truncate>
                    {user?.role || "HPE Developer"}
                  </Text>
                </Box>
                <FormDown size="16px" color="text-tertiary" />
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
