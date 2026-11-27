'use client';

import { useEffect, useRef, useState, type TransitionEvent } from 'react';

/**
 * Upper bound for an exit transition, in case `transitionend` never fires. Presence normally
 * ends on that event; this only has to outlast the longest exit the motion tokens can build
 * (checked in `use-presence.test.tsx`), so it never cuts a fade short.
 */
export const EXIT_FALLBACK_MS = 800;

/** The CSS transitions (not animations) of `element` and its content that haven't finished. */
function runningTransitions(element: Element): CSSTransition[] {
  if (typeof element.getAnimations !== 'function') return [];
  return element
    .getAnimations({ subtree: true })
    .filter(
      (animation): animation is CSSTransition =>
        'transitionProperty' in animation && animation.playState !== 'finished',
    );
}

/**
 * Cancels `transitions` and calls `done` once each has sent its `transitioncancel` (they go
 * out a frame or two later) up to `element`. Returns a function that stops waiting.
 */
function cancelTransitions(element: Element, transitions: CSSTransition[], done: () => void) {
  const pending = new Set(transitions);
  const onCancel = (event: Event) => {
    for (const transition of pending) {
      const target = (transition.effect as KeyframeEffect | null)?.target;
      if (
        target === event.target &&
        transition.transitionProperty === (event as globalThis.TransitionEvent).propertyName
      ) {
        pending.delete(transition);
      }
    }
    if (pending.size > 0) return;
    stop();
    done();
  };
  const stop = () => element.removeEventListener('transitioncancel', onCancel);
  element.addEventListener('transitioncancel', onCancel);
  for (const transition of transitions) transition.cancel();
  return stop;
}

/**
 * Keeps an overlay mounted while it animates out. `isPresent` turns true as soon as
 * `isOpen` does and stays true until the exit transition ends (or a fallback timeout).
 * Spread `exitProps` on the element whose transition of `property` (default `opacity`)
 * marks the end; with several properties, the first of them to end does, so an exit that
 * slides normally and fades under reduced motion passes both. With `animated` false there is
 * no exit motion to wait for, so `isPresent` follows `isOpen` at once.
 *
 * A transition still running in the element or its content when the exit ends (a reveal's
 * `clip-path` that outlasts the fade) is cancelled, and the element leaves once its
 * `transitioncancel` has been sent (a frame or two later; the fallback still bounds it):
 * removed mid-transition, an element never sends one, and React Aria, which tracks running
 * transitions until they end, would keep it in memory.
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
  const stopWaiting = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!isExiting) return;
    const timer = setTimeout(() => setPresent(false), EXIT_FALLBACK_MS);
    return () => {
      clearTimeout(timer);
      stopWaiting.current?.();
      stopWaiting.current = undefined;
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
      const rest = runningTransitions(event.currentTarget);
      if (rest.length === 0) {
        setPresent(false);
        return;
      }
      stopWaiting.current?.();
      stopWaiting.current = cancelTransitions(event.currentTarget, rest, () => {
        stopWaiting.current = undefined;
        setPresent(false);
      });
    },
  };

  return { isPresent, isExiting, exitProps };
}
