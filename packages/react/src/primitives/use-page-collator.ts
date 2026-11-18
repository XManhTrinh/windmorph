'use client';

import { usePageLocale } from './use-page-locale';

// Collators by locale and options, as React Aria keeps its own.
const collators = new Map<string, Intl.Collator>();

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
