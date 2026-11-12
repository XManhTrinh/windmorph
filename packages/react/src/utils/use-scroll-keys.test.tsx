import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useScrollKeys } from './use-scroll-keys';

function Pane({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { tabIndex } = useScrollKeys(ref);
  return (
    <>
      <button type="button">Outside</button>
      <main ref={ref} tabIndex={tabIndex} data-testid="pane">
        {children}
      </main>
    </>
  );
}

const pane = () => screen.getByTestId('pane');

describe('useScrollKeys', () => {
  it('gives the element focus as a scroll key goes down with nothing focused', () => {
    render(<Pane>Text</Pane>);
    for (const key of ['PageDown', 'PageUp', 'Home', 'End', ' ', 'ArrowDown', 'ArrowUp']) {
      (document.activeElement as HTMLElement).blur();
      expect(document.activeElement).toBe(document.body);
      fireEvent.keyDown(document.body, { key });
      expect(document.activeElement, key).toBe(pane());
    }
    // Shift + Space scrolls up, so Shift is let through.
    pane().blur();
    fireEvent.keyDown(document.body, { key: ' ', shiftKey: true });
    expect(document.activeElement).toBe(pane());
  });

  it('leaves other keys, shortcuts and a focused control alone', () => {
    render(<Pane>Text</Pane>);
    for (const init of [
      { key: 'Tab' },
      { key: 'a' },
      { key: 'ArrowDown', metaKey: true },
      { key: 'End', ctrlKey: true },
      { key: 'Home', altKey: true },
    ]) {
      fireEvent.keyDown(document.body, init);
      expect(document.activeElement, JSON.stringify(init)).toBe(document.body);
    }
    const outside = screen.getByRole('button', { name: 'Outside' });
    outside.focus();
    fireEvent.keyDown(outside, { key: 'End' });
    expect(document.activeElement).toBe(outside);
  });

  it('is a tab stop only while it holds nothing that takes focus', async () => {
    const { rerender } = render(<Pane>Text only</Pane>);
    expect(pane()).toHaveAttribute('tabindex', '0');
    // A link arriving (a new page in the pane) takes the stop away, and going brings it back.
    rerender(
      <Pane>
        <a href="/next">Next</a>
      </Pane>,
    );
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '-1'));
    rerender(
      <Pane>
        <button type="button" disabled>
          Off
        </button>
      </Pane>,
    );
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '0'));
  });
});

/** A frame that stays mounted while the element behind its ref is left out, added or replaced. */
function Frame({ pane: shown }: { pane: 'none' | 'first' | 'second' }) {
  const ref = useRef<HTMLElement>(null);
  const { tabIndex } = useScrollKeys(ref);
  return shown === 'none' ? (
    <main data-testid="plain">A page without the pane</main>
  ) : (
    <main key={shown} ref={ref} tabIndex={tabIndex} data-testid="pane" data-pane={shown}>
      {shown === 'first' ? 'Text only' : <a href="/next">Next</a>}
    </main>
  );
}

describe('useScrollKeys, with another scrolling element on the page', () => {
  /** A pane, a side panel that scrolls by itself and can't take focus, and a rail that doesn't. */
  function WithSide({ side = true }: { side?: boolean }) {
    const ref = useRef<HTMLElement>(null);
    const { tabIndex } = useScrollKeys(ref);
    return (
      <>
        <nav data-testid="rail">Rail</nav>
        <main ref={ref} tabIndex={tabIndex} data-testid="pane">
          Text
        </main>
        {side && (
          <aside data-testid="side" style={{ overflowY: 'auto' }}>
            <p>Side text</p>
          </aside>
        )}
      </>
    );
  }

  /** Gives an element a content height and a box height: jsdom lays nothing out. */
  const size = (element: HTMLElement, scrollHeight: number, clientHeight: number) =>
    Object.defineProperties(element, {
      scrollHeight: { configurable: true, value: scrollHeight },
      clientHeight: { configurable: true, value: clientHeight },
    });

  it('leaves the keys with the scroller the person last pressed in', () => {
    render(<WithSide />);
    const side = screen.getByTestId('side');
    size(side, 900, 300);
    // Browsers scroll the side panel with the keys after a press in it: the pane stays out.
    fireEvent.pointerDown(side.querySelector('p')!);
    fireEvent.keyDown(document.body, { key: 'PageDown' });
    expect(document.activeElement).toBe(document.body);

    // A press on something that doesn't scroll: the keys would go to the window, so the pane
    // takes them.
    fireEvent.pointerDown(screen.getByTestId('rail'));
    fireEvent.keyDown(document.body, { key: 'PageDown' });
    expect(document.activeElement).toBe(pane());
  });

  it('takes the keys when that scroller has nothing to scroll, or has left the page', () => {
    const { rerender } = render(<WithSide />);
    const side = screen.getByTestId('side');
    size(side, 300, 300);
    fireEvent.pointerDown(side.querySelector('p')!);
    fireEvent.keyDown(document.body, { key: 'End' });
    expect(document.activeElement).toBe(pane());

    pane().blur();
    size(side, 900, 300);
    fireEvent.pointerDown(side.querySelector('p')!);
    rerender(<WithSide side={false} />);
    fireEvent.keyDown(document.body, { key: 'End' });
    expect(document.activeElement).toBe(pane());
  });

  it('takes the keys after a press in the pane itself', () => {
    render(<WithSide />);
    size(pane(), 900, 300);
    pane().style.overflowY = 'auto';
    fireEvent.pointerDown(pane());
    fireEvent.keyDown(document.body, { key: 'ArrowDown' });
    expect(document.activeElement).toBe(pane());
  });
});

describe('useScrollKeys, deciding the tab stop', () => {
  it('counts only what Tab would reach', async () => {
    const { rerender } = render(
      <Pane>
        <input type="hidden" name="token" />
        <div inert>
          <a href="/inert">In an inert part</a>
        </div>
        <div hidden>
          <button type="button">In a hidden part</button>
        </div>
        <fieldset disabled>
          <button type="button">In a disabled group</button>
        </fieldset>
        <a href="/skipped" tabIndex={-1}>
          Out of the tab order
        </a>
      </Pane>,
    );
    // Nothing above takes focus with Tab, so the pane is the stop.
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '0'));
    rerender(
      <Pane>
        <details>
          <summary>More</summary>
        </details>
      </Pane>,
    );
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '-1'));
  });

  it('reads the stop again when an attribute shows or hides a control', async () => {
    render(
      <Pane>
        <div hidden data-testid="part">
          <a href="/next">Next</a>
        </div>
      </Pane>,
    );
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '0'));
    screen.getByTestId('part').removeAttribute('hidden');
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '-1'));
    screen.getByTestId('part').setAttribute('inert', '');
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '0'));
  });

  it('ends its watch and its listeners when it unmounts', () => {
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    const { unmount } = render(<Pane>Text</Pane>);
    const element = pane();
    unmount();
    expect(disconnect).toHaveBeenCalled();
    document.body.append(element);
    fireEvent.keyDown(document.body, { key: 'PageDown' });
    expect(document.activeElement).toBe(document.body);
    element.remove();
    disconnect.mockRestore();
  });
});

describe('useScrollKeys, as the element behind the ref changes', () => {
  it('follows an element that replaces the first one', async () => {
    const { rerender } = render(<Frame pane="first" />);
    expect(pane()).toHaveAttribute('tabindex', '0');
    rerender(<Frame pane="none" />);
    fireEvent.keyDown(document.body, { key: 'PageDown' });
    expect(document.activeElement).toBe(document.body);

    rerender(<Frame pane="second" />);
    expect(pane()).toHaveAttribute('data-pane', 'second');
    fireEvent.keyDown(document.body, { key: 'PageDown' });
    expect(document.activeElement).toBe(pane());
    // The tab stop is read from the new element, and watched on it.
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '-1'));
    pane().querySelector('a')!.remove();
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '0'));
  });

  it('starts once the element arrives after the first render', async () => {
    const { rerender } = render(<Frame pane="none" />);
    rerender(<Frame pane="first" />);
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '0'));
    fireEvent.keyDown(document.body, { key: 'End' });
    expect(document.activeElement).toBe(pane());
  });

  it('follows an element a child swaps without the caller rendering', async () => {
    /** Called after each render of the component that calls the hook. */
    const rendered = vi.fn();
    /** Holds its own state, so a swap renders it alone. */
    function Swapping({
      paneRef,
      tabIndex,
    }: {
      paneRef: RefObject<HTMLElement | null>;
      tabIndex: number;
    }) {
      const [swapped, setSwapped] = useState(false);
      return (
        <>
          <button type="button" tabIndex={-1} onClick={() => setSwapped(true)}>
            Swap
          </button>
          <main key={String(swapped)} ref={paneRef} tabIndex={tabIndex} data-testid="pane">
            {swapped ? <a href="/next">Next</a> : 'Text only'}
          </main>
        </>
      );
    }
    function Outer() {
      const ref = useRef<HTMLElement>(null);
      const { tabIndex } = useScrollKeys(ref);
      useEffect(() => {
        rendered();
      });
      return <Swapping paneRef={ref} tabIndex={tabIndex} />;
    }
    render(<Outer />);
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '0'));
    const first = pane();
    const renders = rendered.mock.calls.length;
    fireEvent.click(screen.getByRole('button', { name: 'Swap' }));
    expect(pane()).not.toBe(first);
    expect(rendered).toHaveBeenCalledTimes(renders);

    // The next key finds the new element: it takes the scroll keys, and its tab stop is read.
    fireEvent.keyDown(document.body, { key: 'PageDown' });
    expect(document.activeElement).toBe(pane());
    await waitFor(() => expect(pane()).toHaveAttribute('tabindex', '-1'));
  });
});
