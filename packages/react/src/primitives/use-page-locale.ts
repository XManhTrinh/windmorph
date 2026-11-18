'use client';

import { createContext, useContext } from 'react';
import { useLocale } from 'react-aria';

/** The page's locale and direction around a region, and the tag the region gives React Aria. */
export interface PageLocale {
  locale: string;
  direction: 'ltr' | 'rtl';
  directed: string;
}

/**
 * Set by `DirectionLocale`: React Aria reads direction only from a locale's script, and the tag a
 * region of the other direction gives it formats as its language's default (`en-Arab-GB` as `en`).
 */
export const PageLocaleContext = createContext<PageLocale | null>(null);

/**
 * The locale of the page here and its direction: React Aria's, unless it is a region's tag for
 * another direction, whose page's it is. An app's own provider inside the region wins, as its
 * locale is then React Aria's.
 */
export function usePageLocaleInfo(): { locale: string; direction: 'ltr' | 'rtl' } {
  const aria = useLocale();
  const page = useContext(PageLocaleContext);
  return page && page.directed === aria.locale ? page : aria;
}

/**
 * The page's locale, for the components' own formatting and reading of dates, times and
 * numbers, so a field in a region laid out the other way still writes and reads them as the
 * page does. React Aria's own words and formats there follow its locale.
 */
export function usePageLocale(): string {
  return usePageLocaleInfo().locale;
}
