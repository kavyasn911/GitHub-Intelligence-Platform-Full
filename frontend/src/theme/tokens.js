// HPE Design System tokens — single source of truth for color, type,
// spacing, radius, and motion. Values are copied exactly from the
// approved HPE Design System reference (colors, spacing scale,
// typography scale, borders/radius, elevation) rather than approximated.
//
// The reference system only defines one (dark) mode. We derive a light
// mode by inverting surfaces while keeping the same semantic roles, so
// the theme toggle still works, but dark is the primary/approved mode.

export const darkTokens = {
  mode: "dark",
  color: {
    bgBase: "#1F2028", // Back (Background)
    bgSurface: "#2B2F3E", // Surface (Secondary)
    bgSurfaceRaised: "#2B2F3E", // Surface (Card)
    bgSurfaceHover: "#343949",
    borderSubtle: "#4A5163", // Border
    borderStrong: "#5B6478",
    textPrimary: "#FFFFFF", // Text (Primary)
    textSecondary: "#C8CDD8", // Text (Secondary)
    textTertiary: "#8B93A6",
    accent: "#00C781", // Primary (HPE Green)
    accentSoft: "rgba(0, 199, 129, 0.14)",
    accentStrong: "#00E588",
    success: "#008F5A",
    successSoft: "rgba(0, 143, 90, 0.14)",
    warning: "#E5A000",
    warningSoft: "rgba(229, 160, 0, 0.14)",
    critical: "#D63232",
    criticalSoft: "rgba(214, 50, 50, 0.14)",
    info: "#0065FF",
    infoSoft: "rgba(0, 101, 255, 0.14)",
    focus: "#A25FFF",
  },
};

export const lightTokens = {
  mode: "light",
  color: {
    bgBase: "#F4F5F7",
    bgSurface: "#FFFFFF",
    bgSurfaceRaised: "#FFFFFF",
    bgSurfaceHover: "#EDEFF3",
    borderSubtle: "#D8DCE4",
    borderStrong: "#C0C6D2",
    textPrimary: "#1F2028",
    textSecondary: "#4A5163",
    textTertiary: "#767F94",
    accent: "#008F5A",
    accentSoft: "rgba(0, 143, 90, 0.10)",
    accentStrong: "#00734A",
    success: "#008F5A",
    successSoft: "rgba(0, 143, 90, 0.10)",
    warning: "#B5790A",
    warningSoft: "rgba(181, 121, 10, 0.10)",
    critical: "#C22A2A",
    criticalSoft: "rgba(194, 42, 42, 0.10)",
    info: "#0057D8",
    infoSoft: "rgba(0, 87, 216, 0.10)",
    focus: "#8A3FE0",
  },
};

// 3. Typography (HPE Text / Inter)
export const type = {
  fontDisplay: '"Inter", -apple-system, "Segoe UI", sans-serif',
  fontBody: '"Inter", -apple-system, "Segoe UI", sans-serif',
  fontMono: '"IBM Plex Mono", "SFMono-Regular", Menlo, monospace',
  scale: {
    caption: "12px",
    bodySmall: "14px",
    body: "16px",
    heading3: "18px",
    heading2: "20px",
    heading1: "24px",
    display: "32px",
  },
};

// 4. Spacing system — multiples of 8px
export const space = {
  4: "4px",
  8: "8px",
  12: "12px",
  16: "16px",
  24: "24px",
  32: "32px",
  40: "40px",
  48: "48px",
  64: "64px",
};

// 5. Borders & radius
export const radius = {
  sm: "8px",
  md: "12px",
  lg: "16px",
};
export const borderWidth = "1px";

export const layout = {
  topbarHeight: "64px",
  sidebarExpanded: "260px",
  sidebarCollapsed: "72px",
  itemHeight: "44px",
  iconSize: "20px",
  radius: radius.md,
  radiusSm: radius.sm,
  radiusLg: radius.lg,
  transition: "260ms cubic-bezier(0.4, 0, 0.2, 1)",
};
