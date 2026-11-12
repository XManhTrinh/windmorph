'use client';

import { createContext, useContext, useMemo } from 'react';
import type { WindmorphLabels } from '../../windmorph-labels';

/** A component's key in {@link WindmorphLabels}. */
export type LabelsKey = keyof WindmorphLabels;

/** The words a key takes: the component's `Partial<…Labels>`. */
export type LabelsOf<Key extends LabelsKey> = NonNullable<WindmorphLabels[Key]>;

/** The words of the providers above, already merged; `null` with no provider. */
export const LabelsContext = createContext<WindmorphLabels | null>(null);

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
 * A component's words: its defaults, then the words a `LabelsProvider` above gives `key` (its
 * key in `WindmorphLabels`; one built from another passes that one's key first), then its own
 * `labels`. A word left `undefined` keeps the one below it. The result is the same object
 * until one of the three changes. A component of your own adds its key to `WindmorphLabels` by
 * declaration merging.
 */
export function useLabels<Key extends LabelsKey, Defaults extends Partial<LabelsOf<Key>>>(
  key: Key | readonly [...LabelsKey[], Key],
  defaults: Defaults,
  own: WindmorphLabels[Key],
): Defaults & LabelsOf<Key> {
  const provided = useContext(LabelsContext);
  const keys = typeof key === 'string' ? key : key.join(' ');
  return useMemo(() => {
    const words: Record<string, unknown> = { ...defaults };
    if (provided) {
      for (const each of keys.split(' ') as LabelsKey[]) {
        Object.assign(words, defined(provided[each]));
      }
    }
    return Object.assign(words, defined(own)) as Defaults & LabelsOf<Key>;
  }, [provided, keys, defaults, own]);
}
