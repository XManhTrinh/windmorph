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
  if (!input) return;
  input.focus = (options?: FocusOptions) => {
    HTMLElement.prototype.focus.call(input, { preventScroll: true, ...options });
  };
}
