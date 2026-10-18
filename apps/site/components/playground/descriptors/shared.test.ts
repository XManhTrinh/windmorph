import { describe, expect, it } from 'vitest';
import { adjustToggleForm } from './shared';

const text = { noToggleVariant: 'text', fallbackVariant: 'filled' };

describe('adjustToggleForm', () => {
  it('moves a text button to filled when it becomes a toggle', () => {
    expect(adjustToggleForm({ variant: 'text', toggle: true }, 'toggle', text)).toMatchObject({
      variant: 'filled',
      toggle: true,
    });
  });

  it('turns the toggle off when the text variant is chosen', () => {
    expect(
      adjustToggleForm({ variant: 'text', toggle: true, selected: true }, 'variant', text),
    ).toMatchObject({ variant: 'text', toggle: false, selected: false });
  });

  it('makes a toggle of a button that is selected, and drops its link', () => {
    expect(adjustToggleForm({ selected: true, href: '/docs' }, 'selected')).toMatchObject({
      toggle: true,
      href: undefined,
    });
  });

  it('turns the toggle off when a link is set', () => {
    expect(
      adjustToggleForm({ toggle: true, selectedIcon: true, href: '/docs' }, 'href'),
    ).toMatchObject({ toggle: false, selectedIcon: false, href: '/docs' });
  });
});
