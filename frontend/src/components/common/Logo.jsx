import React from "react";
import { Box, Text } from "grommet";
import styled, { keyframes } from "styled-components";

// HPE Enterprise-style lockup: a rounded "capsule" mark (closer to HPE's
// real pill logo) with a horizontal glyph, referenced from the brand's
// GreenLake site header, plus the "HPE" wordmark. On mount, the mark
// scales/fades in first and the wordmark reveals a beat later — a small
// brand moment rather than everything popping in at once.

const markIn = keyframes`
  from { opacity: 0; transform: scale(0.75); }
  to   { opacity: 1; transform: scale(1); }
`;

const wordIn = keyframes`
  from { opacity: 0; transform: translateX(-6px); }
  to   { opacity: 1; transform: translateX(0); }
`;

const MarkWrap = styled.span`
  display: inline-flex;
  animation: ${markIn} 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
`;

const WordWrap = styled.span`
  display: inline-block;
  animation: ${wordIn} 420ms cubic-bezier(0.4, 0, 0.2, 1) 260ms both;
`;

// True HPE mark: a simple rounded-rectangle outline (no inner bar) —
// matches the reference lockup exactly rather than approximating it.
export function LogoMark({ width = 40, height = 24, color = "#01A982" }) {
  return (
    <MarkWrap>
      <svg width={width} height={height} viewBox="0 0 40 24" fill="none">
        <rect x="1.5" y="1.5" width="37" height="21" rx="10.5" stroke={color} strokeWidth="3" />
      </svg>
    </MarkWrap>
  );
}

// Full lockup: mark + "HPE" wordmark, with the "E"'s two horizontal bars
// picked out in the accent color — the detail that makes the real HPE
// lockup recognizable rather than a generic sans-serif "HPE".
// `collapsed` drops the wordmark for the narrow sidebar rail. `animated`
// (default true) plays the reveal — set false if the logo remounts often
// (e.g. inside a list) and shouldn't replay.
export function Logo({ collapsed = false, accent = "#01A982", animated = true, wordColor = "#F2F4F7" }) {
  const Word = animated ? WordWrap : "span";
  const wordmarkColor = wordColor;

  return (
    <Box direction="row" align="center" gap="10px">
      <LogoMark width={38} height={23} color={accent} />
      {!collapsed && (
        <Word>
          <svg width="54" height="22" viewBox="0 0 54 22" fill="none" aria-label="HPE">
            <text x="0" y="17" fontFamily='"Metric","Inter",sans-serif' fontWeight="700" fontSize="19" letterSpacing="0.5" fill={wordmarkColor}>HP</text>
            <text x="35" y="17" fontFamily='"Metric","Inter",sans-serif' fontWeight="700" fontSize="19" letterSpacing="0.5" fill={accent}>E</text>
          </svg>
        </Word>
      )}
    </Box>
  );
}
