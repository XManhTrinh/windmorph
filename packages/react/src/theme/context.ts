'use client';

import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import type { ColorMode, ContrastLevel, ResolvedColorMode } from '../tokens/color';
import type { Density } from '../tokens/density';
import type { MotionScheme } from '../tokens/motion';
import { DEFAULT_THEME_STATE, type ThemeState } from './state';

export interface ThemeContextValue extends ThemeState {
  /** `mode` with `"system"` resolved from `prefers-color-scheme`. */
  resolvedMode: ResolvedColorMode;
  /** Names of the themes available to `setTheme`. */
  themes: readonly string[];
  /** Switches the colour theme; a name not in `themes` is ignored (with a warning in development). */
  setTheme: (theme: string) => void;
  /** Switches the colour mode: `light`, `dark` or `system`. */
  setMode: (mode: ColorMode) => void;
  /** Switches the contrast level: `standard`, `medium` or `high`. */
  setContrast: (contrast: ContrastLevel) => void;
  /** Switches the motion scheme: `expressive` or `standard`. */
  setMotion: (motion: MotionScheme) => void;
  /** Switches the web density, `0` to `-3`. */
  setDensity: (density: Density) => void;
}

/** What `ThemeProvider` provides: everything `useTheme` returns but `resolvedMode`. */
export type ThemeProviderValue = Omit<ThemeContextValue, 'resolvedMode'>;

export const ThemeContext = createContext<ThemeProviderValue | null>(null);

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToColorScheme(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const getSystemMode = (): ResolvedColorMode =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

const getServerSystemMode = (): ResolvedColorMode => 'light';

/** The theme applied to the nearest `ThemeProvider` or `ThemeScope`. */
export const ThemeScopeContext = createContext<ThemeState>(DEFAULT_THEME_STATE);

/** One `ThemeScope`'s class and the CSS variables (`--*` keys) of its `style`. */
export interface ThemeScopeLayer {
  className: string;
  variables: Readonly<Record<string, string>>;
}

/**
 * The classes and inline CSS variables of the `ThemeScope`s around this point, outermost first,
 * one layer per scope that sets either, so `Overlay` can repeat them around its portalled
 * content: component tokens an app sets through a scope's class or `style` then reach overlays
 * opened inside it (2026-10-17). Kept per scope (2026-10-24), so an inner scope's value wins
 * however each scope sets it, as on the page.
 */
export const ThemeScopeLayersContext = createContext<readonly ThemeScopeLayer[]>([]);

/**
 * The theme the DOM already carries at this point through `data-*` attributes: the nearest
 * `ThemeScope`'s, or the `ThemeProvider`'s when it writes them on `<html>`; `null` when unknown.
 * A `ThemeScope` puts only the attributes that differ from it on its element.
 */
export const InheritedThemeContext = createContext<ThemeState | null>(null);

/**
 * The theme `<html>` carries (the `ThemeProvider`'s, when it writes it there), for `Overlay`'s
 * wrapper in `document.body`; `null` when unknown.
 */
export const DocumentThemeContext = createContext<ThemeState | null>(null);

/**
 * Reads and changes the app theme set by `ThemeProvider`.
 * @throws if called outside a `ThemeProvider`.
 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  // Read here, in each component that asks, so the device's mode arriving after hydration
  // re-renders only those components and never changes the provider's context value.
  const systemMode = useSyncExternalStore(
    subscribeToColorScheme,
    getSystemMode,
    getServerSystemMode,
  );
  const mode = value?.mode;
  const resolvedMode = mode === undefined || mode === 'system' ? systemMode : mode;
  const theme = useMemo(() => value && { ...value, resolvedMode }, [value, resolvedMode]);
  if (!theme) throw new Error('[@windmorph/react] useTheme() must be used inside <ThemeProvider>.');
  return theme;
}

/** The classes and CSS variables of the `ThemeScope`s around this point (`ThemeScopeLayersContext`). */
export function useThemeScopeLayers(): readonly ThemeScopeLayer[] {
  return useContext(ThemeScopeLayersContext);
}

/** The theme state in effect at this point in the tree, including any `ThemeScope`. */
export function useThemeScope(): ThemeState {
  return useContext(ThemeScopeContext);
}
