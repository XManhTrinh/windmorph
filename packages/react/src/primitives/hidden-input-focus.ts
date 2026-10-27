/**
 * Ref callback for the visually hidden native input of a checkbox, radio button or switch
 * (the controls and the list items that draw them). React Aria focuses that input with a
 * plain `focus()` when its label is pressed, and the browser then scrolls the 1px input
 * into view: when a tap lands on the visible part of a control whose centre is above the
 * window, the page jumped by hundreds of pixels to centre an invisible pixel. The input's
 * `focus()` now defaults to `preventScroll: true` (a caller can still pass
 * `{ preventScroll: false }`); Tab focus is the browser's own and still scrolls into view.
 */
export function preventHiddenInputScroll(input: HTMLInputElement | null): void {
  if (!input || Object.prototype.hasOwnProperty.call(input, 'focus')) return;
  // The element's own property, defined rather than assigned: test tooling can turn the
  // prototype's `focus` into an accessor whose setter would replace it for every element.
  // The prototype's current `focus` is looked up on each call, so wrappers installed later
  // (React Aria's, while an overlay is open) still run.
  Object.defineProperty(input, 'focus', {
    configurable: true,
    writable: true,
    value: (options?: FocusOptions) => {
      const focus = (Object.getPrototypeOf(input) as HTMLElement).focus;
      focus.call(input, { preventScroll: true, ...options });
    },
  });
}
