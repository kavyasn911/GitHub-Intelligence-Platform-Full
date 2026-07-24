import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { SavedDiscoveriesPage } from "./pages/SavedDiscoveriesPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { RepositoryDetailsPage } from "./pages/RepositoryDetailsPage";
import { SystemPage } from "./pages/SystemPage";

const PATH_TO_KEY = {
  "/": "discovery",
  "/dashboard": "dashboard",
  "/saved": "saved",
  "/history": "history",
  "/system": "system",
  "/settings": "settings",
};

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingQuery, setPendingQuery] = useState("");

  useEffect(() => {
    if (location.pathname === "/" && location.state?.query) {
      setPendingQuery(location.state.query);
    }
  }, [location.pathname, location.state]);

  function goToRerun(query) {
    navigate("/", { state: { query } });
  }

  return (
    <AppShell
      activePage={PATH_TO_KEY[location.pathname] || "discovery"}
      onNavigate={(key) => navigate(Object.entries(PATH_TO_KEY).find(([, v]) => v === key)?.[0] || "/")}
      onNewSearch={() => {
  setPendingQuery("");
  navigate("/", {
    replace: true,
    state: {
      query: "",
      refresh: Date.now(),
      clear: true,
    },
  });
}}
      onRerunHistory={goToRerun}
    >
      <Routes key={location.pathname}>
        <Route path="/" element={<DiscoveryPage initialQuery={pendingQuery} />} />
        <Route path="/dashboard" element={<DashboardPage onNewSearch={() => {
  setPendingQuery("");
  navigate("/", {
    replace: true,
    state: {
      query: "",
      refresh: Date.now(),
      clear: true,
    },
  });
}} />} />
        <Route path="/saved" element={<SavedDiscoveriesPage onRerun={goToRerun} />} />
        <Route path="/history" element={<HistoryPage onRerun={goToRerun} />} />
        <Route path="/system" element={<SystemPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/repository/:owner/:repo" element={<RepositoryDetailsPage />} />
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
