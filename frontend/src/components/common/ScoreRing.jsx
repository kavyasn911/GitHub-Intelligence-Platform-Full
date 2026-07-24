import React from "react";
import { Box, Text } from "grommet";

// Compact circular score indicator used for match % / confidence / health.
// Pure SVG (no chart lib needed for a single ring).
export function ScoreRing({ value = 0, size = 56, stroke = 5, color = "#04C08C", label }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference * (1 - clamped / 100);

  return (
    <Box align="center" justify="center" style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="var(--ring-track, rgba(255,255,255,0.08))" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <Box style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column" }} align="center">
        <Text size="13px" weight={700} color="text-primary">
          {Math.round(clamped)}%
        </Text>
        {label && (
          <Text size="9px" color="text-tertiary" style={{ marginTop: "-2px" }}>
            {label}
          </Text>
        )}
      </Box>
    </Box>
  );
}
