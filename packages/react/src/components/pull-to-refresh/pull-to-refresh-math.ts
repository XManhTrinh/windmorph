/*
 * The pull's arithmetic, ported from Compose Material 3's `PullToRefreshModifierNode`
 * (androidx `compose/material3/pulltorefresh/PullToRefresh.kt`). Pure functions, so they're
 * unit-tested against Compose's numbers.
 */

/** Compose's `PullToRefreshDefaults.PositionalThreshold`, px: how far the indicator travels. */
export const POSITIONAL_THRESHOLD = 80;

/** Compose's `DragMultiplier`: the indicator moves half as far as the finger. */
export const DRAG_MULTIPLIER = 0.5;

/**
 * The indicator's offset, px, for a pull of `distancePulled` px (Compose's
 * `calculateVerticalOffset`). Below the threshold it follows the finger at half speed; past it
 * the extra pull meets growing resistance, up to one more threshold at three times the pull.
 */
export function verticalOffset(distancePulled: number, threshold: number): number {
  const adjusted = Math.max(0, distancePulled) * DRAG_MULTIPLIER;
  if (adjusted <= threshold) return adjusted;
  // How far beyond the threshold the pull has gone, as a fraction of the threshold, limited
  // to 200%; the tension grows with it at a decreasing rate.
  const linearTension = Math.min(Math.max(adjusted / threshold - 1, 0), 2);
  const tension = linearTension - linearTension ** 2 / 4;
  return threshold + threshold * tension;
}

/**
 * Compose's `PullToRefreshState.distanceFraction` while pulling: the offset over the
 * threshold. 1 is the threshold; it reaches 2 at most.
 */
export function distanceFraction(distancePulled: number, threshold: number): number {
  return threshold > 0 ? verticalOffset(distancePulled, threshold) / threshold : 0;
}

/** Whether releasing a pull of `distancePulled` px refreshes (Compose's `onRelease`). */
export function passesThreshold(distancePulled: number, threshold: number): boolean {
  return distancePulled * DRAG_MULTIPLIER > threshold;
}

/**
 * The extra turn, in degrees, of the determinate indicator pulled past the threshold:
 * Compose's `PullToRefreshDefaults.LoadingIndicator` turns it back half a turn per threshold
 * of overshoot, starting at the threshold so the shape doesn't jump.
 */
export function overshootRotation(fraction: number): number {
  return fraction > 1 ? -(fraction - 1) * 180 : 0;
}
