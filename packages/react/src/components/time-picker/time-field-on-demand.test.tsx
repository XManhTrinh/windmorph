import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadControl, partOf, resetOnDemand } from '../../../test/on-demand';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';
import { TimeField } from './TimeField';

// The field's parts load through a mock loader, reset before each test (no fresh imports).
vi.mock('../../utils/load-on-demand', async (importOriginal) =>
  (await import('../../../test/on-demand')).mockOnDemand(importOriginal),
);

// The field's dialog and docked list: a test can hold their loads back, or fail them.
const dialog = loadControl('TimeFieldDialog');
const list = loadControl('TimeFieldList');
const parts = {
  set fail(fail: boolean) {
    dialog.fail = fail;
    list.fail = fail;
  },
  hold: () => {
    const releases = [dialog.hold(), list.hold()];
    return () => releases.forEach((release) => release());
  },
};

/** The times the field said its code failed to load (React's own warnings aside). */
const loadErrors = (error: { mock: { calls: unknown[][] } }) =>
  error.mock.calls.filter(([message]) => String(message).includes("couldn't load")).length;

beforeEach(() => {
  resetOnDemand();
  setMediaQueries({ [COMPACT_WINDOW]: false });
});

describe('TimeField code loaded on demand', () => {
  for (const presentation of ['dialog', 'docked'] as const) {
    it(`closes its ${presentation} picker on a failed load and, while it loads, on Escape, a press outside${presentation === 'dialog' ? ', typing' : ''} or focus moving on`, async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <>
          <TimeField label="Opens at" presentation={presentation} />
          <button type="button">Elsewhere</button>
        </>,
      );
      const button = screen.getByRole('button', { name: 'Open time picker' });
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
        // Nothing to point at yet: no list is in the page (a dialog never names one).
        if (presentation === 'docked') expect(button).not.toHaveAttribute('aria-controls');
      };
      await open();
      await userEvent.keyboard('{Escape}');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      await open();
      await userEvent.click(document.body);
      expect(button).toHaveAttribute('aria-expanded', 'false');
      if (presentation === 'dialog') {
        // Typing a time in the text box while nothing shows: the modal picker would cover it.
        await open();
        await userEvent.keyboard('9');
        expect(button).toHaveAttribute('aria-expanded', 'false');
      }
      await open();
      act(() => elsewhere.focus());
      expect(button).toHaveAttribute('aria-expanded', 'false');
      // The code coming in (the load itself, awaited) opens nothing and leaves focus where it went.
      await act(async () => {
        release();
        await partOf(presentation === 'dialog' ? 'TimeFieldDialog' : 'TimeFieldList').preload();
      });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(elsewhere).toHaveFocus();
      // The next open shows it.
      await userEvent.click(button);
      expect(
        await screen.findByRole(presentation === 'dialog' ? 'dialog' : 'listbox'),
      ).toBeInTheDocument();
      error.mockRestore();
    });
  }
});
