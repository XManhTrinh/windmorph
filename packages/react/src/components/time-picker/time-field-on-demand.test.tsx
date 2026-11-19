import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';
import type * as LoadOnDemand from '../../utils/load-on-demand';
import type { OnDemandComponent } from '../../utils/load-on-demand';
import type { TimeField as TimeFieldComponent } from './TimeField';

// The field's dialog and docked list, loaded on demand; a test can hold their loads back, or
// fail them.
const parts = { fail: false, gate: Promise.resolve() };
/** The parts loaded on demand, with their loaders' source. */
const made: { source: string; part: OnDemandComponent<object> }[] = [];
/** The part whose loader imports `module`. */
const partOf = (module: string) => made.find(({ source }) => source.includes(module))!.part;
let TimeField: typeof TimeFieldComponent;

// The field's modules, imported afresh once for the file: each test uses its own part, which
// starts with nothing loaded.
beforeAll(async () => {
  vi.resetModules();
  vi.doMock('../../utils/load-on-demand', async (importOriginal) => {
    const original = await importOriginal<typeof LoadOnDemand>();
    const onDemand: typeof original.onDemand = (load) => {
      const part = original.onDemand(load);
      made.push({ source: String(load), part: part as unknown as OnDemandComponent<object> });
      return part;
    };
    return { ...original, onDemand };
  });
  for (const part of ['./TimeFieldDialog', './TimeFieldList']) {
    vi.doMock(part, async (importOriginal) => {
      await parts.gate;
      if (parts.fail) throw new Error('The network is down');
      return importOriginal();
    });
  }
  ({ TimeField } = await import('./TimeField'));
  // A fresh import of the field and all it imports: under a full run on two cores it takes as
  // long as a test may.
}, 20_000);

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
      let release = () => {};
      parts.gate = new Promise<void>((resolve) => (release = resolve));
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
