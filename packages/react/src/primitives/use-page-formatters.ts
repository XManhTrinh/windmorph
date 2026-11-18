'use client';

import { DateFormatter } from '@internationalized/date';
import { usePageLocale } from './use-page-locale';

// Formatters by locale and options, as React Aria keeps its own: an object written in place on
// each render gets the same formatter, and the sets of options are few.
const dateFormatters = new Map<string, DateFormatter>();
const numberFormatters = new Map<string, Intl.NumberFormat>();

/** React Aria's `useDateFormatter`, in the page's locale. */
export function usePageDateFormatter(options: Intl.DateTimeFormatOptions): DateFormatter {
  const locale = usePageLocale();
  const key = `${locale} ${JSON.stringify(options)}`;
  let formatter = dateFormatters.get(key);
  if (!formatter) {
    formatter = new DateFormatter(locale, options);
    dateFormatters.set(key, formatter);
  }
  return formatter;
}

/** React Aria's `useNumberFormatter`, in the page's locale. */
export function usePageNumberFormatter(options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
  const locale = usePageLocale();
  const key = `${locale} ${JSON.stringify(options)}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    numberFormatters.set(key, formatter);
  }
  return formatter;
}
