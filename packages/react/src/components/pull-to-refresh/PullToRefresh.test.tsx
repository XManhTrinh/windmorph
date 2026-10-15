import { act, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { preloadLoadingIndicator } from '../loading-indicator/lazy-loading-indicator';
import { useM3Spring } from '../../motion/use-m3-spring';
import { PullToRefresh, type PullToRefreshProps } from './PullToRefresh';

vi.mock('../../motion/use-m3-spring', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../motion/use-m3-spring')>();
  return { useM3Spring: vi.fn(actual.useM3Spring) };
});

type TouchType = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';

/** Dispatches a one-finger touch event at `y` (x stays put unless given). */
function touch(target: Element, type: TouchType, y: number, x = 20): Event {
  const event = new Event(type, { bubbles: true, cancelable: type !== 'touchend' });
  const point = { identifier: 1, clientX: x, clientY: y, target };
  const ended = type === 'touchend' || type === 'touchcancel';
  Object.defineProperties(event, {
    touches: { value: ended ? [] : [point] },
    changedTouches: { value: [point] },
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

/** A touch pull from y = 0 through each of `stops`; returns whether each move was claimed. */
function pull(target: Element, stops: number[], { release = true } = {}): boolean[] {
  touch(target, 'touchstart', 0);
  const claimed = stops.map((y) => touch(target, 'touchmove', y).defaultPrevented);
  if (release) touch(target, 'touchend', stops.at(-1) ?? 0);
  return claimed;
}

/** Dispatches a mouse pointer event (jsdom has no PointerEvent constructor). */
function pointer(target: Element, type: string, y: number) {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 20, clientY: y });
  Object.defineProperties(event, {
    pointerType: { value: 'mouse' },
    pointerId: { value: 7 },
    isPrimary: { value: true },
  });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

function Feed({ children, ...props }: Partial<PullToRefreshProps>) {
  return (
    <PullToRefresh
      onRefresh={() => undefined}
      data-testid="area"
      style={{ height: 400, overflowY: 'auto' }}
      {...props}
    >
      <ul aria-label="Messages">
        <li>Alex: Lunch at noon?</li>
        <li>Sam: Running late</li>
      </ul>
      {children}
    </PullToRefresh>
  );
}

const item = () => screen.getByText('Alex: Lunch at noon?');
const indicatorBox = () => document.querySelector<HTMLElement>('[data-indicator]');

describe('PullToRefresh', () => {
  // The indicator loads on demand; on a page it's in by the time a pull shows it (see
  // pull-to-refresh-on-demand.test.tsx), so these tests start with it loaded.
  beforeAll(async () => {
    await preloadLoadingIndicator();
  });

  it('shows only its content at rest, with an empty polite status', async () => {
    const { container } = render(<Feed />);
    expect(screen.getByRole('list', { name: 'Messages' })).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(screen.getByTestId('area')).toHaveClass('overscroll-y-contain');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('follows a pull at half speed with a determinate indicator', async () => {
    const { container } = render(<Feed />);
    touch(item(), 'touchstart', 0);
    expect(touch(item(), 'touchmove', 100).defaultPrevented).toBe(true);
    const indicator = screen.getByRole('progressbar', { name: 'Pull to refresh' });
    // 100px pulled moves it 50px of the 80px threshold.
    expect(indicator).toHaveAttribute('aria-valuenow', '0.625');
    expect(indicatorBox()!.style.transform).toBe('translateY(calc(50px - 100%))');
    expect(indicatorBox()).toHaveClass(
      'size-[48px]',
      'rounded-corner-full',
      'bg-primary-container',
    );
    expect(screen.getByTestId('area')).toHaveAttribute('data-pulling', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('cancels a release short of the threshold, and the indicator leaves', async () => {
    const onRefresh = vi.fn();
    render(<Feed onRefresh={onRefresh} />);
    pull(item(), [60, 150]);
    expect(onRefresh).not.toHaveBeenCalled();
    expect(screen.getByTestId('area')).not.toHaveAttribute('data-pulling');
    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull());
  });

  it('turns past the threshold with resistance, and pulling back below it cancels', () => {
    const onRefresh = vi.fn();
    render(<Feed onRefresh={onRefresh} />);
    pull(item(), [100, 240], { release: false });
    // 240px pulled: 80px + 35px of resistance, turned back by (1.4375 - 1) × 180°.
    expect(indicatorBox()!.style.transform).toBe('translateY(calc(115px - 100%))');
    expect(
      screen.getByRole('progressbar', { name: 'Pull to refresh' }).parentElement!.style.transform,
    ).toBe('rotate(-78.75deg)');
    touch(item(), 'touchmove', 120);
    touch(item(), 'touchend', 120);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('refreshes on a release past the threshold and keeps the indicator until done', async () => {
    const onRefresh = vi.fn();
    const { rerender } = render(<Feed onRefresh={onRefresh} refreshing={false} />);
    pull(item(), [80, 200]);
    expect(onRefresh).toHaveBeenCalledTimes(1);

    rerender(<Feed onRefresh={onRefresh} refreshing />);
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing');
    expect(screen.getByTestId('area')).toHaveAttribute('data-refreshing', 'true');
    // The indeterminate indicator is the one exposed; it settles at the threshold.
    const busy = screen.getByRole('progressbar', { name: 'Refreshing' });
    expect(busy).not.toHaveAttribute('aria-valuenow');
    await waitFor(() =>
      expect(indicatorBox()!.style.transform).toBe('translateY(calc(80px - 100%))'),
    );

    rerender(<Feed onRefresh={onRefresh} refreshing={false} />);
    expect(screen.getByRole('status')).toHaveTextContent('Refreshed');
    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull());
  });

  it('does not pull again while refreshing, but keeps the browser from overscrolling', () => {
    const onRefresh = vi.fn();
    render(<Feed onRefresh={onRefresh} refreshing />);
    // Placed at the threshold from the start, with nothing announced.
    expect(indicatorBox()!.style.transform).toBe('translateY(calc(80px - 100%))');
    expect(screen.getByRole('status')).toHaveTextContent('');
    expect(pull(item(), [100, 300])).toEqual([true, true]);
    expect(indicatorBox()!.style.transform).toBe('translateY(calc(80px - 100%))');
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('leaves scrolling alone when the content is not at its top', () => {
    const onRefresh = vi.fn();
    render(<Feed onRefresh={onRefresh} />);
    Object.defineProperty(screen.getByTestId('area'), 'scrollTop', { value: 120 });
    expect(pull(item(), [40, 200])).toEqual([false, false]);
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('leaves upward and sideways drags to the browser for the whole gesture', () => {
    render(<Feed />);
    touch(item(), 'touchstart', 100);
    expect(touch(item(), 'touchmove', 80).defaultPrevented).toBe(false);
    expect(touch(item(), 'touchmove', 300).defaultPrevented).toBe(false);
    touch(item(), 'touchend', 300);
    touch(item(), 'touchstart', 0, 20);
    expect(touch(item(), 'touchmove', 10, 80).defaultPrevented).toBe(false);
    expect(touch(item(), 'touchmove', 200, 80).defaultPrevented).toBe(false);
    expect(screen.queryByRole('progressbar')).toBeNull();
  });

  it('hands a gesture pushed back to zero to the browser again', () => {
    render(<Feed />);
    expect(pull(item(), [100, 0, -20], { release: false })).toEqual([true, true, false]);
    expect(screen.getByTestId('area')).not.toHaveAttribute('data-pulling');
  });

  it('leaves drags inside an element that handles them itself', () => {
    render(
      <PullToRefresh onRefresh={() => undefined}>
        <div data-testid="pad" style={{ touchAction: 'none' }}>
          Sketch pad
        </div>
      </PullToRefresh>,
    );
    expect(pull(screen.getByTestId('pad'), [100, 200])).toEqual([false, false]);
  });

  it('cancels when a second finger lands', () => {
    const onRefresh = vi.fn();
    render(<Feed onRefresh={onRefresh} />);
    pull(item(), [100, 300], { release: false });
    const second = new Event('touchstart', { bubbles: true });
    const points = [
      { identifier: 1, clientX: 20, clientY: 300 },
      { identifier: 2, clientX: 80, clientY: 300 },
    ];
    Object.defineProperties(second, {
      touches: { value: points },
      changedTouches: { value: [points[1]] },
    });
    act(() => {
      item().dispatchEvent(second);
    });
    touch(item(), 'touchend', 300);
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    render(<Feed disabled />);
    expect(pull(item(), [100, 300])).toEqual([false, false]);
    expect(screen.getByTestId('area')).toHaveAttribute('data-disabled', 'true');
  });

  it('pulls with a mouse past a 4px slop and swallows the click that ends it', () => {
    const onRefresh = vi.fn();
    const onClick = vi.fn();
    render(
      <Feed onRefresh={onRefresh}>
        <button type="button" onClick={onClick}>
          Open
        </button>
      </Feed>,
    );
    const button = screen.getByRole('button', { name: 'Open' });
    pointer(button, 'pointerdown', 0);
    pointer(button, 'pointermove', 3);
    expect(screen.queryByRole('progressbar')).toBeNull();
    pointer(button, 'pointermove', 104);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0.625');
    pointer(button, 'pointermove', 204);
    pointer(button, 'pointerup', 204);
    act(() => button.click());
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
    // A plain click still works.
    pointer(button, 'pointerdown', 0);
    pointer(button, 'pointerup', 0);
    act(() => button.click());
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('keeps the indicator while a promise from onRefresh is pending, without refreshing', async () => {
    let finish: () => void = () => undefined;
    const onRefresh = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    render(<Feed onRefresh={onRefresh} />);
    pull(item(), [100, 200]);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('progressbar', { name: 'Refreshing' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing');
    await act(async () => finish());
    expect(screen.getByRole('status')).toHaveTextContent('Refreshed');
    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull());
  });

  it('shows the indicator when a refresh button sets refreshing', () => {
    function WithButton() {
      const [refreshing, setRefreshing] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setRefreshing(true)}>
            Refresh
          </button>
          <Feed refreshing={refreshing} />
        </>
      );
    }
    render(<WithButton />);
    act(() => screen.getByRole('button', { name: 'Refresh' }).click());
    expect(screen.getByRole('progressbar', { name: 'Refreshing' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Refreshing');
  });

  it('uses a custom threshold and labels', () => {
    const onRefresh = vi.fn();
    render(
      <Feed
        onRefresh={onRefresh}
        threshold={60}
        labels={{ pull: 'Pull to load new messages', refreshing: 'Loading new messages' }}
      />,
    );
    pull(item(), [100], { release: false });
    const indicator = screen.getByRole('progressbar', { name: 'Pull to load new messages' });
    expect(indicator).toHaveAttribute('aria-valuenow', String(50 / 60));
    touch(item(), 'touchmove', 121);
    touch(item(), 'touchend', 121);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(
      document.querySelector('[style*="--m3-pull-to-refresh-threshold"]')?.getAttribute('style'),
    ).toContain('--m3-pull-to-refresh-threshold: 60px');
  });

  it('puts className, style, data-* and ref on the root and classNames on its parts', () => {
    let node: HTMLDivElement | null = null;
    render(
      <PullToRefresh
        onRefresh={() => undefined}
        refreshing
        ref={(element) => {
          node = element;
        }}
        className="h-dvh overflow-y-auto"
        style={{ color: 'red' }}
        data-testid="area"
        classNames={{ layer: 'top-16', indicator: 'shadow-elevation-3' }}
      >
        Content
      </PullToRefresh>,
    );
    const area = screen.getByTestId('area');
    expect(node).toBe(area);
    expect(area).toHaveClass('h-dvh', 'overflow-y-auto', 'overscroll-y-contain');
    expect(area.style.color).toBe('red');
    expect(area.firstElementChild).toHaveClass('sticky', 'h-0', 'top-16');
    expect(area.firstElementChild).not.toHaveClass('top-0');
    expect(indicatorBox()).toHaveClass('shadow-elevation-3');
  });

  it("cancels a flex root's gap below its layer; in a grid the layer takes a row of its own", () => {
    const { rerender } = render(
      <PullToRefresh onRefresh={() => undefined} data-testid="area" style={{ display: 'block' }}>
        Content
      </PullToRefresh>,
    );
    const layer = () => screen.getByTestId('area').firstElementChild as HTMLElement;
    expect(layer().style.marginBlockEnd).toBe('0px');
    rerender(
      <PullToRefresh
        onRefresh={() => undefined}
        data-testid="area"
        style={{ display: 'flex', flexDirection: 'column', rowGap: '16px' }}
      >
        Content
      </PullToRefresh>,
    );
    expect(layer().style.marginBlockEnd).toBe('-16px');
    expect(layer().style.gridRow).toBe('');
    rerender(
      <PullToRefresh
        onRefresh={() => undefined}
        data-testid="area"
        style={{ display: 'grid', rowGap: '8px', columnGap: '24px' }}
      >
        Content
      </PullToRefresh>,
    );
    // A grid row can't shrink below zero, so no margin is set: one row gap stays above the
    // content (documented), and the layer spans every column so the content keeps its cells.
    expect(layer().style.marginBlockEnd).toBe('0px');
    expect(layer().style.gridRow).toBe('span 1 / 1');
    expect(layer().style.gridColumn).toBe('1 / -1');
    rerender(
      <PullToRefresh
        onRefresh={() => undefined}
        data-testid="area"
        style={{ display: 'flex', columnGap: '12px' }}
      >
        Content
      </PullToRefresh>,
    );
    expect(layer().style.marginInlineEnd).toBe('-12px');
    expect(layer().style.marginBlockEnd).toBe('0px');
    expect(layer().style.gridRow).toBe('');
  });
});

describe('PullToRefresh settle', () => {
  it('settles on the non-bouncing default effects spring, as Compose', () => {
    vi.mocked(useM3Spring).mockClear();
    render(<Feed />);
    expect(useM3Spring).toHaveBeenCalledWith('effects', 'default');
    expect(vi.mocked(useM3Spring).mock.calls.some(([family]) => family === 'spatial')).toBe(false);
  });
});
