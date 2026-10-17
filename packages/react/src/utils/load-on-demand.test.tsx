import { render } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runIdleCallbacks } from '../../test/setup';
import { IDLE_FALLBACK_DELAY, usePreloadWhenIdle } from './load-on-demand';

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
