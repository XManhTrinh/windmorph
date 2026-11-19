import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { setMediaQueries } from '../../../test/setup';
import type * as LoadOnDemand from '../../utils/load-on-demand';
import type { OnDemandComponent } from '../../utils/load-on-demand';
import type { DateField as DateFieldComponent } from './DateField';
import { COMPACT_WINDOW } from './use-media-query';

// The compact window's dialog, loaded on demand; a test can hold its load back, or fail it.
const parts = { fail: false, gate: Promise.resolve() };
/** The parts loaded on demand, with their loaders' source. */
const made: { source: string; part: OnDemandComponent<object> }[] = [];
/** The part whose loader imports `module`. */
const partOf = (module: string) => made.find(({ source }) => source.includes(module))!.part;
let DateField: typeof DateFieldComponent;

// The field's modules, imported afresh for the file, so it starts with nothing loaded.
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
  vi.doMock('./CompactDateDialog', async (importOriginal) => {
    await parts.gate;
    if (parts.fail) throw new Error('The network is down');
    return importOriginal();
  });
  ({ DateField } = await import('./DateField'));
  // A fresh import of the field and all it imports: under a full run on two cores it takes as
  // long as a test may.
}, 20_000);

/** The times the field said its code failed to load (React's own warnings aside). */
const loadErrors = (error: { mock: { calls: unknown[][] } }) =>
  error.mock.calls.filter(([message]) => String(message).includes("couldn't load")).length;

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
    let release = () => {};
    parts.gate = new Promise<void>((resolve) => (release = resolve));
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
