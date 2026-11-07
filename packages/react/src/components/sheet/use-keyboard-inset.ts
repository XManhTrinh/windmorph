'use client';

import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const viewport = window.visualViewport;
  if (!viewport) return () => {};
  viewport.addEventListener('resize', onChange);
  viewport.addEventListener('scroll', onChange);
  return () => {
    viewport.removeEventListener('resize', onChange);
    viewport.removeEventListener('scroll', onChange);
  };
}

/**
 * How far the on-screen keyboard covers the bottom of the window, in px. Phone browsers lay a
 * keyboard over the page without resizing it (Chrome's default `interactive-widget`), so an
 * element fixed to the window's bottom sits behind it; the visual viewport shrinks instead.
 * A zoomed page shrinks it too, so only an unzoomed one counts (2026-11-07).
 */
function getInset() {
  const viewport = window.visualViewport;
  if (!viewport || Math.abs(viewport.scale - 1) > 0.01) return 0;
  return Math.max(0, Math.round(window.innerHeight - viewport.offsetTop - viewport.height));
}

const getServerInset = () => 0;

/** The keyboard's height over the window's bottom edge, followed as it opens and closes. */
export function useKeyboardInset(): number {
  return useSyncExternalStore(subscribe, getInset, getServerInset);
}
