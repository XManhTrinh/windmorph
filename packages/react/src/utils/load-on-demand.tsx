import { useEffect, useState, type ComponentType, type RefObject } from 'react';

/** A component whose module loads the first time it renders, or ahead of that. */
export interface OnDemandComponent<P extends object> {
  /**
   * Starts loading the module, once; later calls return the same promise. A failed load (say,
   * a dropped connection) is tried again on the next call.
   */
  preload: () => Promise<ComponentType<P>>;
  /**
   * Renders the component once its module has loaded, and nothing until then; mounting it
   * starts the load. A failed load renders nothing and is tried again on the next mount or
   * `preload`.
   */
  Component: ComponentType<P>;
}

/**
 * Loads a component on demand, for parts a component shows only sometimes (a tooltip on
 * hover, a loading indicator while loading), so it doesn't carry their code up front.
 *
 * Unlike `React.lazy` it never suspends: once the module is in, the component renders in the
 * same pass, and on first use it renders as soon as the module arrives. A `Suspense` boundary
 * would hold back content that resolves after its fallback showed (React throttles those
 * reveals by up to 300ms), so a part preloaded on hover would still show late.
 */
export function onDemand<P extends object>(
  load: () => Promise<ComponentType<P>>,
): OnDemandComponent<P> {
  let loaded: ComponentType<P> | undefined;
  let pending: Promise<ComponentType<P>> | undefined;

  const preload = () => {
    pending ??= load().then(
      (component) => (loaded = component),
      (error: unknown) => {
        pending = undefined;
        throw error;
      },
    );
    return pending;
  };

  function Component(props: P) {
    // Re-renders once the module arrives; `loaded` holds the component.
    const [, setArrived] = useState(false);
    useEffect(() => {
      if (loaded) return;
      let mounted = true;
      preload().then(
        () => mounted && setArrived(true),
        () => undefined,
      );
      return () => {
        mounted = false;
      };
    }, []);
    const Loaded = loaded;
    return Loaded ? <Loaded {...props} /> : null;
  }

  return { preload, Component };
}

/** How long after mounting a browser without `requestIdleCallback` waits before preloading. */
export const IDLE_FALLBACK_DELAY = 1000;

/** A mounted part waiting for the browser's next idle period, with the preload it wants. */
interface IdleEntry {
  preload: () => Promise<unknown>;
}

const idleQueue = new Set<IdleEntry>();
let cancelIdle: (() => void) | undefined;

function whenIdle(run: () => void): () => void {
  if (typeof window.requestIdleCallback === 'function') {
    const handle = window.requestIdleCallback(run);
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(run, IDLE_FALLBACK_DELAY);
  return () => window.clearTimeout(handle);
}

function runIdlePreloads() {
  cancelIdle = undefined;
  const preloads = new Set([...idleQueue].map((entry) => entry.preload));
  idleQueue.clear();
  // A failed preload is left to the hover, focus or render that needs the part.
  for (const preload of preloads) void preload().catch(() => undefined);
}

/** Whether the user asked to save data, where the browser tells. */
function savesData() {
  const { connection } = navigator as Navigator & { connection?: { saveData?: boolean } };
  return connection?.saveData === true;
}

/**
 * Calls `preload` in the browser's first idle period after mount (or `IDLE_FALLBACK_DELAY`
 * later without `requestIdleCallback`), while `enabled`, so the part is usually in before it
 * first shows. One callback serves every mounted part. Never on the server, nor when the user
 * asked to save data.
 */
export function usePreloadWhenIdle(preload: () => Promise<unknown>, enabled: boolean) {
  useEffect(() => {
    if (!enabled || savesData()) return;
    const entry: IdleEntry = { preload };
    idleQueue.add(entry);
    cancelIdle ??= whenIdle(runIdlePreloads);
    return () => {
      idleQueue.delete(entry);
      if (idleQueue.size === 0 && cancelIdle) {
        cancelIdle();
        cancelIdle = undefined;
      }
    };
  }, [preload, enabled]);
}

/**
 * Calls `preload` when the pointer moves over `ref`'s element or focus enters it, while
 * `enabled`: the moments a part shown on hover or focus becomes likely. It also preloads when
 * the browser is idle (`usePreloadWhenIdle`).
 */
export function usePreloadOnIntent(
  ref: RefObject<HTMLElement | null>,
  preload: () => Promise<unknown>,
  enabled: boolean,
) {
  usePreloadWhenIdle(preload, enabled);
  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;
    // A failed preload is left to the render that needs the part, which loads again.
    const onIntent = () => void preload().catch(() => undefined);
    element.addEventListener('pointerover', onIntent);
    element.addEventListener('focusin', onIntent);
    return () => {
      element.removeEventListener('pointerover', onIntent);
      element.removeEventListener('focusin', onIntent);
    };
  }, [ref, preload, enabled]);
}
