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
// focus with no key or pointer before it, or a click with no pointer, is a screen reader's or a
// phone's form navigation (its virtual modality, which shows rings), and ends the pointer's
// turn, so a modifier alone then leaves the rings showing (2026-11-16). React Aria's main entry
// has no reader for its modality, so the guard follows the same events instead.
function guard(page: Document) {
  const view = page.defaultView;
  if (!view || guarded.has(page)) return;
  guarded.add(page);
  let pointerLast = false;
  // A key or pointer event since focus last moved, and a return to the window, which moves
  // focus with no event before it but isn't a screen reader's.
  let eventBeforeFocus = false;
  let returning = false;
  const keepPointer = (event: KeyboardEvent) => {
    if (MODIFIERS.has(event.key) && pointerLast) setInteractionModality('pointer');
  };
  const onPointer = () => {
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
  page.addEventListener(
    'focus',
    (event) => {
      if (event.target === view || event.target === page) return;
      if (!eventBeforeFocus && !returning) pointerLast = false;
      eventBeforeFocus = false;
      returning = false;
    },
    true,
  );
  page.addEventListener(
    'click',
    (event) => {
      if (event.detail === 0 && !(event as PointerEvent).pointerType) pointerLast = false;
    },
    true,
  );
  view.addEventListener('blur', () => (returning = true));
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
