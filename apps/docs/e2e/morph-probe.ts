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
 * seen however few frames a loaded machine renders. Call it before the press or release that
 * starts the morph (`phase`: whether the element is pressed when it starts); the returned
 * function waits for the morph and gives its curve.
 */
export async function probeNextMorph(
  element: Locator,
  phase: 'press' | 'release' = 'press',
): Promise<() => Promise<MorphCurve>> {
  await element.evaluate((el: HTMLElement, pressed) => {
    const store = window as unknown as { morph?: MorphCurve };
    delete store.morph;
    const onRun = (event: TransitionEvent) => {
      // The phase's own morph: a transition can also restart before it (the previous one's,
      // when its duration changes back), and that one isn't probed.
      if (
        event.target !== el ||
        event.propertyName !== 'border-top-left-radius' ||
        el.hasAttribute('data-pressed') !== pressed
      ) {
        return;
      }
      el.removeEventListener('transitionrun', onRun);
      const transition = el
        .getAnimations()
        .find(
          (animation) =>
            (animation as CSSTransition).transitionProperty === 'border-top-left-radius',
        )!;
      const resumeAt = transition.currentTime ?? 0;
      transition.pause();
      const end = Number(transition.effect!.getComputedTiming().endTime);
      const radii = Array.from({ length: 101 }, (_, step) => {
        transition.currentTime = (end * step) / 100;
        return parseFloat(getComputedStyle(el).borderTopLeftRadius);
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
  }, phase === 'press');
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
