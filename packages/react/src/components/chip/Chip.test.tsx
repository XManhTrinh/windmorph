import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { AssistChip, FilterChip, InputChip, SuggestionChip } from './Chip';

const Icon = ({ id = 'icon' }: { id?: string }) => <svg data-testid={id} viewBox="0 0 24 24" />;

describe('AssistChip', () => {
  it('is a 32px button with 8px corners, an outline and a primary icon', async () => {
    const onPress = vi.fn();
    const { container } = render(
      <AssistChip leadingIcon={<Icon />} onPress={onPress}>
        Add to calendar
      </AssistChip>,
    );
    const chip = screen.getByRole('button', { name: 'Add to calendar' });
    expect(chip).toHaveClass(
      'h-[32px]',
      'rounded-corner-small',
      'border-outline-variant',
      'text-on-surface',
      'text-label-large',
      'ps-[8px]',
      'pe-[16px]',
    );
    expect(screen.getByTestId('icon').parentElement).toHaveClass('text-primary', 'me-[8px]');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(chip.querySelector('[data-touch-target]')).not.toBeNull();
    await userEvent.click(chip);
    expect(onPress).toHaveBeenCalledOnce();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('pads 16px without icons', () => {
    render(<AssistChip>Plain</AssistChip>);
    expect(screen.getByRole('button', { name: 'Plain' })).toHaveClass('ps-[16px]', 'pe-[16px]');
  });

  it('can be elevated, a link, disabled, or strongly outlined', () => {
    render(
      <>
        <AssistChip elevated>Elevated</AssistChip>
        <AssistChip href="/map">Directions</AssistChip>
        <AssistChip disabled>Off</AssistChip>
        <AssistChip outline="strong">Strong</AssistChip>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Elevated' })).toHaveClass(
      'bg-surface-container-low',
      'shadow-elevation-1',
      'data-hovered:shadow-elevation-2',
    );
    expect(screen.getByRole('button', { name: 'Elevated' })).not.toHaveClass('border');
    expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute('href', '/map');
    expect(screen.getByRole('button', { name: 'Off' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Strong' })).toHaveClass('border-outline');
    expect(screen.getByRole('button', { name: 'Strong' })).not.toHaveClass(
      'border-outline-variant',
    );
  });
});

describe('SuggestionChip', () => {
  it('uses on-surface-variant labels and 8px corners', () => {
    render(<SuggestionChip>Sounds good</SuggestionChip>);
    expect(screen.getByRole('button', { name: 'Sounds good' })).toHaveClass(
      'text-on-surface-variant',
      'rounded-corner-small',
    );
  });
});

describe('FilterChip', () => {
  it('toggles with 8px corners, growing a check', async () => {
    const onSelectedChange = vi.fn();
    const { container } = render(
      <FilterChip onSelectedChange={onSelectedChange}>Vegan</FilterChip>,
    );
    const chip = screen.getByRole('button', { name: 'Vegan' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    expect(chip).toHaveClass(
      'rounded-corner-small',
      'data-selected:bg-secondary-container',
      'data-selected:border-transparent',
      'ps-[16px]',
      'data-selected:ps-[8px]',
      'pe-[16px]',
    );
    expect(chip.className).not.toMatch(/rounded-corner-medium|rounded-\[min/);
    const check = chip.querySelector('svg')!.closest('[aria-hidden]')!;
    expect(check).toHaveClass('grid-cols-[0fr]', 'in-data-selected:grid-cols-[1fr]');
    expect(chip.querySelector('svg')!.parentElement).toHaveClass('me-[8px]');

    await userEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(chip).toHaveAttribute('data-selected', 'true');
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('pads 8px beside icons and 8px between elements, with a primary leading icon', () => {
    render(
      <>
        <FilterChip leadingIcon={<Icon id="l" />}>Leading</FilterChip>
        <FilterChip trailingIcon={<Icon id="t" />}>Trailing</FilterChip>
        <FilterChip leadingIcon={<Icon id="l2" />} trailingIcon={<Icon id="t2" />} selected>
          Both
        </FilterChip>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Leading' })).toHaveClass('ps-[8px]', 'pe-[16px]');
    expect(screen.getByTestId('l').parentElement).toHaveClass(
      'me-[8px]',
      'text-primary',
      'group-data-selected/chip:text-on-secondary-container',
    );
    expect(screen.getByRole('button', { name: 'Trailing' })).toHaveClass('ps-[16px]', 'pe-[8px]');
    expect(screen.getByTestId('t').parentElement).toHaveClass('ms-[8px]');
    expect(screen.getByRole('button', { name: 'Both' })).toHaveClass('ps-[8px]', 'pe-[8px]');
    expect(screen.getByRole('button', { name: 'Both' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('t2').parentElement).toHaveClass('ms-[8px]');
  });

  it('can be elevated', () => {
    render(<FilterChip elevated>Elevated</FilterChip>);
    expect(screen.getByRole('button', { name: 'Elevated' })).toHaveClass(
      'bg-surface-container-low',
      'data-selected:bg-secondary-container',
    );
  });

  it('can have a remove button as a second focus stop', async () => {
    const onRemove = vi.fn();
    const onSelectedChange = vi.fn();
    const { container } = render(
      <FilterChip onRemove={onRemove} onSelectedChange={onSelectedChange}>
        Nearby
      </FilterChip>,
    );
    const toggle = screen.getByRole('button', { name: 'Nearby' });
    const remove = screen.getByRole('button', { name: 'Remove Nearby' });
    const root = toggle.parentElement!;
    expect(root).toHaveClass('min-w-[88px]', 'rounded-corner-small', 'pe-[8px]');
    expect(toggle).toHaveClass('ps-[16px]');
    expect(remove.querySelector('[data-touch-target]')).not.toBeNull();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(root).toHaveAttribute('data-selected', 'true');
    expect(onSelectedChange).toHaveBeenCalledWith(true);

    await userEvent.tab();
    expect(remove).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onRemove).toHaveBeenCalledOnce();
    toggle.focus();
    await userEvent.keyboard('{Delete}');
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('InputChip', () => {
  it('has an action and a remove button named after the label', async () => {
    const onPress = vi.fn();
    const onRemove = vi.fn();
    const { container } = render(
      <InputChip avatar={<img src="data:," alt="" />} onPress={onPress} onRemove={onRemove}>
        Alex
      </InputChip>,
    );
    const chip = screen.getByRole('button', { name: 'Alex' });
    const remove = screen.getByRole('button', { name: 'Remove Alex' });
    const root = chip.parentElement!;
    expect(root).toHaveClass(
      'rounded-corner-small',
      'border-outline-variant',
      'min-w-[88px]',
      'pe-[8px]',
    );
    expect(chip).toHaveClass('ps-[4px]');
    expect(root.querySelector('img')!.parentElement).toHaveClass('rounded-corner-medium');
    expect(root.querySelector('img')!.parentElement!.parentElement).toHaveClass('me-[8px]');
    expect(remove).toHaveClass('size-[24px]', 'rounded-full', 'focus-ring');
    expect(remove.querySelector('[data-touch-target]')).not.toBeNull();

    await userEvent.click(chip);
    expect(onPress).toHaveBeenCalledOnce();
    await userEvent.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
    chip.focus();
    await userEvent.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('is one focus stop when removing is its only action', async () => {
    const onRemove = vi.fn();
    const { container } = render(
      <>
        <button type="button">Before</button>
        <InputChip onRemove={onRemove} data-testid="chip">
          Sam
        </InputChip>
        <button type="button">After</button>
      </>,
    );
    expect(screen.queryByRole('button', { name: 'Sam' })).toBeNull();
    const remove = screen.getByRole('button', { name: 'Remove Sam' });
    expect(screen.getByTestId('chip')).toHaveClass(
      'min-w-[88px]',
      'has-data-focus-visible:[outline:var(--md-sys-focus-indicator-thickness)_solid_var(--md-sys-color-secondary)]',
    );
    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.tab();
    expect(remove).toHaveFocus();
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
    remove.focus();
    await userEvent.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledOnce();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows selection and disables both buttons', () => {
    render(
      <InputChip
        selected
        disabled
        onPress={() => {}}
        onRemove={() => {}}
        removeLabel="Delete"
        data-testid="chip"
      >
        Priya
      </InputChip>,
    );
    const root = screen.getByTestId('chip');
    expect(root).toHaveAttribute('data-selected', 'true');
    expect(root).toHaveAttribute('data-disabled', 'true');
    expect(root).toHaveClass('data-selected:bg-secondary-container');
    expect(screen.getByRole('button', { name: 'Priya' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Priya' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Priya' })).toBeDisabled();
  });

  it('pads 12px with no icons or remove button, and is static without actions', () => {
    render(<InputChip data-testid="chip">Plain</InputChip>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Plain').closest('[data-chip-primary]')).toHaveClass(
      'ps-[12px]',
      'pe-[12px]',
    );
  });
});
