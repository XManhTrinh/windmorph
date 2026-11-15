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
function guard(page: Document) {
  if (guarded.has(page)) return;
  guarded.add(page);
  let pointerLast = false;
  const keepPointer = (event: KeyboardEvent) => {
    if (MODIFIERS.has(event.key) && pointerLast) setInteractionModality('pointer');
  };
  page.addEventListener('pointerdown', () => (pointerLast = true), true);
  page.addEventListener('mousedown', () => (pointerLast = true), true);
  page.addEventListener(
    'keydown',
    (event) => {
      if (!MODIFIERS.has(event.key) && !ignoredByReactAria(event)) pointerLast = false;
      keepPointer(event);
    },
    true,
  );
  page.addEventListener('keyup', keepPointer, true);
  page.defaultView?.addEventListener('keydown', keepPointer);
  page.defaultView?.addEventListener('keyup', keepPointer);
}

// Installs, once per document, the guard that keeps a modifier key pressed alone from showing
// focus rings. Called by `useM3Interaction` after React Aria's focus tracking is set up, so the
// whole page is covered as soon as one interactive component mounts.
export function useModifierKeysGuard(): void {
  useEffect(() => {
    guard(document);
  }, []);
}
