'use client';

import { createContext, useContext } from 'react';
import type { ColorMode, ContrastLevel, ResolvedColorMode } from '../tokens/color';
import type { MotionScheme } from '../tokens/motion';
import { DEFAULT_THEME_STATE, type ThemeState } from './state';

export interface ThemeContextValue extends ThemeState {
  /** `mode` with `"system"` resolved from `prefers-color-scheme`. */
  resolvedMode: ResolvedColorMode;
  /** Names of the themes available to `setTheme`. */
  themes: readonly string[];
  setTheme: (theme: string) => void;
  setMode: (mode: ColorMode) => void;
  setContrast: (contrast: ContrastLevel) => void;
  setMotion: (motion: MotionScheme) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/** The theme applied to the nearest `ThemeProvider` or `ThemeScope`. */
export const ThemeScopeContext = createContext<ThemeState>(DEFAULT_THEME_STATE);

/**
 * The classes of the `ThemeScope`s around this point, merged outermost first, so `Overlay`
 * can put them on its portalled wrapper: CSS variables an app sets through a scope's class
 * (component tokens such as `--md-comp-filled-card-container-color`) then reach overlays
 * opened inside it.
 */
export const ThemeScopeClassNameContext = createContext<string>('');

/**
 * Reads and changes the app theme set by `ThemeProvider`.
 * @throws if called outside a `ThemeProvider`.
 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('[@windmorph/react] useTheme() must be used inside <ThemeProvider>.');
  return value;
}

/** The merged classes of the `ThemeScope`s around this point (see `ThemeScopeClassNameContext`). */
export function useThemeScopeClassName(): string {
  return useContext(ThemeScopeClassNameContext);
}

/** The theme state in effect at this point in the tree, including any `ThemeScope`. */
export function useThemeScope(): ThemeState {
  return useContext(ThemeScopeContext);
}
