import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Checkbox } from '../components/checkbox/Checkbox';
import { List, ListItem } from '../components/list/List';
import { Radio, RadioGroup } from '../components/radio/RadioGroup';
import { Switch } from '../components/switch/Switch';

/** Presses the label text and returns the options each `focus()` on the input received. */
async function focusOptionsOnPress(ui: ReactElement, labelText: string, role: string) {
  const focus = vi.spyOn(HTMLElement.prototype, 'focus');
  render(ui);
  const input = screen.getByRole(role, { name: labelText });
  await userEvent.click(screen.getByText(labelText));
  expect(input).toHaveFocus();
  return focus.mock.contexts
    .map((context, index) => [context, focus.mock.calls[index]?.[0]] as const)
    .filter(([context]) => context === input)
    .map(([, options]) => options);
}

describe('hidden input focus', () => {
  afterEach(() => vi.restoreAllMocks());

  // A tap on the visible part of a control whose centre is above the window must not scroll
  // the page to the 1px hidden input.
  it.each([
    ['checkbox', <Checkbox key="c">Subscribe</Checkbox>, 'Subscribe', 'checkbox'],
    ['switch', <Switch key="s">Wi-Fi</Switch>, 'Wi-Fi', 'switch'],
    [
      'radio',
      <RadioGroup key="r" label="Size">
        <Radio value="small">Small</Radio>
        <Radio value="large">Large</Radio>
      </RadioGroup>,
      'Large',
      'radio',
    ],
    [
      'list switch row',
      <List key="ls" aria-label="Privacy">
        <ListItem key="online" control="switch">
          Show when online
        </ListItem>
      </List>,
      'Show when online',
      'switch',
    ],
    [
      'list checkbox row',
      <List key="lc" aria-label="Notify me about">
        <ListItem key="messages" control="checkbox">
          Messages
        </ListItem>
      </List>,
      'Messages',
      'checkbox',
    ],
    [
      'list radio row',
      <List key="lr" aria-label="Theme" defaultValue="light">
        <ListItem key="light" value="light">
          Light
        </ListItem>
        <ListItem key="dark" value="dark">
          Dark
        </ListItem>
      </List>,
      'Dark',
      'radio',
    ],
  ])('a pressed %s focuses its input without scrolling', async (_, ui, label, role) => {
    const calls = await focusOptionsOnPress(ui, label, role);
    expect(calls.length).toBeGreaterThan(0);
    for (const options of calls) expect(options).toMatchObject({ preventScroll: true });
  });

  it('still lets a caller ask for scrolling', () => {
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    render(<Checkbox>Subscribe</Checkbox>);
    const input = screen.getByRole('checkbox', { name: 'Subscribe' });
    input.focus({ preventScroll: false });
    expect(focus).toHaveBeenLastCalledWith({ preventScroll: false });
  });
});
