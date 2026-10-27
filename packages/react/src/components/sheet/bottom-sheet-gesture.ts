import { DRAG_SLOP } from './sheet-gesture';

/** What a touch that starts on a bottom sheet's content does. */
export type ContentGesture = 'undecided' | 'drag' | 'scroll';

/**
 * Decides whether a touch on the sheet's content drags the sheet or scrolls the content,
 * from how far it has moved (`dx`, `dy`, px; `dy` positive downwards), whether the content
 * under it is scrolled, and whether the sheet can still rise (it rests below its top
 * detent). Until it moves past {@link DRAG_SLOP} it is undecided; then a mostly horizontal
 * move scrolls (horizontal scrollers, text). On content at its top, a downward move drags
 * the sheet, and so does an upward one while the sheet can rise (Compose's nested scroll
 * raises the sheet before the content scrolls; the caller hands the rest of the move to
 * the content once the sheet is up). Anything else scrolls. Callers keep the first decision
 * until the pointer lifts.
 */
export function contentGesture(
  dx: number,
  dy: number,
  scrolled: boolean,
  canRise = false,
): ContentGesture {
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= DRAG_SLOP) return 'undecided';
  if (Math.abs(dx) >= Math.abs(dy)) return 'scroll';
  if (scrolled) return 'scroll';
  return dy > 0 || canRise ? 'drag' : 'scroll';
}

/** Whether `root`, or any scroller between `target` and it, is scrolled away from its top. */
export function scrolledAbove(target: Element, root: Element): boolean {
  for (let node: Element | null = target; node; node = node.parentElement) {
    if (node.scrollTop > 0) return true;
    if (node === root) return false;
  }
  return false;
}
