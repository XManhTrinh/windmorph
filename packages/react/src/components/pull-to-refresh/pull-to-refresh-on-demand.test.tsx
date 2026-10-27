import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runIdleCallbacks } from '../../../test/setup';

/** How many times the `LoadingIndicator` module has been loaded in the current test. */
let loads = 0;

/** `PullToRefresh` from this test's fresh modules, so the indicator starts unloaded. */
async function load() {
  const { PullToRefresh } = await import('./PullToRefresh');
  return PullToRefresh;
}

/** Dispatches a one-finger touch event at `y`. */
function touch(target: Element, type: 'touchstart' | 'touchmove', y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  const point = { identifier: 1, clientX: 20, clientY: y, target };
  Object.defineProperties(event, {
    touches: { value: [point] },
    changedTouches: { value: [point] },
  });
  act(() => {
    target.dispatchEvent(event);
  });
}

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 50)));

describe('PullToRefresh indicator on demand', () => {
  beforeEach(() => {
    vi.resetModules();
    loads = 0;
    vi.doMock('../loading-indicator/LoadingIndicator', async (importOriginal) => {
      loads += 1;
      return importOriginal();
    });
  });

  it("doesn't carry the indicator's code up front, and loads it when the browser is idle", async () => {
    const PullToRefresh = await load();
    render(
      <PullToRefresh onRefresh={() => undefined}>
        <p>Alex: Lunch at noon?</p>
      </PullToRefresh>,
    );
    await settle();
    expect(loads).toBe(0);
    act(() => runIdleCallbacks());
    await waitFor(() => expect(loads).toBe(1));
  });

  it('never loads it while disabled', async () => {
    const PullToRefresh = await load();
    render(
      <PullToRefresh onRefresh={() => undefined} disabled>
        <p>Alex: Lunch at noon?</p>
      </PullToRefresh>,
    );
    act(() => runIdleCallbacks());
    touch(screen.getByText('Alex: Lunch at noon?'), 'touchstart', 0);
    await settle();
    expect(loads).toBe(0);
  });

  it('loads it as a touch lands, so it shows as soon as the pull passes the slop', async () => {
    const PullToRefresh = await load();
    render(
      <PullToRefresh onRefresh={() => undefined}>
        <p>Alex: Lunch at noon?</p>
      </PullToRefresh>,
    );
    const item = screen.getByText('Alex: Lunch at noon?');
    touch(item, 'touchstart', 0);
    await waitFor(() => expect(loads).toBe(1));
    const { preloadLoadingIndicator } = await import('../loading-indicator/lazy-loading-indicator');
    await act(() => preloadLoadingIndicator());
    // Nothing awaited after the move: the render that shows the indicator already has it.
    touch(item, 'touchmove', 100);
    expect(screen.getByRole('progressbar', { name: 'Pull to refresh' })).toBeInTheDocument();
    expect(loads).toBe(1);
  });
});
