'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';
import { flushSync } from 'react-dom';
import { useReducedMotion } from 'motion/react';

export interface EntranceOptions {
  /**
   * How far into the window an element must come before its entrance plays, from 0 (any part
   * showing) to 1 (to the middle): past that share of half the window's height from its top or
   * bottom, so 0.25 is an eighth of the window in. One shown whole enters wherever it is. The
   * browser measures what shows, so an element of any size, one that changes size, or one in a
   * box that clips it enters as it comes into view. @default 0.25
   */
  amount?: number;
}

export interface EntranceResult {
  /**
   * Whether the element shows its final state. `false` only while an entrance is waiting to
   * play: show the start state (bars at their baseline, a number at its start). It turns `true`
   * once, as the element first comes into view or the page is printed; under reduced motion it is
   * always `true`, so nothing waits at its start to jump in.
   */
  entered: boolean;
  /**
   * Whether the element is in view now, so a change is worth animating. `false` while the page
   * prints, on screen or not: a print runs no frames to animate in.
   */
  inView: boolean;
}

const subscribeNothing = () => () => undefined;

/** Told `true` on `beforeprint` and `false` on `afterprint`. */
type PrintListener = (printing: boolean) => void;
const printListeners = new Set<PrintListener>();
// Between `beforeprint` and `afterprint`: an entrance mounted then (a print-only section an app
// renders from its own `beforeprint` handler) starts entered. One the page's first entrance can't
// know, since the shared listeners are added after that event has passed.
let printing = false;

// One pair of window listeners for every entrance on the page, added with the first and removed
// with the last: a print commits them all in one `flushSync`, so the browser lays it out after a
// single synchronous render, and a print begun inside React's own work warns once, not once for
// each entrance (twelve tiles, twelve warnings).
const beforePrint = () => {
  printing = true;
  flushSync(() => {
    for (const listener of [...printListeners]) listener(true);
  });
};
const afterPrint = () => {
  printing = false;
  for (const listener of [...printListeners]) listener(false);
};

/** Calls `listener` as the page is printed and after; returns the unsubscribe. */
function subscribeToPrint(listener: PrintListener) {
  if (printListeners.size === 0) {
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
  }
  printListeners.add(listener);
  // Mounted during a print: it prints entered too.
  if (printing) listener(true);
  return () => {
    printListeners.delete(listener);
    if (printListeners.size > 0) return;
    window.removeEventListener('beforeprint', beforePrint);
    window.removeEventListener('afterprint', afterPrint);
  };
}

/**
 * Whether an element's entrance should play: once, when it first comes into view, so motion
 * nobody saw isn't wasted. Never for content that was on screen as the page hydrated: its final
 * picture was in the server's HTML, and replaying it from nothing would flash. Content
 * server-rendered out of view switches to its start state unseen and enters when scrolled to;
 * content the browser mounts later enters as it comes into view. A hidden tab waits until it
 * shows. On `beforeprint` the element enters and is out of view until `afterprint`, committed
 * before the print is laid out, so what React renders from `entered` (text, an attribute, a style
 * or CSS variable) prints in its final state. A print runs no frames, though: a Motion value
 * moved by it jumps to its target, but Motion writes the styles bound to that value on its next
 * frame, so a mark drawn from a Motion value needs a print value in CSS (its resting geometry
 * written as a CSS variable and applied under `@media print`), as `AnimatedNumber` prints its
 * final value. Every entrance on the page commits in the same render, from one shared listener. A
 * print begun inside React's own work (`window.print()` from an effect, as a print view does) is
 * laid out before this update renders, and only CSS reaches it (React warns once that it couldn't
 * flush): start a print from a press, or from an effect through a `setTimeout`, so what React
 * renders from `entered` prints. On the server `entered` is `true`.
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
  // Mounted during a print (`printing`): its final state at once, so its first render prints it.
  const [entered, setEntered] = useState(() => !mountedInBrowser || printing);
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
    // Shown whole, or come `amount` of half the window in from its top or bottom.
    let whole = false;
    let inside = false;
    let onScreenNow = false;
    let printingNow = false;
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
        onScreenNow = entry.isIntersecting;
        if (!printingNow) setInView(entry.isIntersecting);
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
    // Any part past the inset: the window drawn in from the top and the bottom by `amount` of
    // its half (not the sides: an element wholly at a wide window's edge could never enter).
    const share = Number.isFinite(amount) ? Math.min(0.98, Math.max(0, amount)) : 0.25;
    const inset = `${-share * 50}% 0px`;
    const pastEdge = new IntersectionObserver(
      (entries) => {
        const entry = newest(entries);
        if (!entry) return;
        inside = entry.isIntersecting;
        enter();
      },
      { rootMargin: inset, threshold: 0 },
    );
    // Committed before the browser lays the print out (the shared `beforeprint` listener's
    // `flushSync`): React would otherwise render after it. Dispatched inside React's own work
    // (`window.print()` from an effect) `flushSync` can't commit, so only CSS print styles reach
    // that print.
    const print = (now: boolean) => {
      printingNow = now;
      if (now) {
        done.current = true;
        hydrating.current = false;
        setEntered(true);
        setInView(false);
      } else {
        setInView(onScreenNow);
      }
    };
    onScreen.observe(element);
    pastEdge.observe(element);
    document.addEventListener('visibilitychange', enter);
    const unsubscribePrint = subscribeToPrint(print);
    return () => {
      onScreen.disconnect();
      pastEdge.disconnect();
      document.removeEventListener('visibilitychange', enter);
      unsubscribePrint();
    };
  }, [ref, amount, mountedInBrowser]);

  // Under reduced motion nothing waits at its start state: an entrance would only jump in.
  const reducedMotion = useReducedMotion() === true;
  return { entered: entered || reducedMotion, inView };
}
