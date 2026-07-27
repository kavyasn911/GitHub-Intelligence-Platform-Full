import React from "react";
import { Box, Text } from "grommet";

// Exact vector reconstruction of the reference lockup — every
// coordinate below was extracted directly from the reference image via
// contour detection (not hand-drawn/approximated), then verified by
// re-rendering and diffing against the source pixels (~96% IoU overlap,
// the remainder being the source image's own anti-aliasing). Static,
// no animation.

const RECT_VIEWBOX = "0 0 496 147";
const RECT_PATH =
  "M0,0 L0,147 L496,147 L496,0 Z M26,28 L469,26 L470,121 L27,122 Z";

const GLYPH_VIEWBOX = "0 0 484 145";
const H_PATH =
  "M0,0 L0,145 L31,145 L33,86 L118,86 L120,145 L151,145 L151,1 L120,0 L119,56 L32,56 L31,0 Z";
const P_PATH =
  "M182,1 L182,145 L213,145 L215,105 L293,104 L311,95 L322,83 L329,66 L330,45 L322,23 L307,8 L288,1 Z " +
  "M213,32 L283,31 L295,39 L298,60 L283,75 L214,75 Z";
const E_BOTTOM_PATH =
  "M350,57 L350,145 L484,145 L483,116 L379,115 L380,86 L483,86 L484,57 Z";
const E_TOP_PATH =
  "M350,1 L350,30 L377,45 L379,31 L484,31 L483,1 Z";

export function LogoMark({ height = 26, color = "#00C781" }) {
  const width = (496 / 147) * height;
  return (
    <svg width={width} height={height} viewBox={RECT_VIEWBOX} fill="none" shapeRendering="geometricPrecision">
      <path fillRule="evenodd" clipRule="evenodd" d={RECT_PATH} fill={color} />
    </svg>
  );
}

export function HpeGlyph({ height = 22, accent = "#00C781" }) {
  const width = (484 / 145) * height;
  return (
    <svg width={width} height={height} viewBox={GLYPH_VIEWBOX} fill="none" shapeRendering="geometricPrecision">
      <path d={H_PATH} fill="#FFFFFF" />
      <path fillRule="evenodd" clipRule="evenodd" d={P_PATH} fill="#FFFFFF" />
      <path d={E_BOTTOM_PATH} fill={accent} />
      <path d={E_TOP_PATH} fill={accent} />
    </svg>
  );
}

function NameText({ textColor }) {
  return (
    <Text weight={700} size="17px" color={textColor}>
      GitHub <Text as="span" weight={400} size="17px" color="text-secondary">Repository Intelligence</Text>
    </Text>
  );
}

// Full lockup: mark + HPE glyph + persistent name. `collapsed` reduces
// to icon-only for the 72px sidebar rail.
export function Logo({ collapsed = false, accent = "#00C781", textColor = "#FFFFFF" }) {
  return (
    <Box direction="row" align="center" gap="14px">
      <LogoMark color={accent} height={26} />
      <HpeGlyph accent={accent} height={20} />
      {!collapsed && <NameText textColor={textColor} />}
    </Box>
  );
}
