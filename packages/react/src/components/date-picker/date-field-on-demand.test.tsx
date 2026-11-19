import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from './use-media-query';

// The compact window's dialog, loaded on demand; a test can fail its load.
const parts = { fail: false };

/** The field's modules, imported afresh, so the test starts with nothing loaded. */
async function freshDateField() {
  vi.resetModules();
  vi.doMock('./CompactDateDialog', async (importOriginal) => {
    if (parts.fail) throw new Error('The network is down');
    return importOriginal();
  });
  return (await import('./DateField')).DateField;
}

/** The times the field said its code failed to load (React's own warnings aside). */
const loadErrors = (error: { mock: { calls: unknown[][] } }) =>
  error.mock.calls.filter(([message]) => String(message).includes("couldn't load")).length;

afterEach(() => setMediaQueries({ [COMPACT_WINDOW]: false }));

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
});
