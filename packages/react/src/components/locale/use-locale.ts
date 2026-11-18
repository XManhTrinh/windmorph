'use client';

import { useMemo } from 'react';
import { useLocale as useAriaLocale } from 'react-aria';
import { usePageLocale } from '../../primitives/use-page-locale';

/** The locale the components at one place in the page use. */
export interface LocaleContextValue {
  /**
   * The locale, as a BCP 47 language tag (`'en-US'`): the page's, also in a toolbar, list or
   * other region laid out the other way, where React Aria is given it in another script for its
   * arrow keys.
   */
  locale: string;
  /**
   * The direction the components here follow: the locale's, or that of a region laid out the
   * other way (a list in `dir="rtl"` on a left-to-right page).
   */
  direction: 'ltr' | 'rtl';
}

/**
 * The locale the components here use: the nearest {@link LocaleProvider}'s, or the browser's
 * language without one (`en-US` on the server). For an app's own formatting, so its dates
 * and numbers match the fields beside them:
 * `new Intl.DateTimeFormat(useLocale().locale).format(date)`.
 */
export function useLocale(): LocaleContextValue {
  const { direction } = useAriaLocale();
  const locale = usePageLocale();
  return useMemo(() => ({ locale, direction }), [locale, direction]);
}
