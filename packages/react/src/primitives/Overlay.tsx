'use client';

import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Overlay as AriaOverlay, useIsSSR, useUNSAFE_PortalContext } from 'react-aria';
import {
  DocumentThemeContext,
  InheritedThemeContext,
  useThemeScope,
  useThemeScopeLayers,
} from '../theme/context';
import { themeAttributes, themeAttributesOver, type ThemeState } from '../theme/state';
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
  /**
   * Element to portal into. Left out, an app's React Aria `UNSAFE_PortalProvider` container,
   * else the element in full screen when the overlay opened, else `document.body`.
   */
  portalContainer?: Element;
  /**
   * Leave focus handling to the caller: no focus scope, and focus isn't given back as the
   * overlay leaves.
   */
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

// HTML elements that draw their own content and none of their children (replaced elements and
// form controls): an overlay put inside one would never show. A menu's `portalContainer` is
// checked against them too (library-internal).
export const DRAWS_NO_CHILDREN = new Set([
  'audio',
  'canvas',
  'embed',
  'iframe',
  'img',
  'input',
  'object',
  'select',
  'textarea',
  'video',
]);

// The element in full screen, when an overlay has to be drawn inside it. A browser in full
// screen draws only that element's own content, so an overlay portalled to `body` was in the
// document but never seen (2026-11-15): a tooltip, a menu or a dialog opened in a full-screen
// player. Only an HTML element that draws its children: an SVG or MathML element draws none of
// ours, nor does a video or a form control. Not `<html>` or `body` either (2026-11-16): with the
// whole page in full screen `body` is shown already, so nothing has to move, and the overlay
// carries only what differs from `<html>`, as in any other `body`.
function fullscreenContainer(page: Document): HTMLElement | null {
  const element = page.fullscreenElement;
  if (!(element instanceof HTMLElement) || DRAWS_NO_CHILDREN.has(element.localName)) return null;
  return element.contains(page.body) ? null : element;
}

const THEME_COLOR_ATTRIBUTES = ['data-theme', 'data-mode', 'data-contrast'] as const;

// The theme attributes an overlay's wrapper needs inside `container`, the element in full screen
// (2026-11-16) or a container the caller or an app names (2026-11-18): only those that differ
// from what `container` already inherits, each read from the nearest element carrying it, as
// `themeAttributesOver` does for a known ancestor theme. So an app's own `:root` values for the
// system tokens reach an overlay there too; with every attribute on the wrapper, the theme's
// rules declared the colours again there. `<html>` takes the `ThemeProvider`'s state when it
// writes it there, since it does so after this render.
function themeAttributesInside(
  state: ThemeState,
  container: Element,
  documentTheme: ThemeState | null,
  restyled: boolean,
): Partial<ReturnType<typeof themeAttributes>> {
  const all = themeAttributes(state);
  const onDocument = documentTheme && themeAttributes(documentTheme);
  const root = container.ownerDocument.documentElement;
  const differs = (name: keyof typeof all) => {
    const carrier = container.closest(`[${name}]`);
    if (onDocument && (carrier === null || carrier === root)) return all[name] !== onDocument[name];
    return all[name] !== carrier?.getAttribute(name);
  };
  // The colour attributes go together, as one rule reads all three on the same element.
  const colors = restyled || THEME_COLOR_ATTRIBUTES.some((name) => differs(name));
  return {
    ...(colors && {
      'data-theme': all['data-theme'],
      'data-mode': all['data-mode'],
      'data-contrast': all['data-contrast'],
    }),
    ...(differs('data-motion') && { 'data-motion': all['data-motion'] }),
    ...(differs('data-density') && { 'data-density': all['data-density'] }),
  };
}

// React Aria's focus scope dispatches it on an element before giving focus back to it, so an app
// can take the restore over (a virtualised list whose element now shows another item) by
// cancelling it.
const RESTORE_FOCUS_EVENT = 'react-aria-focus-scope-restore';

/** Adds an overlay's wrapper to the overlay it was opened from, until the returned cleanup. */
type NestOverlay = (wrapper: HTMLElement) => () => void;

// Provided inside each overlay's content, so an overlay opened from it (a menu in a dialog)
// tells it where its own content is: they're separate portals, and both leave together when the
// menu's action closes the dialog (2026-11-16).
const NestOverlayContext = createContext<NestOverlay | null>(null);

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
 * Portals an overlay (a dialog, menu, sheet or tooltip) into `portalContainer`, an app's React
 * Aria `UNSAFE_PortalProvider` container, the element in full screen when it opened, or `body`,
 * keeping the theme, density, direction and `ThemeScope` classes and variables of where it was
 * rendered. Its content leaves the opener's contexts behind; as it closes, focus inside it goes
 * back to where it was without resting on the page. `topLayer` keeps it visible beside a modal.
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
  // What `<html>` carries, when the `ThemeProvider` writes it there.
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
  // Where it goes: the caller's container, then an app's `PortalProvider` (React Aria's, for a
  // subtree's overlays), then the element in full screen, then `body`.
  const { getContainer } = useUNSAFE_PortalContext();
  // The element in full screen is read once, as the overlay opens (it mounts as it opens), and
  // kept while it's open (2026-11-16). Following `fullscreenchange` gave an open overlay a new
  // container, so React built its content again there: an element in an open dialog that went
  // full screen was taken out of the document and left full screen at once, and leaving full
  // screen lost a dialog's typed text, scroll and focus. An overlay opened in full screen stays
  // in that element after it, where it's still drawn. None while hydrating, when React Aria
  // draws no portal.
  const [openedInFullscreen] = useState(() =>
    typeof document === 'undefined' ? null : fullscreenContainer(document),
  );
  const fullscreen = useIsSSR() ? null : openedInFullscreen;
  const ownContainer = portalContainer ?? getContainer?.() ?? undefined;
  const container = ownContainer ?? fullscreen ?? undefined;
  // In `document.body`, the wrapper carries only what differs from `<html>`, so an app's own
  // `:root` values for the system tokens reach the overlay too; in an element of the page (a
  // container of the caller's or an app's, or the element in full screen), only what differs
  // from what that element inherits (2026-11-18: a container of the caller's or an app's carried
  // every attribute, so the app's `:root` values never reached a menu opened in its player); in
  // a container in another document (an iframe's), whose theme isn't known, every attribute.
  const restyled = outerLayer !== undefined;
  const drawnIn = ownContainer ?? fullscreen;
  const wrapperTheme = !drawnIn
    ? themeAttributesOver(themed, documentTheme, restyled)
    : typeof document !== 'undefined' && drawnIn.ownerDocument === document
      ? themeAttributesInside(themed, drawnIn, documentTheme, restyled)
      : themeAttributesOver(themed, null, restyled);
  const scopeId = useId();
  const markerRef = useRef<HTMLSpanElement>(null);
  const scopeRef = useRef<HTMLDivElement>(null);

  // The wrappers of the overlays opened from this one that are open now, and every overlay's
  // wrapper is also added to the one above it, so a menu in a dialog in a sheet counts in all.
  const nestInParent = useContext(NestOverlayContext);
  const [nested] = useState(() => new Set<HTMLElement>());
  const nest = useCallback<NestOverlay>(
    (wrapper) => {
      nested.add(wrapper);
      const leaveParent = nestInParent?.(wrapper);
      return () => {
        nested.delete(wrapper);
        leaveParent?.();
      };
    },
    [nested, nestInParent],
  );
  useLayoutEffect(() => {
    const wrapper = scopeRef.current;
    if (!wrapper || !nestInParent) return;
    return nestInParent(wrapper);
  }, [nestInParent]);

  // Where focus was as the overlay opened, read as it first renders, before its content takes
  // focus, as React Aria's focus scope reads it. Nothing of the overlay is in a document yet, so
  // it's the global one; the hand-back below acts only where the overlay's content is in that
  // same document, and leaves a container in another one (an iframe's) to React Aria.
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
  // Inside includes an overlay opened from this one that leaves with it (2026-11-16): a menu
  // action that closes the dialog holding the menu took focus out with the menu, whose own
  // opener left with the dialog, so focus waited on <body> for React Aria's frame.
  useLayoutEffect(() => {
    const wrapper = scopeRef.current;
    return () => {
      const back = focusedBefore;
      if (!managesFocus.current || !wrapper) return;
      if (!(back instanceof HTMLElement || back instanceof SVGElement)) return;
      const page = back.ownerDocument;
      if (wrapper.ownerDocument !== page || back === page.body) return;
      const inside = (node: Node | null) =>
        node !== null && (wrapper.contains(node) || [...nested].some((own) => own.contains(node)));
      if (!inside(page.activeElement) || inside(back)) return;
      queueMicrotask(() => {
        // Still in the document: Strict Mode rehearsing an unmount, not the overlay leaving.
        if (wrapper.isConnected || !back.isConnected) return;
        // Focus moved on purpose meanwhile.
        if (page.activeElement && page.activeElement !== page.body) return;
        // As React Aria's focus scope does before giving focus back: cancelled, the app took
        // the restore over (2026-11-16).
        const restore = new CustomEvent(RESTORE_FOCUS_EVENT, { bubbles: true, cancelable: true });
        if (back.dispatchEvent(restore)) {
          back.focus({ preventScroll: true });
          return;
        }
        // The app took it over, but focus may still be on <body> when React Aria's scope tries
        // in its frame: its own event for the same element is answered as the app's was,
        // so the app hears of the hand-back once.
        const view = page.defaultView;
        if (!view) return;
        const repeat = (event: Event) => {
          if (event.target !== back) return;
          event.preventDefault();
          event.stopImmediatePropagation();
        };
        view.addEventListener(RESTORE_FOCUS_EVENT, repeat, true);
        // Queued after React Aria's frame, which the unmount queued before this microtask.
        view.requestAnimationFrame(() =>
          view.removeEventListener(RESTORE_FOCUS_EVENT, repeat, true),
        );
      });
    };
  }, [focusedBefore, nested]);

  // `dir` is inherited through the DOM, which a portal leaves; copy the direction in
  // effect where the overlay is declared onto the portalled wrapper. Only a change is
  // written: setting the attribute, even to the same value, restyles the whole overlay.
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!markerRef.current || !scope) return;
    const dir = getComputedStyle(markerRef.current).direction;
    if (scope.dir !== dir) scope.dir = dir;
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
        portalContainer={container}
        disableFocusManagement={disableFocusManagement}
        isExiting={exiting}
      >
        <div
          ref={scopeRef}
          {...wrapperTheme}
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
              <NestOverlayContext value={nest}>
                <LeaveOpener>{children}</LeaveOpener>
              </NestOverlayContext>
            </InheritedThemeContext>,
          )}
        </div>
      </AriaOverlay>
    </>
  );
}
