/** How far a pointer moves before a press becomes a drag. */
export const DRAG_SLOP = 4;

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
