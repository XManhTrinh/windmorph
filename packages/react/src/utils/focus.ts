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
    (el) =>
      el.tabIndex >= 0 &&
      !el.matches(':disabled') &&
      !el.closest('[inert], [hidden]') &&
      isRendered(el) &&
      !skip?.(el),
  );
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
