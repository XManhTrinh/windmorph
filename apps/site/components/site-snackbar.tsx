'use client';

import { SnackbarHost, useSnackbarHostState } from '@windmorph/react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

/** Shows a short message in the site's snackbar. */
type Notify = (message: string) => void;

const SnackbarContext = createContext<Notify | null>(null);

/**
 * The site's one snackbar host, for confirmations such as "Copied". It sits above the
 * bottom navigation bar on phones and at the bottom of the window from medium up.
 */
export function SiteSnackbarProvider({ children }: { children: ReactNode }) {
  const state = useSnackbarHostState();
  const notify = useMemo<Notify>(
    () => (message) => {
      void state.showSnackbar(message, { replace: true });
    },
    [state],
  );
  return (
    <SnackbarContext value={notify}>
      {children}
      <SnackbarHost state={state} className="fixed inset-x-0 bottom-20 z-40 medium:bottom-0" />
    </SnackbarContext>
  );
}

/** The site snackbar's `notify`. Outside the provider it does nothing. */
export function useSiteSnackbar(): Notify {
  return useContext(SnackbarContext) ?? noop;
}

function noop() {}

/**
 * Copies text to the clipboard and confirms it in the site snackbar. Returns whether it
 * worked; the clipboard can be unavailable (an insecure context), which fails quietly.
 */
export function useCopy(): (text: string) => Promise<boolean> {
  const notify = useSiteSnackbar();
  return async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('Copied');
      return true;
    } catch {
      return false;
    }
  };
}
