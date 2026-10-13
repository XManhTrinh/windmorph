import { SPRINGS, type SpringToken } from '../../tokens/motion';

/*
 * Compose's FloatingActionButtonMenu animates the number of visible items as an Int on the
 * slow effects spring (identical in both motion schemes) with a visibility threshold of 1
 * item. The Int is the truncated spring value, and the spring ends (snapping to its
 * target) once it is within one item of it. Each item then animates its own width and
 * opacity. These functions give the times at which the visible count steps.
 */

const STAGGER_SPRING = SPRINGS.expressive.effects.slow;

/** Normalised step response (0 → 1, starting at rest) of a spring at `seconds`. */
export function springStep({ dampingRatio, stiffness }: SpringToken, seconds: number): number {
  const omega = Math.sqrt(stiffness);
  if (dampingRatio >= 1) {
    // Critically damped (effects springs): 1 − (1 + ωt)e^(−ωt).
    return 1 - (1 + omega * seconds) * Math.exp(-omega * seconds);
  }
  const decay = dampingRatio * omega;
  const omegaD = omega * Math.sqrt(1 - dampingRatio * dampingRatio);
  return (
    1 -
    Math.exp(-decay * seconds) *
      (Math.cos(omegaD * seconds) + (decay / omegaD) * Math.sin(omegaD * seconds))
  );
}

/** Milliseconds until the (monotonic) step response first reaches `fraction`. */
function timeToReach(fraction: number, spring: SpringToken): number {
  if (fraction <= 0) return 0;
  let lo = 0;
  let hi = 0.05;
  while (springStep(spring, hi) < fraction) hi *= 2;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (springStep(spring, mid) < fraction) lo = mid;
    else hi = mid;
  }
  return Math.round(hi * 1000);
}

export interface StaggerStep {
  /** Milliseconds after the change. */
  at: number;
  /** Visible items (counted from the button upwards) from this time on. */
  count: number;
}

/**
 * When the visible count steps while springing from `from` to `to` items, starting at rest.
 * Opening shows the item nearest the button first; closing hides the farthest first.
 */
export function staggerSteps(from: number, to: number, spring = STAGGER_SPRING): StaggerStep[] {
  const steps: StaggerStep[] = [];
  const span = Math.abs(to - from);
  if (span === 0) return steps;
  // The spring ends within one item of the target, then snaps to it.
  const end = timeToReach((span - 1) / span, spring);
  if (to > from) {
    // The truncated value reaches m when from + span·s ≥ m.
    for (let m = from + 1; m < to; m++) {
      steps.push({ at: timeToReach((m - from) / span, spring), count: m });
    }
  } else {
    // The truncated value drops below m (to m − 1) once from − span·s < m.
    for (let m = from; m > to + 1; m--) {
      steps.push({ at: timeToReach((from - m) / span, spring), count: m - 1 });
    }
  }
  steps.push({ at: end, count: to });
  return steps;
}
