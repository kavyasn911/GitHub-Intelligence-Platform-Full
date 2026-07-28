import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { SavedDiscoveriesPage } from "./pages/SavedDiscoveriesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { RepositoryDetailsPage } from "./pages/RepositoryDetailsPage";
import { SystemPage } from "./pages/SystemPage";
import { AIWorkspacePage } from "./pages/AIWorkspacePage";
import { RepositoryAnalyticsPage } from "./pages/RepositoryAnalyticsPage";
import { KnowledgeGraphPage } from "./pages/KnowledgeGraphPage";

const PATH_TO_KEY = {
  "/": "discovery",
  "/dashboard": "dashboard",
  "/saved": "saved",
  "/history": "history",
  "/ai-workspace": "ai-workspace",
  "/analytics": "analytics",
  "/knowledge-graph": "knowledge-graph",
  "/system": "system",
  "/settings": "settings",
};

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Shared state that survives route changes
  const [discoveryState, setDiscoveryState] = useState({
    query: "",
    result: null,
  });

  useEffect(() => {
    if (location.pathname === "/" && location.state?.query) {
      setDiscoveryState((prev) => ({
        ...prev,
        query: location.state.query,
      }));
    }
  }, [location.pathname, location.state]);

  function goToRerun(query) {
    setDiscoveryState((prev) => ({
      ...prev,
      query,
    }));

    navigate("/", {
      state: { query },
    });
  }

  function clearAndGoToDiscovery() {
    setDiscoveryState({
      query: "",
      result: null,
    });

    navigate("/", {
      replace: true,
      state: {
        query: "",
        refresh: Date.now(),
        clear: true,
      },
    });
  }

  return (
    <AppShell
      activePage={PATH_TO_KEY[location.pathname] || "discovery"}
      onNavigate={(key) =>
        navigate(
          Object.entries(PATH_TO_KEY).find(([, v]) => v === key)?.[0] || "/"
        )
      }
      onNewSearch={clearAndGoToDiscovery}
      onSearchSubmit={goToRerun}
    >
      <Routes>
        <Route
          path="/"
          element={
            <DiscoveryPage
              discoveryState={discoveryState}
              setDiscoveryState={setDiscoveryState}
            />
          }
        />

        <Route
          path="/dashboard"
          element={
            <DashboardPage
              onNewSearch={clearAndGoToDiscovery}
              onNavigate={(key) =>
                navigate(
                  Object.entries(PATH_TO_KEY).find(([, v]) => v === key)?.[0] ||
                    "/"
                )
              }
            />
          }
        />

        <Route
          path="/saved"
          element={<SavedDiscoveriesPage onRerun={goToRerun} />}
        />

        <Route
          path="/history"
          element={<HistoryPage onRerun={goToRerun} />}
        />

        <Route path="/ai-workspace" element={<AIWorkspacePage />} />
        <Route path="/analytics" element={<RepositoryAnalyticsPage />} />
        <Route path="/knowledge-graph" element={<KnowledgeGraphPage />} />
        <Route path="/system" element={<SystemPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route
          path="/repository/:owner/:repo"
          element={<RepositoryDetailsPage />}
        />
      </Routes>
    </AppShell>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

export default App;