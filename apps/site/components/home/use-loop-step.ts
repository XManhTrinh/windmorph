'use client';

import { useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

const subscribeNever = () => () => {};

/** How long a scripted press holds, so the component's press animation shows. */
const PRESS_HOLD_MS = 160;

/**
 * A step counter for the home page's looping showcases. It advances every `stepMs` while the
 * element behind `ref` is on screen, and pauses off screen so the loop costs nothing there.
 * When the visitor prefers reduced motion it never advances and `still` is true. `still` is
 * false on the server and during hydration, so the server's HTML and the first client render
 * always match.
 */
export function useLoopStep(stepMs: number) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const hydrated = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  const [step, setStep] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (reduceMotion || !element) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      timer = entry?.isIntersecting
        ? window.setInterval(() => setStep((current) => current + 1), stepMs)
        : undefined;
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [reduceMotion, stepMs]);

  return { ref, step, still: hydrated && reduceMotion };
}

/** Pointer events at the centre of `element`, as a mouse press there would send. */
function pointer(type: string, element: Element, pointerId: number) {
  const rect = element.getBoundingClientRect();
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    pointerId,
    pointerType: 'mouse',
    isPrimary: pointerId === 1,
    button: 0,
    buttons: type === 'pointerdown' ? 1 : 0,
    // A real press has a size and pressure; React Aria treats a press without them as one
    // from a screen reader, which skips the press styles.
    width: 1,
    height: 1,
    pressure: type === 'pointerdown' ? 0.5 : 0,
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
  });
}

/**
 * Plays each move of a looping showcase as real presses: when `step` advances, the elements
 * that `targets(step)` selects inside `ref` are pressed together, so each component runs its
 * own press animation, and the returned step (the one to render) follows when the presses
 * release, as if someone had tapped them. Nothing is pressed while `still`.
 */
export function usePressedStep(
  ref: RefObject<HTMLElement | null>,
  step: number,
  targets: (step: number) => string,
) {
  const [shown, setShown] = useState(step);

  useEffect(() => {
    const root = ref.current;
    if (!root || step === 0) return;
    const elements = [...root.querySelectorAll(targets(step))];
    elements.forEach((element, index) =>
      element.dispatchEvent(pointer('pointerdown', element, index + 1)),
    );
    const release = (type: 'pointerup' | 'pointercancel') =>
      elements.forEach((element, index) =>
        element.dispatchEvent(pointer(type, element, index + 1)),
      );
    let released = false;
    const timer = window.setTimeout(() => {
      released = true;
      release('pointerup');
      setShown(step);
    }, PRESS_HOLD_MS);
    return () => {
      window.clearTimeout(timer);
      if (!released) release('pointercancel');
    };
  }, [ref, step, targets]);

  return shown;
}
