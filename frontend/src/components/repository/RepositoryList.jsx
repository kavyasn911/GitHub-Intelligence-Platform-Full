import React from "react";
import { Box, Heading } from "grommet";
import { AlternativeRepositoryRow } from "./AlternativeRepositoryRow";
import { EmptyState } from "../common/StateViews";

export function RepositoryList({ repositories, isSaved, onToggleSave }) {
  if (!repositories || repositories.length === 0) {
    return <EmptyState title="No alternative repositories found" subtitle="Try broadening your query or increasing the result count." />;
  }

  return (
    <Box gap="14px">
      <Heading level={3} margin="none" size="16px" color="text-primary">
        Alternative Repositories
      </Heading>
      <Box gap="18px" style={{overflow:"visible"}}>
        {repositories.map((repo) => (
          <AlternativeRepositoryRow
            key={repo.full_name || repo.id}
            repository={repo}
            isSaved={isSaved?.(repo.full_name)}
            onToggleSave={onToggleSave}
          />
        ))}
      </Box>
    </Box>
  );
}
