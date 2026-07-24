import React from "react";
import { Box, Text, Button, Spinner } from "grommet";
import { StatusWarning, Search } from "grommet-icons";

export function EmptyState({ title, subtitle, icon: Icon = Search }) {
  return (
    <Box align="center" justify="center" pad={{"top":"medium","bottom":"small"}} gap="xsmall">
      <Box
        background="bg-surface-raised"
        round="full"
        pad="small"
        border={{ color: "border-subtle" }}
      >
        <Icon color="text-tertiary" size="24px" />
      </Box>
      <Text weight={600} color="text-primary">
        {title}
      </Text>
      {subtitle && (
        <Text size="small" color="text-secondary" textAlign="center" style={{ maxWidth: "520px" }}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <Box
      align="center"
      justify="center"
      pad="large"
      gap="small"
      background="critical-soft"
      round="12px"
      border={{ color: "critical", size: "1px" }}
    >
      <StatusWarning color="critical" size="24px" />
      <Text weight={600} color="text-primary">
        Something went wrong
      </Text>
      <Text size="small" color="text-secondary" textAlign="center" style={{ maxWidth: "420px" }}>
        {message}
      </Text>
      {onRetry && (
        <Button label="Try again" onClick={onRetry} secondary size="small" />
      )}
    </Box>
  );
}

export function InlineSpinner({ label = "Loading…" }) {
  return (
    <Box direction="row" align="center" gap="small" pad="small">
      <Spinner color="accent-1" />
      <Text size="small" color="text-secondary">
        {label}
      </Text>
    </Box>
  );
}
