'use client';

import { useEffect, useRef, useState, type TransitionEvent } from 'react';

/**
 * Upper bound for an exit transition, in case `transitionend` never fires. Presence normally
 * ends on that event; this only has to outlast the longest exit the motion tokens can build
 * (checked in `use-presence.test.tsx`), so it never cuts a fade short.
 */
export const EXIT_FALLBACK_MS = 800;

/** Resolves once the CSS transitions still running in `element` or its content have ended. */
function transitionsEnded(element: Element): Promise<unknown> | undefined {
  const running = element
    .getAnimations?.({ subtree: true })
    .filter((animation) => 'transitionProperty' in animation && animation.playState === 'running');
  return running?.length
    ? Promise.all(running.map((animation) => animation.finished.catch(() => undefined)))
    : undefined;
}

/**
 * Keeps an overlay mounted while it animates out. `isPresent` turns true as soon as
 * `isOpen` does and stays true until the exit transition ends (or a fallback timeout).
 * Spread `exitProps` on the element whose transition of `property` (default `opacity`)
 * marks the end; with several properties, the first of them to end does, so an exit that
 * slides normally and fades under reduced motion passes both. With `animated` false there is
 * no exit motion to wait for, so `isPresent` follows `isOpen` at once.
 *
 * A transition still running in the element or its content when that property ends (a
 * reveal's `clip-path` that outlasts the fade) is waited for too, within the fallback:
 * removed mid-transition, an element never sends its `transitionend`, and React Aria, which
 * tracks running transitions until they end, would keep it in memory.
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
  const waiting = useRef<object | undefined>(undefined);

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => setPresent(false), EXIT_FALLBACK_MS);
    return () => {
      clearTimeout(timer);
      waiting.current = undefined;
    };
  }, [isExiting]);

  const exitProps = {
    onTransitionEnd: (event: TransitionEvent<HTMLElement>) => {
      const ends = typeof property === 'string' ? [property] : property;
      if (
        !isExiting ||
        event.target !== event.currentTarget ||
        !ends.includes(event.propertyName)
      ) {
        return;
      }
      const rest = transitionsEnded(event.currentTarget);
      if (!rest) {
        setPresent(false);
        return;
      }
      const token = {};
      waiting.current = token;
      void rest.then(() => {
        if (waiting.current === token) setPresent(false);
      });
    },
  };

  return { isPresent, isExiting, exitProps };
}
