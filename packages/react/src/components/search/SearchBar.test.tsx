import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';
import { IconButton } from '../icon-button/IconButton';
import { SearchAppBar } from './SearchAppBar';
import { SearchBar, type SearchBarView } from './SearchBar';

const Icon = () => <svg viewBox="0 0 24 24" />;

function Controlled(props: {
  view?: SearchBarView;
  onSubmit?: (v: string) => void;
  resultsAnnouncement?: string;
}) {
  const [query, setQuery] = useState('');
  return (
    <SearchBar
      aria-label="Search mail"
      placeholder="Search mail"
      value={query}
      onChange={setQuery}
      onSubmit={props.onSubmit}
      view={props.view}
      resultsAnnouncement={props.resultsAnnouncement}
      leadingIcon={({ expanded, collapse }) =>
        expanded ? <IconButton icon={<Icon />} aria-label="Back" onPress={collapse} /> : <Icon />
      }
      data-testid="search"
    >
      <button type="button">Suggestion one</button>
      <button type="button">Suggestion two</button>
    </SearchBar>
  );
}

describe('SearchBar', () => {
  it('renders a 56px pill search field with a placeholder', async () => {
    const { container } = render(<Controlled />);
    const input = screen.getByRole('combobox', { name: 'Search mail' });
    expect(input).toHaveAttribute('aria-haspopup', 'dialog');
    expect(input).toHaveAttribute('placeholder', 'Search mail');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveClass('text-body-large', 'placeholder:text-on-surface-variant');
    const field = input.parentElement!;
    // The bar sets the height once; the pill fills it, so a consumer `h-*` resizes both.
    expect(field).toHaveClass('h-full', 'rounded-corner-full', 'bg-surface-container-high');
    expect(screen.getByTestId('search')).toHaveClass(
      'h-[56px]',
      'w-[360px]',
      'max-w-[min(720px,100%)]',
    );
    expect(input.previousElementSibling).toHaveClass('ms-[4px]', 'size-[48px]', 'text-on-surface');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('pads the input 16px when it has no icons', () => {
    render(<SearchBar aria-label="Search" />);
    expect(screen.getByRole('combobox')).toHaveClass('ps-[16px]', 'pe-[16px]');
  });

  it('expands into a docked dialog on press, with focus in the expanded input', async () => {
    render(<Controlled />);
    await userEvent.click(screen.getByRole('combobox'));
    const dialog = screen.getByRole('dialog', { name: 'Search mail' });
    const expandedInput = screen.getByRole('searchbox', { name: 'Search mail' });
    expect(dialog).toContainElement(expandedInput);
    expect(expandedInput).toHaveFocus();
    expect(screen.getByTestId('search')).toHaveAttribute('data-expanded', 'true');
    expect(screen.getByText('Suggestion one').parentElement).toHaveClass(
      'rounded-[12px]',
      'mt-[2px]',
      'bg-surface-container-high',
      // M3: with the bar, at least 240px and at most 2/3 of the window tall.
      'min-h-[min(182px,calc(66.67dvh-58px))]',
      'max-h-[calc(66.67dvh-58px)]',
    );
    // The focused field widens by 12px on each side, from the bar's own bounds.
    const panel = dialog;
    expect(panel).toHaveClass(
      'left-(--m3-search-focused-left)',
      'w-(--m3-search-focused-width)',
      'motion-safe:starting:w-(--m3-search-width)',
    );
    const width = Number.parseFloat(panel.style.getPropertyValue('--m3-search-width'));
    expect(panel.style.getPropertyValue('--m3-search-focused-width')).toBe(`${width + 24}px`);
    // Typing into the expanded input updates the query; ↓ moves focus into the content.
    await userEvent.type(expandedInput, 'ab');
    expect(expandedInput).toHaveValue('ab');
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Suggestion one' })).toHaveFocus();
  });

  it('opens a 56px docked field centred on a shorter bar', async () => {
    render(<SearchBar aria-label="Search" className="h-[48px]" data-testid="search" />);
    const bar = screen.getByTestId('search');
    vi.spyOn(bar, 'getBoundingClientRect').mockReturnValue(new DOMRect(100, 200, 360, 48));
    await userEvent.click(screen.getByRole('combobox'));
    const dialog = screen.getByRole('dialog');
    // M3: the focused search bar container is 56dp tall, whatever the collapsed height.
    expect(screen.getByRole('searchbox').parentElement!.parentElement).toHaveClass('h-[56px]');
    expect(dialog.style.getPropertyValue('--m3-search-top')).toBe('196px');
  });

  it('expands as the user types or presses ↓, and submits with Enter', async () => {
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    const input = screen.getByRole('combobox');
    act(() => input.focus());
    fireEvent.change(input, { target: { value: 'c' } });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    const expanded = screen.getByRole('searchbox');
    expect(expanded).toHaveValue('c');
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('c');
    // M3: the query stays visible but not focused; focus moves to the results.
    expect(expanded).not.toHaveFocus();
    expect(expanded).toHaveValue('c');
    expect(screen.getByText('Suggestion one').parentElement).toHaveFocus();
  });

  it('announces the results politely while the view is open', async () => {
    const { rerender } = render(<Controlled resultsAnnouncement="2 suggestions" />);
    await userEvent.click(screen.getByRole('combobox'));
    const status = screen.getByRole('status');
    expect(status).toHaveClass('sr-only');
    await vi.waitFor(() => expect(status).toHaveTextContent('2 suggestions'));
    rerender(<Controlled resultsAnnouncement="No results" />);
    await vi.waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('No results'));
  });

  it('holds two trailing icon buttons, or an avatar at 30px', () => {
    render(
      <SearchBar
        aria-label="Search"
        trailingIcon={
          <>
            <IconButton icon={<Icon />} aria-label="Voice search" />
            <IconButton icon={<Icon />} aria-label="Clear" />
          </>
        }
      />,
    );
    const trailing = screen.getByRole('button', { name: 'Clear' }).parentElement!;
    expect(trailing).toContainElement(screen.getByRole('button', { name: 'Voice search' }));
    expect(trailing).toHaveClass('min-w-[48px]', 'h-[48px]', '[&>img]:size-[30px]');
    expect(trailing).not.toHaveClass('size-[48px]');
  });

  it('makes its icon buttons standard', () => {
    render(
      <SearchBar
        aria-label="Search"
        trailingIcon={<IconButton icon={<Icon />} aria-label="Voice search" />}
      />,
    );
    expect(screen.getByRole('button', { name: 'Voice search' })).toHaveClass('bg-transparent');
  });

  it('centres the text while collapsed on request', () => {
    render(<SearchBar aria-label="Search" textAlign="center" />);
    expect(screen.getByRole('combobox')).toHaveClass('text-center');
  });

  it('opens full screen and collapses from the leading back button', async () => {
    render(<Controlled view="full-screen" />);
    await userEvent.click(screen.getByRole('combobox'));
    const dialog = screen.getByRole('dialog');
    // M3 Expressive's contained style: a `surface-container-low` view, and the field keeps
    // its filled pill, 16px from each side.
    expect(dialog).toHaveClass('fixed', 'inset-0', 'bg-surface-container-low');
    const field = screen.getByRole('searchbox').parentElement!;
    expect(field).toHaveClass('bg-surface-container-high', 'rounded-corner-full');
    expect(field.parentElement).toHaveClass('start-[16px]', 'w-[calc(100%-32px)]');
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('search')).not.toHaveAttribute('data-expanded');
  });

  it('by default opens full screen on compact windows and docked on larger ones', async () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    render(<Controlled />);
    const bar = screen.getByTestId('search');
    // M3: "Full-screen layout: Default for compact breakpoints".
    expect(bar).toHaveAttribute('data-view', 'full-screen');
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('dialog')).toHaveClass('fixed', 'inset-0');
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    // Docked from the medium window class up ("Best for medium and expanded windows").
    act(() => setMediaQueries({ [COMPACT_WINDOW]: false }));
    expect(bar).toHaveAttribute('data-view', 'docked');
  });

  it('keeps an explicit view whatever the window', () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    render(<Controlled view="docked" />);
    expect(screen.getByTestId('search')).toHaveAttribute('data-view', 'docked');
  });

  it('follows controlled expansion', async () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(
      <SearchBar aria-label="Search" expanded={false} onExpandedChange={onExpandedChange} />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).toBe(null);
    rerender(<SearchBar aria-label="Search" expanded onExpandedChange={onExpandedChange} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(onExpandedChange).toHaveBeenLastCalledWith(false);
  });

  it('passes inputProps to both inputs, keeping its own role, name and state', async () => {
    const onKeyDown = vi.fn();
    const onSubmit = vi.fn();
    render(
      <SearchBar
        aria-label="Search mail"
        onSubmit={onSubmit}
        inputProps={{
          'aria-keyshortcuts': 'Control+K',
          'aria-describedby': 'hint',
          enterKeyHint: 'go',
          autoComplete: 'on',
          spellCheck: true,
          onKeyDown,
          // A consumer can't take over what the bar owns, even past the types.
          ...({ role: 'textbox', 'aria-label': 'Other', type: 'text' } as object),
        }}
      >
        <button type="button">Suggestion</button>
      </SearchBar>,
    );
    const collapsed = screen.getByRole('combobox', { name: 'Search mail' });
    for (const [name, value] of [
      ['aria-keyshortcuts', 'Control+K'],
      ['aria-describedby', 'hint'],
      ['enterkeyhint', 'go'],
      ['autocomplete', 'on'],
      ['spellcheck', 'true'],
      ['type', 'search'],
      ['aria-haspopup', 'dialog'],
    ] as const) {
      expect(collapsed).toHaveAttribute(name, value);
    }
    act(() => collapsed.focus());
    await userEvent.keyboard('{ArrowDown}');
    // The consumer's handler runs and the bar still expands.
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(collapsed).toHaveAttribute('aria-expanded', 'true');
    const expanded = screen.getByRole('searchbox', { name: 'Search mail' });
    expect(expanded).toHaveAttribute('aria-keyshortcuts', 'Control+K');
    expect(expanded).toHaveAttribute('enterkeyhint', 'go');
    expect(expanded).toHaveAttribute('type', 'search');
    await userEvent.keyboard('x{Enter}');
    expect(onKeyDown).toHaveBeenCalledTimes(3);
    expect(onSubmit).toHaveBeenCalledWith('x');
  });

  it('defaults the inputs to the search keyboard action, with no autocomplete', () => {
    render(<SearchBar aria-label="Search" />);
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('enterkeyhint', 'search');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('spellcheck', 'false');
  });

  it('requires a name in its types', () => {
    // @ts-expect-error aria-label or aria-labelledby is required
    const unnamed = <SearchBar placeholder="Search" />;
    expect(unnamed).toBeTruthy();
  });
});

describe('SearchAppBar', () => {
  it('lays out navigation, a full-width search bar and actions', async () => {
    const { container } = render(
      <SearchAppBar
        data-testid="bar"
        navigationIcon={<IconButton icon={<Icon />} aria-label="Menu" />}
        actions={<IconButton icon={<Icon />} aria-label="Account" />}
      >
        <SearchBar aria-label="Search" data-testid="search" />
      </SearchAppBar>,
    );
    const bar = screen.getByTestId('bar');
    expect(bar.tagName).toBe('HEADER');
    expect(bar).toHaveClass('min-h-[64px]', 'bg-surface', 'data-scrolled:bg-surface-container');
    // M3: it fills the free space up to 312px, then half of it.
    expect(screen.getByTestId('search')).toHaveClass('w-[max(min(100%,312px),50%)]');
    // The search container is `surface-container` in an app bar.
    expect(screen.getByRole('combobox').parentElement).toHaveClass('bg-surface-container');
    expect(screen.getByTestId('search').parentElement).toHaveClass(
      'flex-1',
      'justify-center',
      'ps-[8px]',
      'pt-[4px]',
    );
    expect(screen.getByRole('button', { name: 'Menu' }).parentElement).toHaveClass('ps-[8px]');
    expect(screen.getByRole('button', { name: 'Account' }).parentElement).toHaveClass(
      'pe-[8px]',
      'text-on-surface-variant',
    );
    expect(await axeViolations(container)).toEqual([]);
  });

  it('raises the search bar colour once content scrolls under it', async () => {
    render(
      <SearchAppBar data-testid="bar" scrollBehavior="pinned">
        <SearchBar aria-label="Search" />
      </SearchAppBar>,
    );
    const bar = screen.getByTestId('bar');
    expect(bar).toHaveClass('sticky');
    window.scrollY = 20;
    window.dispatchEvent(new Event('scroll'));
    await act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
    expect(bar).toHaveAttribute('data-scrolled', 'true');
    expect(screen.getByRole('combobox').parentElement).toHaveClass('bg-surface-container-highest');
    window.scrollY = 0;
  });
});
