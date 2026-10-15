'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  BUILT_IN_THEME_NAMES,
  type BuiltInThemeName,
  type ColorMode,
  type ContrastLevel,
  type ResolvedColorMode,
} from '../tokens/color';
import type { Density } from '../tokens/density';
import type { MotionScheme } from '../tokens/motion';
import { ThemeContext, ThemeScopeContext, type ThemeContextValue } from './context';
import type { ThemeDefinition } from './create-theme';
import {
  DEFAULT_STORAGE_KEY,
  DEFAULT_THEME_STATE,
  parseThemeState,
  themeAttributes,
  type ThemeState,
  type ThemeStorage,
} from './state';
import { readStoredTheme, writeStoredTheme } from './storage';

export interface ThemeProviderProps {
  children?: ReactNode;
  /**
   * Themes available to `setTheme`: built-in names and/or `createTheme()` results.
   * Defaults to all six built-in themes.
   */
  themes?: ReadonlyArray<BuiltInThemeName | ThemeDefinition>;
  /** Controlled colour theme. */
  theme?: string;
  /** Initial colour theme when uncontrolled. @default "baseline" */
  defaultTheme?: string;
  /** Called with the new colour theme when it changes. */
  onThemeChange?: (theme: string) => void;
  /** Controlled colour mode. */
  mode?: ColorMode;
  /** Initial colour mode when uncontrolled. @default "system" */
  defaultMode?: ColorMode;
  /** Called with the new colour mode when it changes. */
  onModeChange?: (mode: ColorMode) => void;
  /** Controlled contrast level. */
  contrast?: ContrastLevel;
  /** Initial contrast level when uncontrolled. @default "standard" */
  defaultContrast?: ContrastLevel;
  /** Called with the new contrast level when it changes. */
  onContrastChange?: (contrast: ContrastLevel) => void;
  /** Controlled motion scheme. */
  motion?: MotionScheme;
  /** Initial motion scheme when uncontrolled. @default "expressive" */
  defaultMotion?: MotionScheme;
  /** Called with the new motion scheme when it changes. */
  onMotionChange?: (motion: MotionScheme) => void;
  /**
   * Controlled web density, `0` to `-3`: each step takes 4px off the height of fields, menus
   * and other dense-capable components. M3 asks for density to be the reader's choice, not a
   * default, so offer it as a setting; keep the control that changes it at 48px or more.
   */
  density?: Density;
  /** Initial web density when uncontrolled. @default 0 */
  defaultDensity?: Density;
  /** Called with the new density when it changes. */
  onDensityChange?: (density: Density) => void;
  /**
   * Where the selection is remembered. Use `"cookie"` (default) with
   * `getThemeFromCookies` or `ThemeScript` for flash-free server rendering.
   * @default "cookie"
   */
  storage?: ThemeStorage;
  /** Cookie or localStorage key. @default "windmorph-theme" */
  storageKey?: string;
  /**
   * Whether the theme attributes are written to `<html>`. Set to `false` when you
   * render them yourself or theme a subtree with `ThemeScope` instead.
   * @default true
   */
  applyToDocument?: boolean;
}

const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeToColorScheme(onChange: () => void) {
  const query = window.matchMedia(DARK_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

const getSystemMode = (): ResolvedColorMode =>
  window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';

const subscribeToNothing = () => () => {};

/** Re-reads localStorage when another tab changes the theme. Cookies have no change event. */
function subscribeToStorage(storage: ThemeStorage, key: string, onChange: () => void) {
  if (storage !== 'local-storage') return () => {};
  const listener = (event: StorageEvent) => {
    if (event.key === key) onChange();
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

/**
 * One theme dimension: the controlled prop wins, then the user's choice in this
 * session, then the stored selection, then the default.
 */
function useThemeValue<T extends string | number>(
  controlled: T | undefined,
  stored: T | undefined,
  defaultValue: T,
  onChange: ((value: T) => void) | undefined,
) {
  const [selected, setSelected] = useState<T | undefined>(undefined);
  const value = controlled ?? selected ?? stored ?? defaultValue;
  const setValue = useCallback(
    (next: T) => {
      if (controlled === undefined) setSelected(next);
      if (next !== value) onChange?.(next);
    },
    [controlled, value, onChange],
  );
  return [value, setValue] as const;
}

/**
 * Provides the colour theme, mode, contrast level, motion scheme and density to the app,
 * mirrors them as `data-*` attributes on `<html>` and remembers the selection.
 */
export function ThemeProvider({
  children,
  themes: themeList,
  theme: themeProp,
  defaultTheme = DEFAULT_THEME_STATE.theme,
  onThemeChange,
  mode: modeProp,
  defaultMode = DEFAULT_THEME_STATE.mode,
  onModeChange,
  contrast: contrastProp,
  defaultContrast = DEFAULT_THEME_STATE.contrast,
  onContrastChange,
  motion: motionProp,
  defaultMotion = DEFAULT_THEME_STATE.motion,
  onMotionChange,
  density: densityProp,
  defaultDensity = DEFAULT_THEME_STATE.density,
  onDensityChange,
  storage = 'cookie',
  storageKey = DEFAULT_STORAGE_KEY,
  applyToDocument = true,
}: ThemeProviderProps) {
  const definitions = useMemo(
    () => (themeList ?? []).filter((entry): entry is ThemeDefinition => typeof entry !== 'string'),
    [themeList],
  );
  const themeNames = useMemo(
    () =>
      themeList
        ? themeList.map((entry) => (typeof entry === 'string' ? entry : entry.name))
        : BUILT_IN_THEME_NAMES,
    [themeList],
  );

  // The stored selection is external data that only exists in the browser. Reading it
  // through useSyncExternalStore renders the server snapshot during hydration and then
  // the stored value, without a hydration mismatch. `isHydrated` flips in the same pass.
  const storedRaw = useSyncExternalStore(
    useCallback(
      (onChange: () => void) => subscribeToStorage(storage, storageKey, onChange),
      [storage, storageKey],
    ),
    () => readStoredTheme(storage, storageKey),
    () => null,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  const stored = useMemo(() => parseThemeState(storedRaw, themeNames), [storedRaw, themeNames]);

  const [theme, setThemeState] = useThemeValue(
    themeProp,
    stored.theme,
    defaultTheme,
    onThemeChange,
  );
  const [mode, setMode] = useThemeValue(modeProp, stored.mode, defaultMode, onModeChange);
  const [contrast, setContrast] = useThemeValue(
    contrastProp,
    stored.contrast,
    defaultContrast,
    onContrastChange,
  );
  const [motion, setMotion] = useThemeValue(
    motionProp,
    stored.motion,
    defaultMotion,
    onMotionChange,
  );

  const [density, setDensity] = useThemeValue(
    densityProp,
    stored.density,
    defaultDensity,
    onDensityChange,
  );

  const state = useMemo<ThemeState>(
    () => ({ theme, mode, contrast, motion, density }),
    [theme, mode, contrast, motion, density],
  );

  useLayoutEffect(() => {
    if (!isHydrated || !applyToDocument) return;
    const root = document.documentElement;
    for (const [name, value] of Object.entries(themeAttributes(state))) {
      root.setAttribute(name, value);
    }
  }, [isHydrated, applyToDocument, state]);

  useEffect(() => {
    if (isHydrated && storage !== 'none') writeStoredTheme(storage, storageKey, state);
  }, [isHydrated, storage, storageKey, state]);

  const systemMode = useSyncExternalStore(
    subscribeToColorScheme,
    getSystemMode,
    (): ResolvedColorMode => 'light',
  );
  const resolvedMode = mode === 'system' ? systemMode : mode;

  const setTheme = useCallback(
    (next: string) => {
      if (!themeNames.includes(next)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[@windmorph/react] setTheme("${next}") ignored: not one of ${themeNames.join(', ')}.`,
          );
        }
        return;
      }
      setThemeState(next);
    },
    [themeNames, setThemeState],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...state,
      resolvedMode,
      themes: themeNames,
      setTheme,
      setMode,
      setContrast,
      setMotion,
      setDensity,
    }),
    [state, resolvedMode, themeNames, setTheme, setMode, setContrast, setMotion, setDensity],
  );

  return (
    <ThemeContext value={value}>
      <ThemeScopeContext value={state}>
        {definitions.map((definition) => (
          <style
            key={definition.name}
            href={`windmorph-theme-${definition.name}`}
            precedence="windmorph"
          >
            {definition.css}
          </style>
        ))}
        {children}
      </ThemeScopeContext>
    </ThemeContext>
  );
}
