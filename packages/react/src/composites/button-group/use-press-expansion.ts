'use client';

import { useLayoutEffect, type RefObject } from 'react';
import { OVERFLOW_HIDDEN } from './use-overflow';

/**
 * Set on the group while it sizes its items inline. A connected group, a grid at rest, is
 * then a flex row (`data-pinned:flex`), since the bump animates its items' `flex-basis`.
 */
const PINNED = 'data-pinned';

interface Pinned {
  /** Width at rest, before the group changed it. */
  rest: number;
  /** How much the item may give up to a pressed neighbour. */
  limit: number;
  /** The consumer's inline `flex` and `min-width`, restored afterwards. */
  flex: string;
  minWidth: string;
}

/**
 * An item's layout width, and how much of it the item may give up: half the space around its
 * content (Compose's compression limit). Both ignore transforms, such as a scaled ancestor,
 * since the group sets layout widths. The used `width` is in the item's own box sizing, as
 * `flex-basis` is.
 */
function measure(element: HTMLElement): { rest: number; limit: number } {
  const box = element.getBoundingClientRect().width;
  const layout = Number.parseFloat(getComputedStyle(element).width);
  const width = Number.isFinite(layout) ? layout : box;
  const scale = box > 0 ? width / box : 1;
  const content = element.firstElementChild
    ? element.firstElementChild.getBoundingClientRect().width * scale
    : width;
  return { rest: width, limit: Math.max(0, (width - content) / 2) };
}

/**
 * Changes an item's sizing without animating it. Pinning swaps the consumer's sizing (such as
 * a connected group's `flex: 1 1 0%`) for its measured width in px, and unpinning swaps it
 * back: the layout is the same either way, but the `container-motion` utility transitions
 * `flex-basis`, which would run from 0% to the px width (the item collapsing first) or back.
 * The change is flushed to style and its transition finished, so only the moves between the
 * rest and bumped widths animate.
 */
function resizeInstantly(element: HTMLElement, flex: string, minWidth: string) {
  element.style.flex = flex;
  element.style.minWidth = minWidth;
  void getComputedStyle(element).flexBasis;
  if (typeof element.getAnimations !== 'function') return;
  for (const animation of element.getAnimations()) {
    if (animation instanceof CSSTransition && animation.transitionProperty === 'flex-basis') {
      animation.finish();
    }
  }
}

/**
 * How long the release takes to settle, in ms. The token is a CSS time, which a minified
 * stylesheet may write in seconds (`.36s` for `360ms`).
 */
function settleDuration(element: HTMLElement): number {
  const value = getComputedStyle(element)
    .getPropertyValue('--md-sys-motion-spring-spatial-fast-duration')
    .trim();
  const time = Number.parseFloat(value);
  const ms = value.endsWith('ms') ? time : time * 1000;
  return (Number.isFinite(ms) ? ms : 400) + 50;
}

/**
 * M3 Expressive button group interaction (Compose `ButtonGroup`): the pressed item grows
 * by `expandedRatio` of its width and its neighbours shrink by the same amount, each by
 * at most their own compression limit, so the group's total width stays the same.
 *
 * Watches the public `data-pressed` attribute of the group's direct children and animates
 * their `flex-basis` (the `container-motion` utility transitions it on the fast spatial
 * spring), with `data-pinned` on the group while any item is pinned. At rest no inline sizing remains, so consumer sizing such as `flex-1` applies;
 * the switches between that sizing and the pinned px widths don't animate (2026-10-14).
 * Buttons folded into the overflow menu don't take part. Under reduced motion there's no
 * bump at all: it's movement that only decorates the press (architecture §6).
 */
export function usePressExpansion(groupRef: RefObject<HTMLElement | null>, expandedRatio: number) {
  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group || expandedRatio <= 0) return;

    const pinned = new Map<HTMLElement, Pinned>();
    let pressed: HTMLElement | null = null;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const pin = (element: HTMLElement, size: { rest: number; limit: number }): Pinned => {
      const existing = pinned.get(element);
      if (existing) return existing;
      const entry = {
        rest: size.rest,
        limit: size.limit,
        flex: element.style.flex,
        minWidth: element.style.minWidth,
      };
      // Like Compose, the group sets exact widths: a shrinking neighbour may go below its
      // minimum width, its label overlapping the padding it gives up.
      resizeInstantly(element, `0 0 ${entry.rest}px`, '0px');
      pinned.set(element, entry);
      return entry;
    };

    // Every item at once, in one task, so no frame shows some of them unpinned.
    const unpin = () => {
      for (const [element, entry] of pinned) resizeInstantly(element, entry.flex, entry.minWidth);
      pinned.clear();
      group.removeAttribute(PINNED);
    };

    // Back to the rest widths, then unpinned once that has settled.
    const release = () => {
      const [first] = pinned.keys();
      if (!first) return;
      for (const [element, entry] of pinned) element.style.flexBasis = `${entry.rest}px`;
      clearTimeout(settle);
      settle = setTimeout(unpin, settleDuration(first));
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const items = ([...group.children] as HTMLElement[]).filter(
        (element) => !element.hasAttribute(OVERFLOW_HIDDEN),
      );
      const next =
        items.find((el) => el.hasAttribute('data-pressed') && !el.hasAttribute('data-disabled')) ??
        null;
      if (next === pressed) return;
      pressed = next;
      release();
      if (!next || items.length < 2 || reducedMotion.matches) return;
      clearTimeout(settle);

      const index = items.indexOf(next);
      const neighbours = [items[index - 1], items[index + 1]].filter(
        (el): el is HTMLElement => el !== undefined,
      );
      // Pin every item at its current width first (instantly) so the change to the target
      // widths animates. Every item is measured before any is pinned, and every item is
      // pinned, not only the ones that move: in a group sized by its content (`w-fit`) the
      // group's width, and so the other items', depends on how each item is sized.
      const sizes = items.map((el) => pinned.get(el) ?? measure(el));
      // A connected group lays its items out as a grid; pinned, it's a flex row of the same
      // widths, so their `flex-basis` can animate.
      group.setAttribute(PINNED, '');
      const entries = new Map(items.map((el, i) => [el, pin(el, sizes[i]!)]));

      // Compose: a middle item grows by min(ratio × width / 2, both neighbours' limits) on
      // each side; an end item by min(ratio × width, its neighbour's limit) on one side.
      const width = entries.get(next)!.rest;
      const share = neighbours.length === 2 ? (expandedRatio * width) / 2 : expandedRatio * width;
      const growthPerSide = Math.min(
        share,
        ...neighbours.map((neighbour) => entries.get(neighbour)!.limit),
      );
      let growth = 0;
      for (const neighbour of neighbours) {
        const neighbourWidth = entries.get(neighbour)!.rest;
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
      clearTimeout(settle);
      unpin();
    };
  }, [groupRef, expandedRatio]);
}
