import {
  DEFAULT_STORAGE_KEY,
  DEFAULT_THEME_STATE,
  parseThemeState,
  readCookie,
  type ThemeState,
} from '../theme/state';

/** Anything with a `get(name)` like Next's `cookies()` store or `NextRequest.cookies`. */
export interface CookieReader {
  get(name: string): { value: string } | undefined;
}

export interface GetThemeFromCookiesOptions {
  /** Values used for anything not stored. Must match the `ThemeProvider` defaults. */
  defaults?: Partial<ThemeState>;
  /** Must match `ThemeProvider`'s `storageKey`. */
  storageKey?: string;
  /** Allowed theme names; a stored theme outside this list falls back to the default. */
  themes?: readonly string[];
}

/**
 * Reads the theme selection saved by `ThemeProvider` (with `storage="cookie"`) so the
 * server can render the right `data-*` attributes on `<html>` and avoid a theme flash.
 *
 * @example
 * // app/layout.tsx
 * const theme = getThemeFromCookies(await cookies());
 * <html lang="en" {...themeAttributes(theme)}>
 *   <body>
 *     <ThemeProvider defaultTheme={theme.theme} defaultMode={theme.mode}
 *       defaultContrast={theme.contrast} defaultMotion={theme.motion}>…</ThemeProvider>
 */
export function getThemeFromCookies(
  cookies: CookieReader | string | null | undefined,
  { defaults, storageKey = DEFAULT_STORAGE_KEY, themes }: GetThemeFromCookiesOptions = {},
): ThemeState {
  const raw =
    typeof cookies === 'string' ? readCookie(cookies, storageKey) : cookies?.get(storageKey)?.value;
  return { ...DEFAULT_THEME_STATE, ...defaults, ...parseThemeState(raw, themes) };
}
