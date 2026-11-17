import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { setMediaQueries } from '../../test/setup';
import { resample } from './resample';
import { useM3SpringValues } from './use-m3-spring-values';

describe('resample', () => {
  it('reads a list at more or fewer places along the same span', () => {
    expect(resample([0, 10], 5)).toEqual([0, 2.5, 5, 7.5, 10]);
    expect(resample([0, 10, 0], 2)).toEqual([0, 0]);
    expect(resample([4, 8, 6], 3)).toEqual([4, 8, 6]);
  });

  it('fills from one value or from `rest`', () => {
    expect(resample([7], 3)).toEqual([7, 7, 7]);
    expect(resample([], 2, 1)).toEqual([1, 1]);
    expect(resample([1, 2], 0)).toEqual([]);
  });
});

describe('useM3SpringValues', () => {
  it('is its targets in the first render', () => {
    const { result } = renderHook(() => useM3SpringValues([1, 2, 3]));
    expect(result.current.get()).toEqual([1, 2, 3]);
  });

  it('starts a list of another length from the old shape read at the new places', () => {
    const { result, rerender } = renderHook(({ targets }) => useM3SpringValues(targets), {
      initialProps: { targets: [0, 10] as readonly number[] },
    });
    rerender({ targets: [5, 5, 5, 5, 5] });
    // Before the first frame, the five elements stand where the old line was.
    expect(result.current.get()).toEqual([0, 2.5, 5, 7.5, 10]);
  });

  it('springs to new targets over frames and settles on them', async () => {
    const { result, rerender } = renderHook(({ targets }) => useM3SpringValues(targets), {
      initialProps: { targets: [0, 0] as readonly number[] },
    });
    rerender({ targets: [100, 50] });
    await act(() => new Promise((resolve) => setTimeout(resolve, 60)));
    const [first, second] = result.current.get();
    expect(first).toBeGreaterThan(0);
    expect(first).toBeLessThan(100);
    expect(second).toBeGreaterThan(0);
    await act(() => new Promise((resolve) => setTimeout(resolve, 1500)));
    expect(result.current.get()).toEqual([100, 50]);
  });
  it('jumps when it may not animate', () => {
    const { result, rerender } = renderHook(
      ({ targets }) => useM3SpringValues(targets, { animate: false }),
      { initialProps: { targets: [0, 0] as readonly number[] } },
    );
    rerender({ targets: [4, 9] });
    expect(result.current.get()).toEqual([4, 9]);
  });

  // Last: Motion keeps the reduced-motion preference for the rest of the file once read.
  it('jumps under reduced motion', () => {
    setMediaQueries({ '(prefers-reduced-motion)': true, '(prefers-reduced-motion: reduce)': true });
    const { result, rerender } = renderHook(({ targets }) => useM3SpringValues(targets), {
      initialProps: { targets: [0, 0] as readonly number[] },
    });
    rerender({ targets: [1, 2] });
    expect(result.current.get()).toEqual([1, 2]);
  });
});
