import React, { useState, useEffect } from "react";
import { Box, Button, Text, TextArea } from "grommet";
import { GenAI } from "grommet-icons";

const MAX_CHARS = 2000;

export function SearchWorkspace({ onSearch, loading, initialQuery = "" }) {

  const [query, setQuery] = useState(initialQuery);

useEffect(() => {
  setQuery(initialQuery || "");
}, [initialQuery]);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setQuery(initialQuery || "");
  }, [initialQuery]);

  const trimmed = query.trim();
  const canSearch = trimmed.length >= 2 && !loading;

  function submit() {
    if (!canSearch) return;
    onSearch({
      query: trimmed,
      resultLimit: 5
    });
  }

  function handleKeyDown(e) {

    if (e.key === "Enter" && !e.shiftKey) {

      e.preventDefault();

      submit();

    }

  }

  return (
    <Box
      background="bg-surface"
      round="14px"
      border={{
        color: focused ? "accent-1" : "border-subtle",
        size: "1px"
      }}
      pad="large"
      gap="medium"
      style={{
        transition: "border-color 200ms ease"
      }}
    >

      <Text
        size="16px"
        weight={600}
        color="text-primary"
      >
        Project Requirements
      </Text>

      <TextArea
        value={query}
        onChange={(e)=>
          setQuery(
            e.target.value.slice(0,MAX_CHARS)
          )
        }
        onKeyDown={handleKeyDown}
        onFocus={()=>setFocused(true)}
        onBlur={()=>setFocused(false)}
        placeholder="Describe your project..."
        disabled={loading}
        resize={false}
        width="100%"
        rows={5}
        style={{
          width:"100%",
          minHeight:"120px",
          fontSize:"16px",
          lineHeight:"24px",
          padding:"14px",
          borderRadius:"10px",
          boxSizing:"border-box"
        }}
      />

      <Box
        direction="row"
        justify="between"
        align="center"
        margin={{top:"small"}}
      >

        <Text
          size="xsmall"
          color="text-tertiary"
        >
          {trimmed.length} / {MAX_CHARS}
        </Text>

        <Button
          primary
          disabled={!canSearch}
          onClick={submit}
          icon={<GenAI size="16px"/>}
          label={loading ? "Searching..." : "AI Search"}
        />

      </Box>

    </Box>
  );
}

