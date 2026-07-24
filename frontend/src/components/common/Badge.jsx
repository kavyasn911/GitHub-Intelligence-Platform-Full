import React from "react";
import { Box, Text } from "grommet";

const TONE_BG = {
  accent: "accent-soft",
  warning: "warning-soft",
  critical: "critical-soft",
  info: "rgba(92, 200, 255, 0.12)",
  "text-tertiary": "bg-surface-hover",
};

const TONE_FG = {
  accent: "accent-1",
  warning: "warning",
  critical: "critical",
  info: "info",
  "text-tertiary": "text-secondary",
};

export function Badge({ label, tone = "text-tertiary", size = "small" }) {
  return (
    <Box
      background={TONE_BG[tone] || TONE_BG["text-tertiary"]}
      pad={{ vertical: "2px", horizontal: "8px" }}
      round="999px"
      align="center"
      justify="center"
      style={{ display: "inline-flex" }}
    >
      <Text size={size === "small" ? "11px" : "12px"} weight={600} color={TONE_FG[tone] || TONE_FG["text-tertiary"]}>
        {label}
      </Text>
    </Box>
  );
}
