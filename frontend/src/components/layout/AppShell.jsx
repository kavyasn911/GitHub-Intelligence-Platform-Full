import React, { useContext, useEffect, useState } from "react";
import { Grommet, Box, Layer, ResponsiveContext } from "grommet";
import { darkTheme, lightTheme } from "../../theme/appTheme";
import { darkTokens, lightTokens } from "../../theme/tokens";
import { Topbar } from "./Topbar";
import { Sidebar } from "./Sidebar";

const CURRENT_USER = { name: "Kavya S N", role: "HPE Developer", initials: "KS" };

function ShellBody({ activePage, onNavigate, onNewSearch, onRerunHistory, mode, setMode, accent, wordColor, children }) {
  const size = useContext(ResponsiveContext);
  const isSmall = size === "small";

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // On small screens the sidebar behaves as an overlay drawer rather than
  // squeezing the content column; on larger screens it collapses to a rail.
  useEffect(() => {
    if (isSmall) setCollapsed(true);
  }, [isSmall]);

  function handleToggleSidebar() {
    if (isSmall) {
      setMobileOpen((v) => !v);
    } else {
      setCollapsed((c) => !c);
    }
  }

  function handleNavigate(key) {
    onNavigate(key);
    setMobileOpen(false);
  }

  const sidebarProps = {
    activePage,
    onNavigate: handleNavigate,
    onNewSearch,
    onRerunHistory,
    onToggleCollapse: handleToggleSidebar,
    user: CURRENT_USER,
  };

  return (
    <Box style={{
  minHeight:"100vh",
  display:"flex"
}} background="bg-base">
      <Topbar
        onToggleSidebar={handleToggleSidebar}
        mode={mode}
        onToggleMode={() => setMode((m) => (m === "dark" ? "light" : "dark"))}
        accent={accent}
        user={CURRENT_USER}
        onAvatarClick={() => handleNavigate("settings")}
      />

      <Box
        direction="row"
        flex
        style={{
          minHeight: 0,
          overflow: "visible"
        }}
      >
        {!isSmall && <Sidebar collapsed={collapsed} {...sidebarProps} />}

        {isSmall && mobileOpen && (
          <Layer position="left" full="vertical" onEsc={() => setMobileOpen(false)} onClickOutside={() => setMobileOpen(false)} responsive={false}>
            <Sidebar collapsed={false} {...sidebarProps} />
          </Layer>
        )}

        
<Box
          as="main"
          flex
          background="bg-base"
          style={{
            overflowY:"auto",
            overflowX:"hidden",
            flex:1,
            display: "block",
            padding: "32px"
          }}
        >
          <Box
            style={{
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto"
            }}
          >
            {children}
          </Box>
        </Box>

      </Box>
    </Box>
  );
}

export function AppShell({ activePage, onNavigate, onNewSearch, onRerunHistory, children }) {
  const [mode, setMode] = useState("dark");
  const theme = mode === "dark" ? darkTheme : lightTheme;
  const accent = mode === "dark" ? darkTokens.color.accent : lightTokens.color.accent;
  const wordColor = mode === "dark" ? darkTokens.color.textPrimary : lightTokens.color.textPrimary;

  return (
    <Grommet theme={theme} background="bg-base" full themeMode={mode}>
      <ShellBody
        activePage={activePage}
        onNavigate={onNavigate}
        onNewSearch={onNewSearch}
        onRerunHistory={onRerunHistory}
        mode={mode}
        setMode={setMode}
        accent={accent}
        wordColor={wordColor}
      >
        {children}
      </ShellBody>
    </Grommet>
  );
}
