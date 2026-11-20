'use client';

import { createContext, useContext } from 'react';
import { useLocale } from 'react-aria';

/** The page's locale and direction around a region, and the tag the region gives React Aria. */
export interface PageLocale {
  locale: string;
  direction: 'ltr' | 'rtl';
  directed: string;
}

/** Set by `DirectionLocale`, whose tag for React Aria formats as its language's default. */
export const PageLocaleContext = createContext<PageLocale | null>(null);

/** The page's locale and direction here: React Aria's, unless it is a region's directed tag. */
export function usePageLocaleInfo(): { locale: string; direction: 'ltr' | 'rtl' } {
  const aria = useLocale();
  const page = useContext(PageLocaleContext);
  return page && page.directed === aria.locale ? page : aria;
}

/** The page's locale, for the components' own dates, times and numbers in any region. */
export function usePageLocale(): string {
  return usePageLocaleInfo().locale;
}
