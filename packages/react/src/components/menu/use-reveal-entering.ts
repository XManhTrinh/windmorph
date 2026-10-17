'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Holds a menu's reveal closed (`data-entering`) until React Aria has placed it, then lets
 * it open, so it grows from the edge nearest its anchor.
 *
 * The reveal's closed clip depends on `data-placement` (from the top below the anchor, from
 * the bottom above it, from the side beside it). A `@starting-style` rule is read the first
 * time the element's style is resolved, which React Aria's measuring forces before it has
 * set the placement, so every menu used to open from its top edge. Instead, the closed state
 * is a class with no transition: once the placement is known (before the first paint, as
 * React Aria places in a layout effect), the closed clip for that edge is resolved and the
 * class removed, and the clip and opacity transition open from there.
 *
 * Should the placement never arrive, the menu opens on the next frame anyway.
 */
export function useRevealEntering(
  placement: string | null | undefined,
  ref: RefObject<HTMLElement | null>,
) {
  const [entering, setEntering] = useState(true);
  useLayoutEffect(() => {
    if (!entering) return;
    const open = () => {
      // Resolve the closed state for this placement, so the transition starts from it.
      if (ref.current) void getComputedStyle(ref.current).clipPath;
      setEntering(false);
    };
    if (placement) {
      open();
      return;
    }
    const frame = requestAnimationFrame(open);
    return () => cancelAnimationFrame(frame);
  }, [entering, placement, ref]);
  return entering;
}
