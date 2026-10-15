import { act, renderHook } from '@testing-library/react';
import type { TransitionEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LEGACY_DURATIONS, SPRINGS, springSettleDuration } from '../tokens/motion';
import { EXIT_FALLBACK_MS, usePresence } from './use-presence';

describe('usePresence', () => {
  it('waits longer than the slowest spring token plus the longest exit delay', () => {
    const slowest = Math.max(
      ...Object.values(SPRINGS).flatMap((scheme) =>
        Object.values(scheme).flatMap((family) => Object.values(family).map(springSettleDuration)),
      ),
    );
    // The dialog's container fade waits `short-2` for its parts to fade first.
    expect(EXIT_FALLBACK_MS).toBeGreaterThan(slowest + LEGACY_DURATIONS['short-2']);
  });

  it('stays present until the exit transition ends, or the fallback', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ open }) => usePresence(open), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    expect(result.current).toMatchObject({ isPresent: true, isExiting: true });
    act(() => vi.advanceTimersByTime(EXIT_FALLBACK_MS - 1));
    expect(result.current.isPresent).toBe(true);
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.isPresent).toBe(false);
    vi.useRealTimers();
  });

  it('ends on the first of several properties to finish its transition', () => {
    const { result, rerender } = renderHook(
      ({ open }) => usePresence(open, ['translate', 'opacity']),
      { initialProps: { open: true } },
    );
    rerender({ open: false });
    const element = document.createElement('div');
    const end = (propertyName: string) =>
      act(() =>
        result.current.exitProps.onTransitionEnd({
          target: element,
          currentTarget: element,
          propertyName,
        } as unknown as TransitionEvent<HTMLElement>),
      );
    end('color');
    expect(result.current.isPresent).toBe(true);
    end('opacity');
    expect(result.current.isPresent).toBe(false);
  });

  it('follows the open state at once when not animated', () => {
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 'opacity', false), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    expect(result.current).toMatchObject({ isPresent: false, isExiting: false });
  });
});
