import { SPRINGS, type SpringToken } from '../tokens/motion';
import { timeToReach } from './spring-state';

export interface StaggerDelaysOptions {
  /**
   * The spring the count moves on; one damped past critical (a ratio above 1) is read as
   * critically damped. @default the slow effects spring, as the FAB menu's
   */
  spring?: SpringToken;
}

/**
 * When each of `count` items starts an entrance, in seconds: the times a spring from 0 to
 * `count` passes each item, the model of the FAB menu (Compose springs the number of visible
 * items). Any number of items arrives within one spring's time, so a long row never takes
 * seconds; the gaps shrink as the count grows.
 *
 * Under reduced motion an entrance has no movement to space out: don't apply the delays.
 *
 * @example
 * staggerDelays(6); // [0, 0.026, 0.042, 0.059, 0.081, 0.114]
 */
export function staggerDelays(count: number, { spring }: StaggerDelaysOptions = {}): number[] {
  const token = spring ?? SPRINGS.expressive.effects.slow;
  const items = Math.max(0, Math.floor(count));
  return Array.from({ length: items }, (_, index) =>
    index === 0 ? 0 : timeToReach(index / items, token),
  );
}
