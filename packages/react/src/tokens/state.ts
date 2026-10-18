/** M3 state-layer opacities (Compose `StateTokens`) and disabled-state opacities. */
export const STATE_OPACITIES = {
  hover: 0.08,
  focus: 0.1,
  pressed: 0.1,
  dragged: 0.16,
  'disabled-content': 0.38,
  'disabled-container': 0.12,
} as const;

export type StateName = keyof typeof STATE_OPACITIES;

/** M3 focus indicator: 3px outline in `secondary`, offset 2px. */
export const FOCUS_INDICATOR = {
  thickness: '3px',
  offset: '2px',
} as const;
