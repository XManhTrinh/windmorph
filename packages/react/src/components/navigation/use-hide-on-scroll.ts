'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, type RefObject } from 'react';
import { hasVisibleFocusWithin } from '../../utils/focus-visible';

/** How long after the last scroll event the scroll counts as ended where `scrollend` is missing. */
const SCROLL_END_FALLBACK_MS = 150;

/**
 * Hides a bottom bar while the page scrolls down and brings it back on any scroll up
 * (M3: "Scrolling downward can hide the navigation bar; scrolling upward reveals it"). The
 * offset, 0 down to minus the bar's height, follows the scroll distance like a top app
 * bar's `enter-always`, and is written to `--m3-nav-bar-offset`, which the sticky bar uses
 * as its `bottom`, so nothing re-renders while scrolling. Under reduced motion the bar
 * stays put.
 *
 * When the scroll ends with the bar part-hidden, it settles shown or hidden, whichever is
 * nearer, on the default effects spring (`data-settling`; 2026-10-15), as Compose's
 * exit-always bottom bars snap, so it never rests half off the screen.
 *
 * Fully hidden, the bar is `inert`, so Tab and screen readers skip its destinations until
 * it comes back. While keyboard focus is on one of its items it stays on screen (WCAG
 * 2.4.11 Focus Not Obscured), and focusing a partly hidden bar brings it back. Other focus
 * in it (an item pressed with a pointer) doesn't hold it on screen, but the bar isn't made
 * `inert` until focus leaves it, so that focus never drops to the page (2026-10-15).
 */
export function useHideOnScroll(
  enabled: boolean,
  barRef: RefObject<HTMLElement | null>,
  scrollRef?: RefObject<HTMLElement | null>,
) {
  const reducedMotion = useReducedMotion();
  const active = enabled && !reducedMotion;
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (!active) {
      bar.style.removeProperty('--m3-nav-bar-offset');
      return;
    }
    const scroller = scrollRef?.current;
    const target: HTMLElement | Window = scroller ?? window;
    const position = () => Math.max(0, scroller ? scroller.scrollTop : window.scrollY);
    let last = position();
    let offset = 0;
    let frame = 0;
    let endTimer: ReturnType<typeof setTimeout> | undefined;
    let isInert = false;
    const setOffset = (value: number) => {
      offset = value;
      bar.style.setProperty('--m3-nav-bar-offset', `${offset}px`);
      syncInert();
    };
    const syncInert = () => {
      const height = bar.offsetHeight;
      const offScreen = height > 0 && -offset >= height - 0.5;
      const inert = offScreen && !bar.contains(document.activeElement);
      if (inert !== isInert) {
        isInert = inert;
        bar.toggleAttribute('inert', inert);
      }
    };
    const update = () => {
      frame = 0;
      const scroll = position();
      const delta = scroll - last;
      last = scroll;
      const height = bar.offsetHeight;
      setOffset(hasVisibleFocusWithin(bar) ? 0 : Math.min(0, Math.max(-height, offset - delta)));
    };
    const settle = () => {
      clearTimeout(endTimer);
      const height = bar.offsetHeight;
      if (offset >= 0 || offset <= -height) return;
      bar.toggleAttribute('data-settling', true);
      setOffset(-offset > height / 2 ? -height : 0);
    };
    const onScroll = () => {
      bar.removeAttribute('data-settling');
      if (!frame) frame = requestAnimationFrame(update);
      if (!('onscrollend' in window)) {
        clearTimeout(endTimer);
        endTimer = setTimeout(settle, SCROLL_END_FALLBACK_MS);
      }
    };
    const onSettled = (event: TransitionEvent) => {
      if (event.target === bar) bar.removeAttribute('data-settling');
    };
    // Focus leaving a hidden bar makes it inert then.
    const onFocusOut = () => requestAnimationFrame(syncInert);
    update();
    target.addEventListener('scroll', onScroll, { passive: true });
    target.addEventListener('scrollend', settle);
    bar.addEventListener('focusin', onScroll);
    bar.addEventListener('focusout', onFocusOut);
    bar.addEventListener('transitionend', onSettled);
    return () => {
      target.removeEventListener('scroll', onScroll);
      target.removeEventListener('scrollend', settle);
      bar.removeEventListener('focusin', onScroll);
      bar.removeEventListener('focusout', onFocusOut);
      bar.removeEventListener('transitionend', onSettled);
      cancelAnimationFrame(frame);
      clearTimeout(endTimer);
      if (isInert) bar.removeAttribute('inert');
      bar.removeAttribute('data-settling');
      bar.style.removeProperty('--m3-nav-bar-offset');
    };
  }, [active, barRef, scrollRef]);
}
