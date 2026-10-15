/**
 * Whether keyboard focus (`:focus-visible`) is inside `root`. Scroll-hidden bars use it to
 * stay on screen while a keyboard user is on one of their controls, without pinning them
 * after a pointer click (which focuses a button but doesn't show its focus ring).
 */
export function hasVisibleFocusWithin(root: Element): boolean {
  const active = root.ownerDocument.activeElement;
  return active !== null && root.contains(active) && active.matches(':focus-visible');
}
