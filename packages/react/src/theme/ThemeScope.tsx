'use client';

import { useMemo, type ComponentPropsWithRef } from 'react';
import type { ColorMode, ContrastLevel } from '../tokens/color';
import type { MotionScheme } from '../tokens/motion';
import { cn } from '../utils/cn';
import { ThemeScopeContext, useThemeScope } from './context';
import { themeAttributes, type ThemeState } from './state';

export interface ThemeScopeProps extends ComponentPropsWithRef<'div'> {
  /** Colour theme for this subtree. Inherited when omitted. */
  theme?: string;
  /** Colour mode for this subtree. Inherited when omitted. */
  mode?: ColorMode;
  /** Contrast level for this subtree. Inherited when omitted. */
  contrast?: ContrastLevel;
  /** Motion scheme for this subtree. Inherited when omitted. */
  motion?: MotionScheme;
}

/**
 * Applies a different theme, mode, contrast level or motion scheme to a subtree.
 * Scopes nest; unset dimensions are inherited from the nearest provider or scope.
 * Renders a `div` with `text-on-surface` so text picks up the scope's colours.
 */
export function ThemeScope({
  theme,
  mode,
  contrast,
  motion,
  className,
  children,
  ...props
}: ThemeScopeProps) {
  const parent = useThemeScope();
  const state = useMemo<ThemeState>(
    () => ({
      theme: theme ?? parent.theme,
      mode: mode ?? parent.mode,
      contrast: contrast ?? parent.contrast,
      motion: motion ?? parent.motion,
    }),
    [theme, mode, contrast, motion, parent],
  );

  return (
    <div {...props} {...themeAttributes(state)} className={cn('text-on-surface', className)}>
      <ThemeScopeContext value={state}>{children}</ThemeScopeContext>
    </div>
  );
}
