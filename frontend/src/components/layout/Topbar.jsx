import React from "react";
import { Box, Button } from "grommet";
import { Menu, Moon, Sun } from "grommet-icons";
import { Logo } from "../common/Logo";
import { layout } from "../../theme/tokens";

// Deliberately minimal, per spec: hamburger, the animated logo + name,
// and the light/dark toggle. Nothing else — no search bar, no account
// menu (the account block already lives in the sidebar footer).
export function Topbar({ onToggleSidebar, mode, onToggleMode, accent }) {
  return (
    <Box
      as="header"
      direction="row"
      align="center"
      justify="between"
      height={layout.topbarHeight}
      flex={{ shrink: 0 }}
      pad={{ horizontal: "16px" }}
      gap="16px"
      background="bg-surface"
      border={{ side: "bottom", color: "border-subtle" }}
    >
      <Box direction="row" align="center" gap="16px">
        <Button
          icon={<Menu color="text-secondary" />}
          onClick={onToggleSidebar}
          plain
          hoverIndicator={{ color: "bg-surface-hover", round: "6px" }}
          a11yTitle="Toggle sidebar"
          style={{ padding: "8px", borderRadius: "6px" }}
        />

        <Logo accent={accent} />
      </Box>

      <Button
        icon={mode === "dark" ? <Sun color="text-secondary" /> : <Moon color="text-secondary" />}
        onClick={onToggleMode}
        plain
        hoverIndicator={{ color: "bg-surface-hover", round: "6px" }}
        a11yTitle="Toggle theme"
        style={{ padding: "8px", borderRadius: "6px" }}
      />
    </Box>
  );
}
