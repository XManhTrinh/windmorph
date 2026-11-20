import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadControl, partOf, resetOnDemand } from '../../../test/on-demand';
import { setMediaQueries } from '../../../test/setup';
import { DateField } from './DateField';
import { COMPACT_WINDOW } from './use-media-query';

// The field's parts load through a mock loader, reset before each test (no fresh imports).
vi.mock('../../utils/load-on-demand', async (importOriginal) =>
  (await import('../../../test/on-demand')).mockOnDemand(importOriginal),
);

// The compact window's dialog: a test can hold its load back, or fail it.
const parts = loadControl('CompactDateDialog');

/** The times the field said its code failed to load (React's own warnings aside). */
const loadErrors = (error: { mock: { calls: unknown[][] } }) =>
  error.mock.calls.filter(([message]) => String(message).includes("couldn't load")).length;

beforeEach(() => resetOnDemand());
afterEach(() => setMediaQueries({ [COMPACT_WINDOW]: false }));

describe('DateField code loaded on demand', () => {
  it('closes its compact dialog on a failed load and, while it loads, on Escape, a press outside, typing or focus moving on', async () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <>
        <DateField label="Start date" />
        <button type="button">Elsewhere</button>
      </>,
    );
    const button = screen.getByRole('button', { name: 'Open calendar' });
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    // A failed load closes it, said in development.
    parts.fail = true;
    await userEvent.click(button);
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
    expect(loadErrors(error)).toBe(1);
    parts.fail = false;
    const release = parts.hold();
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
    // Typing a date in the text box while nothing shows: the full-screen dialog would cover it.
    await open();
    act(() => screen.getByRole('textbox', { name: 'Start date' }).focus());
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('1');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await open();
    act(() => elsewhere.focus());
    expect(button).toHaveAttribute('aria-expanded', 'false');
    // The code coming in (the load itself, awaited) opens nothing and leaves focus where it went.
    await act(async () => {
      release();
      await partOf('CompactDateDialog').preload();
    });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(elsewhere).toHaveFocus();
    // The next open shows it.
    await userEvent.click(button);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    error.mockRestore();
  });
});
