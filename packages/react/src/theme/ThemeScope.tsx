'use client';

import { useMemo, type ComponentPropsWithRef } from 'react';
import type { ColorMode, ContrastLevel } from '../tokens/color';
import type { MotionScheme } from '../tokens/motion';
import { cn } from '../utils/cn';
import {
  ThemeScopeClassNameContext,
  ThemeScopeContext,
  useThemeScope,
  useThemeScopeClassName,
} from './context';
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
 *
 * Overlays opened inside (menus, dialogs, tooltips) are portalled out of the `div`, so they
 * get its theme attributes and its `className` on their own wrapper: CSS variables set
 * through the class, such as component tokens, reach them too.
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
  const parentClassName = useThemeScopeClassName();
  const scopeClassName = useMemo(
    () => cn(parentClassName, className),
    [parentClassName, className],
  );
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
      <ThemeScopeContext value={state}>
        <ThemeScopeClassNameContext value={scopeClassName}>{children}</ThemeScopeClassNameContext>
      </ThemeScopeContext>
    </div>
  );
}
