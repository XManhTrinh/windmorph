'use client';

import { useEffect, useState, type TransitionEvent } from 'react';

/** Upper bound for an exit transition, in case `transitionend` never fires. */
const EXIT_FALLBACK_MS = 800;

/**
 * Keeps an overlay mounted while it animates out. `isPresent` turns true as soon as
 * `isOpen` does and stays true until the exit transition ends (or a fallback timeout).
 * Spread `exitProps` on the element whose transition of `property` (default `opacity`)
 * marks the end.
 */
export function usePresence(isOpen: boolean, property = 'opacity') {
  const [isPresent, setPresent] = useState(isOpen);
  const [wasOpen, setWasOpen] = useState(isOpen);
  // Adjust state while rendering when `isOpen` changes (no effect, no extra paint).
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setPresent(true);
  }
  const isExiting = isPresent && !isOpen;

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => setPresent(false), EXIT_FALLBACK_MS);
    return () => clearTimeout(timer);
  }, [isExiting]);

  const exitProps = {
    onTransitionEnd: (event: TransitionEvent<HTMLElement>) => {
      if (isExiting && event.target === event.currentTarget && event.propertyName === property) {
        setPresent(false);
      }
    },
  };

  return { isPresent, isExiting, exitProps };
}
