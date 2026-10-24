'use client';

import { useCallback, useContext, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Overlay as AriaOverlay } from 'react-aria';
import {
  DocumentThemeContext,
  InheritedThemeContext,
  useThemeScope,
  useThemeScopeLayers,
} from '../theme/context';
import { themeAttributesOver } from '../theme/state';
import type { Density } from '../tokens/density';
import { ToolbarContext } from './ToolbarContext';

export interface OverlayProps {
  children: ReactNode;
  /** Element to portal into. @default document.body */
  portalContainer?: Element;
  /** Leave focus handling to the caller instead of restoring it on unmount. */
  disableFocusManagement?: boolean;
  /** Whether the overlay is animating out; focus containment is released meanwhile. */
  exiting?: boolean;
  /**
   * Float above every other layer, for overlays that must stay reachable whatever is open
   * (tooltips). A modal open underneath (a dialog, sheet or viewer) does not hide it from
   * assistive technology, does not pull focus out of it, and does not treat a press on it
   * as a press outside. Uses React Aria's top-layer marker, as its toasts do.
   */
  topLayer?: boolean;
  /**
   * The density of the component the overlay belongs to, when it sets its own (`density`
   * prop); by default the overlay takes the enclosing `ThemeProvider` / `ThemeScope`'s.
   */
  density?: Density | undefined;
}

/**
 * Portals overlay content (dialogs, menus, sheets, tooltips) to `document.body`
 * while keeping the theme, mode, contrast, motion scheme, density, **text direction and the
 * enclosing `ThemeScope`s' classes and inline CSS variables** of the place it was rendered from, so overlays opened
 * inside a `ThemeScope` or an RTL region still match it, and CSS variables set through a
 * scope's class (component tokens) reach them. The wrapper is `display: contents`, so the
 * classes affect only what children inherit. Dismissal, focus containment and scroll locking come from the React
 * Aria overlay hooks (`useModalOverlay`, `usePopover`, …) of the component using it.
 *
 * A portalled overlay sits outside any modal it was opened from, so the modal's
 * `ariaHideOutside` would mark it `aria-hidden`; `topLayer` keeps it visible.
 */
export function Overlay({
  children,
  portalContainer,
  disableFocusManagement,
  exiting,
  topLayer,
  density,
}: OverlayProps) {
  const scope = useThemeScope();
  const themed = density === undefined ? scope : { ...scope, density };
  // In `document.body`, the wrapper carries only what differs from `<html>`, so an app's own
  // `:root` values for the system tokens reach the overlay too.
  const documentTheme = useContext(DocumentThemeContext);
  const [outerLayer, ...innerLayers] = useThemeScopeLayers();
  const scopeId = useId();
  const markerRef = useRef<HTMLSpanElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  // `dir` is inherited through the DOM, which a portal leaves; copy the direction in
  // effect where the overlay is declared onto the portalled wrapper.
  useLayoutEffect(() => {
    if (markerRef.current && scopeRef.current) {
      scopeRef.current.dir = getComputedStyle(markerRef.current).direction;
    }
  });
  // On mount, copy it before the content's own layout effects run: they may read layout
  // (React Aria's scroll lock does), which resolves the content's first style, and so its
  // `@starting-style` transitions, in the wrong direction. The marker's ref is attached
  // before them, and `:dir()` reads the direction without resolving styles.
  const attachMarker = useCallback(
    (marker: HTMLSpanElement | null) => {
      markerRef.current = marker;
      if (!marker || typeof CSS === 'undefined' || !CSS.supports('selector(:dir(rtl))')) return;
      const wrapper = marker.ownerDocument.querySelector<HTMLElement>(
        `[data-overlay-scope="${CSS.escape(scopeId)}"]`,
      );
      if (wrapper) wrapper.dir = marker.matches(':dir(rtl)') ? 'rtl' : 'ltr';
    },
    [scopeId],
  );

  return (
    <>
      <span ref={attachMarker} hidden />
      <AriaOverlay
        portalContainer={portalContainer}
        disableFocusManagement={disableFocusManagement}
        isExiting={exiting}
      >
        <div
          ref={scopeRef}
          {...themeAttributesOver(themed, portalContainer ? null : documentTheme)}
          className={outerLayer?.className || undefined}
          data-overlay-scope={scopeId}
          data-react-aria-top-layer={topLayer || undefined}
          style={{
            ...outerLayer?.variables,
            display: 'contents',
            color: 'var(--md-sys-color-on-surface)',
          }}
        >
          {/* Each inner scope's class and variables around the last, as on the page, so the
              innermost scope's value wins whether a class or its style sets it. */}
          {innerLayers.reduceRight<ReactNode>(
            (content, layer) => (
              <div
                className={layer.className || undefined}
                style={{ ...layer.variables, display: 'contents' }}
              >
                {content}
              </div>
            ),
            // An overlay opened from a toolbar isn't part of it.
            <InheritedThemeContext value={themed}>
              <ToolbarContext value={null}>{children}</ToolbarContext>
            </InheritedThemeContext>,
          )}
        </div>
      </AriaOverlay>
    </>
  );
}
