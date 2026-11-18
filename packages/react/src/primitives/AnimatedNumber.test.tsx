import { act, render } from '@testing-library/react';
import { I18nProvider } from 'react-aria';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../test/axe';
import { setMediaQueries } from '../../test/setup';
import { AnimatedNumber } from './AnimatedNumber';

const parts = (container: Element) => {
  const root = container.querySelector<HTMLElement>('[data-slot="animated-number"]')!;
  const [box, spoken] = root.children as unknown as HTMLElement[];
  const [width, moving] = box!.children as unknown as HTMLElement[];
  return { root, box: box!, width: width!, moving: moving!, spoken: spoken! };
};

// In view at once, so a change animates (jsdom has no IntersectionObserver).
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe() {
        this.callback(
          [{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        );
      }
      disconnect() {}
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AnimatedNumber', () => {
  it('is its final value in the server’s HTML, said once', () => {
    const html = renderToString(<AnimatedNumber value={1284} from={0} />);
    expect(html.match(/1,284/g)).toHaveLength(3);
  });

  it('gives assistive technology the final value only, and keeps its width', async () => {
    const { container, rerender } = render(<AnimatedNumber value={10} />);
    rerender(<AnimatedNumber value={2500} />);
    const { box, width, spoken } = parts(container);
    // The width and the moving figure, in one box assistive technology skips.
    expect(box).toHaveAttribute('aria-hidden', 'true');
    expect(width).toHaveClass('invisible');
    expect(width).toHaveTextContent('2,500');
    expect(spoken).toHaveClass('sr-only');
    expect(spoken).toHaveTextContent('2,500');
    expect(container.textContent?.replace(/\s/g, '')).toContain('2,500');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('formats in the page’s locale with the value’s own decimals, or by `format`', () => {
    const { container, rerender } = render(
      <I18nProvider locale="de-DE">
        <AnimatedNumber value={1284.5} />
      </I18nProvider>,
    );
    expect(parts(container).spoken).toHaveTextContent('1.284,5');
    rerender(<AnimatedNumber value={8.2} format={(value) => `${value.toFixed(1)} min`} />);
    expect(parts(container).spoken).toHaveTextContent('8.2 min');
  });

  it('never shows a figure past the one it moves to', async () => {
    const format = (value: number) => String(value);
    const { container, rerender } = render(<AnimatedNumber value={0} format={format} />);
    rerender(<AnimatedNumber value={100} format={format} />);
    const shown: number[] = [];
    for (let frame = 0; frame < 40; frame++) {
      await act(() => new Promise((resolve) => setTimeout(resolve, 16)));
      shown.push(Number(parts(container).moving.textContent));
    }
    // A whole number counts in whole numbers, even through an app's own format.
    expect(shown.every(Number.isInteger)).toBe(true);
    // It moved through figures between, and never past 100 (the spring overshoots).
    expect(shown.some((figure) => figure > 0 && figure < 100)).toBe(true);
    expect(Math.max(...shown)).toBeLessThanOrEqual(100);
    expect(shown.at(-1)).toBe(100);
  });

  it('shows a computed value with at most three decimals, and a tiny one exactly', async () => {
    const { container } = render(<AnimatedNumber value={2 / 3} />);
    expect(parts(container).spoken).toHaveTextContent('0.667');
    // A float sum's leftover isn't padded: 0.1 + 0.2 reads 0.3, as Intl's own default.
    const sum = render(<AnimatedNumber value={0.1 + 0.2} />);
    expect(parts(sum.container).spoken).toHaveTextContent(/^0\.3$/);
    const tiny = render(<AnimatedNumber value={1.5e-7} format={String} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)));
    // Eight decimals: rounded to seven it would read 2e-7.
    expect(parts(tiny.container).moving).toHaveTextContent('1.5e-7');
  });

  it('never shows a figure past the one it showed when a new value arrives mid-overshoot', async () => {
    const { container, rerender } = render(<AnimatedNumber value={0} format={String} />);
    rerender(<AnimatedNumber value={1000} format={String} />);
    const moving = () => Number(parts(container).moving.textContent);
    for (let frame = 0; frame < 60 && moving() < 1000; frame++) {
      await act(() => new Promise((resolve) => setTimeout(resolve, 16)));
    }
    // Past the target now, held at 1000 on screen while the spring overshoots.
    await act(() => new Promise((resolve) => setTimeout(resolve, 60)));
    rerender(<AnimatedNumber value={500} format={String} />);
    const shown: number[] = [];
    for (let frame = 0; frame < 12; frame++) {
      await act(() => new Promise((resolve) => setTimeout(resolve, 16)));
      shown.push(moving());
    }
    expect(Math.max(...shown)).toBeLessThanOrEqual(1000);
  });

  it('lays its figure out inside its own box, so the root takes any display', () => {
    const { container } = render(<AnimatedNumber value={42} className="block text-center" />);
    const { root, box, moving } = parts(container);
    expect(root).toHaveClass('block', 'text-center');
    expect(root).not.toHaveClass('inline-grid');
    // The box is as wide as the number wherever the root puts it, and the figure keeps to it.
    expect(box).toHaveClass('relative', 'inline-grid');
    expect(moving.parentElement).toBe(box);
  });

  it('watches its entrance with one observer, whatever ref an app passes', () => {
    let observers = 0;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor() {
          observers += 1;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { rerender } = render(<AnimatedNumber value={1} ref={() => undefined} />);
    rerender(<AnimatedNumber value={2} ref={() => undefined} />);
    rerender(<AnimatedNumber value={3} ref={() => undefined} />);
    // One entrance: its pair of observers (on screen, and come in past the edge).
    expect(observers).toBe(2);
  });

  it('shows numbers again after a value that isn’t one', async () => {
    const format = (value: number) => (Number.isFinite(value) ? String(value) : 'No value');
    const { container, rerender } = render(<AnimatedNumber value={12} format={format} />);
    rerender(<AnimatedNumber value={Number.NaN} format={format} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
    expect(parts(container).moving).toHaveTextContent('No value');
    rerender(<AnimatedNumber value={15} format={format} />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 600)));
    expect(parts(container).moving).toHaveTextContent('15');
  });

  it('never rounds its figure outside the move', async () => {
    const format = (value: number) => String(value);
    const { container, rerender } = render(<AnimatedNumber value={4.3} format={format} />);
    rerender(<AnimatedNumber value={10} format={format} />);
    const shown: number[] = [];
    for (let frame = 0; frame < 30; frame++) {
      await act(() => new Promise((resolve) => setTimeout(resolve, 16)));
      shown.push(Number(parts(container).moving.textContent));
    }
    // Whole numbers (the target's), never below where it started.
    expect(Math.min(...shown)).toBeGreaterThanOrEqual(4.3);
  });

  it('puts its own props on the root', () => {
    const { container } = render(
      <AnimatedNumber
        value={3}
        id="total"
        className="text-title-large"
        data-kind="total"
        data-slot="value"
      />,
    );
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute('data-slot', 'value');
    expect(root).toHaveAttribute('id', 'total');
    expect(root).toHaveAttribute('data-kind', 'total');
    expect(root).toHaveClass('text-title-large');
  });
  // Last: Motion keeps the reduced-motion preference for the rest of the file once read.
  it('changes at once under reduced motion', () => {
    setMediaQueries({ '(prefers-reduced-motion)': true, '(prefers-reduced-motion: reduce)': true });
    const { container, rerender } = render(<AnimatedNumber value={1} />);
    rerender(<AnimatedNumber value={300} />);
    expect(parts(container).moving).toHaveTextContent('300');
  });
});
