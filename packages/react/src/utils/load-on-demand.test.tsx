import { act, render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runIdleCallbacks } from '../../test/setup';
import {
  IDLE_FALLBACK_DELAY,
  LOAD_RETRY_DELAY,
  LOAD_RETRY_MOST,
  onDemand,
  usePreloadWhenIdle,
} from './load-on-demand';

function Part({ preload, enabled = true }: { preload: () => Promise<unknown>; enabled?: boolean }) {
  usePreloadWhenIdle(preload, enabled);
  return null;
}

const preloader = () => vi.fn(() => Promise.resolve());

/** Sets `navigator.connection.saveData` until the test ends. */
function setSaveData(saveData: boolean) {
  Object.defineProperty(navigator, 'connection', { value: { saveData }, configurable: true });
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'connection');
});

describe('usePreloadWhenIdle', () => {
  it('preloads in the first idle period after mount, once for every part that wants it', () => {
    const preload = preloader();
    render(
      <>
        <Part preload={preload} />
        <Part preload={preload} />
      </>,
    );
    expect(preload).not.toHaveBeenCalled();
    runIdleCallbacks();
    expect(preload).toHaveBeenCalledTimes(1);
    runIdleCallbacks();
    expect(preload).toHaveBeenCalledTimes(1);
  });

  it('skips a part that is disabled or unmounted before the browser is idle', () => {
    const disabled = preloader();
    const unmounted = preloader();
    const kept = preloader();
    render(<Part preload={disabled} enabled={false} />);
    const gone = render(<Part preload={unmounted} />);
    render(<Part preload={kept} />);
    gone.unmount();
    runIdleCallbacks();
    expect(disabled).not.toHaveBeenCalled();
    expect(unmounted).not.toHaveBeenCalled();
    expect(kept).toHaveBeenCalledTimes(1);
  });

  it('cancels the idle callback when every waiting part unmounts', () => {
    const cancel = vi.spyOn(window, 'cancelIdleCallback');
    const preload = preloader();
    render(<Part preload={preload} />).unmount();
    expect(cancel).toHaveBeenCalledTimes(1);
    runIdleCallbacks();
    expect(preload).not.toHaveBeenCalled();
    cancel.mockRestore();
  });

  it("doesn't preload when the user asked to save data", () => {
    setSaveData(true);
    const preload = preloader();
    render(<Part preload={preload} />);
    runIdleCallbacks();
    expect(preload).not.toHaveBeenCalled();
  });

  it('preloads as usual when the connection does not save data', () => {
    setSaveData(false);
    const preload = preloader();
    render(<Part preload={preload} />);
    runIdleCallbacks();
    expect(preload).toHaveBeenCalledTimes(1);
  });

  it('waits a fixed delay in a browser without requestIdleCallback', () => {
    const { requestIdleCallback } = window;
    Reflect.deleteProperty(window, 'requestIdleCallback');
    vi.useFakeTimers();
    try {
      const preload = preloader();
      render(<Part preload={preload} />);
      vi.advanceTimersByTime(IDLE_FALLBACK_DELAY - 1);
      expect(preload).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(preload).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
      window.requestIdleCallback = requestIdleCallback;
    }
  });

  it('never preloads on the server', () => {
    const request = vi.spyOn(window, 'requestIdleCallback');
    const preload = preloader();
    renderToString(<Part preload={preload} />);
    runIdleCallbacks();
    expect(request).not.toHaveBeenCalled();
    expect(preload).not.toHaveBeenCalled();
    request.mockRestore();
  });
});

describe('onDemand useLoaded', () => {
  it('tries a failed load again while it is wanted, pausing longer each time, and stops when it is not', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const load = vi.fn(() => Promise.reject(new Error('The network is down')));
      const part = onDemand<object>(load);
      const onError = vi.fn();
      function Wanting({ enabled }: { enabled: boolean }) {
        part.useLoaded(enabled, onError);
        return null;
      }
      const { rerender } = render(<Wanting enabled />);
      await act(() => vi.advanceTimersByTimeAsync(0));
      expect(load).toHaveBeenCalledTimes(1);
      // Reported once; then tried after 1s, 2s, 4s… up to 30s apart.
      expect(onError).toHaveBeenCalledTimes(1);
      await act(() => vi.advanceTimersByTimeAsync(LOAD_RETRY_DELAY));
      expect(load).toHaveBeenCalledTimes(2);
      await act(() => vi.advanceTimersByTimeAsync(LOAD_RETRY_DELAY * 2 - 1));
      expect(load).toHaveBeenCalledTimes(2);
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(load).toHaveBeenCalledTimes(3);
      await act(() => vi.advanceTimersByTimeAsync(LOAD_RETRY_MOST * 10));
      const tries = load.mock.calls.length;
      await act(() => vi.advanceTimersByTimeAsync(LOAD_RETRY_MOST));
      expect(load.mock.calls.length).toBe(tries + 1);
      expect(onError).toHaveBeenCalledTimes(1);
      // No longer wanted (the menu closed): no more tries.
      rerender(<Wanting enabled={false} />);
      await act(() => vi.advanceTimersByTimeAsync(LOAD_RETRY_MOST * 4));
      expect(load.mock.calls.length).toBe(tries + 1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('tries a mounted Component once, and a caller without onError once while it is wanted', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      const load = vi.fn(() => Promise.reject(new Error('The network is down')));
      const part = onDemand<object>(load);
      function Quiet() {
        part.useLoaded(true);
        return null;
      }
      // A tooltip, a field's dialog: rendered while wanted, with nothing to report to.
      render(
        <>
          <part.Component />
          <Quiet />
        </>,
      );
      await act(() => vi.advanceTimersByTimeAsync(0));
      expect(load).toHaveBeenCalledTimes(1);
      await act(() => vi.advanceTimersByTimeAsync(LOAD_RETRY_MOST * 4));
      expect(load).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });
});
