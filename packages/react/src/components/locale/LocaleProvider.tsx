'use client';

import type { ReactNode } from 'react';
import { I18nProvider } from 'react-aria';

export interface LocaleProviderProps {
  /**
   * The locale, as a BCP 47 language tag: `'en-US'`, `'de-DE'`, `'ar-EG'`. Pass the language
   * the page is written in, the same value on the server and in the browser.
   */
  locale: string;
  children?: ReactNode;
}

/**
 * Sets the locale of every component below it: how dates, times and numbers are written
 * (the order of a date, the 12- or 24-hour clock, digits, the first day of the week) and
 * the direction the arrow keys follow. A provider inside another sets it for its part of
 * the page.
 *
 * Without one the components use the browser's language (`en-US` on the server), which may
 * not be the page's: an English page in a British browser would get 24-hour time fields.
 * It sets no `lang` or `dir`: set those on the page's own elements, `dir="rtl"` included for
 * a right-to-left language. The words come from a {@link LabelsProvider}.
 *
 * ```tsx
 * <ThemeProvider>
 *   <LocaleProvider locale="en-US">{children}</LocaleProvider>
 * </ThemeProvider>
 * ```
 */
export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}
