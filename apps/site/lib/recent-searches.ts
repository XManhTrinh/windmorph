import { useSyncExternalStore } from 'react';

/** Where the recent searches are kept, newest first. */
export const RECENT_SEARCHES_KEY = 'windmorph-docs:recent-searches';

/** How many recent searches are kept. */
export const MAX_RECENT_SEARCHES = 5;

const NONE: readonly string[] = Object.freeze([]);
const listeners = new Set<() => void>();
/** The last stored value read and what it parsed to, so snapshots stay the same array. */
let cache: { raw: string | null; searches: readonly string[] } = { raw: null, searches: NONE };

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(RECENT_SEARCHES_KEY);
  } catch {
    // Storage can be blocked (private windows, site data off); there are simply no recents.
    return null;
  }
}

function parse(raw: string | null): readonly string[] {
  if (raw == null) return NONE;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return NONE;
    return value
      .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return NONE;
  }
}

function getSnapshot(): readonly string[] {
  const raw = readRaw();
  if (raw !== cache.raw) cache = { raw, searches: parse(raw) };
  return cache.searches;
}

function getServerSnapshot(): readonly string[] {
  return NONE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // Another tab changed them.
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === RECENT_SEARCHES_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function write(searches: readonly string[]) {
  try {
    if (searches.length === 0) window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    else window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
  } catch {
    // Not kept when storage is blocked or full; the search works the same without them.
  }
  for (const listener of listeners) listener();
}

/** Puts a query first in the recent searches (case-insensitively once). */
export function addRecentSearch(query: string) {
  const search = query.trim().replace(/\s+/g, ' ');
  if (!search) return;
  const key = search.toLowerCase();
  write(
    [search, ...getSnapshot().filter((item) => item.toLowerCase() !== key)].slice(
      0,
      MAX_RECENT_SEARCHES,
    ),
  );
}

export function removeRecentSearch(query: string) {
  write(getSnapshot().filter((item) => item !== query));
}

/** The recent searches, newest first; none while server rendering and hydrating. */
export function useRecentSearches(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
