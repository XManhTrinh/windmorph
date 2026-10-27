import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RIPPLE_GROW_MS, useRippleHold } from './use-m3-interaction';

describe('useRippleHold', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('keeps a quick tap rippling until the 225ms growth is done', () => {
    const { result, rerender } = renderHook(({ pressed }) => useRippleHold(pressed), {
      initialProps: { pressed: false },
    });
    expect(result.current).toBe(false);
    rerender({ pressed: true });
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(50));
    rerender({ pressed: false });
    // Released after 50ms: still rippling so the ripple can reach the edges.
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(RIPPLE_GROW_MS - 51));
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe(false);
  });

  it('follows a long press to its release', () => {
    const { result, rerender } = renderHook(({ pressed }) => useRippleHold(pressed), {
      initialProps: { pressed: true },
    });
    rerender({ pressed: false });
    rerender({ pressed: true });
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(true);
    rerender({ pressed: false });
    expect(result.current).toBe(false);
  });

  it('restarts the hold for each new press', () => {
    const { result, rerender } = renderHook(({ pressed }) => useRippleHold(pressed), {
      initialProps: { pressed: false },
    });
    rerender({ pressed: true });
    rerender({ pressed: false });
    act(() => vi.advanceTimersByTime(200));
    rerender({ pressed: true });
    rerender({ pressed: false });
    act(() => vi.advanceTimersByTime(100));
    // 300ms after the first press but only 100ms after the second.
    expect(result.current).toBe(true);
    act(() => vi.advanceTimersByTime(RIPPLE_GROW_MS - 100));
    expect(result.current).toBe(false);
  });
});
