'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * The exit side of Compose's display mode animation for a view that swaps its content (the
 * date picker's calendar ↔ text input; 2026-10-24): call `capture()` right before the swap,
 * with the vertical distance it leaves by, and when `key` changes a still copy of the outgoing
 * view fades out on the fast effects spring while it slides that far on the default spatial
 * spring, in the `slot` element
 * (laid over the new view, which the picker's clipping keeps in bounds), then goes. The copy is
 * `inert` and hidden from assistive technology, with its ids removed, so only the new view is
 * ever reachable. Under reduced motion it only fades.
 */
export function useViewExit(key: unknown) {
  const slot = useRef<HTMLDivElement | null>(null);
  const view = useRef<HTMLElement | null>(null);
  const leaving = useRef<HTMLElement | null>(null);
  const scrolled = useRef<(readonly [HTMLElement, number])[]>([]);
  const offset = useRef('0');

  useLayoutEffect(() => {
    const copy = leaving.current;
    const container = slot.current;
    leaving.current = null;
    if (!copy || !container) return;
    container.replaceChildren(copy);
    for (const [node, top] of scrolled.current) node.scrollTop = top;
    scrolled.current = [];
    // Applies the start state before the transition is set.
    void copy.offsetHeight;
    copy.style.transition = [
      'translate var(--md-sys-motion-spring-spatial-default-duration) var(--md-sys-motion-spring-spatial-default-easing)',
      'opacity var(--md-sys-motion-spring-effects-fast-duration) var(--md-sys-motion-spring-effects-fast-easing)',
    ].join(', ');
    const { transitionDuration } = getComputedStyle(copy);
    const longest = Math.max(...transitionDuration.split(',').map((d) => parseFloat(d) * 1000));
    const remove = () => copy.remove();
    if (!(longest > 0)) return remove();
    copy.style.opacity = '0';
    copy.style.translate = `0 ${offset.current}`;
    // Both transitions have ended by then (a background tab can skip their events).
    const timer = window.setTimeout(remove, longest + 50);
    return () => {
      window.clearTimeout(timer);
      remove();
    };
  }, [key]);

  /** The outgoing view (a ref callback for the element that swaps). */
  const attachView = useCallback((element: HTMLElement | null) => {
    view.current = element;
  }, []);
  /** The element the copy is laid in (a ref callback; React renders nothing inside it). */
  const attachSlot = useCallback((element: HTMLDivElement | null) => {
    slot.current = element;
  }, []);
  /** Copies the outgoing view, to leave by `distance`; call it right before the content changes. */
  const capture = useCallback((distance: string) => {
    const element = view.current;
    if (!element || !slot.current) return;
    const copy = element.cloneNode(true) as HTMLElement;
    for (const node of [copy, ...copy.querySelectorAll('[id]')]) node.removeAttribute('id');
    // A copy starts unscrolled: keep where a scrolled part (the range picker's months) was.
    const originals = [...element.querySelectorAll<HTMLElement>('*')];
    const copies = [...copy.querySelectorAll<HTMLElement>('*')];
    scrolled.current = originals.flatMap((node, index) =>
      node.scrollTop > 0 ? [[copies[index]!, node.scrollTop] as const] : [],
    );
    copy.removeAttribute('data-enter');
    copy.style.translate = '0 0';
    copy.style.opacity = '1';
    leaving.current = copy;
    offset.current = distance;
  }, []);
  return { attachView, attachSlot, capture };
}
