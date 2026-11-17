import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { setMediaQueries } from '../../test/setup';
import { useM3SpringValue } from './use-m3-spring-value';

const wait = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

describe('useM3SpringValue', () => {
  it('is its target in the first render', () => {
    const { result } = renderHook(() => useM3SpringValue(42));
    expect(result.current.get()).toBe(42);
  });

  it('springs to a new target over frames and settles on it', async () => {
    const { result, rerender } = renderHook(({ target }) => useM3SpringValue(target), {
      initialProps: { target: 0 },
    });
    rerender({ target: 100 });
    await wait(60);
    expect(result.current.get()).toBeGreaterThan(0);
    expect(result.current.get()).toBeLessThan(100);
    await wait(1500);
    expect(result.current.get()).toBe(100);
  });

  it('keeps its speed when a new target arrives mid-move', async () => {
    const { result, rerender } = renderHook(({ target }) => useM3SpringValue(target), {
      initialProps: { target: 0 },
    });
    rerender({ target: 100 });
    await wait(50);
    const speed = result.current.getVelocity();
    expect(speed).toBeGreaterThan(0);
    rerender({ target: 200 });
    await wait(20);
    // Restarted from rest it would be far slower one frame in.
    expect(result.current.getVelocity()).toBeGreaterThan(speed * 0.5);
  });

  it('jumps when it may not animate', () => {
    const { result, rerender } = renderHook(
      ({ target }) => useM3SpringValue(target, { animate: false }),
      { initialProps: { target: 0 } },
    );
    rerender({ target: 7 });
    expect(result.current.get()).toBe(7);
  });

  it('jumps a spatial value under reduced motion but keeps an effects value’s spring', async () => {
    setMediaQueries({ '(prefers-reduced-motion)': true, '(prefers-reduced-motion: reduce)': true });
    const spatial = renderHook(({ target }) => useM3SpringValue(target), {
      initialProps: { target: 0 },
    });
    spatial.rerender({ target: 1 });
    expect(spatial.result.current.get()).toBe(1);

    const effects = renderHook(({ target }) => useM3SpringValue(target, { family: 'effects' }), {
      initialProps: { target: 0 },
    });
    effects.rerender({ target: 1 });
    expect(effects.result.current.get()).toBe(0);
    await wait(30);
    expect(effects.result.current.get()).toBeGreaterThan(0);
  });
});
