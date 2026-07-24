// Shared formatting + derivation helpers so components stay declarative.

export function formatCount(n) {
  if (n === null || n === undefined) return "—";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatPercent(value, { fromFraction = false } = {}) {
  if (value === null || value === undefined) return "—";
  const pct = fromFraction ? value * 100 : value;
  return `${Math.round(pct)}%`;
}

export function timeAgo(dateString) {
  if (!dateString) return "—";
  const then = new Date(dateString).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const STRATEGY_COPY = {
  reuse_directly: { label: "Reuse Directly", tone: "accent" },
  fork_and_extend: { label: "Fork & Extend", tone: "info" },
  reuse_components: { label: "Reuse Components", tone: "info" },
  architectural_reference: { label: "Architectural Reference", tone: "warning" },
  reference_only: { label: "Architectural Reference", tone: "warning" },
  build_new: { label: "Build New", tone: "critical" },
};

export function strategyCopy(strategy) {
  return STRATEGY_COPY[strategy] || { label: "Build New", tone: "critical" };
}

const HEALTH_COPY = {
  excellent: { label: "Excellent", tone: "accent" },
  healthy: { label: "Healthy", tone: "accent" },
  moderate: { label: "Moderate", tone: "warning" },
  weak: { label: "Weak", tone: "critical" },
  archived: { label: "Archived", tone: "critical" },
};

export function healthCopy(status) {
  return HEALTH_COPY[status] || { label: "Unknown", tone: "text-tertiary" };
}

// Backend doesn't return a single 0-1 "confidence" for requirement intelligence,
// so we derive a readable label from how it was produced.
export function requirementConfidence(mode) {
  if (mode === "llm") return { label: "High", tone: "accent" };
  if (mode === "deterministic_fallback") return { label: "Medium", tone: "warning" };
  return { label: "—", tone: "text-tertiary" };
}

export function savingsFromScore(score0to100) {
  if (score0to100 === null || score0to100 === undefined) return "—";
  if (score0to100 >= 75) return "High (60–80% faster)";
  if (score0to100 >= 50) return "Moderate (30–50% faster)";
  if (score0to100 >= 25) return "Low (10–20% faster)";
  return "Minimal";
}

export function riskFromSignals({ risks = [], healthPercent = 0 }) {
  const riskCount = Array.isArray(risks) ? risks.length : 0;
  if (riskCount >= 3 || healthPercent < 35) return { label: "High", tone: "critical" };
  if (riskCount >= 1 || healthPercent < 60) return { label: "Medium", tone: "warning" };
  return { label: "Low", tone: "accent" };
}
