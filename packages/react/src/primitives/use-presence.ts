'use client';

import { useEffect, useState, type TransitionEvent } from 'react';

/**
 * Upper bound for an exit transition, in case `transitionend` never fires. Presence normally
 * ends on that event; this only has to outlast the longest exit the motion tokens can build
 * (checked in `use-presence.test.tsx`), so it never cuts a fade short.
 */
export const EXIT_FALLBACK_MS = 800;

/**
 * Keeps an overlay mounted while it animates out. `isPresent` turns true as soon as
 * `isOpen` does and stays true until the exit transition ends (or a fallback timeout).
 * Spread `exitProps` on the element whose transition of `property` (default `opacity`)
 * marks the end; with several properties, the first of them to end does, so an exit that
 * slides normally and fades under reduced motion passes both. With `animated` false there is
 * no exit motion to wait for, so `isPresent` follows `isOpen` at once.
 */
export function usePresence(
  isOpen: boolean,
  property: string | readonly string[] = 'opacity',
  animated = true,
) {
  const [isPresent, setPresent] = useState(isOpen);
  const [wasOpen, setWasOpen] = useState(isOpen);
  // Adjust state while rendering when `isOpen` changes (no effect, no extra paint).
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setPresent(true);
  }
  if (!animated && isPresent !== isOpen) setPresent(isOpen);
  const isExiting = animated && isPresent && !isOpen;

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => setPresent(false), EXIT_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [isExiting]);

  const exitProps = {
    onTransitionEnd: (event: TransitionEvent<HTMLElement>) => {
      const ends = typeof property === 'string' ? [property] : property;
      if (isExiting && event.target === event.currentTarget && ends.includes(event.propertyName)) {
        setPresent(false);
      }
    },
  };

  return { isPresent, isExiting, exitProps };
}
