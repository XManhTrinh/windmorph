import { render, screen } from '@testing-library/react';
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
    expect(set).toHaveClass('flex', 'flex-wrap', 'gap-[8px]');
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
});
