import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLoopStep } from './use-loop-step';

vi.mock('motion/react', async (importOriginal) => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useReducedMotion: () => false,
}));

/** Delivers one callback with an entry per state, oldest first, as a busy browser can. */
let intersect: (...isIntersecting: boolean[]) => void = () => {};

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = (...states) =>
          act(() =>
            callback(
              states.map((isIntersecting) => ({ isIntersecting }) as IntersectionObserverEntry),
              this as unknown as IntersectionObserver,
            ),
          );
      }
      observe() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function Loop() {
  const { ref, step } = useLoopStep(100);
  return (
    <div ref={ref} data-testid="loop">
      {step}
    </div>
  );
}

describe('useLoopStep', () => {
  // 2026-11-11: it read the first entry of a callback, so when the first notice (off screen)
  // and a quick scroll's (on screen) came together, the loop never started.
  it('goes by the newest of the observer’s entries delivered together', () => {
    render(<Loop />);
    intersect(false, true);
    act(() => vi.advanceTimersByTime(250));
    expect(screen.getByTestId('loop')).toHaveTextContent('2');
    intersect(true, false);
    act(() => vi.advanceTimersByTime(250));
    expect(screen.getByTestId('loop')).toHaveTextContent('2');
  });
});
