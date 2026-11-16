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

// Keys React Aria never counts as keyboard use: its own rule, without the platform part.
const ignoredByReactAria = (event: KeyboardEvent) =>
  event.metaKey ||
  event.ctrlKey ||
  event.key === 'Control' ||
  event.key === 'Shift' ||
  event.key === 'Meta';

const guarded = new WeakSet<Document>();

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
  const view = page.defaultView;
  if (!view || guarded.has(page)) return;
  guarded.add(page);
  let pointerLast = false;
  let eventBeforeFocus = false;
  let returning = false;
  // The `focus` each wrap found, latest last. React Aria's unload teardown (a `beforeunload` the
  // page then stays on: a leave prompt answered "Stay", a download) puts back the `focus` it
  // found and wraps it again as components render, leaving this wrapper out, so a press wraps it
  // again. Should React Aria have wrapped this wrapper in turn, a call comes back into it: each
  // call nested in the wrapper goes one wrap further down, so every call ends at the browser's.
  const found: HTMLElement['focus'][] = [];
  let depth = 0;
  const wrapper = function (this: HTMLElement, ...args: Parameters<HTMLElement['focus']>) {
    eventBeforeFocus = true;
    const next = found[Math.max(0, found.length - 1 - depth)]!;
    depth += 1;
    try {
      next.apply(this, args);
    } finally {
      depth -= 1;
    }
  };
  const wrapFocus = () => {
    const current = view.HTMLElement.prototype.focus;
    if (current === wrapper) return;
    found.push(current);
    // Defined, not assigned, as React Aria does: a test library may have made `focus` a getter.
    Reflect.defineProperty(view.HTMLElement.prototype, 'focus', {
      configurable: true,
      writable: true,
      value: wrapper,
    });
  };
  wrapFocus();
  const keepPointer = (event: KeyboardEvent) => {
    if (MODIFIERS.has(event.key) && pointerLast) setInteractionModality('pointer');
  };
  const onPointer = () => {
    wrapFocus();
    pointerLast = true;
    eventBeforeFocus = true;
  };
  page.addEventListener('pointerdown', onPointer, true);
  page.addEventListener('mousedown', onPointer, true);
  page.addEventListener(
    'keydown',
    (event) => {
      eventBeforeFocus = true;
      if (!MODIFIERS.has(event.key) && !ignoredByReactAria(event)) pointerLast = false;
      keepPointer(event);
    },
    true,
  );
  page.addEventListener('keyup', keepPointer, true);
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
      if (event.detail === 0 && !(event as PointerEvent).pointerType) {
        pointerLast = false;
        eventBeforeFocus = true;
      }
    },
    true,
  );
  view.addEventListener('blur', () => {
    eventBeforeFocus = false;
    returning = true;
  });
  view.addEventListener('pageshow', wrapFocus);
  // A form's failed check that moves focus to its first invalid field shows that field's ring:
  // React Aria sets the keyboard's modality then, so the pointer's turn ends.
  page.addEventListener(
    'invalid',
    () => {
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
