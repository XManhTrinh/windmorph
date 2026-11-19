import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from './use-media-query';

// The compact window's dialog, loaded on demand; a test can hold its load back, or fail it.
const parts = { fail: false, gate: Promise.resolve() };

/** The field's modules, imported afresh, so the test starts with nothing loaded. */
async function freshDateField() {
  vi.resetModules();
  vi.doMock('./CompactDateDialog', async (importOriginal) => {
    await parts.gate;
    if (parts.fail) throw new Error('The network is down');
    return importOriginal();
  });
  return (await import('./DateField')).DateField;
}

/** The times the field said its code failed to load (React's own warnings aside). */
const loadErrors = (error: { mock: { calls: unknown[][] } }) =>
  error.mock.calls.filter(([message]) => String(message).includes("couldn't load")).length;

afterEach(() => {
  setMediaQueries({ [COMPACT_WINDOW]: false });
  parts.fail = false;
  parts.gate = Promise.resolve();
});

describe('DateField code loaded on demand', () => {
  it('closes its compact dialog when its code fails to load, and loads it on the next open', async () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    const DateField = await freshDateField();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    parts.fail = true;
    render(<DateField label="Start date" />);
    const button = screen.getByRole('button', { name: 'Open calendar' });
    await userEvent.click(button);
    // Closed, not left open over nothing, and said in development.
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
    expect(loadErrors(error)).toBe(1);
    parts.fail = false;
    await userEvent.click(button);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    error.mockRestore();
  });

  it('closes its compact dialog opened while its code loads on Escape, a press outside or focus moving on', async () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    const DateField = await freshDateField();
    let release = () => {};
    parts.gate = new Promise<void>((resolve) => (release = resolve));
    render(
      <>
        <DateField label="Start date" />
        <button type="button">Elsewhere</button>
      </>,
    );
    const button = screen.getByRole('button', { name: 'Open calendar' });
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    const open = async () => {
      await userEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    };
    await open();
    await userEvent.keyboard('{Escape}');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await open();
    await userEvent.click(document.body);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await open();
    act(() => elsewhere.focus());
    expect(button).toHaveAttribute('aria-expanded', 'false');
    // The code coming in later opens nothing and leaves focus where it went.
    await act(async () => {
      release();
      await parts.gate;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(elsewhere).toHaveFocus();
  });
});
