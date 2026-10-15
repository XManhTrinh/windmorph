'use client';

import { useLayoutEffect, type RefObject } from 'react';

/**
 * Makes the parts of a collapsed standard bottom sheet that lie below its peek `inert`, so
 * Tab and screen readers reach only what's on screen (WCAG 2.4.11 Focus Not Obscured). The
 * content's top-level children are measured against the panel's top: one that doesn't fit
 * entirely within `peekHeight` is inert until the sheet expands. With the default 56px peek
 * that's all the content, leaving the drag handle, which expands the sheet; a taller peek
 * keeps a summary row that fits in it reachable. `collapsed` comes from the panel's
 * `data-detent`. If focus is in a part that becomes inert (Escape collapsed the sheet),
 * it moves to `fallback` (the handle, or the panel) instead of falling to the page.
 */
export function usePeekInert(
  panelRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
  collapsed: boolean,
  peekHeight: number,
  fallback: () => HTMLElement | null,
) {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const content = contentRef.current;
    if (!collapsed || !panel || !content) return;
    const top = panel.getBoundingClientRect().top;
    const active = panel.ownerDocument.activeElement;
    // Children the consumer made inert themselves are left alone.
    const hidden = [...content.children].filter(
      (child) =>
        !child.hasAttribute('inert') &&
        child.getBoundingClientRect().bottom - top > peekHeight + 0.5,
    );
    for (const child of hidden) child.setAttribute('inert', '');
    if (active && hidden.some((child) => child.contains(active))) fallback()?.focus();
    return () => {
      for (const child of hidden) child.removeAttribute('inert');
    };
  });
}
