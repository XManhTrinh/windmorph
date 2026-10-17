'use client';

import { useLayoutEffect, useRef, type RefObject } from 'react';

/** A CSS time (`500ms`, `.5s`) in ms; 0 for anything else. */
function toMs(value: string) {
  const time = value.trim();
  const amount = parseFloat(time);
  if (Number.isNaN(amount)) return 0;
  return time.endsWith('ms') ? amount : time.endsWith('s') ? amount * 1000 : 0;
}

/** Each item's pill and its icon's top, relative to the rail. */
function measure(rail: HTMLElement) {
  const railTop = rail.getBoundingClientRect().top;
  const tops = new Map<HTMLElement, number>();
  for (const pill of rail.querySelectorAll<HTMLElement>('[data-nav-item] [data-slot="pill"]')) {
    const icon = pill.querySelector('[data-slot="icon"]');
    if (icon) tops.set(pill, icon.getBoundingClientRect().top - railTop);
  }
  return tops;
}

/**
 * Moves the rail's item pills from where their icons were to where they are as the rail
 * expands or collapses, on the default spatial spring, as Compose's rail lerps each icon
 * between its top and start positions (`NavigationItem.kt`; 2026-10-17). The items' heights
 * and gaps spring in CSS (64 → 48px and 4 → 0px, `itemMinHeight` / `itemVerticalSpacedBy`),
 * but the switch between an icon above its label and beside it moved every icon in one
 * frame. Only the pills move (the `translate` property), never the rail's root; nothing
 * moves under reduced motion, where the spatial spring is 0ms.
 *
 * Call `capture` while rendering the switch (the DOM still shows the old layout); the
 * layout effect then plays the move from the captured positions.
 */
export function useRailItemMorph(railRef: RefObject<HTMLElement | null>, mode: boolean) {
  const before = useRef<Map<HTMLElement, number> | null>(null);
  const capture = () => {
    if (railRef.current) before.current = measure(railRef.current);
  };
  useLayoutEffect(() => {
    const rail = railRef.current;
    const from = before.current;
    before.current = null;
    if (!rail || !from || typeof rail.animate !== 'function') return;
    const style = getComputedStyle(rail);
    const duration = toMs(
      style.getPropertyValue('--md-sys-motion-spring-spatial-default-duration'),
    );
    if (duration <= 0) return;
    const easing = style.getPropertyValue('--md-sys-motion-spring-spatial-default-easing').trim();
    for (const [pill, top] of measure(rail)) {
      const old = from.get(pill);
      if (old === undefined || Math.abs(old - top) < 0.5) continue;
      pill.animate([{ translate: `0 ${old - top}px` }, { translate: '0 0' }], {
        duration,
        easing: easing || 'ease',
      });
    }
  }, [railRef, mode]);
  return capture;
}
