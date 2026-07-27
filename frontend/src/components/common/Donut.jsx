import React from "react";
import { Box, Text } from "grommet";

const PALETTE = ["#00C781", "#0065FF", "#E5A000", "#A25FFF", "#D63232", "#00E588", "#8B93A6"];

// A simple stroke-dasharray donut — no external chart library needed,
// and it degrades gracefully to "no data" when the backend has nothing
// to report yet (e.g. before the knowledge graph has been synced).
export function Donut({ entries, size = 148, thickness = 20, centerLabel, centerValue }) {
  const total = entries.reduce((sum, [, v]) => sum + v, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const segments = entries.map(([label, value], i) => {
    const fraction = total > 0 ? value / total : 0;
    const length = fraction * circumference;
    const segment = {
      label,
      value,
      color: PALETTE[i % PALETTE.length],
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -offset,
    };
    offset += length;
    return segment;
  });

  return (
    <Box direction="row" align="center" gap="20px" wrap>
      <Box style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={thickness} />
          {segments.map((s) => (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <Box
          style={{ position: "absolute", inset: 0 }}
          align="center"
          justify="center"
        >
          <Text size="20px" weight={700} color="text-primary">{centerValue}</Text>
          <Text size="10px" color="text-tertiary">{centerLabel}</Text>
        </Box>
      </Box>

      <Box gap="8px">
        {segments.map((s) => (
          <Box key={s.label} direction="row" align="center" gap="8px">
            <Box width="10px" height="10px" round="3px" background={s.color} flex={{ shrink: 0 }} />
            <Text size="small" color="text-secondary">{s.label}</Text>
            <Text size="small" color="text-tertiary">{s.value}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
