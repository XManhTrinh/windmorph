/** M3's minimum touch target, px. */
export const MIN_TOUCH_TARGET = 48;

/** An item's visible part along the carousel, in px from the viewport's start edge. */
export interface VisibleSpan {
  start: number;
  size: number;
}

/**
 * How far an item's press area reaches past each end of its visible part, so that an item
 * narrower than M3's 48px touch target (a small item, 40–56px) still takes 48px of presses.
 * It grows into the spacing on each side: half of it where the neighbour grows too, all of
 * it where the neighbour doesn't, so press areas never overlap; and never past the
 * viewport's edges, where it grows the other way instead. Items 48px or wider don't grow.
 */
export function pressAreaReach(
  spans: readonly VisibleSpan[],
  index: number,
  spacing: number,
  viewport: number,
): { start: number; end: number } {
  const span = spans[index];
  if (!span) return { start: 0, end: 0 };
  const need = Math.max(0, MIN_TOUCH_TARGET - span.size);
  if (need === 0) return { start: 0, end: 0 };
  const grows = (neighbour: VisibleSpan | undefined) =>
    neighbour !== undefined && neighbour.size < MIN_TOUCH_TARGET;
  const room = (neighbour: VisibleSpan | undefined) => (grows(neighbour) ? spacing / 2 : spacing);
  const startRoom = Math.max(0, Math.min(room(spans[index - 1]), span.start));
  const endRoom = Math.max(
    0,
    Math.min(room(spans[index + 1]), viewport - (span.start + span.size)),
  );
  let start = Math.min(startRoom, need / 2);
  let end = Math.min(endRoom, need / 2);
  if (start < need / 2) end = Math.min(endRoom, need - start);
  if (end < need / 2) start = Math.min(startRoom, need - end);
  return { start, end };
}
