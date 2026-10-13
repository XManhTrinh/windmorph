'use client';

import { useCallback, useState, type ReactNode, type RefCallback } from 'react';
import { I18nProvider, useLocale } from 'react-aria';
import { localeWithDirection } from './locale-with-direction';

export interface DomDirectionLocaleProps {
  /**
   * Renders the content. Attach the ref to the element whose laid-out direction should
   * drive React Aria (usually the component's root).
   */
  children: (directionRef: RefCallback<HTMLElement>) => ReactNode;
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
