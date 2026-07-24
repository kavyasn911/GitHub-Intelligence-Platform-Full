import React from "react";
import { Box, Button, Text, Avatar } from "grommet";
import { Menu, Moon, Sun, FormDown } from "grommet-icons";
import { Logo } from "../common/Logo";
import { layout } from "../../theme/tokens";

export function Topbar({ onToggleSidebar, mode, onToggleMode, accent, user, onAvatarClick }) {
  return (
    <Box
      as="header"
      direction="row"
      align="center"
      justify="between"
      height={layout.topbarHeight}
      flex={{ shrink: 0 }}
      pad={{ horizontal: "medium" }}
      background="bg-surface"
      border={{ side: "bottom", color: "border-subtle" }}
    >
      <Box direction="row" align="center" gap="medium">
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

      <Box direction="row" align="center" gap="small">
        <Button
          icon={mode === "dark" ? <Sun color="text-secondary" /> : <Moon color="text-secondary" />}
          onClick={onToggleMode}
          plain
          hoverIndicator={{ color: "bg-surface-hover", round: "6px" }}
          a11yTitle="Toggle theme"
          style={{ padding: "8px", borderRadius: "6px" }}
        />

        <Button plain onClick={onAvatarClick} a11yTitle="Account menu">
          <Box direction="row" align="center" gap="8px" pad={{ vertical: "4px", horizontal: "6px" }} round="8px" hoverIndicator={{ color: "bg-surface-hover" }}>
            <Avatar size="32px" background="accent-soft">
              <Text size="small" weight={600} color={accent}>
                {user?.initials || "KS"}
              </Text>
            </Avatar>
            <Text size="small" weight={600} color="text-primary">
              {user?.name || "Kavya S N"}
            </Text>
            <FormDown color="text-tertiary" size="18px" />
          </Box>
        </Button>
      </Box>
    </Box>
  );
}
