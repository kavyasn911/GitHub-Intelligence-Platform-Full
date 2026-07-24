import React, { useEffect, useRef, useState } from "react";
import { Box, Text } from "grommet";
import { StatusGood } from "grommet-icons";
import styled, { keyframes } from "styled-components";

// The backend answers `discover()` in one request, so there's no
// server-pushed step-by-step signal. We stage through the same
// conceptual steps client-side while the request is in flight, then
// snap to "complete" the moment the response lands.
export const TIMELINE_STEPS = [
  "Understanding",
  "Searching",
  "Analyzing",
  "Ranking",
  "Finalizing",
];

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid ${(p) => p.$track};
  border-top-color: ${(p) => p.$accent};
  animation: ${spin} 0.8s linear infinite;
`;

export function ThinkingTimeline({ active, accent = "#00C781" }) {
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      return undefined;
    }

    setStepIndex(0);
    timerRef.current = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, TIMELINE_STEPS.length - 1));
    }, 900);

    return () => clearInterval(timerRef.current);
  }, [active]);

  if (!active) return null;

  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="medium" gap="medium">
      <Text size="small" weight={600} color="text-primary">
        Searching for the best repositories…
      </Text>

      <Box direction="row" align="center">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          const pending = i > stepIndex;
          const isLast = i === TIMELINE_STEPS.length - 1;

          return (
            <React.Fragment key={step}>
              <Box align="center" gap="6px" flex={{ shrink: 0 }}>
                <Box width="24px" height="24px" align="center" justify="center" round="full" background={done ? "accent-soft" : "transparent"} border={pending ? { color: "border-strong" } : undefined}>
                  {done && <StatusGood color="accent-1" size="16px" />}
                  {current && <Spinner $track="rgba(255,255,255,0.12)" $accent={accent} />}
                  {pending && <Box width="6px" height="6px" round="full" background="border-strong" />}
                </Box>
                <Text size="xsmall" weight={current ? 600 : 500} color={pending ? "text-tertiary" : "text-primary"} style={{ whiteSpace: "nowrap" }}>
                  {step}
                </Text>
              </Box>

              {!isLast && (
                <Box flex style={{ height: "2px", margin: "0 4px", marginBottom: "20px" }} background={done ? "accent-1" : "border-subtle"} />
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
}
