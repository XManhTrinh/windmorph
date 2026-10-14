import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PropsRecord } from '../lib/component-props';
import { axeViolations } from '../test/axe';
import { PropsList } from './props-list';

const PROPS: PropsRecord[] = [
  {
    name: 'variant',
    type: 'enum',
    required: true,
    defaultValue: '"standard"',
    description: '`standard` spaces the buttons apart;\n`connected` joins them.',
    options: ['standard', 'connected'],
    values: ['"standard"', '"connected"'],
  },
  {
    name: 'labels',
    type: 'Partial<SheetLabels>',
    required: false,
    description: 'Words the sheet announces. See {@link Badge}.',
    keys: [
      { name: 'labels.close', type: 'string', required: false, defaultValue: '"Close"' },
      { name: 'labels.handle', type: 'string', required: false, defaultValue: '"Drag"' },
    ],
  },
];

function renderList() {
  return render(<PropsList caption="BottomSheet props" scope="BottomSheet" props={PROPS} />);
}

beforeAll(() => {
  // jsdom lays nothing out, so it has no scrolling to do.
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('PropsList', () => {
  it('lists each prop in a named region: name, Required, type values, default, description', () => {
    renderList();
    const region = screen.getByRole('region', { name: 'BottomSheet props' });
    const [variant] = within(region).getAllByRole('listitem');
    expect(variant).toHaveAttribute('id', 'prop-BottomSheet-variant');
    // Reading order: name, required, then the type, the default and the description.
    expect(variant!.textContent).toMatch(
      /^variantRequired.*One of "standard""connected"Default"standard"standard spaces the buttons apart; connected joins them\./,
    );
    // Backticks become code, not literal text.
    expect(within(variant!).getByText('connected', { selector: 'p code' })).toBeInTheDocument();
    expect(within(variant!).getByRole('link', { name: 'Link to variant' })).toHaveAttribute(
      'href',
      '#prop-BottomSheet-variant',
    );
  });

  it("links a reference to its component's page", () => {
    renderList();
    expect(screen.getByRole('link', { name: 'Badge' })).toHaveAttribute(
      'href',
      '/components/badge/api',
    );
  });

  it("folds an object prop's keys behind a button that names how many there are", async () => {
    const user = userEvent.setup();
    renderList();
    const toggle = screen.getByRole('button', { name: '2 keys' });
    const keys = document.getElementById(toggle.getAttribute('aria-controls')!)!;
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(keys).not.toBeVisible();
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(keys).toBeVisible();
    expect(within(keys).getByText('labels.close')).toBeInTheDocument();
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the keys when the URL names one, on load and on a fragment change', async () => {
    window.history.replaceState(null, '', '#prop-BottomSheet-labels.close');
    const { unmount } = renderList();
    expect(screen.getByRole('button', { name: '2 keys' })).toHaveAttribute('aria-expanded', 'true');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    unmount();

    window.history.replaceState(null, '', '/');
    renderList();
    const toggle = screen.getByRole('button', { name: '2 keys' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await act(async () => {
      window.history.replaceState(null, '', '#prop-BottomSheet-labels.handle');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('folds a long union after its first members', async () => {
    const user = userEvent.setup();
    const countries = Array.from({ length: 20 }, (_, index) => `"C${index}"`);
    render(
      <PropsList
        caption="PhoneField props"
        scope="PhoneField"
        props={[{ name: 'country', type: 'enum', required: false, values: countries }]}
      />,
    );
    expect(screen.getByText('"C11"')).toBeVisible();
    expect(screen.getByText('"C12"')).not.toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Show all 20' }));
    expect(screen.getByText('"C19"')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Show fewer' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('has no axe violations', async () => {
    const { container } = renderList();
    expect(await axeViolations(container)).toEqual([]);
  });
});
