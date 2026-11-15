'use client';

import {
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Overlay as AriaOverlay } from 'react-aria';
import {
  DocumentThemeContext,
  InheritedThemeContext,
  useThemeScope,
  useThemeScopeLayers,
} from '../theme/context';
import { themeAttributes, themeAttributesOver } from '../theme/state';
import type { Density } from '../tokens/density';
import { ContainerButtonContext } from './ButtonContext';
import { ChipSetDisabledContext } from './ChipSetContext';
import { DialogTriggerContext, SheetTriggerContext } from './OverlayTriggerContext';
import { ToggleGroupStateContext } from './ToggleGroupStateContext';
import { ToolbarContext } from './ToolbarContext';
import { TooltipPlacementContext } from './TooltipPlacementContext';
import { RichContext, TooltipContext } from './TooltipTriggerContext';
import { TriggerContext } from './TriggerContext';

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

// What an overlay's buttons take from a container outside it: nothing.
const NO_BUTTON_SETTINGS = {};

// An overlay isn't part of what it was opened from. A chip in a dialog opened from a chip of a
// set kept the set's selection and its `disabled`; a button in one opened from a button group
// kept the group's size, variant, `disabled` and connected corners; a tooltip in one opened
// from an app bar opened below its button, as in the bar (2026-11-14). An icon button in one
// opened from inside a tooltip trigger left its label tooltip to that trigger, so a full-screen
// dialog's close button had none; the action of a rich tooltip whose trigger sits inside a
// menu trigger took that trigger's props; and a dialog or modal sheet inside a dialog or sheet
// a trigger opened took that trigger's open state (2026-11-15).
function LeaveOpener({ children }: { children: ReactNode }) {
  return (
    <TriggerContext value={null}>
      <TooltipContext value={null}>
        <RichContext value={null}>
          <DialogTriggerContext value={null}>
            <SheetTriggerContext value={null}>
              <ToolbarContext value={null}>
                <ContainerButtonContext value={NO_BUTTON_SETTINGS}>
                  <TooltipPlacementContext value={null}>
                    <ToggleGroupStateContext value={null}>
                      <ChipSetDisabledContext value={false}>{children}</ChipSetDisabledContext>
                    </ToggleGroupStateContext>
                  </TooltipPlacementContext>
                </ContainerButtonContext>
              </ToolbarContext>
            </SheetTriggerContext>
          </DialogTriggerContext>
        </RichContext>
      </TooltipContext>
    </TriggerContext>
  );
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
  // A scope's class or variables may set a colour role: each layer carries the colour
  // attributes, so the values derived from the roles (elevation) resolve again with them.
  const {
    'data-theme': layerTheme,
    'data-mode': layerMode,
    'data-contrast': layerContrast,
  } = themeAttributes(themed);
  const colorAttributes = {
    'data-theme': layerTheme,
    'data-mode': layerMode,
    'data-contrast': layerContrast,
  };
  const scopeId = useId();
  const markerRef = useRef<HTMLSpanElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  // Where focus was as the overlay opened, read as it first renders, before its content takes
  // focus (as React Aria's focus scope reads it).
  const [focusedBefore] = useState(() =>
    typeof document === 'undefined' ? null : document.activeElement,
  );
  const managesFocus = useRef(!disableFocusManagement);
  useLayoutEffect(() => {
    managesFocus.current = !disableFocusManagement;
  });
  // React Aria's focus scope gives focus back a frame after the overlay has left the document,
  // so for that frame focus was on <body>, which a screen reader can announce as the page
  // (2026-11-15). Focus still inside as the overlay unmounts goes back as soon as the commit
  // that removes it ends, before the next frame, without a scroll, as React Aria's would; the
  // scope then finds focus elsewhere and leaves it. Not during the commit: React reads no focus
  // events while it commits, so the element would miss its own handlers (its focus ring, its
  // tooltip). Where it was is gone, inside, or won't take focus: React Aria's, as before.
  useLayoutEffect(() => {
    const wrapper = scopeRef.current;
    return () => {
      const page = wrapper?.ownerDocument;
      if (!managesFocus.current || !wrapper || !page?.activeElement) return;
      if (!wrapper.contains(page.activeElement)) return;
      const back = focusedBefore;
      if (!(back instanceof HTMLElement || back instanceof SVGElement)) return;
      if (back === page.body || wrapper.contains(back)) return;
      queueMicrotask(() => {
        // Still in the document: Strict Mode rehearsing an unmount, not the overlay leaving.
        if (wrapper.isConnected || !back.isConnected) return;
        // Focus moved on purpose meanwhile.
        if (page.activeElement && page.activeElement !== page.body) return;
        back.focus({ preventScroll: true });
      });
    };
  }, [focusedBefore]);

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
          {...themeAttributesOver(
            themed,
            portalContainer ? null : documentTheme,
            outerLayer !== undefined,
          )}
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
                {...colorAttributes}
                className={layer.className || undefined}
                style={{ ...layer.variables, display: 'contents' }}
              >
                {content}
              </div>
            ),
            <InheritedThemeContext value={themed}>
              <LeaveOpener>{children}</LeaveOpener>
            </InheritedThemeContext>,
          )}
        </div>
      </AriaOverlay>
    </>
  );
}
