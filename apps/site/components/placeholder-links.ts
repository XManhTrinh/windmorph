'use client';

import { useEffect } from 'react';

/**
 * The examples' stand-in links: a profile, a policy, a person mentioned. They point at
 * `#demo-…` fragments (so the copied code reads as a link) that no page has.
 */
export const PLACEHOLDER_LINKS = 'a[href^="#demo-"]';

/**
 * Keeps the examples' stand-in links ({@link PLACEHOLDER_LINKS}) from navigating: a press
 * stays a press (its focus, its ripple, the example's own handler) but leaves the URL alone,
 * instead of adding a fragment that goes nowhere. It listens while capturing, so the default
 * is already prevented when a router link's handler checks it.
 */
export function usePlaceholderLinks() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(PLACEHOLDER_LINKS)) {
        event.preventDefault();
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
}
