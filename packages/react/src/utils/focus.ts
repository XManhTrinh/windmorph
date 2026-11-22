/** What can take focus with Tab, before {@link isTabbable} looks at each one. */
export const TABBABLE = [
  'a[href]',
  'area[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'iframe',
  'summary',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

/**
 * Whether an element is rendered: not under `display: none` (a responsive `hidden` class,
 * say) or `content-visibility: hidden`. Environments without `checkVisibility` (jsdom)
 * count every element as rendered.
 */
function isRendered(el: HTMLElement): boolean {
  return !('checkVisibility' in el) || el.checkVisibility();
}

/**
 * The elements inside `root` that Tab would reach, in document order: focusable, not
 * disabled, not `tabindex="-1"`, not in an `inert` or `hidden` subtree, and rendered. `skip`
 * leaves out elements the caller doesn't want. (React Aria's tree walker isn't part of its
 * public API.)
 */
export function tabbables(root: Element, skip?: (el: HTMLElement) => boolean): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) => isTabbable(el) && !skip?.(el),
  );
}

/**
 * Whether Tab would reach `el`, one of the `TABBABLE` candidates. With `within`, only an
 * `inert` or `hidden` part inside that element counts, not one around it.
 */
export function isTabbable(el: HTMLElement, within?: Element): boolean {
  if (el.tabIndex < 0 || el.matches(':disabled') || !isRendered(el)) return false;
  const off = el.closest('[inert], [hidden]');
  return off === null || (within !== undefined && !(within !== off && within.contains(off)));
}

/** The first of {@link tabbables}, or null when there's none. */
export function firstTabbable(
  root: Element,
  skip?: (el: HTMLElement) => boolean,
): HTMLElement | null {
  return tabbables(root, skip)[0] ?? null;
}
