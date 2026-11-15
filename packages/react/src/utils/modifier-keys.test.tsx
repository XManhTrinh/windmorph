import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../components/button/Button';

// A Mac, before React Aria first reads the platform (it keeps the answer): there it counts
// Option as typing, since Option with another key types a character.
Object.defineProperty(window.navigator, 'platform', { value: 'MacIntel', configurable: true });

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
});
