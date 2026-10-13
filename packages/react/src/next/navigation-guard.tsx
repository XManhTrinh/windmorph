'use client';

import { useRouter } from 'next/navigation';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

/** Runs instead of a navigation while a guard is active; `proceed()` navigates after all. */
export type NavigationAttempt = (proceed: () => void) => void;

interface GuardRegistry {
  /** Adds a guard and returns its removal. */
  add: (attempt: { current: NavigationAttempt }) => () => void;
  /** Navigates with `go`, unless the most recent guard takes the attempt. */
  attempt: (go: () => void) => void;
}

const GuardContext = createContext<GuardRegistry | null>(null);

/** The guard registry `NextRouterProvider` holds; @internal */
export function useGuardRegistry(): GuardRegistry {
  const guards = useRef<{ current: NavigationAttempt }[]>([]);
  return useMemo(
    () => ({
      add: (guard) => {
        guards.current = [...guards.current, guard];
        return () => {
          guards.current = guards.current.filter((item) => item !== guard);
        };
      },
      attempt: (go) => {
        const latest = guards.current.at(-1);
        if (latest) latest.current(go);
        else go();
      },
    }),
    [],
  );
}

/** @internal */
export const GuardProvider = GuardContext.Provider;

export interface NavigationGuardOptions {
  /** Whether leaving should ask first, e.g. while a form has unsaved changes. */
  when: boolean;
  /**
   * Called instead of following a library link (or a `useGuardedNavigate` call) while `when`
   * is true. Show a confirm dialog, and call `proceed()` if the person chooses to leave.
   */
  onAttempt: NavigationAttempt;
}

/**
 * Asks before leaving a page with unsaved changes. While `when` is true, library links
 * (`href` on a `Button`, `ListItem`, `Link`, `Tab`, …) inside `NextRouterProvider` call
 * `onAttempt` instead of navigating, and reloading or closing the tab shows the browser's
 * own prompt. The browser's Back and Forward buttons can't be stopped in the App Router.
 * When several guards are active, the most recent one decides.
 *
 * @example
 * useNavigationGuard({ when: dirty, onAttempt: (proceed) => setLeaving(() => proceed) });
 */
export function useNavigationGuard({ when, onAttempt }: NavigationGuardOptions): void {
  const registry = useContext(GuardContext);
  const latest = useRef(onAttempt);

  useEffect(() => {
    latest.current = onAttempt;
  }, [onAttempt]);

  useEffect(() => {
    if (!when) return;
    const remove = registry?.add(latest);
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => {
      remove?.();
      window.removeEventListener('beforeunload', warn);
    };
  }, [when, registry]);
}

/**
 * A `navigate(href)` for code that would call `router.push` itself (after a save, a
 * redirect), which asks the active navigation guard first, as library links do.
 */
export function useGuardedNavigate(): (href: string) => void {
  const registry = useContext(GuardContext);
  const router = useRouter();
  return useCallback(
    (href: string) => {
      const go = () => router.push(href);
      if (registry) registry.attempt(go);
      else go();
    },
    [registry, router],
  );
}
