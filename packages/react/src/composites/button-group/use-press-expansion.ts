'use client';

import { useLayoutEffect, type RefObject } from 'react';

interface Pinned {
  /** Width at rest, before the group changed it. */
  rest: number;
  /** The consumer's inline `flex` and `min-width`, restored afterwards. */
  flex: string;
  minWidth: string;
  timer?: ReturnType<typeof setTimeout>;
}

/** Half the space around an item's content: how much it may give up (Compose's compression limit). */
function compressionLimit(element: HTMLElement, width: number): number {
  const content = element.firstElementChild?.getBoundingClientRect().width ?? width;
  return Math.max(0, (width - content) / 2);
}

function settleDuration(element: HTMLElement): number {
  const value = getComputedStyle(element)
    .getPropertyValue('--md-sys-motion-spring-spatial-fast-duration')
    .trim();
  const ms = Number.parseFloat(value);
  return (Number.isFinite(ms) ? ms : 400) + 50;
}

/**
 * M3 Expressive button group interaction (Compose `ButtonGroup`): the pressed item grows
 * by `expandedRatio` of its width and its neighbours shrink by the same amount, each by
 * at most their own compression limit, so the group's total width stays the same.
 *
 * Watches the public `data-pressed` attribute of the group's direct children and animates
 * their `flex-basis` (the `container-motion` utility transitions it on the fast spatial
 * spring). At rest no inline sizing remains, so consumer sizing such as `flex-1` applies.
 */
export function usePressExpansion(groupRef: RefObject<HTMLElement | null>, expandedRatio: number) {
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || expandedRatio <= 0) return;

    const pinned = new Map<HTMLElement, Pinned>();
    let pressed: HTMLElement | null = null;

    const pin = (element: HTMLElement): Pinned => {
      const existing = pinned.get(element);
      if (existing) {
        clearTimeout(existing.timer);
        return existing;
      }
      const entry = {
        rest: element.getBoundingClientRect().width,
        flex: element.style.flex,
        minWidth: element.style.minWidth,
      };
      element.style.flex = `0 0 ${entry.rest}px`;
      // Like Compose, the group sets exact widths: a shrinking neighbour may go below its
      // minimum width, its label overlapping the padding it gives up.
      element.style.minWidth = '0px';
      pinned.set(element, entry);
      return entry;
    };

    const release = (element: HTMLElement) => {
      const entry = pinned.get(element);
      if (!entry) return;
      element.style.flexBasis = `${entry.rest}px`;
      clearTimeout(entry.timer);
      entry.timer = setTimeout(() => {
        element.style.flex = entry.flex;
        element.style.minWidth = entry.minWidth;
        pinned.delete(element);
      }, settleDuration(element));
    };

    const update = () => {
      const items = [...group.children] as HTMLElement[];
      const next =
        items.find((el) => el.hasAttribute('data-pressed') && !el.hasAttribute('data-disabled')) ??
        null;
      if (next === pressed) return;
      pressed = next;
      for (const element of pinned.keys()) release(element);
      if (!next || items.length < 2) return;

      const index = items.indexOf(next);
      const neighbours = [items[index - 1], items[index + 1]].filter(
        (el): el is HTMLElement => el !== undefined,
      );
      // Pin at the current width first so the change to the target width animates.
      const rest = new Map([next, ...neighbours].map((el) => [el, pin(el).rest]));
      void group.offsetWidth;

      // Compose: a middle item grows by min(ratio × width / 2, both neighbours' limits) on
      // each side; an end item by min(ratio × width, its neighbour's limit) on one side.
      const width = rest.get(next)!;
      const share = neighbours.length === 2 ? (expandedRatio * width) / 2 : expandedRatio * width;
      const growthPerSide = Math.min(
        share,
        ...neighbours.map((neighbour) => compressionLimit(neighbour, rest.get(neighbour)!)),
      );
      let growth = 0;
      for (const neighbour of neighbours) {
        const neighbourWidth = rest.get(neighbour)!;
        const give = Math.min(growthPerSide, neighbourWidth);
        neighbour.style.flexBasis = `${neighbourWidth - give}px`;
        growth += give;
      }
      next.style.flexBasis = `${width + growth}px`;
    };

    const observer = new MutationObserver((records) => {
      if (records.some((record) => (record.target as Element).parentElement === group)) update();
    });
    observer.observe(group, { subtree: true, attributes: true, attributeFilter: ['data-pressed'] });

    return () => {
      observer.disconnect();
      for (const [element, entry] of pinned) {
        clearTimeout(entry.timer);
        element.style.flex = entry.flex;
        element.style.minWidth = entry.minWidth;
      }
    };
  }, [groupRef, expandedRatio]);
}
