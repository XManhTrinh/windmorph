/**
 * Springs that start with a velocity, for a transition that continues a gesture. Kept out of
 * `motion.ts`, which nearly every component imports, since only the bottom sheet's drag
 * release needs them (2026-10-17).
 */
import type { SpringToken } from './motion';

/**
 * `springSettleDuration`'s threshold (`motion.ts`), repeated here so this module doesn't widen
 * the public tokens; the tokens test checks a resting spring settles at the same time.
 */
const SETTLE_THRESHOLD = 0.001;

/**
 * Progress (0 → 1) at time `t` seconds of a spring that starts with a velocity, as Compose's
 * `animateTo(target, initialVelocity)` runs one: `velocity` is in distances per second, where
 * the distance is the whole way to the target (positive towards it).
 */
export function springProgressWithVelocity(
  { dampingRatio: z, stiffness: k }: SpringToken,
  velocity: number,
  t: number,
): number {
  const w0 = Math.sqrt(k);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    const b = (z * w0 - velocity) / wd;
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + b * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + (w0 - velocity) * t);
}

/**
 * A spring that starts with a velocity (see {@link springProgressWithVelocity}) as a CSS
 * `linear()` easing and its settle duration in ms, for a transition that continues a gesture
 * (a released sheet keeps its speed rather than starting from rest).
 */
export function springWithVelocityToLinearEasing(
  token: SpringToken,
  velocity: number,
  samples = 60,
): { easing: string; duration: number } {
  const progress = (t: number) => springProgressWithVelocity(token, velocity, t);
  let lastUnsettled = 0;
  for (let t = 0; t < 5; t += 0.001) {
    if (Math.abs(1 - progress(t)) > SETTLE_THRESHOLD) lastUnsettled = t;
  }
  const duration = Math.max(10, Math.ceil((lastUnsettled * 1000) / 10) * 10);
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const value = i === samples ? 1 : progress((duration / 1000) * (i / samples));
    points.push(String(Math.round(value * 10000) / 10000));
  }
  return { easing: `linear(${points.join(', ')})`, duration };
}
