import {
  COLOR_MODES,
  CONTRAST_LEVEL_NAMES,
  DEFAULT_THEME,
  type ColorMode,
  type ContrastLevel,
} from '../tokens/color';
import { DEFAULT_DENSITY, isDensity, type Density } from '../tokens/density';
import { DEFAULT_MOTION_SCHEME, MOTION_SCHEMES, type MotionScheme } from '../tokens/motion';

/** The theme dimensions, mirrored as `data-*` attributes. */
export interface ThemeState {
  /** The colour theme's name: a built-in (`baseline`, `ocean` …) or one made with `createTheme`. */
  theme: string;
  /** `light`, `dark` or `system` (follows `prefers-color-scheme`). */
  mode: ColorMode;
  /** `standard`, `medium` or `high`. */
  contrast: ContrastLevel;
  /** `expressive` (springs that overshoot) or `standard` (no visible overshoot). */
  motion: MotionScheme;
  /** Web density, `0` (default) to `-3` (densest); see `Density`. */
  density: Density;
}

export const DEFAULT_THEME_STATE: ThemeState = {
  theme: DEFAULT_THEME,
  mode: 'system',
  contrast: 'standard',
  motion: DEFAULT_MOTION_SCHEME,
  density: DEFAULT_DENSITY,
};

/** Where the selected theme is remembered between visits. */
export type ThemeStorage = 'cookie' | 'local-storage' | 'none';

export const DEFAULT_STORAGE_KEY = 'windmorph-theme';

const THEME_NAME = /^[a-z][a-z0-9-]*$/;

const includes = <T extends string>(list: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (list as readonly string[]).includes(value);

/** Serialises a theme state for a cookie or localStorage value. */
export function serializeThemeState(state: ThemeState): string {
  return encodeURIComponent(
    new URLSearchParams({
      theme: state.theme,
      mode: state.mode,
      contrast: state.contrast,
      motion: state.motion,
      density: String(state.density),
    }).toString(),
  );
}

/**
 * Parses a stored theme state. Unknown or invalid values are dropped, so the
 * result only contains fields that can be trusted.
 */
export function parseThemeState(
  raw: string | null | undefined,
  themes?: readonly string[],
): Partial<ThemeState> {
  if (!raw) return {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(decodeURIComponent(raw));
  } catch {
    return {};
  }
  const result: Partial<ThemeState> = {};
  const theme = params.get('theme');
  if (theme && THEME_NAME.test(theme) && (!themes || themes.includes(theme))) result.theme = theme;
  const mode = params.get('mode');
  if (includes(COLOR_MODES, mode)) result.mode = mode;
  const contrast = params.get('contrast');
  if (includes(CONTRAST_LEVEL_NAMES, contrast)) result.contrast = contrast;
  const motion = params.get('motion');
  if (includes(MOTION_SCHEMES, motion)) result.motion = motion;
  const density = params.get('density');
  if (density !== null && isDensity(density)) result.density = Number(density) as Density;
  return result;
}

/** The `data-*` attributes for a theme state, for `<html>` or any themed element. */
export function themeAttributes(state: ThemeState) {
  return {
    'data-theme': state.theme,
    'data-mode': state.mode,
    'data-contrast': state.contrast,
    'data-motion': state.motion,
    'data-density': `${state.density}`,
  } as const;
}

/**
 * The `data-*` attributes an element needs to carry `state` inside an ancestor that already
 * carries `inherited` (2026-10-24): only the dimensions that differ, so the theme's rules don't
 * declare the same values again there and an app's own values for the system tokens (an
 * `:root` rule) still reach it. The colour dimensions go together, since one rule reads the
 * theme, mode and contrast of the same element. With no known `inherited` (a portal into an
 * app's own container, a provider that leaves `<html>` alone), every attribute.
 */
export function themeAttributesOver(
  state: ThemeState,
  inherited: ThemeState | null,
): Partial<ReturnType<typeof themeAttributes>> {
  const all = themeAttributes(state);
  if (!inherited) return all;
  const colors =
    state.theme !== inherited.theme ||
    state.mode !== inherited.mode ||
    state.contrast !== inherited.contrast;
  return {
    ...(colors && {
      'data-theme': all['data-theme'],
      'data-mode': all['data-mode'],
      'data-contrast': all['data-contrast'],
    }),
    ...(state.motion !== inherited.motion && { 'data-motion': all['data-motion'] }),
    ...(state.density !== inherited.density && { 'data-density': all['data-density'] }),
  };
}

export function readCookie(cookieString: string, name: string): string | undefined {
  for (const part of cookieString.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}
