import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { IconButton } from '../icon-button/IconButton';
import { SearchField, type SearchFieldProps } from './SearchField';

const Icon = () => <svg viewBox="0 0 24 24" />;

function Field(props: Partial<SearchFieldProps>) {
  return (
    <SearchField
      aria-label="Search settings"
      placeholder="Search settings"
      leadingIcon={<Icon />}
      data-testid="field"
      {...(props as object)}
    />
  );
}

function Controlled(props: Partial<SearchFieldProps>) {
  const [query, setQuery] = useState('');
  return <Field value={query} onChange={setQuery} {...props} />;
}

const box = () => screen.getByRole('searchbox', { name: 'Search settings' });
const clearButton = () => screen.queryByRole('button', { name: 'Clear search' });

describe('SearchField', () => {
  it('is a search box with its name, drawn as the search bar’s pill filling its container', () => {
    render(<Field />);
    const input = box();
    expect(input).toHaveAttribute('type', 'search');
    expect(input).toHaveAttribute('placeholder', 'Search settings');
    expect(input).not.toHaveAttribute('aria-haspopup');
    expect(input).not.toHaveAttribute('aria-expanded');
    expect(input).toHaveClass('text-body-large', 'ps-[4px]', 'pe-[16px]');
    const pill = input.parentElement!;
    expect(pill).toHaveAttribute('data-tokens', 'md-comp-search-bar');
    expect(pill).toHaveClass(
      'h-full',
      'rounded-[var(--_md-comp-search-bar-container-shape)]',
      'bg-[var(--_md-comp-search-bar-container-color)]',
    );
    expect(screen.getByTestId('field')).toHaveClass(
      'h-[calc(56px+var(--md-sys-density,0)*4px)]',
      'w-full',
      'min-w-0',
    );
  });

  it('takes a density, or its scope’s when left out', () => {
    const { rerender } = render(<Field />);
    expect(screen.getByTestId('field')).not.toHaveAttribute('data-density');
    rerender(<Field density={-2} />);
    expect(screen.getByTestId('field')).toHaveAttribute('data-density', '-2');
    expect(document.querySelector('[data-slot="leading"]')).toHaveClass('max-h-full');
  });

  it('can be named by another element', () => {
    render(
      <>
        <h2 id="heading">Find a setting</h2>
        <SearchField aria-labelledby="heading" />
      </>,
    );
    expect(screen.getByRole('searchbox', { name: 'Find a setting' })).toBeInTheDocument();
  });

  it('is uncontrolled with a default value, and reports changes', async () => {
    const onChange = vi.fn();
    render(<Field defaultValue="Wi" onChange={onChange} />);
    await userEvent.type(box(), 'fi');
    expect(box()).toHaveValue('Wifi');
    expect(onChange).toHaveBeenLastCalledWith('Wifi');
  });

  it('clears on Escape, and a second Escape reaches what holds it', async () => {
    const outer = vi.fn();
    render(
      <div onKeyDown={(event) => event.key === 'Escape' && outer()}>
        <Controlled />
      </div>,
    );
    await userEvent.type(box(), 'Display');
    await userEvent.keyboard('{Escape}');
    expect(box()).toHaveValue('');
    expect(outer).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(outer).toHaveBeenCalledTimes(1);
    expect(box()).toHaveFocus();
  });

  it('shows the clear button only while there is text; it clears and keeps focus', async () => {
    render(<Controlled />);
    expect(clearButton()).toBeNull();
    await userEvent.type(box(), 'Sound');
    expect(clearButton()).toBeInTheDocument();
    await userEvent.click(clearButton()!);
    expect(box()).toHaveValue('');
    expect(box()).toHaveFocus();
    expect(clearButton()).toBeNull();
  });

  it('reaches the clear button by keyboard, which hands focus back to the input', async () => {
    render(<Controlled />);
    await userEvent.type(box(), 'Sound');
    await userEvent.tab();
    expect(clearButton()).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(box()).toHaveValue('');
    expect(box()).toHaveFocus();
  });

  it('keeps any trailing icon beside the clear button', async () => {
    render(<Controlled trailingIcon={<IconButton icon={<Icon />} aria-label="Voice search" />} />);
    const trailing = () => document.querySelector('[data-slot="trailing"]')!;
    expect(trailing().querySelectorAll('button')).toHaveLength(1);
    expect(box()).toHaveClass('pe-[4px]');
    await userEvent.type(box(), 'a');
    const buttons = [...trailing().querySelectorAll('button')];
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual([
      'Clear search',
      'Voice search',
    ]);
  });

  it('submits on Enter, not while an input method is composing', async () => {
    const onSubmit = vi.fn();
    render(<Controlled onSubmit={onSubmit} />);
    await userEvent.type(box(), 'Privacy');
    fireEvent.keyDown(box(), { key: 'Enter', isComposing: true });
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Privacy');
  });

  it('opens nothing on typing, a press or ↓', async () => {
    render(<Controlled />);
    await userEvent.click(box());
    await userEvent.keyboard('Battery{ArrowDown}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(box()).toHaveValue('Battery');
  });

  it('is disabled: no typing, no clear button, the disabled colours', async () => {
    render(<Field disabled defaultValue="Network" />);
    expect(box()).toBeDisabled();
    expect(clearButton()).toBeNull();
    expect(screen.getByTestId('field')).toHaveAttribute('data-disabled');
    const pill = box().parentElement!;
    expect(pill).toHaveClass('bg-on-surface/12');
    expect(pill).not.toHaveClass('bg-[var(--_md-comp-search-bar-container-color)]');
    expect(box()).toHaveClass('text-on-surface/38', 'placeholder:text-on-surface/38');
    expect(box()).not.toHaveClass('text-[color:var(--_md-comp-search-bar-input-text-color)]');
    expect(document.querySelector('[data-slot="leading"]')).toHaveClass('text-on-surface/38');
  });

  it('puts the caret in the input from a press on the pill around it', () => {
    render(<Field />);
    fireEvent.pointerDown(document.querySelector('[data-slot="leading"] svg')!, { button: 0 });
    expect(box()).toHaveFocus();
  });

  it('sends its id, descriptions and what it controls to the input', () => {
    render(
      <Field
        id="settings-search"
        aria-describedby="hint"
        aria-details="rules"
        aria-controls="results"
        inputProps={{ 'aria-describedby': 'more' }}
      />,
    );
    expect(box()).toHaveAttribute('id', 'settings-search');
    expect(box()).toHaveAttribute('aria-describedby', 'hint more');
    expect(box()).toHaveAttribute('aria-details', 'rules');
    expect(box()).toHaveAttribute('aria-controls', 'results');
    expect(screen.getByTestId('field')).not.toHaveAttribute('id');
  });

  it('takes input attributes, replacing the defaults and chaining handlers first', async () => {
    const onKeyDown = vi.fn();
    const onSubmit = vi.fn();
    render(
      <Controlled
        onSubmit={onSubmit}
        inputProps={{ enterKeyHint: 'go', spellCheck: true, onKeyDown, 'data-input': 'yes' }}
      />,
    );
    expect(box()).toHaveAttribute('enterkeyhint', 'go');
    expect(box()).toHaveAttribute('spellcheck', 'true');
    expect(box()).toHaveAttribute('autocomplete', 'off');
    expect(box()).toHaveAttribute('data-input', 'yes');
    expect(box()).toHaveAttribute('type', 'search');
    await userEvent.type(box(), 'x{Enter}');
    expect(onKeyDown).toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith('x');
  });

  it('lands every classNames key on its part, with className winning on the root', async () => {
    render(
      <Controlled
        trailingIcon={<Icon />}
        className="w-[240px]"
        classNames={{
          root: 'root-x w-[480px]',
          field: 'field-x',
          input: 'input-x',
          leading: 'leading-x',
          trailing: 'trailing-x',
          clear: 'clear-x',
        }}
      />,
    );
    await userEvent.type(box(), 'a');
    const root = screen.getByTestId('field');
    expect(root).toHaveClass('root-x', 'w-[240px]');
    expect(root).not.toHaveClass('w-[480px]', 'w-full');
    expect(box().parentElement).toHaveClass('field-x');
    expect(box()).toHaveClass('input-x');
    expect(document.querySelector('[data-slot="leading"]')).toHaveClass('leading-x');
    expect(document.querySelector('[data-slot="trailing"]')).toHaveClass('trailing-x');
    expect(clearButton()).toHaveClass('clear-x');
  });

  it('takes its own words and clear icon', async () => {
    render(
      <Controlled
        labels={{ clear: 'Effacer la recherche' }}
        clearIcon={<svg data-testid="own-clear" />}
      />,
    );
    await userEvent.type(box(), 'a');
    expect(screen.getByRole('button', { name: 'Effacer la recherche' })).toContainElement(
      screen.getByTestId('own-clear'),
    );
  });

  it('focuses itself on mount with autoFocus, and passes refs', () => {
    const ref = { current: null as HTMLDivElement | null };
    const inputRef = { current: null as HTMLInputElement | null };
    render(<Field autoFocus ref={ref} inputRef={inputRef} />);
    expect(box()).toHaveFocus();
    expect(ref.current).toBe(screen.getByTestId('field'));
    expect(inputRef.current).toBe(box());
  });

  it('renders on the server', () => {
    const html = renderToString(<Field defaultValue="Wi-Fi" />);
    expect(html).toContain('type="search"');
    expect(html).toContain('value="Wi-Fi"');
    expect(html).toContain('Clear search');
  });

  it('has no axe violations, empty, with text and disabled', async () => {
    const { container, rerender } = render(<Field />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<Field defaultValue="Wi-Fi" key="text" />);
    expect(await axeViolations(container)).toEqual([]);
    rerender(<Field defaultValue="Wi-Fi" disabled key="disabled" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
