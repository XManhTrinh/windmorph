import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntrance } from './use-entrance';

/** An IntersectionObserver the test drives: `show(ratio)` reports the element's visible share. */
let observed: ((ratio: number, windowShare?: number, widthShown?: number) => void) | null = null;
beforeEach(() => {
  observed = null;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        // A 1000 × 800 window; the element 400px tall, or 3200px when `windowShare` is given (the
        // share of the window it fills), and `widthShown` px of its 1000 showing.
        observed = (ratio, windowShare, widthShown = 1000) =>
          callback(
            [
              {
                isIntersecting: ratio > 0,
                intersectionRatio: ratio,
                rootBounds: { height: 800, width: 1000 },
                boundingClientRect: { height: windowShare === undefined ? 400 : 3200, width: 1000 },
                intersectionRect: {
                  height: windowShare === undefined ? ratio * 400 : windowShare * 800,
                  width: ratio > 0 ? widthShown : 0,
                },
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
const show = (ratio: number, windowShare?: number, widthShown?: number) =>
  act(() => observed?.(ratio, windowShare, widthShown));

const seen: boolean[] = [];
function Chart({ amount }: { amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, inView } = useEntrance(ref, amount === undefined ? {} : { amount });
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
    const root = await act(async () => hydrateRoot(container, <Chart />));
    show(0.1);
    show(0);
    show(1);
    expect(seen.every(Boolean)).toBe(true);
    act(() => root.unmount());
    container.remove();
  });

  it('enters content hydrated out of view once it is scrolled to', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Chart />);
    document.body.append(container);
    const root = await act(async () => hydrateRoot(container, <Chart />));
    show(0);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    show(0.4);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    act(() => root.unmount());
    container.remove();
  });

  it('enters an element taller than the window once a share of the window shows it', () => {
    const { container } = render(<Chart />);
    // A tenth of a very tall element, filling half the window.
    show(0.1, 0.5);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });

  it('waits for a share across, too, in a sideways scroller', () => {
    const { container } = render(<Chart />);
    // Tall enough to fill half the window, with 1px of its width in view.
    show(0.001, 0.5, 1);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    show(0.1, 0.5, 600);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });

  it('enters once, even when it starts watching again', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Chart />);
    document.body.append(container);
    const root = await act(async () => hydrateRoot(container, <Chart />));
    show(0.5);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    // A new amount watches again; out of view then, it doesn't go back to its start state.
    act(() => root.render(<Chart amount={0.5} />));
    show(0);
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    act(() => root.unmount());
    container.remove();
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
