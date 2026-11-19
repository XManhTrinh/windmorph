'use client';

import { useCallback, useLayoutEffect, useState, type RefObject } from 'react';
import { flushSync } from 'react-dom';

/**
 * The element a popover is placed against, as React Aria finds it: its offset parent, or the
 * page (`<html>`) when that's a static `body` or there's none.
 */
function containingBlock(popover: HTMLElement): Element {
  const page = popover.ownerDocument.documentElement;
  const parent = popover.offsetParent;
  if (!parent) return page;
  const view = popover.ownerDocument.defaultView;
  const staticBody =
    parent === popover.ownerDocument.body && view?.getComputedStyle(parent).position === 'static';
  return staticBody ? page : parent;
}

/** A box's padding box in the window's coordinates: where coordinates in it start, and its size. */
function paddingBox(element: Element) {
  const rect = element.getBoundingClientRect();
  const left = rect.left + element.clientLeft;
  const top = rect.top + element.clientTop;
  return { left, top, right: left + element.clientWidth, bottom: top + element.clientHeight };
}

/**
 * What can show of `boundary`'s padding box, in the window's coordinates: cut by every ancestor
 * that clips its content (a scroll pane, `overflow: hidden`), on the axes it clips, up to the
 * first `fixed` one, and by the visual viewport. React Aria keeps a menu within the window only
 * in the window's coordinates, which a stand-in in a container's coordinates doesn't share, so
 * a menu in a player partly above the window was placed above it, out of reach while the page's
 * scroll is locked (2026-11-19): the stand-in is only what shows.
 */
function shownRect(boundary: Element) {
  const page = boundary.ownerDocument;
  const view = page.defaultView;
  const shown = paddingBox(boundary);
  // A `fixed` box (the element in full screen is one, in the top layer) isn't cut by what's
  // around it: only what's inside it and the viewport can cut the menu.
  const fixed = (element: Element) => view?.getComputedStyle(element).position === 'fixed';
  const first = fixed(boundary) ? null : boundary.parentElement;
  for (let node = first; node; node = fixed(node) ? null : node.parentElement) {
    if (node === page.documentElement || node === page.body) break;
    const style = view?.getComputedStyle(node);
    const clipsX = style !== undefined && style.overflowX !== 'visible';
    const clipsY = style !== undefined && style.overflowY !== 'visible';
    if (!clipsX && !clipsY) continue;
    const clip = paddingBox(node);
    if (clipsX) {
      shown.left = Math.max(shown.left, clip.left);
      shown.right = Math.min(shown.right, clip.right);
    }
    if (clipsY) {
      shown.top = Math.max(shown.top, clip.top);
      shown.bottom = Math.min(shown.bottom, clip.bottom);
    }
  }
  const viewport = view?.visualViewport;
  const viewportLeft = viewport?.offsetLeft ?? 0;
  const viewportTop = viewport?.offsetTop ?? 0;
  shown.left = Math.max(shown.left, viewportLeft);
  shown.top = Math.max(shown.top, viewportTop);
  shown.right = Math.min(
    shown.right,
    viewportLeft + (viewport?.width ?? page.documentElement.clientWidth),
  );
  shown.bottom = Math.min(
    shown.bottom,
    viewportTop + (viewport?.height ?? page.documentElement.clientHeight),
  );
  return shown;
}

/**
 * The element to hand React Aria as a popover's `boundaryElement` to keep it within `boundary`
 * (a menu's `portalContainer`), and `placing`, its `shouldUpdatePosition`. Declare it before
 * `usePopover`: the stand-in is placed before React Aria places the popover, in the same pass.
 *
 * React Aria (3.53) measures a custom boundary in the page's coordinates but the popover in its
 * containing block's, and adds the two when the boundary holds that block (as a
 * `position: relative` `portalContainer` does): the menu was kept within a box shifted by the
 * boundary's place in the page (2026-11-18: in a player 48px from the page's corner, a menu above
 * its trigger was capped 48px short, and in right to left one sat 552px off its trigger, past
 * the player's edge). So it's handed a stand-in: a hidden box placed in the page where what
 * shows of the boundary's padding box (`shownRect`) sits in the popover's containing block, at
 * that size, which its sums read as the boundary. With the page as the containing block (a
 * static container), that's the boundary's own place. The popover must be `position: absolute`
 * from its first placement (React Aria starts it `fixed`, whose containing block is the page's),
 * so both count from the same block.
 *
 * What shows changes without React Aria knowing, so the stand-in follows it:
 * - the window or the visual viewport resizes: React Aria places the popover again then, so the
 *   stand-in is placed first (these listeners are registered in a layout effect declared before
 *   React Aria's own, which come after them) and the popover placed again with it (a window
 *   getting shorter left a menu its old height, past the window's edge, 2026-11-19);
 * - the container resizes without the window: React Aria doesn't place the popover again (the
 *   container moved the trigger without resizing it), and `usePopover` doesn't return
 *   `updatePosition`, so `placing` turns off and on, each committed at once, before the paint,
 *   which re-runs its positioning effect;
 * - something around it scrolls (a pane): the popover moves with the container and keeps its
 *   place, so only the stand-in moves, for React Aria's next placement (a page opened after the
 *   pane scrolled went 79px above the pane's visible top, 2026-11-19).
 */
export function useBoundaryInContainer(
  boundary: Element | null,
  popoverRef: RefObject<HTMLElement | null>,
): { boundaryElement: Element | null; placing: boolean } {
  const standIn = useStandIn();
  const [placing, setPlacing] = useState(true);
  const place = useCallback(() => {
    const popover = popoverRef.current;
    if (!standIn) return;
    if (!boundary || !popover) {
      standIn.remove();
      return;
    }
    placeStandIn(standIn, boundary, containingBlock(popover));
  }, [boundary, popoverRef, standIn]);
  // On each layout pass in which `placing` changes, and when the boundary does.
  useLayoutEffect(place, [place, placing]);
  useLayoutEffect(() => {
    const view = boundary?.ownerDocument.defaultView;
    if (!boundary || !view) return;
    const placeAgain = () => {
      place();
      flushSync(() => setPlacing(false));
      flushSync(() => setPlacing(true));
    };
    const viewport = view.visualViewport;
    view.addEventListener('resize', placeAgain);
    viewport?.addEventListener('resize', placeAgain);
    // Scroll events don't bubble: a pane's reach the document only on the capture phase.
    view.document.addEventListener('scroll', place, { capture: true, passive: true });
    viewport?.addEventListener('scroll', place, { passive: true });
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      let observed = false;
      observer = new ResizeObserver(() => {
        // The first call reports the size the container has as it's observed.
        if (!observed) {
          observed = true;
          return;
        }
        placeAgain();
      });
      observer.observe(boundary);
    }
    return () => {
      view.removeEventListener('resize', placeAgain);
      viewport?.removeEventListener('resize', placeAgain);
      view.document.removeEventListener('scroll', place, { capture: true });
      viewport?.removeEventListener('scroll', place);
      observer?.disconnect();
    };
  }, [boundary, place]);
  return { boundaryElement: boundary ? standIn : null, placing };
}

/**
 * The same for the popovers placed inside a popover (the submenus beside a menu in a
 * `portalContainer`, all portalled into the root popover): their containing block is that
 * popover, which React Aria moves, so the stand-in follows it on each of its layout passes. A
 * submenu that opens is placed before it in that pass, from where the root popover already was.
 */
export function useBoundaryForSubmenus(
  boundary: Element | null,
  popoverRef: RefObject<HTMLElement | null>,
): Element | null {
  const standIn = useStandIn();
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!standIn) return;
    if (!boundary || !popover) {
      standIn.remove();
      return;
    }
    placeStandIn(standIn, boundary, popover);
  });
  return boundary ? standIn : null;
}

/** A hidden box for React Aria to measure, in the page while its popover is open. */
function useStandIn() {
  const [standIn] = useState(() =>
    typeof document === 'undefined' ? null : document.createElement('div'),
  );
  useLayoutEffect(() => () => standIn?.remove(), [standIn]);
  return standIn;
}

/** Puts `standIn` in the page where what shows of `boundary` sits in `block`, at its size. */
function placeStandIn(standIn: HTMLElement, boundary: Element, block: Element) {
  const shown = shownRect(boundary);
  const origin = paddingBox(block);
  standIn.setAttribute('aria-hidden', 'true');
  standIn.setAttribute('data-menu-boundary', '');
  Object.assign(standIn.style, {
    position: 'absolute',
    top: `${shown.top - origin.top}px`,
    left: `${shown.left - origin.left}px`,
    width: `${Math.max(0, shown.right - shown.left)}px`,
    height: `${Math.max(0, shown.bottom - shown.top)}px`,
    visibility: 'hidden',
    pointerEvents: 'none',
  });
  if (!standIn.isConnected) block.ownerDocument.documentElement.append(standIn);
}
