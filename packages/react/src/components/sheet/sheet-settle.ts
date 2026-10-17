import { SPRINGS, type MotionScheme } from '../../tokens/motion';
import { springWithVelocityToLinearEasing } from '../../tokens/spring-velocity';

/** Compose's `BottomSheetDefaults.PositionalThreshold` (56dp). */
export const POSITIONAL_THRESHOLD = 56;
/** Compose's `BottomSheetDefaults.VelocityThreshold` (125dp per second). */
export const VELOCITY_THRESHOLD = 125;

/** The anchor at or beyond `position` in one direction, nearest to it. */
function closestAnchor(anchors: number[], position: number, searchUpwards: boolean) {
  let best: number | undefined;
  for (const anchor of anchors) {
    const beyond = searchUpwards ? anchor >= position : anchor <= position;
    if (beyond && (best === undefined || Math.abs(anchor - position) < Math.abs(best - position)))
      best = anchor;
  }
  return best ?? (searchUpwards ? Math.max(...anchors) : Math.min(...anchors));
}

/**
 * Where a dragged sheet settles, ported from Compose's `AnchoredDraggableState`
 * (`computeTarget`). Offsets grow away from the open position (0 = fully open; downwards for
 * a bottom sheet, toward its edge for a side sheet); `velocity` is in px per second, positive
 * the same way.
 *
 * - A fling faster than 125px/s goes to the next anchor in its direction.
 * - Otherwise the sheet moves on once it has travelled `positionalThreshold` (56px, the
 *   bottom sheet's; a side sheet passes half its width, as Compose's horizontal
 *   `ModalWideNavigationRail` does) towards the neighbouring anchor, and returns to where it
 *   started if not.
 */
export function settleTarget(
  anchors: number[],
  origin: number,
  offset: number,
  velocity: number,
  positionalThreshold: number = POSITIONAL_THRESHOLD,
): number {
  if (offset === origin) return origin;
  if (Math.abs(velocity) >= VELOCITY_THRESHOLD) {
    return closestAnchor(anchors, offset, velocity > 0);
  }
  const neighbour = closestAnchor(anchors, offset, offset > origin);
  const travelled = Math.abs(origin - offset);
  return travelled < Math.min(positionalThreshold, Math.abs(neighbour - origin))
    ? origin
    : neighbour;
}

/** A pointer position along a drag's axis, and when it was there (ms). */
export interface DragSample {
  position: number;
  time: number;
}

/** How far back a release velocity looks, ms (Compose's `VelocityTracker` horizon). */
export const VELOCITY_WINDOW = 100;

/**
 * A drag's velocity at release, px per second, from the samples of the last
 * {@link VELOCITY_WINDOW}ms before the last one (the release), so a slow drag that ends in a
 * flick reads as a fling and one that stops before lifting doesn't.
 */
export function releaseVelocity(samples: readonly DragSample[]): number {
  const last = samples.at(-1);
  if (!last) return 0;
  const first = samples.find((sample) => last.time - sample.time <= VELOCITY_WINDOW) ?? last;
  const elapsed = (last.time - first.time) / 1000;
  return elapsed > 0 ? (last.position - first.position) / elapsed : 0;
}

/**
 * How far a closing sheet travels, as a share of its size: 112%, so the fast spatial spring's
 * overshoot (under 10.5% of the distance) settles out of view (see `sheet-styles.ts`).
 */
export const EXIT_DISTANCE = 1.12;

/** A settle's spring, started at the release speed, as a `linear()` easing and a duration. */
export interface ReleaseMotion {
  easing: string;
  duration: number;
}

/**
 * The transition that settles a released sheet at the speed it was let go with, as Compose's
 * `animateTo(target, velocity)`: the fast spatial spring for an exit (`closes`), the default
 * spatial spring otherwise, started with `velocity` (px per second) over `distance` (px, the
 * way still to go, same sign convention). `null` (the sheet's own transition, instant under
 * reduced motion) when reduced motion is on or there's nowhere to go. Both sheets use it.
 */
export function releaseMotion(
  scheme: MotionScheme,
  closes: boolean,
  velocity: number,
  distance: number,
): ReleaseMotion | null {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduced || Math.abs(distance) < 0.5) return null;
  return springWithVelocityToLinearEasing(
    SPRINGS[scheme].spatial[closes ? 'fast' : 'default'],
    velocity / distance,
  );
}
