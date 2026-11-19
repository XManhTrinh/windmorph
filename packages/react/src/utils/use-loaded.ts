import { useEffect, useRef, useSyncExternalStore, type ComponentType } from 'react';
import type { OnDemandComponent } from './load-on-demand';

/** The first pause before a still-wanted failed load is tried again; it doubles each time. */
export const LOAD_RETRY_DELAY = 1000;
/** The longest of those pauses. */
export const LOAD_RETRY_MOST = 30_000;

const nothing = () => undefined;

/**
 * `part`'s component once its module is in, else `undefined`, re-rendering the caller as it
 * arrives, whichever call loaded it (library-internal: for components that open with a part
 * loaded on demand). While `enabled` it starts the load. Without `onError` a failed load is
 * tried again only the next time `enabled` turns on (or on `preload`). With it, a failed load
 * calls `onError` (once, until `enabled` turns off): the caller usually closes, which ends the
 * wait, and the next open tries again; while it stays enabled (an app holding a menu open that
 * its close can't change), it's tried again after a pause, `LOAD_RETRY_DELAY` doubling up to
 * `LOAD_RETRY_MOST`, so it shows once the network is back. Apart from `load-on-demand.tsx`,
 * so a component that only renders a part on demand (a tooltip, an indicator) doesn't carry
 * it.
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
        // A caller with nothing to report to tries once.
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
