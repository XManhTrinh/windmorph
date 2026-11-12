'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { SCROLL_KEYS } from './use-scroll-keys';

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

/** The Navigation API, as far as it is read here. */
interface NavigationLike extends EventTarget {
  currentEntry?: { key: string } | null;
  activation?: { entry?: { key: string } | null } | null;
}

/** The part of an address that names a page: everything but its fragment. */
const withoutFragment = (address: string) => address.split('#')[0];

/**
 * Whether the page on screen is the one this document was loaded with, by a reload or a return
 * through history: its position comes back. A page shown later in the same document isn't the
 * load's, even to a hook that mounts only then (a frame left, and come back to by a link): the
 * history entry is compared where the Navigation API tells it, the address elsewhere.
 */
function loadRestores(): boolean {
  const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
  if (entry?.type !== 'reload' && entry?.type !== 'back_forward') return false;
  const { navigation } = window as { navigation?: NavigationLike };
  const loadedOn = navigation?.activation?.entry?.key;
  if (loadedOn !== undefined) return navigation?.currentEntry?.key === loadedOn;
  return withoutFragment(entry.name) === withoutFragment(location.href);
}

/** Moves the element there at once, whatever its `scroll-behavior`. */
function moveTo(element: HTMLElement, top: number) {
  if (typeof element.scrollTo === 'function') element.scrollTo({ top, behavior: 'instant' });
  else element.scrollTop = top;
}

/**
 * Keeps the element behind `ref` at `top` for `duration` ms: a router can scroll it after the
 * page changes, and content still arriving makes the page tall enough to reach the position
 * only later. The ref is read on every frame, so an element that arrives during the hold, or
 * replaces the first one, is held too. It ends when the time is up or the moment the person
 * scrolls, and then calls `onEnd`, with the event that ended it. Returns what stops it early,
 * without calling `onEnd`.
 */
function hold(
  ref: RefObject<HTMLElement | null>,
  top: number,
  duration: number,
  onEnd: (releasedBy?: Event) => void,
): () => void {
  let frame = 0;
  const until = performance.now() + duration;
  const stop = () => {
    cancelAnimationFrame(frame);
    for (const type of RELEASE_EVENTS) window.removeEventListener(type, release, true);
  };
  const end = (releasedBy?: Event) => {
    stop();
    onEnd(releasedBy);
  };
  const release = (event: Event) => {
    // A key still down from the back or forward shortcut repeats, and that isn't scrolling; a
    // scroll key held down is.
    if (event instanceof KeyboardEvent && event.repeat) {
      const shortcut = event.altKey || event.ctrlKey || event.metaKey;
      if (shortcut || !SCROLL_KEYS.has(event.key)) return;
    }
    end(event);
  };
  const apply = () => {
    const element = ref.current;
    if (element && element.scrollTop !== top) moveTo(element, top);
    if (performance.now() < until) frame = requestAnimationFrame(apply);
    else end();
  };
  for (const type of RELEASE_EVENTS) {
    window.addEventListener(type, release, { capture: true, passive: true });
  }
  apply();
  return stop;
}

/** The page the element shows. */
interface Shown {
  key: string;
  /** Whether its position was restored (a reload, back or forward) or it began at its top. */
  restored: boolean;
  /** Its position needs no more holding: the hold ended, or there was nothing to hold. */
  settled: boolean;
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
 *   new page's top first; and never while a restored position is still being held, nor by the
 *   press or key that ends the hold, since content still arriving can leave the page short of
 *   it.
 * - Going back or forward (the Navigation API's `navigate` event, or `popstate` where it's
 *   missing) restores the page's position and holds it for `holdFor` ms while content arrives;
 *   the hold ends the moment the person scrolls.
 * - A new page starts at its top: every other change of `pageKey`.
 * - The element can be left out on some pages (a frame that lays them out without its pane),
 *   arrive after the page has changed, or be replaced, while the component that calls the hook
 *   stays mounted: pages without it keep nothing, and a restored position is held on whichever
 *   element is behind the ref.
 *
 * Call it in a component that stays mounted as the pages change (a layout): back and forward
 * are seen only while it is mounted.
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
  const shown = useRef<Shown | null>(null);
  const kept = useRef<Kept | null>(null);
  /** Set by back and forward until the page changes; cleared when the person sets off anew. */
  const traversing = useRef(false);
  /** The page whose restored position is being held, which the element may not have reached. */
  const holding = useRef<string | null>(null);
  /** The press or key that ended the last hold, which takes no position either. */
  const releasedBy = useRef<Event | null>(null);

  useEffect(() => {
    const keep = () => {
      const element = ref.current;
      if (!element || !shown.current) return;
      const { key } = shown.current;
      // Content still arriving can leave the element short of the position being held: what is
      // kept for the page stands until the hold ends.
      if (holding.current === key) return;
      const store = keptFor(kept, storageKey);
      const top = element.scrollTop;
      // Every press and key comes through here: most move nothing, and write nothing.
      if (store.last?.key === key && store.last.top === top) return;
      store.last = { key, top };
      // Deleted first, so the page moves to the newest end of the map.
      store.positions.delete(key);
      store.positions.set(key, top);
      if (store.positions.size > MAX_PAGES) {
        const [oldest] = store.positions.keys();
        if (oldest !== undefined) store.positions.delete(oldest);
      }
      writePositions(storageKey, store.positions);
    };
    const onSetOff = (event: Event) => {
      // A held key repeats after back or forward has begun: that isn't setting off anew.
      if (event instanceof KeyboardEvent && event.repeat) return;
      traversing.current = false;
      // The press or key that ended a hold reached this listener after the hold's own: the page
      // may still be short of the position that was held, so what is kept for it stands.
      if (event !== releasedBy.current) keep();
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
    // `popstate` can't tell a step within the page (a fragment) from a step to another page; the
    // `hashchange` that follows it can, where only the fragment differs, and takes the step back.
    const onHashChange = (event: HashChangeEvent) => {
      if (withoutFragment(event.oldURL) === withoutFragment(event.newURL)) {
        traversing.current = false;
      }
    };
    // In browsers with the Navigation API, `popstate` can arrive after the restored page is on
    // screen; `navigate` comes before the page changes.
    const { navigation } = window as { navigation?: NavigationLike };
    document.addEventListener('pointerdown', onSetOff, true);
    document.addEventListener('keydown', onSetOff, true);
    window.addEventListener('pagehide', keep);
    if (navigation) {
      navigation.addEventListener('navigate', onNavigate);
    } else {
      window.addEventListener('popstate', onTraverse, true);
      window.addEventListener('hashchange', onHashChange);
    }
    return () => {
      document.removeEventListener('pointerdown', onSetOff, true);
      document.removeEventListener('keydown', onSetOff, true);
      window.removeEventListener('pagehide', keep);
      if (navigation) {
        navigation.removeEventListener('navigate', onNavigate);
      } else {
        window.removeEventListener('popstate', onTraverse, true);
        window.removeEventListener('hashchange', onHashChange);
      }
    };
  }, [ref, storageKey]);

  // Before paint, so a restored page never shows at its top first.
  useLayoutEffect(() => {
    const previous = shown.current;
    const samePage = previous?.key === pageKey;
    // The same page again (effects run twice in development, an option changed) repeats its
    // decision, and a hold that has ended isn't begun again.
    const restored = samePage
      ? previous.restored
      : previous === null
        ? loadRestores()
        : traversing.current;
    if (!samePage) traversing.current = false;
    // The page is noted even while the element is left out (a frame that lays some pages out
    // without its pane), so the next page with it is decided against the page just left.
    const page: Shown = { key: pageKey, restored, settled: samePage && previous.settled };
    shown.current = page;
    const top = restored ? keptFor(kept, storageKey).positions.get(pageKey) : undefined;
    if (top === undefined) {
      // A new page, or one first seen through history with nothing kept for it, starts at its
      // top; the first page of a visit is left where the browser put it.
      if (previous !== null && !samePage && ref.current) moveTo(ref.current, 0);
      page.settled = true;
      return;
    }
    if (page.settled) return;
    holding.current = pageKey;
    const release = () => {
      if (holding.current === pageKey) holding.current = null;
    };
    const stop = hold(ref, top, holdFor, (event) => {
      page.settled = true;
      releasedBy.current = event ?? null;
      release();
    });
    return () => {
      stop();
      release();
    };
  }, [ref, pageKey, storageKey, holdFor]);
}
