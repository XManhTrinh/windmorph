import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { IconButton } from '../icon-button/IconButton';
import { SearchAppBar } from './SearchAppBar';
import { SearchBar } from './SearchBar';

const Icon = () => <svg viewBox="0 0 24 24" />;

function Controlled(props: { view?: 'docked' | 'full-screen'; onSubmit?: (v: string) => void }) {
  const [query, setQuery] = useState('');
  return (
    <SearchBar
      aria-label="Search mail"
      placeholder="Search mail"
      value={query}
      onChange={setQuery}
      onSubmit={props.onSubmit}
      view={props.view}
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
    );
    // Typing into the expanded input updates the query; ↓ moves focus into the content.
    await userEvent.type(expandedInput, 'ab');
    expect(expandedInput).toHaveValue('ab');
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Suggestion one' })).toHaveFocus();
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
  });

  it('opens full screen and collapses from the leading back button', async () => {
    render(<Controlled view="full-screen" />);
    await userEvent.click(screen.getByRole('combobox'));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('fixed', 'inset-0', 'bg-surface-container-high');
    expect(screen.getByRole('searchbox').parentElement).toHaveClass('bg-transparent');
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByTestId('search')).not.toHaveAttribute('data-expanded');
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
    expect(screen.getByTestId('search')).toHaveClass('w-full');
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
