'use client';

import { useCallback, useId, useLayoutEffect, useRef, type ReactNode } from 'react';
import { Overlay as AriaOverlay } from 'react-aria';
import { useThemeScope, useThemeScopeClassName } from '../theme/context';
import { themeAttributes } from '../theme/state';
import { ToolbarContext } from './ToolbarContext';

export interface OverlayProps {
  children: ReactNode;
  /** Element to portal into. @default document.body */
  portalContainer?: Element;
  /** Leave focus handling to the caller instead of restoring it on unmount. */
  disableFocusManagement?: boolean;
  /** Whether the overlay is animating out; focus containment is released meanwhile. */
  isExiting?: boolean;
  /**
   * Float above every other layer, for overlays that must stay reachable whatever is open
   * (tooltips). A modal open underneath (a dialog, sheet or viewer) does not hide it from
   * assistive technology, does not pull focus out of it, and does not treat a press on it
   * as a press outside. Uses React Aria's top-layer marker, as its toasts do.
   */
  topLayer?: boolean;
}

/**
 * Portals overlay content (dialogs, menus, sheets, tooltips) to `document.body`
 * while keeping the theme, mode, contrast, motion scheme, **text direction and the
 * enclosing `ThemeScope`s' classes** of the place it was rendered from, so overlays opened
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
  isExiting,
  topLayer,
}: OverlayProps) {
  const scope = useThemeScope();
  const scopeClassName = useThemeScopeClassName();
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
        isExiting={isExiting}
      >
        <div
          ref={scopeRef}
          {...themeAttributes(scope)}
          className={scopeClassName || undefined}
          data-overlay-scope={scopeId}
          data-react-aria-top-layer={topLayer || undefined}
          style={{ display: 'contents', color: 'var(--md-sys-color-on-surface)' }}
        >
          {/* An overlay opened from a toolbar isn't part of it. */}
          <ToolbarContext value={null}>{children}</ToolbarContext>
        </div>
      </AriaOverlay>
    </>
  );
}
