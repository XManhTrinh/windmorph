'use client';

import { useCallback, useSyncExternalStore } from 'react';

/** The M3 compact window class (below 600px wide). */
export const COMPACT_WINDOW = '(max-width: 599.98px)';

/**
 * Whether a media query matches, kept in step with the window. The server (and the first
 * client render, so hydration matches) sees `false`.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
