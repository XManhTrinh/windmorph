import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';

// The field's dialog and docked list, loaded on demand; a test can hold their loads back, or
// fail them.
const parts = { fail: false, gate: Promise.resolve() };

/** The field's modules, imported afresh, so each test starts with nothing loaded. */
async function freshTimeField() {
  vi.resetModules();
  for (const part of ['./TimeFieldDialog', './TimeFieldList']) {
    vi.doMock(part, async (importOriginal) => {
      await parts.gate;
      if (parts.fail) throw new Error('The network is down');
      return importOriginal();
    });
  }
  return (await import('./TimeField')).TimeField;
}

/** The times the field said its code failed to load (React's own warnings aside). */
const loadErrors = (error: { mock: { calls: unknown[][] } }) =>
  error.mock.calls.filter(([message]) => String(message).includes("couldn't load")).length;

beforeEach(() => {
  parts.fail = false;
  parts.gate = Promise.resolve();
  setMediaQueries({ [COMPACT_WINDOW]: false });
});

describe('TimeField code loaded on demand', () => {
  for (const presentation of ['dialog', 'docked'] as const) {
    it(`closes its ${presentation} picker when its code fails to load, and loads it on the next open`, async () => {
      const TimeField = await freshTimeField();
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      parts.fail = true;
      render(<TimeField label="Opens at" presentation={presentation} />);
      const button = screen.getByRole('button', { name: 'Open time picker' });
      await userEvent.click(button);
      // Closed, not left open over nothing, and said in development.
      await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
      expect(loadErrors(error)).toBe(1);
      parts.fail = false;
      await userEvent.click(button);
      expect(
        await screen.findByRole(presentation === 'dialog' ? 'dialog' : 'listbox'),
      ).toBeInTheDocument();
      error.mockRestore();
    });
  }

  for (const presentation of ['dialog', 'docked'] as const) {
    it(`closes its ${presentation} picker opened while its code loads on Escape, a press outside or focus moving on`, async () => {
      const TimeField = await freshTimeField();
      let release = () => {};
      parts.gate = new Promise<void>((resolve) => (release = resolve));
      render(
        <>
          <TimeField label="Opens at" presentation={presentation} />
          <button type="button">Elsewhere</button>
        </>,
      );
      const button = screen.getByRole('button', { name: 'Open time picker' });
      const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
      const open = async () => {
        await userEvent.click(button);
        expect(button).toHaveAttribute('aria-expanded', 'true');
        // Nothing to point at yet: no list is in the page.
        expect(button).not.toHaveAttribute('aria-controls');
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
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(elsewhere).toHaveFocus();
    });
  }
});
