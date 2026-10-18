import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useKeepPressedInPlace } from './keep-pressed-in-place';

/** A row whose press changes `version` (as a switch does) unless `inert`. */
function Harness({ inert = false }: { inert?: boolean }) {
  const [version, setVersion] = useState(0);
  const { capture, release } = useKeepPressedInPlace('[role=row]', version, false);
  return (
    <div
      onPointerDownCapture={capture}
      onPointerUpCapture={release}
      onPointerUp={() => !inert && setVersion((value) => value + 1)}
    >
      <div role="row">Documents</div>
      <button type="button" onClick={() => setVersion((value) => value + 1)}>
        Elsewhere
      </button>
    </div>
  );
}

/** The row's top: 300px until a change has rendered, then 184px (the rows above folded). */
function stubLayout() {
  const scroller = document.scrollingElement ?? document.documentElement;
  let top = 300;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ top }) as DOMRect,
  );
  Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 1000 });
  const scrollTo = vi.fn();
  scroller.scrollTo = scrollTo as typeof scroller.scrollTo;
  return {
    scroller,
    scrollTo,
    fold: () => {
      top = 184;
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  const scroller = document.scrollingElement ?? document.documentElement;
  Reflect.deleteProperty(scroller, 'scrollTop');
  Reflect.deleteProperty(scroller, 'scrollTo');
});

describe('useKeepPressedInPlace', () => {
  it('scrolls by as much as the pressed row moved, before the change paints', () => {
    const { scrollTo, fold } = stubLayout();
    render(<Harness />);
    const row = screen.getByRole('row');
    fireEvent.pointerDown(row);
    fold();
    fireEvent.pointerUp(row);
    expect(scrollTo).toHaveBeenCalledWith({ top: 884, behavior: 'instant' });
  });

  it('does nothing when the page scrolled between the press and the change', () => {
    const { scroller, scrollTo, fold } = stubLayout();
    render(<Harness />);
    const row = screen.getByRole('row');
    fireEvent.pointerDown(row);
    Object.defineProperty(scroller, 'scrollTop', { configurable: true, value: 1200 });
    fold();
    fireEvent.pointerUp(row);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('forgets a press that changed nothing, so a later change is not held', async () => {
    vi.useFakeTimers();
    try {
      const { scrollTo, fold } = stubLayout();
      render(<Harness inert />);
      const row = screen.getByRole('row');
      fireEvent.pointerDown(row);
      fireEvent.pointerUp(row);
      await act(() => vi.runAllTimersAsync());
      fold();
      fireEvent.click(screen.getByRole('button', { name: 'Elsewhere' }));
      expect(scrollTo).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
