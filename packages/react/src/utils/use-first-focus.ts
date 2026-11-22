'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { firstTabbable } from './focus';

/** A dialog's scrolling region is focusable for the keyboard, but it isn't a control. */
const isScroller = (el: HTMLElement) => el.hasAttribute('data-scrollable');

/**
 * Focuses a modal surface's first interactive element (or, through `pick`, another one: a
 * dialog's least destructive action), or the panel when it has none. Focus already on a
 * control inside the panel (an `autoFocus` one) stays.
 */
function focusInside(panel: HTMLElement, pick: (first: HTMLElement) => HTMLElement) {
  const active = panel.ownerDocument.activeElement;
  if (active !== panel && active instanceof HTMLElement && panel.contains(active)) return;
  const first = firstTabbable(panel, isScroller);
  (first ? pick(first) : panel).focus();
}

/**
 * Gives a modal surface (Dialog, BottomSheet, SideSheet) its initial focus: its first
 * interactive element, not the panel (M3: "focus should automatically land on the first
 * interactive element"), whatever opened it.
 *
 * React Aria's `useDialog` focuses the panel as it mounts, unless something inside took
 * focus first. After a virtual click, though (a screen reader's, or Space on a native
 * checkbox or switch, whose click has no `detail`), it waits for the page's transitions to
 * end and gives up if focus moved meanwhile, so the panel may hold no focus at mount, and
 * focus can end on the page. So:
 * - the panel focused at mount: focus moves on at once;
 * - a control inside already focused: it stays;
 * - otherwise: at the end of the enter motion (every transition on the panel, its parts and
 *   its ancestors, the motion layers), unless focus is inside by then.
 *   With no motion (reduced motion, `instant`) that's the next frame.
 */
export function useFirstFocus(
  panelRef: RefObject<HTMLElement | null>,
  pick: (first: HTMLElement) => HTMLElement = (first) => first,
) {
  const latestPick = useRef(pick);
  useLayoutEffect(() => {
    latestPick.current = pick;
  });
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const active = panel.ownerDocument.activeElement;
    if (active === panel) {
      focusInside(panel, latestPick.current);
      return;
    }
    if (active instanceof HTMLElement && panel.contains(active)) return;
    let live = true;
    const frame = requestAnimationFrame(() => {
      const elements: Element[] = [...panel.children];
      for (let el: Element | null = panel; el; el = el.parentElement) elements.push(el);
      const view = panel.ownerDocument.defaultView;
      const transitions = elements.flatMap((element) => {
        if (typeof element.getAnimations !== 'function') return [];
        // Reading a style starts the transitions that haven't started yet.
        void view?.getComputedStyle(element).opacity;
        return element.getAnimations().filter((animation) => 'transitionProperty' in animation);
      });
      // A transition cut short (the surface closing while it enters) never finishes, so a
      // surface that leaves early takes no focus.
      Promise.all(transitions.map((transition) => transition.finished)).then(
        () => {
          if (live && panel.isConnected) focusInside(panel, latestPick.current);
        },
        () => undefined,
      );
    });
    return () => {
      live = false;
      cancelAnimationFrame(frame);
    };
  }, [panelRef]);
}
