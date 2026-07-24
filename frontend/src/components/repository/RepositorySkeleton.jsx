import React from "react";
import { Box } from "grommet";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { opacity: 0.5; }
  50% { opacity: 1; }
  100% { opacity: 0.5; }
`;

const Bar = styled(Box)`
  animation: ${shimmer} 1.4s ease-in-out infinite;
  background: var(--skeleton-bg, rgba(255,255,255,0.06));
  border-radius: 6px;
`;

export function RepositorySkeletonRow() {
  return (
    <Box background="bg-surface" round="12px" border={{ color: "border-subtle" }} pad="small" direction="row" align="center" gap="medium">
      <Bar width="40px" height="40px" style={{ borderRadius: "8px", flexShrink: 0 }} />
      <Box gap="8px" flex>
        <Bar width="45%" height="14px" />
        <Bar width="75%" height="11px" />
      </Box>
      <Bar width="52px" height="52px" style={{ borderRadius: "999px", flexShrink: 0 }} />
    </Box>
  );
}

export function RepositorySkeletonList({ count = 3 }) {
  return (
    <Box gap="8px">
      {Array.from({ length: count }).map((_, i) => (
        <RepositorySkeletonRow key={i} />
      ))}
    </Box>
  );
}
