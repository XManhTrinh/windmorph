'use client';

import { useCallback, useState, type ReactNode, type RefCallback } from 'react';
import { I18nProvider, useLocale } from 'react-aria';

export interface DomDirectionLocaleProps {
  /**
   * Renders the content. Attach the ref to the element whose laid-out direction should
   * drive React Aria (usually the component's root).
   */
  children: (directionRef: RefCallback<HTMLElement>) => ReactNode;
}

/**
 * The locale with the given direction, keeping its language and region so dates and
 * numbers still format the same: only the script changes (`en-US` → `en-Arab-US` for RTL,
 * `ar` → `ar-Latn` for LTR), which React Aria's `isRTL` reads.
 */
export function localeWithDirection(locale: string, direction: 'ltr' | 'rtl'): string {
  try {
    return new Intl.Locale(locale, { script: direction === 'rtl' ? 'Arab' : 'Latn' }).toString();
  } catch {
    return direction === 'rtl' ? 'ar' : 'en-US';
  }
}

/**
 * React Aria takes keyboard direction (arrow keys, `start` / `end`) from its locale, not
 * the DOM `dir`, so a component inside an RTL region without an `I18nProvider` would move
 * the wrong way. This reads the element's computed direction and, when it differs from
 * the locale's, provides the same locale with the matching direction to its content.
 */
export function DomDirectionLocale({ children }: DomDirectionLocaleProps) {
  const { locale, direction: localeDirection } = useLocale();
  const [direction, setDirection] = useState(localeDirection);
  const directionRef = useCallback<RefCallback<HTMLElement>>((element) => {
    if (element) setDirection(getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr');
  }, []);
  const effectiveLocale =
    direction === localeDirection ? locale : localeWithDirection(locale, direction);
  return <I18nProvider locale={effectiveLocale}>{children(directionRef)}</I18nProvider>;
}
