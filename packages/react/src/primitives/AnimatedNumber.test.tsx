import { act, render } from '@testing-library/react';
import { I18nProvider } from 'react-aria';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../test/axe';
import { setMediaQueries } from '../../test/setup';
import { AnimatedNumber } from './AnimatedNumber';

const parts = (container: Element) => {
  const root = container.querySelector<HTMLElement>('[data-slot="animated-number"]')!;
  const [width, moving, spoken] = root.children as unknown as HTMLElement[];
  return { root, width: width!, moving: moving!, spoken: spoken! };
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
    const { width, moving, spoken } = parts(container);
    expect(moving).toHaveAttribute('aria-hidden', 'true');
    expect(width).toHaveAttribute('aria-hidden', 'true');
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
    const { container, rerender } = render(<AnimatedNumber value={0} />);
    rerender(<AnimatedNumber value={100} />);
    const shown: number[] = [];
    for (let frame = 0; frame < 40; frame++) {
      await act(() => new Promise((resolve) => setTimeout(resolve, 16)));
      shown.push(Number(parts(container).moving.textContent));
    }
    // It moved through figures between, and never past 100 (the spring overshoots).
    expect(shown.some((figure) => figure > 0 && figure < 100)).toBe(true);
    expect(Math.max(...shown)).toBeLessThanOrEqual(100);
    expect(shown.at(-1)).toBe(100);
  });

  it('puts its own props on the root', () => {
    const { container } = render(
      <AnimatedNumber value={3} id="total" className="text-title-large" data-kind="total" />,
    );
    const { root } = parts(container);
    expect(root).toHaveAttribute('id', 'total');
    expect(root).toHaveAttribute('data-kind', 'total');
    expect(root).toHaveClass('inline-grid', 'text-title-large');
  });
  // Last: Motion keeps the reduced-motion preference for the rest of the file once read.
  it('changes at once under reduced motion', () => {
    setMediaQueries({ '(prefers-reduced-motion)': true, '(prefers-reduced-motion: reduce)': true });
    const { container, rerender } = render(<AnimatedNumber value={1} />);
    rerender(<AnimatedNumber value={300} />);
    expect(parts(container).moving).toHaveTextContent('300');
  });
});
