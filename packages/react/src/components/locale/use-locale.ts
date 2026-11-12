'use client';

import { useLocale as useAriaLocale } from 'react-aria';

/** The locale the components at one place in the page use. */
export interface LocaleContextValue {
  /** The locale, as a BCP 47 language tag (`'en-US'`). */
  locale: string;
  /** The direction the locale's text runs. */
  direction: 'ltr' | 'rtl';
}

/**
 * The locale the components here use: the nearest {@link LocaleProvider}'s, or the browser's
 * language without one (`en-US` on the server). For an app's own formatting, so its dates
 * and numbers match the fields beside them:
 * `new Intl.DateTimeFormat(useLocale().locale).format(date)`.
 */
export function useLocale(): LocaleContextValue {
  return useAriaLocale();
}
