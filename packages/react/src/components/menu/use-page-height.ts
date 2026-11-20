'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/** The height a popover's surface holds while its submenus show in place. */
export interface PageHeight {
  /** The visible page's height in px; `undefined` until measured (and on the server). */
  height: number | undefined;
  /** The height changed with the page, so the surface springs to it (`data-paging`). */
  paging: boolean;
  /** It changed with the page to a shorter one (`data-shrinking`). */
  shrinking: boolean;
}

const UNMEASURED: PageHeight = { height: undefined, paging: false, shrinking: false };

/**
 * Measures the pages of a popover whose submenus show in place (`submenuPresentation="replace"`)
 * for its surface, which holds their height: once as each page goes in (`level` changes), in the
 * same commit, so the surface springs from the old height from the first frame on; and again
 * whenever their size changes otherwise (a web font arriving, new text), which the surface follows
 * at once, as `useNaturalSize`'s `resized` does. The pages keep their natural height (capped by the
 * popover's maximum), whatever the surface's.
 */
export function usePageHeight<T extends HTMLElement>(level: number) {
  const ref = useRef<T>(null);
  const measured = useRef<number | undefined>(undefined);
  const [height, setHeight] = useState<PageHeight>(UNMEASURED);
  const measure = useCallback((paging: boolean) => {
    const element = ref.current;
    if (!element) return;
    const used = parseFloat(getComputedStyle(element).height);
    const next = Number.isNaN(used) ? undefined : used;
    const previous = measured.current;
    if (next === previous) return;
    measured.current = next;
    const springs = paging && previous !== undefined && next !== undefined;
    setHeight({ height: next, paging: springs, shrinking: springs && next < previous });
  }, []);
  useLayoutEffect(() => {
    measure(false);
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => measure(false));
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure]);
  // A new page is in the DOM by now: measured before the paint, so the surface's height and its
  // transition change together.
  const pageLevel = useRef(level);
  useLayoutEffect(() => {
    if (pageLevel.current === level) return;
    pageLevel.current = level;
    measure(true);
  }, [level, measure]);
  return [ref, height] as const;
}
