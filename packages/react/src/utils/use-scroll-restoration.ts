'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';

export interface ScrollRestorationOptions {
  /**
   * Identifies the page shown: the router's path and query, so it works with any router. A
   * position is kept for each key.
   */
  pageKey: string;
  /**
   * The `sessionStorage` key the positions are kept under, for an app with more than one such
   * element. @default "windmorph-scroll"
   */
  storageKey?: string;
  /**
   * How long, in ms, a restored position is held while content arrives (images, data): moved
   * by anything but the person in that time (a router, a script), it is put back. The hold
   * ends at once when the person scrolls. @default 1500
   */
  holdFor?: number;
}

/** The most pages a position is kept for; the oldest go first. */
const MAX_PAGES = 200;

/** What a person does to scroll, which ends a hold. */
const RELEASE_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

function readPositions(storageKey: string): Map<string, number> {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? '{}');
    if (typeof stored !== 'object' || stored === null) return new Map();
    return new Map(
      Object.entries(stored).filter(
        (entry): entry is [string, number] => typeof entry[1] === 'number',
      ),
    );
  } catch {
    // Storage blocked, or not JSON: the positions are kept in memory for the visit.
    return new Map();
  }
}

function writePositions(storageKey: string, positions: Map<string, number>) {
  try {
    sessionStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(positions)));
  } catch {
    // Storage blocked or full: the map in memory still serves back and forward.
  }
}

/** The positions kept under one storage key, read once. */
interface Kept {
  storageKey: string;
  positions: Map<string, number>;
  /** The last page and position written, so a press or key that moved nothing writes nothing. */
  last: { key: string; top: number } | null;
}

/** The positions for `storageKey`: read from storage the first time, and again for another key. */
function keptFor(cache: { current: Kept | null }, storageKey: string): Kept {
  if (cache.current?.storageKey !== storageKey) {
    cache.current = { storageKey, positions: readPositions(storageKey), last: null };
  }
  return cache.current;
}

/** Whether this page load is a reload or a return through history, where a position comes back. */
function loadRestores(): boolean {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  return entry?.type === 'reload' || entry?.type === 'back_forward';
}

/** Moves the element there at once, whatever its `scroll-behavior`. */
function scrollTo(element: HTMLElement, top: number) {
  if (typeof element.scrollTo === 'function') element.scrollTo({ top, behavior: 'instant' });
  else element.scrollTop = top;
}

/**
 * Keeps the element at `top` for `duration` ms: a router can scroll it after the page changes,
 * and content still arriving makes the page tall enough to reach the position only later. Ends
 * the moment the person scrolls. Returns what ends it early.
 */
function hold(element: HTMLElement, top: number, duration: number): () => void {
  let frame = 0;
  const until = performance.now() + duration;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of RELEASE_EVENTS) window.removeEventListener(type, stop, true);
  };
  const apply = () => {
    if (element.scrollTop !== top) scrollTo(element, top);
    if (performance.now() < until) frame = requestAnimationFrame(apply);
    else stop();
  };
  for (const type of RELEASE_EVENTS) {
    window.addEventListener(type, stop, { capture: true, passive: true });
  }
  apply();
  return stop;
}

/**
 * Keeps and restores the scroll position of an element that scrolls by itself (an app frame's
 * pane), per page. Browsers restore only the window's scroll, so with client-side routing such
 * an element comes back at its top, or wherever it was on the page just left, and a reload
 * loses its position too.
 *
 * - A position is kept for each `pageKey`, in `sessionStorage`, so a reload restores it too.
 * - A page's position is taken when the person sets off: a press, a key, or back and forward.
 *   Never from a scroll after the page changed, since a router can scroll the element to the
 *   new page's top first.
 * - Going back or forward (the Navigation API's `navigate` event, or `popstate` where it's
 *   missing) restores the page's position and holds it for `holdFor` ms while content arrives;
 *   the hold ends the moment the person scrolls.
 * - A new page starts at its top.
 *
 * @example
 * const pane = useRef<HTMLElement>(null);
 * useScrollRestoration(pane, { pageKey: `${pathname}?${searchParams}` });
 * return <main ref={pane} className="overflow-y-auto">…</main>;
 */
export function useScrollRestoration(
  ref: RefObject<HTMLElement | null>,
  { pageKey, storageKey = 'windmorph-scroll', holdFor = 1500 }: ScrollRestorationOptions,
): void {
  /** The page the element shows, and whether its position was restored. */
  const shown = useRef<{ key: string; restored: boolean } | null>(null);
  const kept = useRef<Kept | null>(null);
  /** Set by back and forward until the page changes; cleared when the person sets off anew. */
  const traversing = useRef(false);

  useEffect(() => {
    const keep = () => {
      const element = ref.current;
      if (!element || !shown.current) return;
      const store = keptFor(kept, storageKey);
      const { key } = shown.current;
      const top = element.scrollTop;
      // Every press and key comes through here: most move nothing, and write nothing.
      if (store.last?.key === key && store.last.top === top) return;
      store.last = { key, top };
      // Deleted first, so the page moves to the newest end of the map.
      store.positions.delete(key);
      store.positions.set(key, top);
      if (store.positions.size > MAX_PAGES) {
        store.positions.delete(store.positions.keys().next().value as string);
      }
      writePositions(storageKey, store.positions);
    };
    const onSetOff = (event: Event) => {
      // A held key repeats after back or forward has begun: that isn't setting off anew.
      if ((event as KeyboardEvent).repeat) return;
      traversing.current = false;
      keep();
    };
    const onTraverse = () => {
      keep();
      traversing.current = true;
    };
    const onNavigate = (event: Event) => {
      const { navigationType, hashChange } = event as Event & {
        navigationType?: string;
        hashChange?: boolean;
      };
      if (navigationType === 'traverse' && !hashChange) onTraverse();
    };
    // In browsers with the Navigation API, `popstate` can arrive after the restored page is on
    // screen; `navigate` comes before the page changes.
    const navigation = (window as { navigation?: EventTarget }).navigation;
    document.addEventListener('pointerdown', onSetOff, true);
    document.addEventListener('keydown', onSetOff, true);
    window.addEventListener('pagehide', keep);
    if (navigation) navigation.addEventListener('navigate', onNavigate);
    else window.addEventListener('popstate', onTraverse, true);
    return () => {
      document.removeEventListener('pointerdown', onSetOff, true);
      document.removeEventListener('keydown', onSetOff, true);
      window.removeEventListener('pagehide', keep);
      if (navigation) navigation.removeEventListener('navigate', onNavigate);
      else window.removeEventListener('popstate', onTraverse, true);
    };
  }, [ref, storageKey]);

  // Before paint, so a restored page never shows at its top first.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const previous = shown.current;
    // The same page again (a development double render) repeats its decision.
    const restored =
      previous?.key === pageKey
        ? previous.restored
        : previous === null
          ? loadRestores()
          : traversing.current;
    if (previous?.key !== pageKey) traversing.current = false;
    shown.current = { key: pageKey, restored };
    if (!restored) {
      // A new page starts at its top; the first page of a visit is left where the browser put it.
      if (previous !== null && previous.key !== pageKey) scrollTo(element, 0);
      return;
    }
    const top = keptFor(kept, storageKey).positions.get(pageKey);
    if (top === undefined) {
      // Nothing kept for it (a page first seen through history): its top, as a new page.
      if (previous !== null && previous.key !== pageKey) scrollTo(element, 0);
      return;
    }
    return hold(element, top, holdFor);
  }, [ref, pageKey, storageKey, holdFor]);
}
