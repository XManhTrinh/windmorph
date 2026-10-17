import { DRAG_SLOP } from './sheet-gesture';

/** What a touch on a modal side sheet does once it moves. */
export type SwipeGesture = 'undecided' | 'drag' | 'scroll' | 'ignore';

/**
 * Decides what a touch on a modal side sheet does, from how far it has moved (`dx`, `dy`,
 * px; `dx` positive rightwards), the sheet's `edge` and the layout `direction`. Until it
 * moves past {@link DRAG_SLOP} it is undecided; then a move more vertical than sideways is
 * the browser's (`scroll`: the content scrolls natively), a sideways move toward the sheet's
 * edge drags the sheet, and one away from it is ignored. The end edge is the right in LTR
 * and the left in RTL. Callers keep the first decision until the pointer lifts.
 */
export function sideSwipeGesture(
  dx: number,
  dy: number,
  edge: 'start' | 'end',
  direction: 'ltr' | 'rtl',
): SwipeGesture {
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= DRAG_SLOP) return 'undecided';
  if (Math.abs(dy) > Math.abs(dx)) return 'scroll';
  return Math.sign(dx) === edgeSign(edge, direction) ? 'drag' : 'ignore';
}

/** The physical sign (+1 right, -1 left) of the way toward a side sheet's `edge`. */
export function edgeSign(edge: 'start' | 'end', direction: 'ltr' | 'rtl'): 1 | -1 {
  return (edge === 'end') === (direction === 'ltr') ? 1 : -1;
}
