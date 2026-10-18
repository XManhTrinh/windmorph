/**
 * M3 corner-radius scale (Compose `ShapeTokens`, dp → px 1:1).
 * Emitted as `--md-sys-shape-corner-<name>` and the `rounded-corner-<name>` utilities.
 */
export const CORNERS = {
  none: '0px',
  'extra-small': '4px',
  small: '8px',
  medium: '12px',
  large: '16px',
  'large-increased': '20px',
  'extra-large': '28px',
  'extra-large-increased': '32px',
  'extra-extra-large': '48px',
  full: '9999px',
} as const;

/** A step of the M3 corner scale, from `none` to `full`. */
export type CornerName = keyof typeof CORNERS;
export const CORNER_NAMES = Object.keys(CORNERS) as CornerName[];
