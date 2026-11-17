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
    const at = result.current.get();
    expect(result.current.getVelocity()).toBeGreaterThan(100);
    // A target just ahead: carried on its speed it runs well past it; from rest it would creep.
    rerender({ target: at + 1 });
    await wait(40);
    expect(result.current.get()).toBeGreaterThan(at + 4);
  });

  it('turns a moving value to a new target at once, whatever its delay', async () => {
    const { result, rerender } = renderHook(
      ({ target, delay }) => useM3SpringValue(target, { delay }),
      { initialProps: { target: 0, delay: 0 } },
    );
    rerender({ target: 100, delay: 0 });
    await wait(50);
    const at = result.current.get();
    rerender({ target: 100 + at, delay: 0.4 });
    await wait(250);
    // Well on its way before the delay would have ended: never held still for it.
    expect(result.current.get()).toBeGreaterThan(at + 60);
  });

  it('waits its delay before a move from rest', async () => {
    const { result, rerender } = renderHook(
      ({ target }) => useM3SpringValue(target, { delay: 0.2 }),
      { initialProps: { target: 0 } },
    );
    rerender({ target: 100 });
    await wait(100);
    expect(result.current.get()).toBe(0);
    await wait(200);
    expect(result.current.get()).toBeGreaterThan(0);
  });

  it('keeps its wait counted from when it began, when a new target arrives', async () => {
    const { result, rerender } = renderHook(
      ({ target }) => useM3SpringValue(target, { delay: 0.3 }),
      { initialProps: { target: 0 } },
    );
    rerender({ target: 100 });
    await wait(150);
    rerender({ target: 50 });
    await wait(220);
    expect(result.current.get()).toBeGreaterThan(0);
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
