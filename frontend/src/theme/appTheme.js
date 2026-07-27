import { darkTokens, lightTokens, type, radius } from "./tokens";

// Builds a Grommet theme object from our token set. Grommet reads
// global.colors by name, so every token is registered under a matching
// semantic key that components reference directly
// (e.g. background="bg-surface", border="border-subtle").
function buildTheme(tokens) {
  const c = tokens.color;
  const onAccent = "#0B1710"; // text color on top of the green primary

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
        success: c.success,
        "success-soft": c.successSoft,
        critical: c.critical,
        "critical-soft": c.criticalSoft,
        warning: c.warning,
        "warning-soft": c.warningSoft,
        info: c.info,
        "info-soft": c.infoSoft,
        focus: c.focus,
        text: c.textPrimary,
        background: c.bgBase,
        border: c.borderSubtle,
      },
      font: {
        family: type.fontBody,
        size: type.scale.body,
        height: "24px",
      },
      focus: {
        border: { color: "focus" },
        outline: { color: "focus" },
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
      border: { radius: radius.sm },
      padding: { horizontal: "16px", vertical: "9px" },
      primary: {
        color: "brand",
        extend: `
          color: ${onAccent};
          font-weight: 600;
          transition: background-color 200ms ease, transform 150ms ease;
          &:hover { background-color: ${c.accentStrong}; }
          &:active { transform: translateY(1px); }
        `,
      },
      secondary: {
        border: { color: "border-strong", width: "1px" },
        extend: `
          font-weight: 600;
          transition: background-color 200ms ease, border-color 200ms ease;
          &:hover { background-color: ${c.bgSurfaceHover}; border-color: ${c.accent}; }
        `,
      },
      option: {
        extend: `
          color: ${c.accent};
          font-weight: 600;
          &:hover { background-color: ${c.accentSoft}; }
        `,
      },
      disabled: {
        opacity: 0.45,
      },
    },

    card: {
      container: {
        background: "bg-surface-raised",
        round: radius.md,
        elevation: "none",
        extend: `border: 1px solid ${c.borderSubtle};`,
      },
    },

    layer: {
      background: "bg-surface",
      border: { radius: radius.md },
      overlay: { background: "rgba(6, 8, 12, 0.6)" },
    },

    textInput: {
      extend: `font-family: ${type.fontBody};`,
    },

    text: {
      xsmall: { size: type.scale.caption, height: "16px" },
      small: { size: type.scale.bodySmall, height: "20px" },
      medium: { size: type.scale.body, height: "24px" },
      large: { size: type.scale.heading3, height: "26px" },
      xlarge: { size: type.scale.heading2, height: "28px" },
      xxlarge: { size: type.scale.heading1, height: "32px" },
    },

    heading: {
      font: { family: type.fontDisplay },
      weight: 600,
      level: {
        1: { small: { size: "26px", height: "32px" }, medium: { size: type.scale.display, height: "40px" } },
        2: { small: { size: "20px", height: "26px" }, medium: { size: type.scale.heading1, height: "30px" } },
        3: { small: { size: "17px", height: "22px" }, medium: { size: type.scale.heading3, height: "24px" } },
      },
    },

    tip: {
      content: {
        background: "bg-surface-raised",
        elevation: "medium",
      },
    },

    checkBox: {
      color: "accent-1",
      hover: { border: { color: "accent-1" } },
    },
  };
}

export const darkTheme = buildTheme(darkTokens);
export const lightTheme = buildTheme(lightTokens);
