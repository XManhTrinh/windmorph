import { render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { AssistChip, FilterChip, InputChip } from './Chip';
import { ChipSet } from './ChipSet';

describe('ChipSet', () => {
  it('is a labelled group, 8px apart, with arrow keys between chips and one Tab stop', async () => {
    const { container } = render(
      <>
        <button type="button">Before</button>
        <ChipSet aria-label="Actions">
          <AssistChip>Call</AssistChip>
          <AssistChip>Directions</AssistChip>
          <AssistChip>Share</AssistChip>
        </ChipSet>
        <button type="button">After</button>
      </>,
    );
    const set = screen.getByRole('group', { name: 'Actions' });
    expect(set).toHaveClass(
      'flex',
      'flex-wrap',
      'gap-x-[8px]',
      'gap-y-[calc(8px-max(-4px,var(--md-sys-density,0)*2px))]',
    );
    const [call, directions, share] = ['Call', 'Directions', 'Share'].map((name) =>
      screen.getByRole('button', { name }),
    );

    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.tab();
    expect(call).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(directions).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(share).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(share).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(call).toHaveFocus();
    await userEvent.keyboard('{End}{ArrowUp}');
    expect(directions).toHaveFocus();

    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(directions).toHaveFocus();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('reverses left and right in right-to-left layouts', async () => {
    render(
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <ChipSet aria-label="Actions">
          <AssistChip>Call</AssistChip>
          <AssistChip>Share</AssistChip>
        </ChipSet>
      </div>,
    );
    screen.getByRole('button', { name: 'Call' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Share' })).toHaveFocus();
  });

  it('moves through a chip and its remove button', async () => {
    render(
      <ChipSet aria-label="Recipients">
        <InputChip onPress={() => {}} onRemove={() => {}}>
          Alex
        </InputChip>
        <InputChip onRemove={() => {}}>Sam</InputChip>
      </ChipSet>,
    );
    screen.getByRole('button', { name: 'Alex' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Remove Alex' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Remove Sam' })).toHaveFocus();
  });

  it('keeps focus in the set when the focused chip is removed', async () => {
    function Recipients() {
      const [names, setNames] = useState(['Alex', 'Sam', 'Priya']);
      return (
        <ChipSet aria-label="Recipients">
          {names.map((name) => (
            <InputChip
              key={name}
              onPress={name === 'Alex' ? () => {} : undefined}
              onRemove={() => setNames((all) => all.filter((other) => other !== name))}
            >
              {name}
            </InputChip>
          ))}
        </ChipSet>
      );
    }
    const { container } = render(<Recipients />);
    // The next stop takes focus: past both of a two-part chip's stops.
    screen.getByRole('button', { name: 'Alex' }).focus();
    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    await userEvent.keyboard('{Delete}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove Sam' })).toHaveFocus());
    // The neighbour takes focus without scrolling the page (2026-10-15).
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    focus.mockRestore();
    // The last chip hands focus back to the one before it.
    screen.getByRole('button', { name: 'Remove Priya' }).focus();
    await userEvent.keyboard('{Backspace}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove Sam' })).toHaveFocus());
    // With no chips left, the set itself holds focus.
    await userEvent.keyboard('{Backspace}');
    await waitFor(() => expect(screen.getByRole('group', { name: 'Recipients' })).toHaveFocus());
    expect(await axeViolations(container)).toEqual([]);
  });

  it('leaves focus alone when it has moved on before a chip goes', async () => {
    function Later() {
      const [shown, setShown] = useState(true);
      return (
        <>
          <ChipSet aria-label="Tags">
            {shown && <InputChip onRemove={() => {}}>Draft</InputChip>}
          </ChipSet>
          <button type="button" onClick={() => setShown(false)}>
            Clear
          </button>
        </>
      );
    }
    render(<Later />);
    screen.getByRole('button', { name: 'Remove Draft' }).focus();
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveFocus();
  });

  it('shares one selection between its filter chips', async () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <ChipSet
        aria-label="Size"
        selectionMode="single"
        defaultSelectedKeys={['s']}
        onSelectionChange={onSelectionChange}
      >
        <FilterChip value="s">Small</FilterChip>
        <FilterChip value="m">Medium</FilterChip>
        <FilterChip value="l" onRemove={() => {}}>
          Large
        </FilterChip>
      </ChipSet>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Size' })).toBeInTheDocument();
    const small = screen.getByRole('radio', { name: 'Small' });
    const medium = screen.getByRole('radio', { name: 'Medium' });
    const large = screen.getByRole('radio', { name: 'Large' });
    expect(small).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(medium);
    expect(medium).toHaveAttribute('aria-checked', 'true');
    expect(small).toHaveAttribute('aria-checked', 'false');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['m']));
    await userEvent.click(large);
    expect(large).toHaveAttribute('aria-checked', 'true');
    expect(large.parentElement).toHaveAttribute('data-selected', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('selects with the arrow keys in single mode, wrapping, and Tab enters at the selection', async () => {
    const onSelectionChange = vi.fn();
    render(
      <>
        <button type="button">Before</button>
        <ChipSet
          aria-label="Size"
          selectionMode="single"
          defaultSelectedKeys={['m']}
          onSelectionChange={onSelectionChange}
        >
          <FilterChip value="s">Small</FilterChip>
          <FilterChip value="m">Medium</FilterChip>
          <FilterChip value="l">Large</FilterChip>
        </ChipSet>
      </>,
    );
    const radio = (name: string) => screen.getByRole('radio', { name });
    await userEvent.tab();
    await userEvent.tab();
    expect(radio('Medium')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(radio('Large')).toHaveFocus();
    expect(radio('Large')).toHaveAttribute('aria-checked', 'true');
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(['l']));
    await userEvent.keyboard('{ArrowDown}');
    expect(radio('Small')).toHaveFocus();
    expect(radio('Small')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{ArrowLeft}');
    expect(radio('Large')).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Home}');
    expect(radio('Small')).toHaveAttribute('aria-checked', 'true');
    expect(radio('Medium')).toHaveAttribute('aria-checked', 'false');
    // Tab leaves the set and Shift+Tab comes back to the selected chip.
    await userEvent.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    await userEvent.tab();
    expect(radio('Small')).toHaveFocus();
  });

  it('can scroll in one row', () => {
    render(
      <ChipSet aria-label="Filters" layout="scroll" className="custom">
        <FilterChip>Open now</FilterChip>
      </ChipSet>,
    );
    expect(screen.getByRole('group', { name: 'Filters' })).toHaveClass(
      'flex-nowrap',
      'overflow-x-auto',
      'custom',
    );
  });

  it('scrolls a chip the arrow keys reach fully into its row, ring included', async () => {
    render(
      <ChipSet aria-label="Filters" layout="scroll" selectionMode="single">
        <FilterChip value="open">Open now</FilterChip>
        <FilterChip value="rating">Rating</FilterChip>
      </ChipSet>,
    );
    const row = screen.getByRole('radiogroup', { name: 'Filters' });
    const [open, rating] = screen.getAllByRole('radio');
    const box = (left: number, right: number) => () =>
      ({ left, right, top: 0, bottom: 32, width: right - left, height: 32 }) as DOMRect;
    Object.defineProperty(row, 'scrollWidth', { value: 400 });
    Object.defineProperty(row, 'clientWidth', { value: 304 });
    row.getBoundingClientRect = box(0, 304);
    open!.getBoundingClientRect = box(4, 222);
    rating!.getBoundingClientRect = box(230, 321);
    open!.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(rating).toHaveFocus();
    expect(row.scrollLeft).toBe(22);
  });
});
