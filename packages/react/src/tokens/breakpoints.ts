/**
 * M3 window size classes as Tailwind breakpoints (min-widths).
 * Compact (< 600px) is the mobile-first default and has no prefix.
 */
export const BREAKPOINTS = {
  medium: '600px',
  expanded: '840px',
  large: '1200px',
  xlarge: '1600px',
} as const;

export type BreakpointName = keyof typeof BREAKPOINTS;
export const BREAKPOINT_NAMES = Object.keys(BREAKPOINTS) as BreakpointName[];
