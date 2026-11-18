import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useEntrance } from './use-entrance';

/**
 * IntersectionObservers that behave as a browser's: each reports where the element stands as it
 * starts watching, then only when that crosses its threshold or margin. `place` sets where the
 * element is: whether any part shows, the share of it that does, and whether it has come past
 * the inset a margin draws in.
 */
interface Place {
  /** Any part on screen. */
  visible: boolean;
  /** The share of the element on screen. */
  ratio: number;
  /** Some part has come past the margin's inset. */
  inside: boolean;
}
let where: Place = { visible: false, ratio: 0, inside: false };
const observers = new Set<{ margined: boolean; report: (force: boolean) => void }>();
const margins: string[] = [];
beforeEach(() => {
  where = { visible: false, ratio: 0, inside: false };
  observers.clear();
  margins.length = 0;
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private watched = false;
      private last: [boolean, boolean] = [false, false];
      private self: { margined: boolean; report: (force: boolean) => void };
      constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
        const margined = options.rootMargin !== undefined;
        if (margined) margins.push(options.rootMargin!);
        this.self = {
          margined,
          report: (force) => {
            if (!this.watched) return;
            const intersecting = margined ? where.inside : where.visible;
            const whole = where.ratio >= 1;
            const crossed = intersecting !== this.last[0] || (!margined && whole !== this.last[1]);
            this.last = [intersecting, whole];
            if (!force && !crossed) return;
            callback(
              [
                {
                  isIntersecting: intersecting,
                  intersectionRatio: margined ? (intersecting ? 1 : 0) : where.ratio,
                } as IntersectionObserverEntry,
              ],
              this as unknown as IntersectionObserver,
            );
          },
        };
        observers.add(this.self);
      }
      observe() {
        // Inside the render's own `act`, as React runs effects there: no `act` of its own.
        this.watched = true;
        this.self.report(true);
      }
      disconnect() {
        this.watched = false;
        observers.delete(this.self);
      }
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});
/** Moves the element: every observer reports the crossings it sees. */
const place = (next: Partial<Place>) =>
  act(() => {
    where = { ...where, ...next };
    for (const observer of [...observers]) observer.report(false);
  });
const inView = (ratio: number) => place({ visible: ratio > 0, ratio, inside: false });

const seen: boolean[] = [];
function Chart({ amount }: { amount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { entered, inView } = useEntrance(ref, amount === undefined ? {} : { amount });
  seen.push(entered);
  return <div ref={ref} data-entered={entered} data-in-view={inView} />;
}
const box = (container: Element) => container.firstElementChild as HTMLElement;

/**
 * Runs `dispatch` outside `act`, as a browser dispatches its events: `act` would flush any
 * update scheduled meanwhile, so what is committed by the time it returns couldn't be told apart.
 */
function outsideAct(dispatch: () => void) {
  const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const actEnvironment = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = false;
  try {
    dispatch();
  } finally {
    environment.IS_REACT_ACT_ENVIRONMENT = actEnvironment;
  }
}

describe('useEntrance', () => {
  it('shows the final picture on the server', () => {
    expect(renderToString(<Chart />)).toContain('data-entered="true"');
  });

  it('waits in the start state when the browser mounts it, and enters once it has come in', () => {
    const { container } = render(<Chart />);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    // A sliver at the window's edge: in view, worth animating, not yet entered.
    inView(0.1);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    expect(box(container)).toHaveAttribute('data-in-view', 'true');
    place({ inside: true });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    place({ visible: false, ratio: 0, inside: false });
    place({ visible: true, ratio: 1, inside: true });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });

  it('commits its final picture before the page is laid out for print', () => {
    const { container } = render(<Chart />);
    inView(0.1);
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    // A print runs no frames, so a chart never scrolled to, or mid-entrance, would print as it
    // stands: it enters, and stops being in view so React's values land rather than animate.
    // The browser lays the print out as soon as `beforeprint` returns, so the change must be
    // committed by then, not scheduled: dispatched outside `act`, and read at once.
    outsideAct(() => window.dispatchEvent(new Event('beforeprint')));
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    expect(box(container)).toHaveAttribute('data-in-view', 'false');
    // A report while the page is printed (the print's own layout moves it) keeps it out of view.
    place({ visible: true, ratio: 1, inside: true });
    expect(box(container)).toHaveAttribute('data-in-view', 'false');
    act(() => {
      window.dispatchEvent(new Event('afterprint'));
    });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    expect(box(container)).toHaveAttribute('data-in-view', 'true');
  });

  it('draws the window in by amount of its half, top and bottom', () => {
    render(<Chart />);
    render(<Chart amount={0.5} />);
    // From the top and the bottom only: an element at a wide window's side can still come in.
    expect(margins).toEqual(['-12.5% 0px', '-25% 0px']);
  });

  it('takes an amount that isn’t a number as the default', () => {
    expect(() => render(<Chart amount={Number.NaN} />)).not.toThrow();
    expect(margins.at(-1)).toBe('-12.5% 0px');
  });

  it('enters one shown whole, however near the window’s edge', () => {
    const { container } = render(<Chart />);
    place({ visible: true, ratio: 1, inside: false });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });

  it('enters one of any size as soon as part of it has come in (the browser measures it)', () => {
    const { container } = render(<Chart />);
    // A list many windows tall, or one in a box that clips it: a hundredth of it shows.
    place({ visible: true, ratio: 0.01, inside: true });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });

  it('never replays for content on screen as the page hydrates', async () => {
    seen.length = 0;
    place({ visible: true, ratio: 0.1, inside: false });
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Chart />);
    document.body.append(container);
    const root = await act(async () => hydrateRoot(container, <Chart />));
    inView(0);
    place({ visible: true, ratio: 1, inside: true });
    expect(seen.every(Boolean)).toBe(true);
    act(() => root.unmount());
    container.remove();
  });

  it('enters content hydrated out of view once it is scrolled to', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Chart />);
    document.body.append(container);
    const root = await act(async () => hydrateRoot(container, <Chart />));
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    place({ visible: true, ratio: 0.4, inside: true });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    act(() => root.unmount());
    container.remove();
  });

  it('still enters a page hydrated out of view once it starts watching again', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Chart />);
    document.body.append(container);
    const root = await act(async () => hydrateRoot(container, <Chart />));
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    // Watching again (a new amount) while part of it shows: it hasn't entered, and it still can.
    inView(0.3);
    act(() => root.render(<Chart amount={0.5} />));
    place({ inside: true });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    act(() => root.unmount());
    container.remove();
  });

  it('enters once, even when it starts watching again', async () => {
    place({ visible: true, ratio: 0.5, inside: true });
    const container = document.createElement('div');
    container.innerHTML = renderToString(<Chart />);
    document.body.append(container);
    const root = await act(async () => hydrateRoot(container, <Chart />));
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    // A new amount watches again; out of view then, it doesn't go back to its start state.
    inView(0);
    act(() => root.render(<Chart amount={0.5} />));
    expect(box(container)).toHaveAttribute('data-entered', 'true');
    act(() => root.unmount());
    container.remove();
  });

  it('goes by the newest record when a report carries several', () => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(private callback: IntersectionObserverCallback) {}
        observe() {
          // Left, then came back, before the report ran.
          this.callback(
            [
              { isIntersecting: false, intersectionRatio: 0 },
              { isIntersecting: true, intersectionRatio: 1 },
            ] as IntersectionObserverEntry[],
            this as unknown as IntersectionObserver,
          );
        }
        disconnect() {}
      },
    );
    const { container } = render(<Chart />);
    expect(box(container)).toHaveAttribute('data-in-view', 'true');
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
    place({ visible: true, ratio: 1, inside: true });
    expect(box(container)).toHaveAttribute('data-entered', 'false');
    hidden.mockReturnValue(false);
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(box(container)).toHaveAttribute('data-entered', 'true');
  });
});
