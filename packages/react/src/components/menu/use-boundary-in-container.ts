'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

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

/** Where a box's padding edge sits in the page, which is where coordinates in it start. */
function paddingEdge(element: Element) {
  const rect = element.getBoundingClientRect();
  const page = element.ownerDocument.documentElement;
  return {
    top: rect.top + page.scrollTop + element.clientTop,
    left: rect.left + page.scrollLeft + element.clientLeft,
  };
}

/**
 * The element to hand React Aria as a popover's `boundaryElement` to keep it within `boundary`
 * (a menu's `portalContainer`). It's placed before React Aria places the popover, on each layout
 * pass in which `version` changes (the boundary resized), so declare it before `usePopover`.
 *
 * React Aria (3.53) measures a custom boundary in the page's coordinates but the popover in its
 * containing block's, and adds the two when the boundary holds that block (as a
 * `position: relative` `portalContainer` does): the menu was kept within a box shifted by the
 * boundary's place in the page (2026-11-18: in a player 48px from the page's corner, a menu above
 * its trigger was capped 48px short, and in right to left one sat 552px off its trigger, past
 * the player's edge). So it's handed a stand-in: a hidden box placed in the page where the
 * boundary's padding box sits in the popover's containing block, with that box's size, which its
 * sums read as the boundary. With the page as the containing block (a static container), that's the boundary's
 * own place. The popover must be `position: absolute` from its first placement (React Aria
 * starts it `fixed`, whose containing block is the page's), so both count from the same block.
 */
export function useBoundaryInContainer(
  boundary: Element | null,
  popoverRef: RefObject<HTMLElement | null>,
  version: unknown,
): Element | null {
  const standIn = useStandIn();
  useLayoutEffect(() => {
    const popover = popoverRef.current;
    if (!standIn) return;
    if (!boundary || !popover) {
      standIn.remove();
      return;
    }
    placeStandIn(standIn, boundary, containingBlock(popover));
  }, [boundary, popoverRef, standIn, version]);
  return boundary ? standIn : null;
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

/** Puts `standIn` in the page where `boundary`'s padding box sits in `block`, at its size. */
function placeStandIn(standIn: HTMLElement, boundary: Element, block: Element) {
  const inner = paddingEdge(boundary);
  const origin = paddingEdge(block);
  standIn.setAttribute('aria-hidden', 'true');
  standIn.setAttribute('data-menu-boundary', '');
  Object.assign(standIn.style, {
    position: 'absolute',
    top: `${inner.top - origin.top}px`,
    left: `${inner.left - origin.left}px`,
    width: `${boundary.clientWidth}px`,
    height: `${boundary.clientHeight}px`,
    visibility: 'hidden',
    pointerEvents: 'none',
  });
  if (!standIn.isConnected) block.ownerDocument.documentElement.append(standIn);
}
