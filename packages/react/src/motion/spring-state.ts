import { springPosition, type SpringToken } from '../tokens/motion';

/** Where a spring is and how fast it moves, relative to its target. */
export interface SpringState {
  /** Distance from the target (the value minus the target). */
  displacement: number;
  /** Units per second. */
  velocity: number;
}

/**
 * The state of a spring (mass 1) at `t` seconds after it started with `displacement` from its
 * target and `velocity`, from the closed-form solution for under- and critically-damped
 * springs, which every M3 spring is. A retarget restarts it from the state it has then, so it
 * keeps its speed.
 */
export function springState(
  { dampingRatio: z, stiffness: k }: SpringToken,
  displacement: number,
  velocity: number,
  t: number,
): SpringState {
  const w0 = Math.sqrt(k);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    const decay = Math.exp(-z * w0 * t);
    const a = displacement;
    const b = (velocity + z * w0 * displacement) / wd;
    const cos = Math.cos(wd * t);
    const sin = Math.sin(wd * t);
    return {
      displacement: decay * (a * cos + b * sin),
      velocity: decay * ((b * wd - z * w0 * a) * cos - (a * wd + z * w0 * b) * sin),
    };
  }
  const decay = Math.exp(-w0 * t);
  const a = displacement;
  const b = velocity + w0 * displacement;
  return {
    displacement: decay * (a + b * t),
    velocity: decay * (b - w0 * (a + b * t)),
  };
}

/** Seconds until a spring starting at rest first covers `fraction` of the way to its target. */
export function timeToReach(fraction: number, spring: SpringToken): number {
  if (fraction <= 0) return 0;
  let low = 0;
  let high = 0.05;
  while (springPosition(spring, high) < fraction) high *= 2;
  for (let step = 0; step < 50; step++) {
    const middle = (low + high) / 2;
    if (springPosition(spring, middle) < fraction) low = middle;
    else high = middle;
  }
  return high;
}
