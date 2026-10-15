'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, type RefObject } from 'react';
import { hasVisibleFocusWithin } from '../../utils/focus-visible';

/**
 * Hides a bottom bar while the page scrolls down and brings it back on any scroll up
 * (M3: "Scrolling downward can hide the navigation bar; scrolling upward reveals it"). The
 * offset, 0 down to minus the bar's height, follows the scroll distance like a top app
 * bar's `enter-always`, and is written to `--m3-nav-bar-offset`, which the sticky bar uses
 * as its `bottom`, so nothing re-renders while scrolling. Under reduced motion the bar
 * stays put.
 *
 * Fully hidden, the bar is `inert`, so Tab and screen readers skip its destinations until
 * it comes back. While keyboard focus is on one of its items it stays on screen (WCAG
 * 2.4.11 Focus Not Obscured), and focusing a partly hidden bar brings it back.
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
    let hidden = false;
    const update = () => {
      frame = 0;
      const scroll = position();
      const delta = scroll - last;
      last = scroll;
      const height = bar.offsetHeight;
      offset = hasVisibleFocusWithin(bar) ? 0 : Math.min(0, Math.max(-height, offset - delta));
      bar.style.setProperty('--m3-nav-bar-offset', `${offset}px`);
      const offScreen = height > 0 && -offset >= height - 0.5;
      if (offScreen !== hidden) {
        hidden = offScreen;
        bar.toggleAttribute('inert', offScreen);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    target.addEventListener('scroll', onScroll, { passive: true });
    bar.addEventListener('focusin', onScroll);
    return () => {
      target.removeEventListener('scroll', onScroll);
      bar.removeEventListener('focusin', onScroll);
      cancelAnimationFrame(frame);
      if (hidden) bar.removeAttribute('inert');
      bar.style.removeProperty('--m3-nav-bar-offset');
    };
  }, [active, barRef, scrollRef]);
}
