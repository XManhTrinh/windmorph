import { expect, type Locator } from '@playwright/test';

/** The corner radius a morph starts from, and the smallest and largest it passes through. */
export interface MorphCurve {
  from: number;
  to: number;
  min: number;
  max: number;
}

/**
 * Probes the next corner-radius transition on `element` as it starts: paused, read at 100
 * points along its whole timeline and resumed where it was, so the spring's full curve is
 * seen however few frames a loaded machine renders. Call it before the press, release or
 * hover that starts the morph (`phase`: whether the element must be pressed when it starts,
 * or `any`); the returned function waits for the morph and gives its curve. `corner` is
 * the corner read, top left by default.
 */
export async function probeNextMorph(
  element: Locator,
  phase: 'press' | 'release' | 'any' = 'press',
  corner = 'border-top-left-radius',
): Promise<() => Promise<MorphCurve>> {
  await element.evaluate(
    (el: HTMLElement, { pressed, property }) => {
      const store = window as unknown as { morph?: MorphCurve };
      delete store.morph;
      const onRun = (event: TransitionEvent) => {
        // The phase's own morph: a transition can also restart before it (the previous one's,
        // when its duration changes back), and that one isn't probed.
        if (
          event.target !== el ||
          event.propertyName !== property ||
          (pressed !== null && el.hasAttribute('data-pressed') !== pressed)
        ) {
          return;
        }
        el.removeEventListener('transitionrun', onRun);
        const transition = el
          .getAnimations()
          .find((animation) => (animation as CSSTransition).transitionProperty === property)!;
        const resumeAt = transition.currentTime ?? 0;
        transition.pause();
        const end = Number(transition.effect!.getComputedTiming().endTime);
        const radii = Array.from({ length: 101 }, (_, step) => {
          transition.currentTime = (end * step) / 100;
          return parseFloat(getComputedStyle(el).getPropertyValue(property));
        });
        transition.currentTime = resumeAt;
        transition.play();
        store.morph = {
          from: radii[0]!,
          to: radii[100]!,
          min: Math.min(...radii),
          max: Math.max(...radii),
        };
      };
      el.addEventListener('transitionrun', onRun);
    },
    { pressed: phase === 'any' ? null : phase === 'press', property: corner },
  );
  return async () => {
    const read = () =>
      element.evaluate(() => (window as unknown as { morph?: MorphCurve }).morph ?? null);
    await expect.poll(read).not.toBeNull();
    return (await read())!;
  };
}

/** Whether a morph passed beyond either end: the spring overshot. */
export function overshoots({ from, to, min, max }: MorphCurve, tolerance = 0.25): boolean {
  return min < Math.min(from, to) - tolerance || max > Math.max(from, to) + tolerance;
}
