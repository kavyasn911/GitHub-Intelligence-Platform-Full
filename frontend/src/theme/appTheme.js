import { darkTokens, lightTokens, type } from "./tokens";

// Builds a Grommet theme object from our token set.
// Grommet reads global.colors by name, so every token is registered
// under a matching semantic key that components reference directly
// (e.g. background="bg-surface", border="border-subtle").
function buildTheme(tokens) {
  const c = tokens.color;

  return {
    global: {
      colors: {
        "bg-base": c.bgBase,
        "bg-surface": c.bgSurface,
        "bg-surface-raised": c.bgSurfaceRaised,
        "bg-surface-hover": c.bgSurfaceHover,
        "border-subtle": c.borderSubtle,
        "border-strong": c.borderStrong,
        "text-primary": c.textPrimary,
        "text-secondary": c.textSecondary,
        "text-tertiary": c.textTertiary,
        brand: c.accent,
        "accent-1": c.accent,
        "accent-soft": c.accentSoft,
        "accent-strong": c.accentStrong,
        critical: c.critical,
        "critical-soft": c.criticalSoft,
        warning: c.warning,
        "warning-soft": c.warningSoft,
        info: c.info,
        text: c.textPrimary,
        background: c.bgBase,
        border: c.borderSubtle,
        focus: c.accent,
      },
      font: {
        family: type.fontBody,
        size: type.scale.md,
        height: "22px",
      },
      focus: {
        border: { color: "accent-1" },
        outline: { color: "accent-1" },
      },
      edgeSize: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      breakpoints: {
        small: { value: 768 },
        medium: { value: 1280 },
        large: {},
      },
    },

    button: {
      border: { radius: "8px" },
      padding: { horizontal: "16px", vertical: "9px" },
      primary: {
        color: "brand",
        extend: `
          color: ${tokens.mode === "dark" ? "#04231A" : "#FFFFFF"};
          font-weight: 600;
          &:hover { background-color: ${c.accentStrong}; }
        `,
      },
      secondary: {
        border: { color: "border-strong", width: "1px" },
        extend: `
          &:hover { background-color: ${c.bgSurfaceHover}; border-color: ${c.accent}; }
        `,
      },
    },

    card: {
      container: {
        background: "bg-surface-raised",
        round: "12px",
        elevation: tokens.mode === "dark" ? "none" : "small",
        extend: `border: 1px solid ${c.borderSubtle};`,
      },
    },

    layer: {
      background: "bg-surface",
    },

    text: {
      xsmall: { size: type.scale.xs, height: "16px" },
      small: { size: type.scale.sm, height: "18px" },
      medium: { size: type.scale.md, height: "22px" },
      large: { size: type.scale.lg, height: "26px" },
      xlarge: { size: type.scale.xl, height: "30px" },
      xxlarge: { size: type.scale.xxl, height: "36px" },
    },

    heading: {
      font: { family: type.fontDisplay },
      weight: 600,
      level: {
        1: { small: { size: "26px", height: "32px" }, medium: { size: "30px", height: "36px" } },
        2: { small: { size: "20px", height: "26px" }, medium: { size: "22px", height: "28px" } },
      },
    },

    tip: {
      content: {
        background: "bg-surface-raised",
        elevation: "medium",
      },
    },
  };
}

export const darkTheme = buildTheme(darkTokens);
export const lightTheme = buildTheme(lightTokens);
