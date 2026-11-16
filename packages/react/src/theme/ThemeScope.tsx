'use client';

import { useCallback, useContext, useMemo, type ComponentPropsWithoutRef, type Ref } from 'react';
import type { ColorMode, ContrastLevel } from '../tokens/color';
import type { Density } from '../tokens/density';
import type { MotionScheme } from '../tokens/motion';
import { cn } from '../utils/cn';
import {
  InheritedThemeContext,
  ThemeScopeContext,
  ThemeScopeLayersContext,
  useThemeScope,
  useThemeScopeLayers,
} from './context';
import { themeAttributesOver, type ThemeState } from './state';

export interface ThemeScopeProps extends ComponentPropsWithoutRef<'div'> {
  /** Colour theme for this subtree. Inherited when omitted. */
  theme?: string;
  /** Colour mode for this subtree. Inherited when omitted. */
  mode?: ColorMode;
  /** Contrast level for this subtree. Inherited when omitted. */
  contrast?: ContrastLevel;
  /** Motion scheme for this subtree. Inherited when omitted. */
  motion?: MotionScheme;
  /**
   * Web density for this subtree, `0` to `-3` (e.g. a dense data table's filters). Inherited
   * when omitted.
   */
  density?: Density;
  /**
   * The element: a `div`, or a `span` for a scope inside content that takes only phrasing
   * content, where a `div` isn't allowed (a `<button>`, a `<p>`, a `<label>`). The ref
   * receives it.
   * @default "div"
   */
  as?: 'div' | 'span';
  /** The scope's element: a `div`, or the `span` of `as="span"`. */
  ref?: Ref<HTMLDivElement | HTMLSpanElement>;
}

/**
 * Applies a different theme, mode, contrast level, motion scheme or density to a subtree.
 * Scopes nest; unset dimensions are inherited from the nearest provider or scope.
 * Renders a `div` (or a `span`, with `as`) with `text-on-surface` so text picks up the scope's
 * colours.
 *
 * Overlays opened inside (menus, dialogs, tooltips) are portalled out of the `div`, so they
 * get its theme attributes, its `className` and the CSS variables of its `style` on their own
 * wrapper: component tokens set through the class or as inline variables reach them too.
 */
export function ThemeScope({
  theme,
  mode,
  contrast,
  motion,
  density,
  as: Tag = 'div',
  className,
  style,
  children,
  ref,
  ...props
}: ThemeScopeProps) {
  // One callback for either element, so the ref is typed for both without a cast.
  const setRef = useCallback(
    (element: HTMLDivElement | HTMLSpanElement | null) => {
      if (typeof ref === 'function') return ref(element);
      if (ref) ref.current = element;
    },
    [ref],
  );
  const parent = useThemeScope();
  const inherited = useContext(InheritedThemeContext);
  const parentLayers = useThemeScopeLayers();
  const layers = useMemo(() => {
    const variables = Object.fromEntries(
      Object.entries(style ?? {})
        .filter(([name, value]) => name.startsWith('--') && value !== undefined && value !== null)
        .map(([name, value]) => [name, String(value)]),
    );
    if (!className && Object.keys(variables).length === 0) return parentLayers;
    return [...parentLayers, { className: className ?? '', variables }];
  }, [parentLayers, className, style]);
  const state = useMemo<ThemeState>(
    () => ({
      theme: theme ?? parent.theme,
      mode: mode ?? parent.mode,
      contrast: contrast ?? parent.contrast,
      motion: motion ?? parent.motion,
      density: density ?? parent.density,
    }),
    [theme, mode, contrast, motion, density, parent],
  );

  return (
    <Tag
      {...props}
      ref={setRef}
      {...themeAttributesOver(state, inherited, layers !== parentLayers)}
      style={style}
      className={cn('text-on-surface', className)}
    >
      <ThemeScopeContext value={state}>
        <InheritedThemeContext value={state}>
          <ThemeScopeLayersContext value={layers}>{children}</ThemeScopeLayersContext>
        </InheritedThemeContext>
      </ThemeScopeContext>
    </Tag>
  );
}
