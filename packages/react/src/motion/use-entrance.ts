'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

export interface EntranceOptions {
  /**
   * How much must show before the entrance plays, from 0 to 1: of the element, or of the window
   * across and down for an element larger than it. @default 0.25
   */
  amount?: number;
}

export interface EntranceResult {
  /**
   * Whether the element shows its final state. `false` only while an entrance is waiting to
   * play: show the start state (bars at their baseline, a number at its start). It turns `true`
   * once, as the element first comes into view.
   */
  entered: boolean;
  /** Whether the element is in view now, so a change is worth animating. */
  inView: boolean;
}

const subscribeNothing = () => () => undefined;
const THRESHOLDS = Array.from({ length: 21 }, (_, step) => step / 20);

/**
 * Whether an element's entrance should play: once, when it first comes into view, so motion
 * nobody saw isn't wasted. Never for content that was on screen as the page hydrated: its final
 * picture was in the server's HTML, and replaying it from nothing would flash. Content
 * server-rendered out of view switches to its start state unseen and enters when scrolled to;
 * content the browser mounts later enters as it comes into view. A hidden tab waits until it
 * shows. On the server `entered` is `true`.
 *
 * @param ref The element whose entrance it is; it must be rendered by the time effects run.
 * @example
 * const { entered, inView } = useEntrance(ref);
 * const height = useM3SpringValue(entered ? share : 0, { animate: inView });
 */
export function useEntrance(
  ref: RefObject<Element | null>,
  { amount = 0.25 }: EntranceOptions = {},
): EntranceResult {
  // False on the server and while hydrating, true for a render the browser started.
  const inBrowser = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  const [mountedInBrowser] = useState(inBrowser);
  const [entered, setEntered] = useState(!mountedInBrowser);
  const [inView, setInView] = useState(false);
  // Entered once, for good: watching again (a new `amount`, an `Activity` shown again) never
  // sends it back to its start state.
  const done = useRef(false);

  useEffect(() => {
    const element = ref.current;
    // Nothing to watch: show the final picture, and let changes animate.
    if (!element || typeof IntersectionObserver === 'undefined') {
      setEntered(true);
      setInView(true);
      return;
    }
    let first = true;
    let showing = false;
    const enter = () => {
      if (done.current || !showing || document.hidden) return;
      done.current = true;
      setEntered(true);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Any part showing is worth animating; an entrance waits for `amount` of it.
        setInView(entry !== undefined && entry.isIntersecting);
        // A share of the element, or, for one larger than the window, that share of the window,
        // across and down (a tall one in a sideways scroller waits for some of its width).
        const bounds = entry?.rootBounds ?? null;
        const shownAlong = (axis: 'width' | 'height') =>
          bounds !== null &&
          entry!.intersectionRect[axis] >=
            amount * Math.min(entry!.boundingClientRect[axis], bounds[axis]) - 0.5;
        showing =
          entry !== undefined &&
          entry.isIntersecting &&
          (entry.intersectionRatio >= amount - 0.001 ||
            (shownAlong('width') && shownAlong('height')));
        if (first && !mountedInBrowser && !done.current) {
          // Hydrated with any part on screen: it showed its final picture already. Wholly out
          // of view: show the start state, unseen, until it's scrolled to.
          if (entry?.isIntersecting) done.current = true;
          else setEntered(false);
        }
        first = false;
        enter();
      },
      // Fine steps, so a tall element's callback runs as more of it shows.
      { threshold: THRESHOLDS },
    );
    observer.observe(element);
    document.addEventListener('visibilitychange', enter);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', enter);
    };
  }, [ref, amount, mountedInBrowser]);

  return { entered, inView };
}
