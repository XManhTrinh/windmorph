import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntrance } from './use-entrance';

/** An IntersectionObserver the test drives: `show(ratio)` reports the element's visible share. */
let observed: ((ratio: number, windowShare?: number) => void) | null = null;
beforeEach(() => {
  observed = null;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        observed = (ratio, windowShare) =>
          callback(
            [
              {
                isIntersecting: ratio > 0,
                intersectionRatio: ratio,
                rootBounds: { height: 800 },
                intersectionRect: { height: (windowShare ?? ratio) * 800 },
              } as unknown as IntersectionObserverEntry,
            ],
            this as unknown as IntersectionObserver,
          );
      }
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});
const show = (ratio: number, windowShare?: number) => act(() => observed?.(ratio, windowShare));

const seen: boolean[] = [];
function Chart() {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, inView } = useEntrance(ref);
  seen.push(entered);
  return <div ref={ref} data-entered={entered} data-in-view={inView} />;
}
const box = (container: Element) => container.firstElementChild as HTMLElement;

describe('useEntrance', () => {
  it('shows the final picture on the server', () => {
    expect(renderToString(<Chart />)).toContain('data-entered="true"');
  });

  it('waits in the start state when the browser mounts it, and enters once seen', () => {
    const { container } = render(<Chart />);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    show(0.1);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    expect(box(container)).toHaveAttribute('data-in-view', 'true');
    show(0.5);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    show(0);
    show(0.5);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });

  it('never replays for content on screen as the page hydrates', async () => {
    seen.length = 0;
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Chart />);
    document.body.append(container);
    await act(async () => {
      hydrateRoot(container, <Chart />);
    });
    show(0.1);
    show(0);
    show(1);
    expect(seen.every(Boolean)).toBe(true);
    container.remove();
  });

  it('enters content hydrated out of view once it is scrolled to', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Chart />);
    document.body.append(container);
    await act(async () => {
      hydrateRoot(container, <Chart />);
    });
    show(0);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    show(0.4);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    container.remove();
  });

  it('enters an element taller than the window once a share of the window shows it', () => {
    const { container } = render(<Chart />);
    // A tenth of a very tall element, filling half the window.
    show(0.1, 0.5);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });

  it('shows the final picture and animates when there is nothing to watch', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = render(<Chart />);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    expect(box(container)).toHaveAttribute('data-in-view', 'true');
  });

  it('waits for a hidden tab to show', () => {
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    const { container } = render(<Chart />);
    show(1);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    hidden.mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });
});
