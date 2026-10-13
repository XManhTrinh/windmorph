import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COMPONENT_META } from '../../content/components/catalog';
import { RECENT_SEARCHES_KEY } from '../../lib/recent-searches';
import { DocsSearch } from './docs-search';
import { componentSearchEntry, GUIDE_ENTRIES, type SearchEntry } from './search-index';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const entries: SearchEntry[] = [
  ...GUIDE_ENTRIES,
  ...COMPONENT_META.map((page) => componentSearchEntry(page)),
];

const LABEL = 'Search documentation';

beforeEach(() => {
  // jsdom has no media queries; the search listens for the compact / medium boundary.
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
  window.localStorage.clear();
  push.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const dialog = () => screen.getByRole('dialog', { name: LABEL });
const searchbox = () => within(dialog()).getByRole('searchbox', { name: LABEL });

describe('DocsSearch', () => {
  it('opens with Ctrl+K from anywhere, and with / outside a field', async () => {
    const user = userEvent.setup();
    render(
      <>
        <input aria-label="Name" />
        <DocsSearch entries={entries} view="docked" />
      </>,
    );
    await user.keyboard('{Control>}k{/Control}');
    expect(searchbox()).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    // A slash typed into a field stays there.
    await user.click(screen.getByRole('textbox', { name: 'Name' }));
    await user.keyboard('/');
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue('/');
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(document.body);
    await user.keyboard('/');
    expect(searchbox()).toHaveFocus();
    expect(searchbox()).toHaveValue('');
  });

  it('advertises the shortcuts and shows the hint on the docked bar', () => {
    render(<DocsSearch entries={entries} view="docked" />);
    const input = screen.getByRole('combobox', { name: LABEL });
    expect(input).toHaveAttribute('aria-keyshortcuts', 'Meta+K Control+K /');
    expect(screen.getByText('Ctrl K')).toHaveAttribute('aria-hidden', 'true');
  });

  it('groups the results by category with a type label and the match emphasised', async () => {
    const user = userEvent.setup();
    render(<DocsSearch entries={entries} view="docked" />);
    await user.click(screen.getByRole('combobox', { name: LABEL }));
    await user.type(searchbox(), 'button');

    const actions = within(dialog()).getByRole('grid', { name: 'Actions' });
    const first = within(actions).getAllByRole('row')[0]!;
    expect(first).toHaveTextContent(/^Button.*Component$/);
    expect(first.querySelector('mark')).toHaveTextContent('Button');
    expect(within(dialog()).getByRole('heading', { name: 'Actions' })).toBeInTheDocument();
    await waitFor(() =>
      expect(within(dialog()).getByRole('status')).toHaveTextContent(/^\d+ results$/),
    );
  });

  it('opens a tab result on its tab', async () => {
    const user = userEvent.setup();
    render(<DocsSearch entries={entries} view="docked" />);
    await user.click(screen.getByRole('combobox', { name: LABEL }));
    await user.type(searchbox(), 'slider keyboard');
    const row = within(dialog()).getAllByRole('row')[0]!;
    expect(row).toHaveTextContent(/Accessibility$/);
    await user.click(row);
    expect(push).toHaveBeenCalledWith('/components/slider/accessibility');
  });

  it('Enter opens the best match and remembers the search', async () => {
    const user = userEvent.setup();
    render(<DocsSearch entries={entries} view="docked" />);
    await user.click(screen.getByRole('combobox', { name: LABEL }));
    await user.type(searchbox(), 'theming{Enter}');
    expect(push).toHaveBeenCalledWith('/theming');
    expect(JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY)!)).toEqual(['theming']);
  });

  it('lists recent searches and suggestions before anything is typed', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(['dialog', 'otp']));
    const user = userEvent.setup();
    render(<DocsSearch entries={entries} view="docked" />);
    await user.click(screen.getByRole('combobox', { name: LABEL }));

    const recent = within(dialog()).getByRole('grid', { name: 'Recent searches' });
    expect(
      within(recent)
        .getAllByRole('row')
        .map((row) => row.textContent),
    ).toEqual(['dialog', 'otp']);
    expect(within(dialog()).getByRole('grid', { name: 'Suggestions' })).toBeInTheDocument();
    await waitFor(() =>
      expect(within(dialog()).getByRole('status')).toHaveTextContent(
        '2 recent searches, 5 suggestions',
      ),
    );

    await user.click(
      within(recent).getByRole('button', { name: 'Remove dialog from recent searches' }),
    );
    expect(within(recent).getAllByRole('row')).toHaveLength(1);
    expect(searchbox()).toHaveFocus();

    await user.click(within(recent).getByRole('row', { name: /otp/ }));
    expect(searchbox()).toHaveValue('otp');
    expect(searchbox()).toHaveFocus();
    expect(within(dialog()).getByRole('row', { name: /PIN input/ })).toBeInTheDocument();
  });

  it('moves through every group with the arrow keys', async () => {
    const user = userEvent.setup();
    render(<DocsSearch entries={entries} view="docked" />);
    await user.click(screen.getByRole('combobox', { name: LABEL }));
    await user.type(searchbox(), 'button');
    const grids = within(dialog()).getAllByRole('grid');
    expect(grids.length).toBeGreaterThan(1);
    const firstRows = within(grids[0]!).getAllByRole('row');

    await user.keyboard('{ArrowDown}');
    expect(firstRows[0]).toHaveFocus();
    for (let step = 1; step < firstRows.length; step++) await user.keyboard('{ArrowDown}');
    expect(firstRows.at(-1)).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(within(grids[1]!).getAllByRole('row')[0]).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(firstRows.at(-1)).toHaveFocus();
    for (let step = 1; step < firstRows.length; step++) await user.keyboard('{ArrowUp}');
    await user.keyboard('{ArrowUp}');
    expect(searchbox()).toHaveFocus();
  });

  it('says when nothing matches and suggests pages', async () => {
    const user = userEvent.setup();
    render(<DocsSearch entries={entries} view="docked" />);
    await user.click(screen.getByRole('combobox', { name: LABEL }));
    await user.type(searchbox(), 'zzzz');
    expect(within(dialog()).getByText(/No results for/)).toHaveTextContent('No results for “zzzz”');
    expect(within(dialog()).getByRole('grid', { name: 'Suggestions' })).toBeInTheDocument();
    await waitFor(() =>
      expect(within(dialog()).getByRole('status')).toHaveTextContent('No results for zzzz'),
    );
  });

  it('clears the query from the clear button', async () => {
    const user = userEvent.setup();
    render(<DocsSearch entries={entries} view="full-screen" />);
    await user.click(screen.getByRole('combobox', { name: LABEL }));
    await user.type(searchbox(), 'menu');
    await user.click(within(dialog()).getByRole('button', { name: 'Clear search' }));
    expect(searchbox()).toHaveValue('');
    expect(searchbox()).toHaveFocus();
    // The full-screen view leads with a back button that closes it.
    await user.click(within(dialog()).getByRole('button', { name: 'Close search' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('works when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    const user = userEvent.setup();
    render(<DocsSearch entries={entries} view="docked" />);
    await user.click(screen.getByRole('combobox', { name: LABEL }));
    expect(within(dialog()).queryByRole('grid', { name: 'Recent searches' })).toBeNull();
    await user.type(searchbox(), 'theming{Enter}');
    expect(push).toHaveBeenCalledWith('/theming');
  });
});
