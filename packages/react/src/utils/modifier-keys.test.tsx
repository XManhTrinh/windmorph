import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as ReactAria from 'react-aria';
import { setInteractionModality } from 'react-aria';
// Tests only: React Aria's main entry has no reader for the modality (3.53).
import { getInteractionModality } from 'react-aria/private/interactions/useFocusVisible';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from '../components/button/Button';

// The guard's own calls, counted; React Aria's internal ones don't go through the export.
vi.mock('react-aria', async (importOriginal) => {
  const actual = await importOriginal<typeof ReactAria>();
  return { ...actual, setInteractionModality: vi.fn(actual.setInteractionModality) };
});

// A Mac, before React Aria first reads the platform (it keeps the answer): there it counts
// Option as typing, since Option with another key types a character.
Object.defineProperty(window.navigator, 'platform', { value: 'MacIntel', configurable: true });

const guardCalls = vi.mocked(setInteractionModality);

afterEach(() => guardCalls.mockClear());

describe('modifier keys pressed alone', () => {
  it('never show the focus ring of a control focused by a pointer', async () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(button);
    expect(button).toHaveFocus();
    expect(button).not.toHaveAttribute('data-focus-visible');
    // Option alone, as a shortcut or a window switcher starts: still a pointer user.
    await userEvent.keyboard('{Alt}');
    expect(button).not.toHaveAttribute('data-focus-visible');
    await userEvent.keyboard('{CapsLock}');
    expect(button).not.toHaveAttribute('data-focus-visible');
    // A key that does something is keyboard use, and the ring shows.
    await userEvent.keyboard('{ArrowDown}');
    expect(button).toHaveAttribute('data-focus-visible');
    // Once the keyboard is in use, a modifier alone leaves the ring as it is.
    await userEvent.keyboard('{Alt}');
    expect(button).toHaveAttribute('data-focus-visible');
  });

  it("keep a screen reader's modality, and its rings, after a pointer press", async () => {
    render(
      <>
        <Button>Save</Button>
        <Button>Share</Button>
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    // Then a screen reader moves on and activates the next button with a click that has no
    // pointer (React Aria's virtual modality): the ring shows.
    const share = screen.getByRole('button', { name: 'Share' });
    act(() => {
      share.focus();
      fireEvent.click(share, { detail: 0 });
    });
    expect(getInteractionModality()).toBe('virtual');
    // Option alone used to put the pointer's modality back, as the last press was a pointer's,
    // which hides every ring; any other modality shows them.
    await userEvent.keyboard('{Alt}');
    expect(getInteractionModality()).not.toBe('pointer');
  });

  it("keep the pointer when a press moves focus by script, as a dialog's first control takes it", async () => {
    render(
      <>
        <Button>Open</Button>
        <Button>Cancel</Button>
      </>,
    );
    const open = screen.getByRole('button', { name: 'Open' });
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(open);
    // The press's own focus went to Open; the dialog it opens then focuses Cancel by script.
    act(() => cancel.focus());
    expect(cancel).toHaveFocus();
    await userEvent.keyboard('{Alt}');
    expect(getInteractionModality()).toBe('pointer');
    expect(cancel).not.toHaveAttribute('data-focus-visible');
  });

  it('keep the pointer through a held modifier, and leave the keyboard alone', async () => {
    render(<Button>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(button);
    // Option held down, repeating: React Aria counts each press as typing, and each time the
    // pointer's modality goes back.
    guardCalls.mockClear();
    await userEvent.keyboard('{Alt>3}{/Alt}');
    expect(getInteractionModality()).toBe('pointer');
    expect(button).not.toHaveAttribute('data-focus-visible');
    expect(guardCalls).toHaveBeenCalled();
    // With the keyboard in use, the key changes nothing, so the guard does nothing.
    await userEvent.keyboard('{ArrowDown}');
    guardCalls.mockClear();
    await userEvent.keyboard('{Alt>3}{/Alt}');
    expect(guardCalls).not.toHaveBeenCalled();
    expect(button).toHaveAttribute('data-focus-visible');
  });
});
