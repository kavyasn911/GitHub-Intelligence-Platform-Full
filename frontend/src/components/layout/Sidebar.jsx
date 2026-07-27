import React from "react";
import { Box, Button, Text, Avatar, Tip } from "grommet";
import {
  Add,
  Dashboard,
  Search,
  Bookmark,
  History,
  Chat,
  Analytics,
  Nodes,
  System,
  Configure,
  FormPrevious,
  FormDown,
} from "grommet-icons";
import { layout } from "../../theme/tokens";

function SectionLabel({ children, collapsed }) {
  if (collapsed) return null;
  return (
    <Text
      size="10px"
      weight={700}
      color="text-tertiary"
      style={{
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        padding: "0 8px",
        lineHeight: "16px",
        display: "block",
      }}
    >
      {children}
    </Text>
  );
}

function NavItem({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  const content = (
    <Box
      direction="row"
      align="center"
      gap="12px"
      height={layout.itemHeight}
      pad={{ horizontal: collapsed ? "0" : "16px" }}
      round="8px"
      justify={collapsed ? "center" : "start"}
      background={active ? "accent-1" : "transparent"}
      style={{ transition: "background-color 200ms ease", flexShrink: 0 }}
      className="sidebar-nav-item"
    >
      <Icon size={layout.iconSize} color={active ? "#0B1710" : "text-secondary"} style={{ flexShrink: 0 }} />
      {!collapsed && (
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="body"
            weight={active ? 700 : 500}
            color={active ? "#0B1710" : "text-secondary"}
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
            }}
          >
            {item.label}
          </Text>
        </Box>
      )}
    </Box>
  );

  return (
    <Button plain onClick={onClick} a11yTitle={item.label} style={{ width: "100%" }}>
      {collapsed ? <Tip content={item.label} dropProps={{ align: { left: "right" } }}>{content}</Tip> : content}
    </Button>
  );
}

const DISCOVERY_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: Dashboard },
  { key: "discovery", label: "Repository Discovery", icon: Search },
  { key: "saved", label: "Saved Repositories", icon: Bookmark },
  { key: "history", label: "Search History", icon: History },
];

const INTELLIGENCE_ITEMS = [
  { key: "ai-workspace", label: "AI Workspace", icon: Chat },
  { key: "analytics", label: "Repository Analytics", icon: Analytics },
];

const PLATFORM_ITEMS = [
  { key: "knowledge-graph", label: "Knowledge Graph", icon: Nodes },
  { key: "system", label: "System Status", icon: System },
];

export function Sidebar({ collapsed, activePage, onNavigate, onNewSearch, onToggleCollapse, user }) {
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
      <Box flex overflow={{ vertical: "auto", horizontal: "hidden" }} pad={{ vertical: "16px", horizontal: collapsed ? "8px" : "16px" }} style={{ display: "flex", flexDirection: "column", rowGap: "28px", minHeight: 0 }}>
        <Button plain onClick={onNewSearch} a11yTitle="New search" style={{ width: "100%", flexShrink: 0 }}>
          <Box
            direction="row"
            align="center"
            justify={collapsed ? "center" : "start"}
            gap="10px"
            height={layout.itemHeight}
            pad={{ horizontal: collapsed ? "0" : "16px" }}
            round="8px"
            background="accent-1"
          >
            <Add size="16px" color="#0B1710" />
            {!collapsed && (
              <Text size="body" weight={700} color="#0B1710">
                New Search
              </Text>
            )}
          </Box>
        </Button>

        <Box style={{ display: "flex", flexDirection: "column", rowGap: "8px", flexShrink: 0 }}>
          <SectionLabel collapsed={collapsed}>Discovery</SectionLabel>
          <Box style={{ display: "flex", flexDirection: "column", rowGap: "4px" }}>
            {DISCOVERY_ITEMS.map((item) => (
              <NavItem key={item.key} item={item} collapsed={collapsed} active={activePage === item.key} onClick={() => onNavigate(item.key)} />
            ))}
          </Box>
        </Box>

        <Box style={{ display: "flex", flexDirection: "column", rowGap: "8px", flexShrink: 0 }}>
          <SectionLabel collapsed={collapsed}>Intelligence</SectionLabel>
          <Box style={{ display: "flex", flexDirection: "column", rowGap: "4px" }}>
            {INTELLIGENCE_ITEMS.map((item) => (
              <NavItem key={item.key} item={item} collapsed={collapsed} active={activePage === item.key} onClick={() => onNavigate(item.key)} />
            ))}
          </Box>
        </Box>

        <Box style={{ display: "flex", flexDirection: "column", rowGap: "8px", flexShrink: 0 }}>
          <SectionLabel collapsed={collapsed}>Platform</SectionLabel>
          <Box style={{ display: "flex", flexDirection: "column", rowGap: "4px" }}>
            {PLATFORM_ITEMS.map((item) => (
              <NavItem key={item.key} item={item} collapsed={collapsed} active={activePage === item.key} onClick={() => onNavigate(item.key)} />
            ))}
          </Box>
        </Box>
      </Box>

      <Box flex={{ shrink: 0 }} pad={{ horizontal: collapsed ? "8px" : "16px", bottom: "16px" }} style={{ display: "flex", flexDirection: "column", rowGap: "4px" }}>
        <NavItem item={{ key: "settings", label: "Settings", icon: Configure }} collapsed={collapsed} active={activePage === "settings"} onClick={() => onNavigate("settings")} />

        <Button plain onClick={onToggleCollapse} a11yTitle="Collapse sidebar" style={{ width: "100%" }}>
          <Box direction="row" align="center" gap="12px" height={layout.itemHeight} pad={{ horizontal: collapsed ? "0" : "16px" }} round="8px" justify={collapsed ? "center" : "start"} hoverIndicator={{ color: "bg-surface-hover" }}>
            <FormPrevious size={layout.iconSize} color="text-secondary" style={{ transform: collapsed ? "rotate(180deg)" : undefined }} />
            {!collapsed && (
              <Text size="body" weight={500} color="text-secondary">
                Collapse
              </Text>
            )}
          </Box>
        </Button>

        <Box border={{ side: "top", color: "border-subtle" }} margin={{ top: "8px" }} pad={{ top: "8px" }}>
          <Box direction="row" align="center" gap="10px" pad={{ vertical: "6px", horizontal: collapsed ? "0" : "8px" }} round="8px" justify={collapsed ? "center" : "start"} style={{ cursor: "pointer" }} hoverIndicator={{ color: "bg-surface-hover" }} onClick={() => onNavigate("settings")}>
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
                    {user?.role || "Developer"}
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
