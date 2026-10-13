import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

const hasDom = typeof document !== 'undefined';

afterEach(() => {
  if (!hasDom) return;
  cleanup();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-mode');
  document.documentElement.removeAttribute('data-contrast');
  document.documentElement.removeAttribute('data-motion');
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; max-age=0; path=/`;
  });
  window.localStorage.clear();
});

/** jsdom has no matchMedia; tests drive it through `setMediaQueries`. */
const mediaState = new Map<string, boolean>();
const listeners = new Set<() => void>();

export function setMediaQueries(queries: Record<string, boolean>) {
  for (const [query, matches] of Object.entries(queries)) mediaState.set(query, matches);
  listeners.forEach((listener) => listener());
}

afterEach(() => mediaState.clear());

if (hasDom)
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return mediaState.get(query) ?? false;
    },
    media: query,
    onchange: null,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    addListener: (listener: () => void) => listeners.add(listener),
    removeListener: (listener: () => void) => listeners.delete(listener),
    dispatchEvent: () => false,
  }));

/**
 * jsdom lays nothing out, so a Range has no rects. ProseMirror (in the rich-text editor)
 * measures one to scroll the cursor into view, sometimes after a test has finished; an
 * element's empty rects stand in.
 */
if (hasDom && !('getClientRects' in Range.prototype)) {
  Object.assign(Range.prototype, {
    getClientRects: () => document.createElement('span').getClientRects(),
    getBoundingClientRect: () => new DOMRect(),
  });
}

/** jsdom doesn't scroll, so an element has no `scrollIntoView`; the rich field calls it on focus. */
if (hasDom && !('scrollIntoView' in Element.prototype)) {
  Object.assign(Element.prototype, { scrollIntoView: () => undefined });
}
