import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePageHeight } from './use-page-height';

function Pages({ level }: { level: number }) {
  const [ref, { height, paging, shrinking }] = usePageHeight<HTMLDivElement>(level);
  return (
    <div
      ref={ref}
      data-height={height}
      data-paging={paging || undefined}
      data-shrinking={shrinking || undefined}
    />
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('usePageHeight', () => {
  it('springs to each new page and follows any other change of size at once', () => {
    let px = 120;
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () => ({ height: `${px}px` }) as CSSStyleDeclaration,
    );
    let notify = () => {};
    vi.stubGlobal(
      'ResizeObserver',
      class {
        constructor(callback: () => void) {
          notify = callback;
        }
        observe() {}
        disconnect() {}
      },
    );
    const { container, rerender } = render(<Pages level={0} />);
    const pages = container.firstElementChild!;
    // Measured as it mounts, with no motion: the menu's reveal opens it.
    expect(pages).toHaveAttribute('data-height', '120');
    expect(pages).not.toHaveAttribute('data-paging');

    // A taller page, measured in the commit that brings it in.
    px = 200;
    rerender(<Pages level={1} />);
    expect(pages).toHaveAttribute('data-height', '200');
    expect(pages).toHaveAttribute('data-paging', 'true');
    expect(pages).not.toHaveAttribute('data-shrinking');

    // Back to a shorter one: it shrinks on the effects easing.
    px = 80;
    rerender(<Pages level={0} />);
    expect(pages).toHaveAttribute('data-height', '80');
    expect(pages).toHaveAttribute('data-shrinking', 'true');

    // A font arriving on the same page: followed at once.
    px = 90;
    act(() => notify());
    expect(pages).toHaveAttribute('data-height', '90');
    expect(pages).not.toHaveAttribute('data-paging');
  });

  it('leaves the height unset while it reads none, as on the server', () => {
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      () => ({ height: 'auto' }) as CSSStyleDeclaration,
    );
    const { container } = render(<Pages level={0} />);
    expect(container.firstElementChild).not.toHaveAttribute('data-height');
  });
});
