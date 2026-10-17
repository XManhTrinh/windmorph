/** How far a pointer moves before a press becomes a drag. */
export const DRAG_SLOP = 4;

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

const EDITABLE = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';

/** A drag's axis: `x` (inline, a side sheet's swipe) or `y` (block, a bottom sheet's drag). */
export type GestureAxis = 'x' | 'y';

/**
 * Whether a computed `touch-action` keeps the browser from panning along `axis`, which means
 * the element handles drags along it itself: `none` both ways, `pan-y` (a horizontal slider,
 * a carousel's own drag) the inline axis, `pan-x` (a vertical slider) the block axis.
 */
function excludesPan(touchAction: string, axis: GestureAxis) {
  if (touchAction === '' || touchAction === 'auto' || touchAction === 'manipulation') return false;
  if (touchAction === 'none') return true;
  const values = touchAction.split(/\s+/);
  return axis === 'x'
    ? !values.some((value) => value === 'pan-x' || value === 'pan-left' || value === 'pan-right')
    : !values.some((value) => value === 'pan-y' || value === 'pan-up' || value === 'pan-down');
}

/**
 * Whether `node` scrolls along the inline axis and still can toward a finger moving by `dx`
 * (px, positive rightwards): a finger moving right reveals what lies to the left, in either
 * direction (`scrollLeft` runs 0 → positive in LTR and 0 → negative in RTL).
 */
function scrollsSideways(node: Element, dx: number) {
  const range = node.scrollWidth - node.clientWidth;
  if (range < 1) return false;
  const style = getComputedStyle(node);
  if (style.overflowX !== 'auto' && style.overflowX !== 'scroll') return false;
  const rtl = style.direction === 'rtl';
  const min = rtl ? -range : 0;
  const max = rtl ? 0 : range;
  return dx > 0 ? node.scrollLeft > min + 0.5 : node.scrollLeft < max - 0.5;
}

/**
 * Whether a touch starting on `target` is left to the content, for a drag along `axis`: on a
 * form field (text selection and caret placement), or on an element between `target` and
 * `root` that handles that axis's drags itself (its `touch-action` excludes panning along
 * it, see {@link excludesPan}). With `dx` (a decided inline move, px, positive rightwards),
 * a horizontal scroller in between that can still scroll that way owns it too, while one at
 * its end in that direction lets the sheet have it.
 */
export function ownsGesture(
  target: Element,
  root: Element,
  axis: GestureAxis = 'y',
  dx = 0,
): boolean {
  if (target.closest(EDITABLE) && root.contains(target.closest(EDITABLE))) return true;
  for (let node: Element | null = target; node && node !== root; node = node.parentElement) {
    if (excludesPan(getComputedStyle(node).touchAction, axis)) return true;
    if (axis === 'x' && dx !== 0 && scrollsSideways(node, dx)) return true;
  }
  return false;
}

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

/** Whether `root`, or any scroller between `target` and it, is scrolled away from its top. */
export function scrolledAbove(target: Element, root: Element): boolean {
  for (let node: Element | null = target; node; node = node.parentElement) {
    if (node.scrollTop > 0) return true;
    if (node === root) return false;
  }
  return false;
}
