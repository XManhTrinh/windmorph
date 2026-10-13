'use client';

import { useEffect, useState, type RefObject } from 'react';

export interface ToolbarScrollExpansionOptions {
  /** The scroll container. Defaults to the window. */
  scrollRef?: RefObject<HTMLElement | null>;
  /** Scroll distance (px) back towards the top before the toolbar expands. @default 40 */
  expandThreshold?: number;
  /** Scroll distance (px) down before the toolbar collapses. @default 40 */
  collapseThreshold?: number;
  /** For content whose start is at the bottom (e.g. a chat), which reverses the direction. */
  reverse?: boolean;
  /** @default true */
  initialExpanded?: boolean;
}

/**
 * Collapses a floating toolbar while the content scrolls down and expands it when it
 * scrolls back up, after a 40px threshold each way (a port of Compose's
 * `floatingToolbarVerticalNestedScroll`). Pass the result to `FloatingToolbar`'s
 * `expanded`.
 *
 * @example
 * const expanded = useToolbarScrollExpansion();
 * <FloatingToolbar aria-label="Actions" expanded={expanded} …>
 */
export function useToolbarScrollExpansion({
  scrollRef,
  expandThreshold = 40,
  collapseThreshold = 40,
  reverse = false,
  initialExpanded = true,
}: ToolbarScrollExpansionOptions = {}): boolean {
  const [expanded, setExpanded] = useState(initialExpanded);

  useEffect(() => {
    const element = scrollRef?.current;
    const target: HTMLElement | Window = element ?? window;
    const position = () => (element ? element.scrollTop : window.scrollY);
    const factor = reverse ? -1 : 1;
    let isExpanded = initialExpanded;
    let last = position();
    // As in Compose, the content offset grows as the content scrolls back towards its start.
    let contentOffset = 0;
    let threshold = isExpanded ? -collapseThreshold : expandThreshold;

    const onScroll = () => {
      const current = position();
      const delta = (last - current) * factor;
      last = current;
      contentOffset += delta;
      if (delta < 0 && contentOffset <= threshold) {
        threshold = contentOffset + expandThreshold;
        if (isExpanded) setExpanded((isExpanded = false));
      } else if (delta > 0 && contentOffset >= threshold) {
        threshold = contentOffset - collapseThreshold;
        if (!isExpanded) setExpanded((isExpanded = true));
      }
    };
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [scrollRef, expandThreshold, collapseThreshold, reverse, initialExpanded]);

  return expanded;
}
