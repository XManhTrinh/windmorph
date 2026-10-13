import {
  COLOR_MODES,
  CONTRAST_LEVEL_NAMES,
  DEFAULT_THEME,
  type ColorMode,
  type ContrastLevel,
} from '../tokens/color';
import { DEFAULT_MOTION_SCHEME, MOTION_SCHEMES, type MotionScheme } from '../tokens/motion';

/** The four theme dimensions, mirrored as `data-*` attributes. */
export interface ThemeState {
  theme: string;
  mode: ColorMode;
  contrast: ContrastLevel;
  motion: MotionScheme;
}

export const DEFAULT_THEME_STATE: ThemeState = {
  theme: DEFAULT_THEME,
  mode: 'system',
  contrast: 'standard',
  motion: DEFAULT_MOTION_SCHEME,
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
  return result;
}

/** The `data-*` attributes for a theme state, for `<html>` or any themed element. */
export function themeAttributes(state: ThemeState) {
  return {
    'data-theme': state.theme,
    'data-mode': state.mode,
    'data-contrast': state.contrast,
    'data-motion': state.motion,
  } as const;
}

export function readCookie(cookieString: string, name: string): string | undefined {
  for (const part of cookieString.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return value.join('=');
  }
  return undefined;
}
