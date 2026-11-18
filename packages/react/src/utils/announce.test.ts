import { afterEach, describe, expect, it, vi } from 'vitest';
import { announcePolite, LIVE_REGION_DELAY } from './announce';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('announcePolite', () => {
  it('writes into the region it made, even once the global document is gone', () => {
    vi.useFakeTimers();
    // The region is new, so the message waits for it to be registered.
    announcePolite('Saved');
    const region = document.querySelector('[data-windmorph-announcer]')!;
    // A test file's environment torn down while the message waits (CI, 2026-11-17).
    vi.stubGlobal('document', undefined);
    expect(() => vi.advanceTimersByTime(LIVE_REGION_DELAY)).not.toThrow();
    vi.unstubAllGlobals();
    expect(region).toHaveTextContent('Saved');
  });
});
