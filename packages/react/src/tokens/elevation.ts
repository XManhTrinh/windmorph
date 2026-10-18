/**
 * M3 elevation levels (Compose `ElevationTokens`) and their shadows.
 * Shadows follow the M3 design kit's key + ambient pair and are tinted with the
 * `shadow` colour role, so they follow the active theme.
 */
export const ELEVATION_LEVELS = {
  0: { dp: 0, key: null, ambient: null },
  1: { dp: 1, key: '0 1px 2px 0', ambient: '0 1px 3px 1px' },
  2: { dp: 3, key: '0 1px 2px 0', ambient: '0 2px 6px 2px' },
  3: { dp: 6, key: '0 1px 3px 0', ambient: '0 4px 8px 3px' },
  4: { dp: 8, key: '0 2px 3px 0', ambient: '0 6px 10px 4px' },
  5: { dp: 12, key: '0 4px 4px 0', ambient: '0 8px 12px 6px' },
} as const;

export type ElevationLevel = keyof typeof ELEVATION_LEVELS;
export const ELEVATION_LEVEL_NAMES = Object.keys(ELEVATION_LEVELS).map(Number) as ElevationLevel[];

export const SHADOW_KEY_OPACITY = 0.3;
export const SHADOW_AMBIENT_OPACITY = 0.15;
