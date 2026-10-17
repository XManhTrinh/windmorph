/**
 * Stacking order for portalled layers, emitted as `--md-sys-z-<name>`.
 * Components never set their own z-index on a root; only overlays use these.
 */
export const Z_INDEX = {
  sticky: 100,
  scrim: 1000,
  dialog: 1100,
  sheet: 1100,
  menu: 1200,
  snackbar: 1300,
  tooltip: 1400,
} as const;

export type ZIndexName = keyof typeof Z_INDEX;
