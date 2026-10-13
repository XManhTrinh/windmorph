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

  it('pads 16px without icons and 8px beside a trailing icon', () => {
    render(
      <>
        <AssistChip>Plain</AssistChip>
        <AssistChip trailingIcon={<Icon id="t" />}>Trailing</AssistChip>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Plain' })).toHaveClass('ps-[16px]', 'pe-[16px]');
    expect(screen.getByRole('button', { name: 'Trailing' })).toHaveClass('ps-[16px]', 'pe-[8px]');
    expect(screen.getByTestId('t').parentElement).toHaveClass('ms-[8px]', 'size-[18px]');
  });

  it('can be elevated, a link, or disabled', () => {
    render(
      <>
        <AssistChip elevated>Elevated</AssistChip>
        <AssistChip href="/map">Directions</AssistChip>
        <AssistChip disabled>Off</AssistChip>
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
  });
});

describe('SuggestionChip', () => {
  it('uses on-surface-variant labels', () => {
    render(<SuggestionChip>Sounds good</SuggestionChip>);
    expect(screen.getByRole('button', { name: 'Sounds good' })).toHaveClass(
      'text-on-surface-variant',
      'rounded-corner-small',
    );
  });
});

describe('FilterChip', () => {
  it('toggles, morphing to round and growing a check', async () => {
    const onSelectedChange = vi.fn();
    const { container } = render(
      <FilterChip onSelectedChange={onSelectedChange}>Vegan</FilterChip>,
    );
    const chip = screen.getByRole('button', { name: 'Vegan' });
    expect(chip).toHaveAttribute('aria-pressed', 'false');
    expect(chip).toHaveClass(
      'rounded-corner-medium',
      'data-pressed:rounded-corner-small',
      'data-selected:not-data-pressed:rounded-[min(var(--md-sys-shape-corner-full),16px)]',
      'data-selected:bg-secondary-container',
      'data-selected:border-transparent',
      'ps-[16px]',
      'data-selected:ps-[8px]',
      'pe-[16px]',
    );
    const check = chip.querySelector('svg')!.closest('[aria-hidden]')!;
    expect(check).toHaveClass('grid-cols-[0fr]', 'in-data-selected:grid-cols-[1fr]');

    await userEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(chip).toHaveAttribute('data-selected', 'true');
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('follows Compose’s arrangement with icons', () => {
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
    expect(screen.getByTestId('l').parentElement).toHaveClass('me-[4px]');
    expect(screen.getByRole('button', { name: 'Trailing' })).toHaveClass('ps-[12px]', 'pe-[8px]');
    expect(screen.getByTestId('t').parentElement).toHaveClass('ms-[8px]');
    expect(screen.getByRole('button', { name: 'Both' })).toHaveClass('ps-[8px]', 'pe-[8px]');
    expect(screen.getByRole('button', { name: 'Both' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('t2').parentElement).toHaveClass('ms-[4px]');
  });

  it('can be elevated', () => {
    render(<FilterChip elevated>Elevated</FilterChip>);
    expect(screen.getByRole('button', { name: 'Elevated' })).toHaveClass(
      'bg-surface-container-low',
      'data-selected:bg-secondary-container',
    );
  });
});

describe('InputChip', () => {
  it('has an action and a remove button named after the label', async () => {
    const onPress = vi.fn();
    const onRemove = vi.fn();
    const { container } = render(
      <InputChip avatar={<img src="data:," alt="" />} onPress={onPress} onRemove={onRemove}>
        Alice
      </InputChip>,
    );
    const chip = screen.getByRole('button', { name: 'Alice' });
    const remove = screen.getByRole('button', { name: 'Remove Alice' });
    expect(chip.parentElement).toHaveClass('rounded-corner-medium', 'border-outline-variant');
    expect(chip).toHaveClass('ps-[4px]', 'pe-[4px]');
    expect(remove).toHaveClass('size-[24px]', 'rounded-full', '-mx-[3px]');
    expect(chip.parentElement).toHaveClass('pe-[8px]');

    await userEvent.click(chip);
    expect(onPress).toHaveBeenCalledOnce();
    await userEvent.click(remove);
    expect(onRemove).toHaveBeenCalledOnce();
    chip.focus();
    await userEvent.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows selection and disables both buttons', () => {
    render(
      <InputChip selected disabled onRemove={() => {}} removeLabel="Delete" data-testid="chip">
        Bob
      </InputChip>,
    );
    const root = screen.getByTestId('chip');
    expect(root).toHaveAttribute('data-selected', 'true');
    expect(root).toHaveAttribute('data-disabled', 'true');
    expect(root).toHaveClass('data-selected:bg-secondary-container');
    expect(screen.getByRole('button', { name: 'Bob' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bob' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Bob' })).toBeDisabled();
  });

  it('pads 12px with no icons or remove button', () => {
    render(<InputChip>Plain</InputChip>);
    expect(screen.getByRole('button', { name: 'Plain' })).toHaveClass('ps-[12px]', 'pe-[12px]');
  });
});
