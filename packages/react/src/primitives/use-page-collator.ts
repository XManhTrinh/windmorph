'use client';

import { usePageLocale } from './use-page-locale';

// Collators by locale and options, as React Aria keeps its own.
const collators = new Map<string, Intl.Collator>();

/**
 * How typeahead compares: by letters, ignoring case and accents where the language does, as
 * React Aria's default list delegate. With {@link usePageCollator} it matches in the page's
 * language (č is not c in Serbian) even in a region laid out the other way.
 */
export const TYPEAHEAD_COLLATION: Intl.CollatorOptions = { usage: 'search', sensitivity: 'base' };

/** React Aria's `useCollator`, in the page's locale: typeahead matches as the page's language. */
export function usePageCollator(options: Intl.CollatorOptions = {}): Intl.Collator {
  const locale = usePageLocale();
  const key = `${locale} ${JSON.stringify(options)}`;
  let collator = collators.get(key);
  if (!collator) {
    collator = new Intl.Collator(locale, options);
    collators.set(key, collator);
  }
  return collator;
}
