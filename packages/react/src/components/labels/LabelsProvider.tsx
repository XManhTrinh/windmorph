'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { WindmorphLabels } from '../../windmorph-labels';

/** The words of the providers above, already merged; `null` with no provider. */
export const LabelsContext = createContext<WindmorphLabels | null>(null);

export interface LabelsProviderProps {
  /**
   * The words, keyed by component: `{ TextField: { error: '…' }, DialogHeader: { close: '…' } }`.
   * Keep the object the same between renders (a constant, or `useMemo`), so the components
   * below render again only when a word changes.
   */
  labels: WindmorphLabels;
  children?: ReactNode;
}

/** One provider's words over another's, per component and per word. */
function mergeLabels(outer: WindmorphLabels | null, inner: WindmorphLabels): WindmorphLabels {
  if (!outer) return inner;
  const merged: Record<string, object | undefined> = { ...outer };
  for (const [component, words] of Object.entries(inner)) {
    merged[component] = { ...merged[component], ...defined(words) };
  }
  return merged;
}

/** An object without its `undefined` values, so a word left `undefined` keeps the one below. */
export function defined<T extends object>(words: T | undefined): Partial<T> {
  if (!words) return {};
  const kept: Partial<T> = {};
  for (const key of Object.keys(words) as (keyof T)[]) {
    if (words[key] !== undefined) kept[key] = words[key];
  }
  return kept;
}

/**
 * Sets the words every component below shows or announces by itself ("Close", "Error",
 * "Character count: 0 of 160"), so an app in another language writes them once. Each
 * component uses its English default, then the words of the providers above it (the nearest
 * first, per word), then its own `labels` prop, which always wins.
 *
 * It ships no translations: the words are the app's. Some are functions, which a server
 * component can't pass to a client one, so render it from a client file of the app's.
 *
 * ```tsx
 * 'use client';
 * const words: WindmorphLabels = {
 *   TextField: { error: 'Fehler', characterCount: (count, max) => `Zeichen: ${count} von ${max}` },
 *   DialogHeader: { close: 'Schließen' },
 * };
 * export const AppLabels = ({ children }: { children: ReactNode }) => (
 *   <LabelsProvider labels={words}>{children}</LabelsProvider>
 * );
 * ```
 */
export function LabelsProvider({ labels, children }: LabelsProviderProps) {
  const outer = useContext(LabelsContext);
  const merged = useMemo(() => mergeLabels(outer, labels), [outer, labels]);
  return <LabelsContext value={merged}>{children}</LabelsContext>;
}
