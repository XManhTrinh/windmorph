import { act, render, screen, waitFor } from '@testing-library/react';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { AssistChip, FilterChip, InputChip, SuggestionChip } from './Chip';
import { Overlay } from '../../primitives/Overlay';
import { ChipSet } from './ChipSet';

describe('ChipSet', () => {
  it('is a labelled group, 8px apart in rows 48px apart, with arrow keys and one Tab stop', async () => {
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
      'gap-y-[calc(48px-max(24px,calc(32px+var(--md-sys-density,0)*4px)))]',
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

  it('disables every chip in it when disabled, with no selection mode too', async () => {
    const onPress = vi.fn();
    const onRemove = vi.fn();
    const { container, rerender } = render(
      <ChipSet aria-label="Trip" disabled>
        <AssistChip onPress={onPress}>Add to calendar</AssistChip>
        <AssistChip href="/map">Open the map</AssistChip>
        <SuggestionChip onPress={onPress}>Sounds good</SuggestionChip>
        <FilterChip onSelectedChange={onPress}>Vegan</FilterChip>
        <FilterChip onSelectedChange={onPress} onRemove={onRemove}>
          Nearby
        </FilterChip>
        <InputChip onPress={onPress} onRemove={onRemove}>
          Alex
        </InputChip>
        <InputChip onRemove={onRemove} data-testid="sam">
          Sam
        </InputChip>
        <InputChip data-testid="static">Priya</InputChip>
      </ChipSet>,
    );
    // The group said it was disabled while every chip still worked.
    expect(screen.getByRole('group', { name: 'Trip' })).toHaveAttribute('aria-disabled', 'true');
    const buttons = screen.getAllByRole('button');
    expect(buttons.map((button) => button.textContent)).toEqual([
      'Add to calendar',
      'Sounds good',
      'Vegan',
      'Nearby',
      'Remove',
      'Alex',
      'Remove',
      'Remove',
    ]);
    for (const button of buttons) {
      expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    const link = screen.getByRole('link', { name: 'Open the map' });
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('data-disabled', 'true');
    // The containers of the chips made of two parts show the disabled style too.
    expect(screen.getByRole('button', { name: 'Nearby' }).parentElement).toHaveAttribute(
      'data-disabled',
      'true',
    );
    expect(screen.getByTestId('sam')).toHaveAttribute('data-disabled', 'true');
    // A chip with nothing to press shows it as well.
    expect(screen.getByTestId('static')).toHaveAttribute('data-disabled', 'true');
    expect(onPress).not.toHaveBeenCalled();
    expect(onRemove).not.toHaveBeenCalled();
    expect(await axeViolations(container)).toEqual([]);

    // With a selection, the chips outside it are disabled as well.
    rerender(
      <ChipSet aria-label="Trip" selectionMode="multiple" disabled>
        <FilterChip value="vegan">Vegan</FilterChip>
        <FilterChip>Spicy</FilterChip>
        <AssistChip onPress={onPress}>Clear filters</AssistChip>
      </ChipSet>,
    );
    for (const name of ['Vegan', 'Spicy', 'Clear filters']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });

  it('leaves chips in an overlay opened from the set out of it', () => {
    render(
      <ChipSet aria-label="Diet" selectionMode="multiple" defaultSelectedKeys={['vegan']} disabled>
        <FilterChip value="vegan">Vegan</FilterChip>
        {/* A dialog or a menu opened from a chip of the set: its content is in the set's
            React tree, and so in its contexts, though it is no part of the set. */}
        <Overlay>
          <FilterChip value="vegan">Vegan only</FilterChip>
          <AssistChip>Open now</AssistChip>
        </Overlay>
      </ChipSet>,
    );
    expect(screen.getByRole('button', { name: 'Vegan' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Vegan' })).toHaveAttribute('aria-pressed', 'true');
    // Neither disabled with the set, nor selected through it.
    expect(screen.getByRole('button', { name: 'Open now' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Vegan only' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Vegan only' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('reports a selection only when it changes', async () => {
    const onSelectionChange = vi.fn();
    render(
      <ChipSet
        aria-label="Size"
        selectionMode="multiple"
        defaultSelectedKeys={['m']}
        deselectable={false}
        onSelectionChange={onSelectionChange}
      >
        <FilterChip value="m">Medium</FilterChip>
        <FilterChip value="l">Large</FilterChip>
      </ChipSet>,
    );
    // The last selected chip of a set that keeps one selected: nothing changes.
    await userEvent.click(screen.getByRole('button', { name: 'Medium' }));
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'true');
    expect(onSelectionChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Large' }));
    expect(onSelectionChange).toHaveBeenCalledExactlyOnceWith(new Set(['m', 'l']));
  });

  it('keeps a set inside a disabled set disabled', () => {
    render(
      <ChipSet aria-label="Trip" disabled>
        <ChipSet aria-label="Diet" selectionMode="multiple">
          <FilterChip value="vegan">Vegan</FilterChip>
          <AssistChip>Clear filters</AssistChip>
        </ChipSet>
      </ChipSet>,
    );
    expect(screen.getByRole('group', { name: 'Diet' })).toHaveAttribute('aria-disabled', 'true');
    for (const name of ['Vegan', 'Clear filters']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });

  it("leaves a chip's own disabled alone in a set that isn't", () => {
    render(
      <ChipSet aria-label="Trip">
        <AssistChip disabled>Add to calendar</AssistChip>
        <SuggestionChip>Sounds good</SuggestionChip>
        <InputChip onRemove={() => {}}>Sam</InputChip>
      </ChipSet>,
    );
    expect(screen.getByRole('group', { name: 'Trip' })).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button', { name: 'Add to calendar' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Sounds good' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Remove Sam' })).toBeEnabled();
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

  it("lets an app's class replace the space between rows, and classNames.root land on the set", () => {
    const rowGap = 'gap-y-[calc(48px-max(24px,calc(32px+var(--md-sys-density,0)*4px)))]';
    const { rerender } = render(
      <ChipSet aria-label="Filters" className="gap-y-[8px]" classNames={{ root: 'from-slot' }}>
        <FilterChip>Open now</FilterChip>
      </ChipSet>,
    );
    const set = screen.getByRole('group', { name: 'Filters' });
    expect(set).toHaveClass('gap-y-[8px]', 'gap-x-[8px]', 'from-slot');
    expect(set).not.toHaveClass(rowGap);
    // A class for the other axis leaves the rows as they are.
    rerender(
      <ChipSet aria-label="Filters" className="gap-x-[16px]">
        <FilterChip>Open now</FilterChip>
      </ChipSet>,
    );
    expect(set).toHaveClass('gap-x-[16px]', rowGap);
    expect(set).not.toHaveClass('gap-x-[8px]');
  });

  it('leaves the set with Tab without scrolling to its last chip', async () => {
    render(
      <>
        <ChipSet aria-label="Filters" layout="scroll">
          <FilterChip>Open now</FilterChip>
          <FilterChip>Price</FilterChip>
          <FilterChip>Rating</FilterChip>
        </ChipSet>
        <button type="button">After</button>
      </>,
    );
    const last = screen.getByRole('button', { name: 'Rating' });
    const focus = vi.spyOn(last, 'focus');
    screen.getByRole('button', { name: 'Open now' }).focus();
    await userEvent.tab();
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
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

  it('scrolls the whole of a chip that holds its buttons into the row, not only the one focused', async () => {
    render(
      <ChipSet aria-label="Filters" layout="scroll">
        <FilterChip>Open now</FilterChip>
        <FilterChip onRemove={() => {}}>Rating</FilterChip>
      </ChipSet>,
    );
    const row = screen.getByRole('group', { name: 'Filters' });
    const open = screen.getByRole('button', { name: 'Open now' });
    const rating = screen.getByRole('button', { name: 'Rating' });
    const box = (left: number, right: number) => () =>
      ({ left, right, top: 0, bottom: 32, width: right - left, height: 32 }) as DOMRect;
    Object.defineProperty(row, 'scrollWidth', { value: 400 });
    Object.defineProperty(row, 'clientWidth', { value: 304 });
    row.getBoundingClientRect = box(0, 304);
    open.getBoundingClientRect = box(4, 222);
    // The toggle is in the row; the chip, with its remove button, reaches past the row's edge.
    rating.getBoundingClientRect = box(230, 290);
    rating.parentElement!.getBoundingClientRect = box(230, 330);
    open.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(rating).toHaveFocus();
    // The focus indicator is drawn round the chip: its end and the ring's 5px come into view.
    expect(row.scrollLeft).toBe(31);
  });

  it('leaves focus in an overlay opened from a single-select set where it is', () => {
    render(
      <ChipSet aria-label="Sort by" selectionMode="single" defaultSelectedKeys={['rating']}>
        <FilterChip value="price">Price</FilterChip>
        <FilterChip value="rating">Rating</FilterChip>
        {/* A dialog opened from a chip of the set: its focus events reach the set through
            React's tree, though it is no part of the set's own element. */}
        <Overlay>
          <ChipSet aria-label="Order" selectionMode="single" defaultSelectedKeys={['rising']}>
            <FilterChip value="rising">Rising</FilterChip>
            <FilterChip value="falling">Falling</FilterChip>
          </ChipSet>
        </Overlay>
      </ChipSet>,
    );
    // Tab into the inner set lands on its own selected chip, and stays there: the outer set
    // pulled focus back to its selected chip, behind the dialog.
    act(() => screen.getByRole('radio', { name: 'Falling' }).focus());
    expect(screen.getByRole('radio', { name: 'Rising' })).toHaveFocus();
  });
});
