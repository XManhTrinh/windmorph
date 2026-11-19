'use client';

import { useCallback, useMemo, useState, type ReactNode, type RefCallback } from 'react';
import { I18nProvider, useLocale } from 'react-aria';
import { localeWithDirection } from './locale-with-direction';
import { PageLocaleContext, usePageLocaleInfo } from './use-page-locale';

export interface DomDirectionLocaleProps {
  /**
   * Renders the content. Attach the ref to the element whose laid-out direction should
   * drive React Aria (usually the component's root).
   */
  children: (directionRef: RefCallback<HTMLElement>) => ReactNode;
}

/**
 * Gives React Aria the page's locale with `direction`, and keeps the page's for the components'
 * own formatting (`usePageLocale`). Internal: Tabs, menus and {@link DomDirectionLocale}.
 */
export function DirectionLocale({
  direction,
  children,
}: {
  direction: 'ltr' | 'rtl';
  children: ReactNode;
}) {
  const page = usePageLocaleInfo();
  const directed =
    direction === page.direction ? page.locale : localeWithDirection(page.locale, direction);
  const value = useMemo(
    () => ({ locale: page.locale, direction: page.direction, directed }),
    [page.locale, page.direction, directed],
  );
  return (
    <PageLocaleContext.Provider value={value}>
      <I18nProvider locale={directed}>{children}</I18nProvider>
    </PageLocaleContext.Provider>
  );
}

/**
 * React Aria takes keyboard direction (arrow keys, `start` / `end`) from its locale, not
 * the DOM `dir`, so a component inside an RTL region without an `I18nProvider` would move
 * the wrong way. This reads the element's computed direction and, when it differs from
 * the page locale's, gives React Aria the same locale with the matching direction
 * ({@link localeWithDirection}). The components' own dates, times and numbers inside (the
 * date and time fields' text, a slider's value, `AnimatedNumber`, the date in a calendar
 * day's name, and `useLocale` for an app's) keep the page's locale; React Aria's own words and
 * formats there (the wording around a day's date, the grid's month name) follow the directed one.
 */
export function DomDirectionLocale({ children }: DomDirectionLocaleProps) {
  const { direction: localeDirection } = useLocale();
  const [direction, setDirection] = useState(localeDirection);
  const directionRef = useCallback<RefCallback<HTMLElement>>((element) => {
    if (element) setDirection(getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr');
  }, []);
  return <DirectionLocale direction={direction}>{children(directionRef)}</DirectionLocale>;
}
