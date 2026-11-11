'use client';

import { useContext } from 'react';
import { defined, LabelsContext } from './LabelsProvider';
import type { WindmorphLabels } from '../../windmorph-labels';

/** A component's key in {@link WindmorphLabels}. */
export type LabelsKey = keyof WindmorphLabels;

/** The words a key takes: the component's `Partial<…Labels>`. */
export type LabelsOf<Key extends LabelsKey> = NonNullable<WindmorphLabels[Key]>;

/**
 * A component's words: its defaults, then the words a `LabelsProvider` above gives its key,
 * then its own `labels` prop. A word left `undefined` keeps the one below it.
 *
 * `key` is the component's key in `WindmorphLabels`. A component built from another passes
 * that one's key before its own (`['DatePicker', 'DateField']`) and reads its words too.
 * `defaults` may leave out a word whose default is worked out later (a format hint); the
 * result then has it only when a provider or the prop gave it.
 *
 * For a component of your own, add its key to `WindmorphLabels` by declaration merging:
 *
 * ```tsx
 * declare module '@windmorph/react' {
 *   interface WindmorphLabels {
 *     Rating?: Partial<RatingLabels>;
 *   }
 * }
 * const labels = useLabels('Rating', DEFAULT_LABELS, props.labels);
 * ```
 */
export function useLabels<Key extends LabelsKey, Defaults extends Partial<LabelsOf<Key>>>(
  key: Key | readonly [...LabelsKey[], Key],
  defaults: Defaults,
  own: WindmorphLabels[Key],
): Defaults & LabelsOf<Key> {
  const provided = useContext(LabelsContext);
  const words: Record<string, unknown> = { ...defaults };
  if (provided) {
    for (const each of typeof key === 'string' ? [key] : key) {
      Object.assign(words, defined(provided[each]));
    }
  }
  return Object.assign(words, defined(own)) as Defaults & LabelsOf<Key>;
}
