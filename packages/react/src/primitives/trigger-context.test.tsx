import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ButtonBase } from './ButtonBase';
import { TriggerContext } from './TriggerContext';

// Its own file: React logs an unknown-prop warning once per prop per module, so another
// test rendering a trigger first would hide it.
describe('TriggerContext', () => {
  it('passes React Aria press options to the press hook, not the DOM', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Menu triggers set preventFocusOnPress (React Aria useMenuTrigger).
    render(
      <TriggerContext value={{ preventFocusOnPress: true, 'aria-haspopup': 'menu' }}>
        <ButtonBase>Open</ButtonBase>
      </TriggerContext>,
    );
    const button = screen.getByRole('button', { name: 'Open' });
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).not.toHaveAttribute('preventfocusonpress');
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
