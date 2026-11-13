const TABBABLE = [
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
function isTabbable(el: HTMLElement, within?: Element): boolean {
  if (el.tabIndex < 0 || el.matches(':disabled') || !isRendered(el)) return false;
  const off = el.closest('[inert], [hidden]');
  return off === null || (within !== undefined && !(within !== off && within.contains(off)));
}

/**
 * Whether `root` holds anything Tab would reach (see {@link tabbables}), for callers that ask on
 * every change to a large subtree: it walks to the first one and stops there. What is around
 * `root` isn't counted: a modal overlay makes the rest of the page `inert` while it is open,
 * which says nothing about what `root` holds.
 */
export function hasTabbable(root: Element): boolean {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const el = node as HTMLElement;
    if (el.matches(TABBABLE) && isTabbable(el, root)) return true;
  }
  return false;
}

/** The first of {@link tabbables}, or null when there's none. */
export function firstTabbable(
  root: Element,
  skip?: (el: HTMLElement) => boolean,
): HTMLElement | null {
  return tabbables(root, skip)[0] ?? null;
}

/**
 * Moves initial focus from a dialog's panel to its first interactive element (M3: "focus
 * should automatically land on the first interactive element"). React Aria's `useDialog`
 * focuses the panel itself unless something inside took focus (`autoFocus`), so this only
 * acts while the panel holds focus. A scrolling region marked `data-scrollable` is
 * focusable for the keyboard but isn't a control, so it's skipped. `pick` can hand focus to
 * another element in place of that first one (a dialog's least destructive action).
 */
export function focusFirstInteractive(
  panel: HTMLElement | null,
  pick: (first: HTMLElement) => HTMLElement = (first) => first,
) {
  if (!panel || panel.ownerDocument.activeElement !== panel) return;
  const first = firstTabbable(panel, (el) => el.hasAttribute('data-scrollable'));
  if (first) pick(first).focus();
}
