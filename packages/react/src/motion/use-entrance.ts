'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

export interface EntranceOptions {
  /**
   * How far into the window an element must come before its entrance plays, from 0 (any part
   * showing) to 1 (to the middle): past that share of half the window from its edge, so 0.25 is
   * an eighth of the window in. One shown whole enters wherever it is. The browser measures what
   * shows, so an element of any size, one that changes size, or one in a box that clips it
   * enters as it comes into view. @default 0.25
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
  // Hydrated: the first report decides, once, whether it showed its final picture already.
  const hydrating = useRef(!mountedInBrowser);

  useEffect(() => {
    const element = ref.current;
    // Nothing to watch: show the final picture, and let changes animate.
    if (!element || typeof IntersectionObserver === 'undefined') {
      setEntered(true);
      setInView(true);
      return;
    }
    // Shown whole, or come `amount` of half the window in from its edge.
    let whole = false;
    let inside = false;
    const enter = () => {
      if (done.current || !(whole || inside) || document.hidden) return;
      done.current = true;
      setEntered(true);
    };
    // A report can carry several records for the element: the newest is how it stands.
    const newest = (entries: IntersectionObserverEntry[]) => entries[entries.length - 1];
    // Any part on screen (a change is worth animating), and shown whole.
    const onScreen = new IntersectionObserver(
      (entries) => {
        const entry = newest(entries);
        if (!entry) return;
        whole = entry.isIntersecting && entry.intersectionRatio >= 0.999;
        setInView(entry.isIntersecting);
        if (hydrating.current) {
          // Hydrated with any part on screen: it showed its final picture already. Wholly out
          // of view: show the start state, unseen, until it's scrolled to.
          hydrating.current = false;
          if (entry.isIntersecting) done.current = true;
          else setEntered(false);
        }
        enter();
      },
      { threshold: [0, 1] },
    );
    // Any part past the inset: the window drawn in by `amount` of its half on every side.
    const inset = `${-Math.min(0.98, Math.max(0, amount)) * 50}%`;
    const pastEdge = new IntersectionObserver(
      (entries) => {
        const entry = newest(entries);
        if (!entry) return;
        inside = entry.isIntersecting;
        enter();
      },
      { rootMargin: inset, threshold: 0 },
    );
    onScreen.observe(element);
    pastEdge.observe(element);
    document.addEventListener('visibilitychange', enter);
    return () => {
      onScreen.disconnect();
      pastEdge.disconnect();
      document.removeEventListener('visibilitychange', enter);
    };
  }, [ref, amount, mountedInBrowser]);

  return { entered, inView };
}
