'use client';

import { usePageLocale } from './use-page-locale';

// Formatters by locale and options, as React Aria keeps its own: an object written in place on
// each render gets the same formatter, and the sets of options are few. A module of its own, so
// a component that writes only numbers never carries the date formatter.
const formatters = new Map<string, Intl.NumberFormat>();

/** React Aria's `useNumberFormatter`, in the page's locale. */
export function usePageNumberFormatter(options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const locale = usePageLocale();
  const key = `${locale} ${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    formatters.set(key, formatter);
  }
  return formatter;
}
