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
