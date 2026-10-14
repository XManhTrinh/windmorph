import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { PropsRecord } from '../lib/component-props';
import { axeViolations } from '../test/axe';
import { PropsList, PropsReference } from './props-list';

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
  it('lists each prop in a named region: name, type, Required, default, then description', () => {
    renderList();
    const region = screen.getByRole('region', { name: 'BottomSheet props' });
    const [variant] = within(region).getAllByRole('listitem');
    expect(variant).toHaveAttribute('id', 'prop-BottomSheet-variant');
    // Reading order: name, type, Required, default, then the description.
    expect(variant!.textContent).toMatch(
      /^varianttype "standard" \| "connected"Required= default "standard"standard spaces the buttons apart; connected joins them\./,
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

  it("groups a component's props under subheads and folds Styling", async () => {
    const user = userEvent.setup();
    render(
      <PropsList
        caption="Dialog props"
        scope="Dialog"
        grouped
        props={[
          { name: 'className', type: 'string', required: false },
          { name: 'open', type: 'boolean', required: false },
          { name: 'children', type: 'ReactNode', required: true },
          { name: 'onOpenChange', type: '(open: boolean) => void', required: false },
        ]}
      />,
    );
    expect(
      screen.getAllByRole('heading', { level: 4 }).map((heading) => heading.textContent),
    ).toEqual(['Events', 'Styling (1)']);
    // Required props lead their group.
    const [first] = screen.getAllByRole('listitem');
    expect(first).toHaveAttribute('data-prop', 'children');
    const styling = screen.getByRole('button', { name: 'Styling (1)' });
    expect(styling).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('className')).not.toBeVisible();
    await user.click(styling);
    expect(screen.getByText('className')).toBeVisible();
  });

  it('has no axe violations', async () => {
    const { container } = renderList();
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('PropsReference', () => {
  const many = (prefix: string, count: number): PropsRecord[] =>
    Array.from({ length: count }, (_, index) => ({
      name: `${prefix}${index}`,
      type: 'string',
      required: false,
      description: index === 0 ? 'Names the scrim.' : 'Something else.',
    }));

  it('heads each component with its name and prop count', () => {
    render(<PropsReference components={[{ name: 'Divider', props: many('inset', 2) }]} />);
    expect(screen.getByRole('heading', { level: 3, name: 'Divider 2 props' })).toHaveAttribute(
      'id',
      'props-Divider',
    );
    // A short page has no filter.
    expect(screen.queryByRole('textbox', { name: 'Filter props' })).toBeNull();
  });

  it('filters every list by name and description, announcing the count', async () => {
    const user = userEvent.setup();
    render(
      <PropsReference
        components={[
          {
            name: 'Dialog',
            props: [
              ...many('a', 8),
              {
                name: 'classNames',
                type: 'X',
                required: false,
                keys: [
                  {
                    name: 'classNames.scrim',
                    type: 'string',
                    required: false,
                    description: 'The scrim.',
                  },
                ],
              },
            ],
          },
          { name: 'DialogTitle', props: many('b', 6) },
        ]}
      />,
    );
    const field = screen.getByRole('textbox', { name: 'Filter props' });
    await user.type(field, 'scrim');
    // `a0` and `b0` by description, `classNames.scrim` by name; its fold opens.
    expect(screen.getByRole('status')).toHaveTextContent('3 props match');
    expect(screen.getByText('a1').closest('li')).toHaveAttribute('data-filtered-out');
    expect(screen.getByText('classNames.scrim')).toBeVisible();
    await user.clear(field);
    await user.type(field, 'nothing like it');
    expect(screen.getByRole('status')).toHaveTextContent('No props match');
    expect(screen.getByText(/No props match “nothing like it”/)).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(field).toHaveValue('');
    expect(field).toHaveFocus();
    expect(screen.getByText('a1').closest('li')).not.toHaveAttribute('data-filtered-out');
  });
});
