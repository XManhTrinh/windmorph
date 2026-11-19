'use client';

import { DateFormatter } from '@internationalized/date';
import { usePageLocale } from './use-page-locale';

// Formatters by locale and options, as React Aria keeps its own: an object written in place on
// each render gets the same formatter, and the sets of options are few.
const formatters = new Map<string, DateFormatter>();

/** React Aria's `useDateFormatter`, in the page's locale. */
export function usePageDateFormatter(options: Intl.DateTimeFormatOptions): DateFormatter {
  const locale = usePageLocale();
  const key = `${locale} ${JSON.stringify(options)}`;
  let formatter = formatters.get(key);
  if (!formatter) {
    formatter = new DateFormatter(locale, options);
    formatters.set(key, formatter);
  }
  return formatter;
}
