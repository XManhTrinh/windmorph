'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

/** Set on a group's child while it's folded into the overflow menu; the group hides it. */
export const OVERFLOW_HIDDEN = 'data-overflow-hidden';

/** Set on the group while it measures its children at their natural widths. */
const MEASURING = 'data-measuring';

/** Sub-pixel slack, so rounding never folds a button that fits. */
const EPSILON = 0.5;

/**
 * How many of `widths` fit in `available` px with `gap` between them, leaving room for an
 * overflow indicator `indicator` px wide (and its gap) when they don't all fit (Compose
 * `ButtonGroup`'s overflow measurement).
 */
export function fitCount(widths: number[], gap: number, indicator: number, available: number) {
  const span = (count: number) =>
    widths.slice(0, count).reduce((sum, width) => sum + width, 0) + gap * Math.max(0, count - 1);
  if (span(widths.length) <= available + EPSILON) return widths.length;
  let count = 0;
  while (count < widths.length && span(count + 1) + gap + indicator <= available + EPSILON) {
    count += 1;
  }
  return count;
}

/**
 * M3 button group overflow ("Buttons at the trailing edge of the button group can be
 * customized to collapse into an overflow menu at smaller breakpoints, and become visible
 * again at larger sizes"). The group's first `count` children are its items and the next
 * one is the overflow indicator. Measures the items at their natural widths whenever the
 * group or an item resizes, hides the trailing items that don't fit (and the indicator
 * when they all do) through `data-overflow-hidden`, and returns how many items show.
 *
 * Measuring and hiding happen in one synchronous pass before paint, so nothing flashes.
 */
export function useOverflow(
  groupRef: RefObject<HTMLElement | null>,
  enabled: boolean,
  count: number,
): number {
  const [visible, setVisible] = useState(count);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || !enabled) return;
    const measure = () => {
      const children = [...group.children] as HTMLElement[];
      const items = children.slice(0, count);
      const indicator = children[count];
      const available = group.clientWidth;
      // Natural widths: every item shown and none growing into spare space.
      for (const element of children) element.removeAttribute(OVERFLOW_HIDDEN);
      group.setAttribute(MEASURING, '');
      const gap = Number.parseFloat(getComputedStyle(group).columnGap) || 0;
      const widths = items.map((element) => element.getBoundingClientRect().width);
      const indicatorWidth = indicator?.getBoundingClientRect().width ?? 0;
      group.removeAttribute(MEASURING);

      const fit = fitCount(widths, gap, indicatorWidth, available);
      items.forEach((element, index) => element.toggleAttribute(OVERFLOW_HIDDEN, index >= fit));
      indicator?.toggleAttribute(OVERFLOW_HIDDEN, fit === count);
      setVisible(fit);
    };
    measure();
    const reset = () => {
      for (const element of group.children) element.removeAttribute(OVERFLOW_HIDDEN);
    };
    if (typeof ResizeObserver === 'undefined') return reset;
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    for (const element of group.children) observer.observe(element);
    return () => {
      observer.disconnect();
      reset();
    };
  }, [groupRef, enabled, count]);

  return enabled ? Math.min(visible, count) : count;
}
