import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef, type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
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
