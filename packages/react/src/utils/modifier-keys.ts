'use client';

import { useEffect } from 'react';
import { setInteractionModality } from 'react-aria';

// Keys that change what another key does, pressed alone. React Aria already leaves Control,
// Shift and Command out of keyboard use, but on a Mac it counts Option (which types a
// character with another key), so Option alone, a shortcut's start or a window switcher's,
// showed a focus ring on a control a pointer had focused (2026-11-15). Caps Lock too.
const MODIFIERS = new Set([
  'Alt',
  'AltGraph',
  'CapsLock',
  'Fn',
  'FnLock',
  'Hyper',
  'Super',
  'Symbol',
  'SymbolLock',
  'OS',
]);

// React Aria 3.53's own rules, copied rather than approximated (its main entry exports none
// of them): its platform tests, which keys it counts as keyboard use (Option only on a Mac,
// where it types a character with another key), which clicks are a screen reader's, and the
// first invalid field of a form, whose ring its form validation shows.
type UserAgentData = { platform?: string; brands?: { brand: string }[] };
const userAgentData = () =>
  (window.navigator as Navigator & { userAgentData?: UserAgentData }).userAgentData;
const isMac = () => /^Mac/i.test(userAgentData()?.platform || window.navigator.platform);
const isAndroid = () =>
  userAgentData()?.brands?.some(({ brand }) => /Android/i.test(brand)) ||
  /Android/i.test(window.navigator.userAgent);
const countedByReactAria = (event: KeyboardEvent) =>
  !(
    event.metaKey ||
    (!isMac() && event.altKey) ||
    event.ctrlKey ||
    event.key === 'Control' ||
    event.key === 'Shift' ||
    event.key === 'Meta'
  );
const isVirtualClick = (event: MouseEvent) => {
  const { pointerType } = event as PointerEvent;
  // A screen reader with Firefox.
  if (pointerType === '' && event.isTrusted) return true;
  // TalkBack.
  if (isAndroid() && pointerType) return event.type === 'click' && event.buttons === 1;
  return event.detail === 0 && !pointerType;
};
const firstInvalidField = (form: HTMLFormElement) =>
  [...form.elements].find((element) => (element as HTMLInputElement).validity?.valid === false) ??
  null;

/**
 * A modifier pressed alone: one of the keys above, or Control, Shift or Command. Neither the
 * guard nor a press's "don't move" state takes it as keyboard use.
 */
export const isModifierAlone = (event: KeyboardEvent) =>
  MODIFIERS.has(event.key) ||
  event.key === 'Control' ||
  event.key === 'Shift' ||
  event.key === 'Meta';

// One guard a window, however many copies of the library a page loads (each would wrap
// `focus` over the other's): each copy adds its React Aria's modality setter, which a page
// with copies bundled apart has one of each, and the guard sets them all.
const GUARD = Symbol.for('@windmorph/react/modifier-keys-guard');
type Setter = typeof setInteractionModality;

// Keeps a modifier pressed alone from counting as keyboard use: after a pointer press, the
// modality stays the pointer's, so no focus ring appears. React Aria sets it on both the key
// going down and coming up, in the document's capture phase; its listener runs first (it is set
// up before this one), and in case it doesn't, the pointer's modality is put back again as the
// event reaches the window.
//
// The pointer counts only while it was the last way focus moved, as React Aria decides it: a
// focus with no key, pointer or script before it, or a click with no pointer, is a screen
// reader's or a phone's form navigation (its virtual modality, which shows rings), and ends the
// pointer's turn, so a modifier alone then leaves the rings showing (2026-11-16). React Aria's
// main entry has no reader for its modality, so the guard follows the same events, with React
// Aria 3.53's rules: a script's `focus()` (a dialog focusing its first control as a press opens
// it) counts as an event before focus, as React Aria wraps `focus` to count it; an untrusted
// focus event counts for nothing; the window's own focus, or blur, marks the element focus
// that follows as a return to the window, which isn't a screen reader's either; and a form
// check that moves focus to an invalid field ends the pointer's turn, as React Aria shows that
// field's ring.
function guard(page: Document) {
  const view = page.defaultView as
    (Window & typeof globalThis & { [GUARD]?: { setters: Set<Setter> } }) | null;
  if (!view) return;
  const installed = view[GUARD];
  if (installed) {
    installed.setters.add(setInteractionModality);
    return;
  }
  const setters = new Set<Setter>([setInteractionModality]);
  view[GUARD] = { setters };
  let pointerLast = false;
  let eventBeforeFocus = false;
  let returning = false;
  // Wrapped once, as React Aria wraps it. React Aria's unload teardown (a `beforeunload` the
  // page then stays on) puts back the `focus` it found, leaving this wrapper out until the page
  // loads again: a script's focus then ends the pointer's turn, at worst a ring on a lone
  // modifier. Wrapping again safely, over whatever had wrapped `focus` since, took more than
  // that is worth (2026-11-16).
  const focus = view.HTMLElement.prototype.focus;
  // Defined, not assigned, as React Aria does: a test library may have made `focus` a getter.
  Reflect.defineProperty(view.HTMLElement.prototype, 'focus', {
    configurable: true,
    writable: true,
    value: function (this: HTMLElement, ...args: Parameters<HTMLElement['focus']>) {
      eventBeforeFocus = true;
      focus.apply(this, args);
    },
  });
  // Only a modifier React Aria took as keyboard use: Option off a Mac changes nothing there.
  const keepPointer = (event: KeyboardEvent) => {
    if (!MODIFIERS.has(event.key) || !pointerLast || !countedByReactAria(event)) return;
    for (const set of setters) set('pointer');
  };
  const onPointer = () => {
    pointerLast = true;
    eventBeforeFocus = true;
  };
  // React Aria listens to pointer events where they exist, and to the mouse's otherwise.
  page.addEventListener(
    typeof view.PointerEvent === 'undefined' ? 'mousedown' : 'pointerdown',
    onPointer,
    true,
  );
  // A key going down or up, as React Aria counts both: a Tab from the browser's address bar
  // reaches the page only as it comes up.
  const onKey = (event: KeyboardEvent) => {
    eventBeforeFocus = true;
    if (!MODIFIERS.has(event.key) && countedByReactAria(event)) pointerLast = false;
    keepPointer(event);
  };
  page.addEventListener('keydown', onKey, true);
  page.addEventListener('keyup', onKey, true);
  view.addEventListener(
    'focus',
    (event) => {
      if (event.target === view) {
        returning = true;
        return;
      }
      if (event.target === page || !event.isTrusted) return;
      if (!eventBeforeFocus && !returning) pointerLast = false;
      eventBeforeFocus = false;
      returning = false;
    },
    true,
  );
  page.addEventListener(
    'click',
    (event) => {
      if (!isVirtualClick(event)) return;
      pointerLast = false;
      eventBeforeFocus = true;
    },
    true,
  );
  view.addEventListener('blur', () => {
    eventBeforeFocus = false;
    returning = true;
  });
  // A failed form check, as React Aria takes it: its form validation shows the ring of the
  // form's first invalid field, wherever it puts focus (a Select's trigger), and its own
  // listener does when focus has moved by the microtask after the `invalid` event.
  page.addEventListener(
    'invalid',
    (event) => {
      const field = event.target as Element & { form?: HTMLFormElement | null };
      if (field.form && firstInvalidField(field.form) === field) pointerLast = false;
      const before = page.activeElement;
      queueMicrotask(() => {
        if (page.activeElement !== before) pointerLast = false;
      });
    },
    true,
  );
  view.addEventListener('keydown', keepPointer);
  view.addEventListener('keyup', keepPointer);
}

// Installs, once per document, the guard that keeps a modifier key pressed alone from showing
// focus rings. Called by `useM3Interaction` after React Aria's focus tracking is set up, so the
// whole page is covered as soon as one interactive component mounts.
export function useModifierKeysGuard(): void {
  useEffect(() => {
    guard(document);
  }, []);
}
