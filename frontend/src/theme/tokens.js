// Argus design tokens
// Single source of truth for color, type, spacing, and motion.
// Grommet theme + any styled-components both read from here.

// HPE brand alignment: HPE Green (#01A982) as the single accent across
// modes, with GreenLake's near-black slate as the dark background rather
// than the previous green-tinted neutral. Values matched against the
// provided HPE lockup + GreenLake product screenshots.
export const darkTokens = {
  mode: "dark",
  color: {
    bgBase: "#0A0F1A",
    bgSurface: "#101623",
    bgSurfaceRaised: "#161D2C",
    bgSurfaceHover: "#1C2434",
    borderSubtle: "#232C3F",
    borderStrong: "#333F57",
    textPrimary: "#F2F4F7",
    textSecondary: "#9AA5B8",
    textTertiary: "#6B7690",
    accent: "#01A982",
    accentSoft: "rgba(1, 169, 130, 0.14)",
    accentStrong: "#28C79E",
    critical: "#FF6B6B",
    criticalSoft: "rgba(255, 107, 107, 0.12)",
    warning: "#FFC069",
    warningSoft: "rgba(255, 192, 105, 0.12)",
    info: "#5CB8FF",
  },
};

export const lightTokens = {
  mode: "light",
  color: {
    bgBase: "#F4F6F9",
    bgSurface: "#FFFFFF",
    bgSurfaceRaised: "#FFFFFF",
    bgSurfaceHover: "#EDF1F5",
    borderSubtle: "#DFE4EC",
    borderStrong: "#C4CBD8",
    textPrimary: "#0F1521",
    textSecondary: "#4B566B",
    textTertiary: "#7A8496",
    accent: "#017A63",
    accentSoft: "rgba(1, 122, 99, 0.10)",
    accentStrong: "#01614F",
    critical: "#D63C3C",
    criticalSoft: "rgba(214, 60, 60, 0.10)",
    warning: "#B5790A",
    warningSoft: "rgba(181, 121, 10, 0.10)",
    info: "#0A6FB5",
  },
};

export const type = {
  fontDisplay: '"Metric", "Inter", -apple-system, "Segoe UI", sans-serif',
  fontBody: '"Metric", "Inter", -apple-system, "Segoe UI", sans-serif',
  fontMono: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
  scale: {
    xs: "12px",
    sm: "13px",
    md: "15px",
    lg: "18px",
    xl: "22px",
    xxl: "28px",
  },
};

export const layout = {
  topbarHeight: "64px",
  sidebarExpanded: "248px",
  sidebarCollapsed: "72px",
  radius: "12px",
  radiusSm: "8px",
  transition: "200ms cubic-bezier(0.4, 0, 0.2, 1)",
};
