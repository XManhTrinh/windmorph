import { useEffect, useRef, useSyncExternalStore, type ComponentType } from 'react';
import type { OnDemandComponent } from './load-on-demand';

/** The first pause before a still-wanted failed load is tried again; it doubles each time. */
export const LOAD_RETRY_DELAY = 1000;
/** The longest of those pauses. */
export const LOAD_RETRY_MOST = 30_000;

const nothing = () => undefined;

/**
 * `part`'s component once its module is in, re-rendering the caller as it arrives; while
 * `enabled` it starts the load. A failed load calls `onError` once; while still enabled (a
 * menu its app holds open) it's tried again after a pause, 1s doubling to 30s. Without
 * `onError` it's tried once. Apart from the loader, so only the components that open with a
 * part on demand carry it (library-internal).
 */
export function useLoaded<P extends object>(
  part: OnDemandComponent<P>,
  enabled: boolean,
  onError?: (error: unknown) => void,
): ComponentType<P> | undefined {
  const component = useSyncExternalStore(part.subscribe, part.loaded, nothing);
  const report = useRef(onError);
  useEffect(() => {
    report.current = onError;
  });
  useEffect(() => {
    if (!enabled || part.loaded()) return;
    let current = true;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const attempt = (pause: number) => {
      part.preload().catch((error: unknown) => {
        const onError = report.current;
        if (!current || !onError) return;
        if (pause === LOAD_RETRY_DELAY) onError(error);
        retry = setTimeout(() => attempt(Math.min(pause * 2, LOAD_RETRY_MOST)), pause);
      });
    };
    attempt(LOAD_RETRY_DELAY);
    return () => {
      current = false;
      clearTimeout(retry);
    };
  }, [part, enabled]);
  return component;
}
