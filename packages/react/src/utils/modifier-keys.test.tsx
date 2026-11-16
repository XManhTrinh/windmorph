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

  // React Aria shows the ring of the invalid field a failed form check moves focus to; a
  // modifier alone put the pointer's modality back over it (2026-11-16).
  it('leave the ring of an invalid field a form check focuses', async () => {
    render(
      <>
        <Button>Send</Button>
        <input aria-label="Email" required />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    const email = screen.getByRole('textbox', { name: 'Email' });
    // What React Aria's form validation does with the first invalid field.
    await act(async () => {
      email.dispatchEvent(new Event('invalid', { cancelable: true }));
      email.focus();
      setInteractionModality('keyboard');
      await Promise.resolve();
    });
    const steps = [getInteractionModality()];
    await userEvent.keyboard('{Alt}');
    steps.push(getInteractionModality());
    expect(steps).toEqual(['keyboard', 'keyboard']);
  });

  // React Aria's unload teardown put the browser's `focus` back, without the guard's wrapper,
  // for good: the script focus above showed a ring again (2026-11-16).
  it('keep counting a script focus after React Aria sets its focus tracking up again', async () => {
    const { rerender } = render(<Button>Open</Button>);
    // A `beforeunload` the page stays on: React Aria tears its tracking down, and sets it up
    // again as a component renders.
    act(() => {
      window.dispatchEvent(new Event('beforeunload'));
    });
    rerender(
      <>
        <Button>Open</Button>
        <Button>Cancel</Button>
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    act(() => cancel.focus());
    await userEvent.keyboard('{Alt}');
    expect(getInteractionModality()).toBe('pointer');
    expect(cancel).not.toHaveAttribute('data-focus-visible');
  });

  it("still reaches the browser's focus when its wrapper is wrapped in turn", async () => {
    render(
      <>
        <Button>Open</Button>
        <Button>Cancel</Button>
      </>,
    );
    // Another script wraps `focus` over the guard's, as React Aria does when it sets up after it.
    const below = HTMLElement.prototype.focus;
    const wrapped = vi.fn(function (this: HTMLElement, ...args: Parameters<HTMLElement['focus']>) {
      below.apply(this, args);
    });
    Reflect.defineProperty(HTMLElement.prototype, 'focus', {
      configurable: true,
      writable: true,
      value: wrapped,
    });
    try {
      // The press leaves it there, the guard's wrapper under it: a call reaches both, once each.
      await userEvent.click(screen.getByRole('button', { name: 'Open' }));
      const cancel = screen.getByRole('button', { name: 'Cancel' });
      wrapped.mockClear();
      act(() => cancel.focus());
      expect(cancel).toHaveFocus();
      expect(wrapped).toHaveBeenCalledTimes(1);
      await userEvent.keyboard('{Alt}');
      expect(getInteractionModality()).toBe('pointer');
    } finally {
      Reflect.defineProperty(HTMLElement.prototype, 'focus', {
        configurable: true,
        writable: true,
        value: below,
      });
    }
  });

  // Round 3 wrapped `focus` again on every press, over whatever was there: a test's stub,
  // restored later only as a property, kept being called, and two copies of the library stacked
  // a wrap a press each (2026-11-16).
  it('never takes over a stub put on focus after it', async () => {
    render(
      <>
        <Button>Open</Button>
        <input aria-label="Name" />
      </>,
    );
    // A test's own stub, put back by hand afterwards.
    const before = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'focus')!;
    Reflect.defineProperty(HTMLElement.prototype, 'focus', {
      configurable: true,
      writable: true,
      value: () => {},
    });
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    Reflect.defineProperty(HTMLElement.prototype, 'focus', before);
    const name = screen.getByRole('textbox', { name: 'Name' });
    act(() => name.focus());
    expect(name).toHaveFocus();
  });

  it('is one guard a page, however many copies of the library it loads', async () => {
    render(<Button>Open</Button>);
    const focus = HTMLElement.prototype.focus;
    vi.resetModules();
    const copy = await import('./modifier-keys');
    function Other() {
      copy.useModifierKeysGuard();
      return null;
    }
    render(<Other />);
    expect(HTMLElement.prototype.focus).toBe(focus);
  });

  // A Tab from the browser's address bar reaches the page only as its key comes up, which React
  // Aria counts as keyboard use: Option alone hid that ring (2026-11-16).
  it('count a key that only comes up, as React Aria does', async () => {
    render(<Button>Save</Button>);
    const save = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(save);
    fireEvent.keyUp(save, { key: 'Tab' });
    expect(getInteractionModality()).toBe('keyboard');
    await userEvent.keyboard('{Alt}');
    expect(getInteractionModality()).toBe('keyboard');
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
