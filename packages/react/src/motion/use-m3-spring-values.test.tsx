import { act, renderHook } from '@testing-library/react';
import { Activity } from 'react';
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

const wait = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

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
  it('keeps each element’s speed when new targets arrive mid-move', async () => {
    const { result, rerender } = renderHook(({ targets }) => useM3SpringValues(targets), {
      initialProps: { targets: [0, 0] as readonly number[] },
    });
    rerender({ targets: [100, 100] });
    await wait(50);
    const [at = 0] = result.current.get();
    // Targets just ahead: carried on its speed each runs well past them; from rest it would creep.
    rerender({ targets: [at + 1, at + 1] });
    await wait(40);
    expect(result.current.get()[0]).toBeGreaterThan(at + 4);
  });

  it('waits each element’s delay before a move from rest', async () => {
    const { result, rerender } = renderHook(
      ({ targets }) => useM3SpringValues(targets, { delay: [0, 0.25] }),
      { initialProps: { targets: [0, 0] as readonly number[] } },
    );
    rerender({ targets: [100, 100] });
    await wait(120);
    const [first, second] = result.current.get();
    expect(first).toBeGreaterThan(0);
    expect(second).toBe(0);
    await wait(250);
    expect(result.current.get()[1]).toBeGreaterThan(0);
  });

  it('turns a moving element to a new target at once, whatever its delay', async () => {
    const { result, rerender } = renderHook(
      ({ targets, delay }) => useM3SpringValues(targets, { delay }),
      { initialProps: { targets: [0] as readonly number[], delay: 0 as number } },
    );
    rerender({ targets: [100], delay: 0 });
    await wait(50);
    const [at = 0] = result.current.get();
    rerender({ targets: [100 + at], delay: 0.4 });
    await wait(250);
    // Well on its way before the delay would have ended: never held (or swung about) for it.
    expect(result.current.get()[0]).toBeGreaterThan(at + 60);
  });

  it('reaches its targets after being hidden mid-move and shown again', async () => {
    let mode: 'visible' | 'hidden' = 'visible';
    const { result, rerender } = renderHook(({ targets }) => useM3SpringValues(targets), {
      initialProps: { targets: [0] as readonly number[] },
      wrapper: ({ children }) => <Activity mode={mode}>{children}</Activity>,
    });
    const full = [100];
    rerender({ targets: full });
    await wait(40);
    mode = 'hidden';
    rerender({ targets: full });
    mode = 'visible';
    rerender({ targets: full });
    await wait(1500);
    expect(result.current.get()).toEqual([100]);
  });

  it('settles a list holding NaN without restarting on every render', async () => {
    const { result, rerender } = renderHook(({ targets }) => useM3SpringValues(targets), {
      initialProps: { targets: [0, 0] as readonly number[] },
    });
    rerender({ targets: [Number.NaN, 100] });
    await wait(60);
    const moving = result.current.get()[1]!;
    expect(moving).toBeGreaterThan(0);
    expect(moving).toBeLessThan(100);
    // The same list again (a parent's render) carries on rather than starting over.
    rerender({ targets: [Number.NaN, 100] });
    await wait(20);
    expect(result.current.get()[1]).toBeGreaterThan(moving);
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
