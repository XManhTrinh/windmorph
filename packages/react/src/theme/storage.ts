import { readCookie, serializeThemeState, type ThemeState, type ThemeStorage } from './state';

const ONE_YEAR = 60 * 60 * 24 * 365;

export function readStoredTheme(storage: ThemeStorage, key: string): string | null {
  try {
    if (storage === 'cookie') return readCookie(document.cookie, key) ?? null;
    if (storage === 'local-storage') return window.localStorage.getItem(key);
  } catch {
    // Storage can be blocked (private mode, sandboxed iframes); fall back to defaults.
  }
  return null;
}

export function writeStoredTheme(storage: ThemeStorage, key: string, state: ThemeState): void {
  const value = serializeThemeState(state);
  try {
    if (storage === 'cookie') {
      document.cookie = `${key}=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
    } else if (storage === 'local-storage') {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // Persisting is best-effort.
  }
}
