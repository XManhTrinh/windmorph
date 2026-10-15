import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { AssistChip, FilterChip, InputChip, SuggestionChip } from './Chip';
import { ChipSet } from './ChipSet';

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
    expect(chip).toHaveAttribute('data-tokens', 'md-comp-assist-chip');
    expect(chip).not.toHaveAttribute('data-elevated');
    expect(chip).toHaveClass(
      'h-fit',
      'min-h-[var(--m3-chip-height)]',
      '[--m3-chip-height:max(24px,calc(32px+var(--md-sys-density,0)*4px))]',
      'rounded-[var(--_md-comp-assist-chip-container-shape)]',
      'border-[color:var(--_md-comp-assist-chip-flat-outline-color)]',
      'text-[color:var(--_md-comp-assist-chip-label-text-color)]',
      'text-label-large',
      'ps-[calc(8px-var(--m3-chip-border))]',
      'pe-[calc(16px-var(--m3-chip-border))]',
    );
    expect(screen.getByTestId('icon').parentElement).toHaveClass(
      'text-[color:var(--_md-comp-assist-chip-with-icon-icon-color)]',
      'me-[8px]',
    );
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('data-slot', 'leading');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(chip.querySelector('[data-touch-target]')).not.toBeNull();
    await userEvent.click(chip);
    expect(onPress).toHaveBeenCalledOnce();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('takes the flat border out of its padding, and darkens the border on keyboard focus', () => {
    render(
      <>
        <AssistChip>Flat</AssistChip>
        <AssistChip elevated>Raised</AssistChip>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Flat' })).toHaveClass(
      'border',
      '[--m3-chip-border:1px]',
      'data-focus-visible:border-on-surface',
    );
    expect(screen.getByRole('button', { name: 'Raised' })).toHaveClass('[--m3-chip-border:0px]');
    expect(screen.getByRole('button', { name: 'Raised' }).className).not.toContain(
      'data-focus-visible:border',
    );
  });

  it('pads 16px without icons', () => {
    render(<AssistChip>Plain</AssistChip>);
    expect(screen.getByRole('button', { name: 'Plain' })).toHaveClass(
      'ps-[calc(16px-var(--m3-chip-border))]',
      'pe-[calc(16px-var(--m3-chip-border))]',
    );
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
    expect(screen.getByRole('button', { name: 'Elevated' })).toHaveAttribute(
      'data-elevated',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Elevated' })).toHaveClass(
      'bg-[var(--_md-comp-assist-chip-elevated-container-color)]',
      'shadow-elevation-1',
      'data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-2',
    );
    expect(screen.getByRole('button', { name: 'Elevated' })).not.toHaveClass('border');
    // The press never raises it: hover's level 2 waits until the press ends (level 1).
    expect(screen.getByRole('button', { name: 'Elevated' }).className).not.toMatch(
      /(^| )data-hovered:shadow-elevation-2|data-pressed:shadow-elevation-2/,
    );
    expect(screen.getByRole('link', { name: 'Directions' })).toHaveAttribute('href', '/map');
    expect(screen.getByRole('button', { name: 'Off' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Strong' })).toHaveClass('border-outline');
    expect(screen.getByRole('button', { name: 'Strong' })).not.toHaveClass(
      'border-[color:var(--_md-comp-assist-chip-flat-outline-color)]',
    );
  });

  it('lets consumer colour, corner and border classes replace the token classes', () => {
    render(
      <AssistChip className="bg-tertiary text-on-tertiary rounded-corner-medium border-primary">
        Mine
      </AssistChip>,
    );
    const chip = screen.getByRole('button', { name: 'Mine' });
    expect(chip).toHaveClass('bg-tertiary', 'text-on-tertiary', 'rounded-corner-medium');
    expect(chip).toHaveClass('border-primary');
    expect(chip.className).not.toMatch(
      /(^| )(rounded|text|border)-\[[^\]]*--_md-comp-assist-chip-/,
    );
  });
});

describe('SuggestionChip', () => {
  it('uses on-surface-variant labels and 8px corners', () => {
    render(<SuggestionChip>Sounds good</SuggestionChip>);
    const chip = screen.getByRole('button', { name: 'Sounds good' });
    expect(chip).toHaveAttribute('data-tokens', 'md-comp-suggestion-chip');
    expect(chip).toHaveClass(
      'text-[color:var(--_md-comp-suggestion-chip-label-text-color)]',
      'rounded-[var(--_md-comp-suggestion-chip-container-shape)]',
      'border-[color:var(--_md-comp-suggestion-chip-flat-outline-color)]',
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
    expect(chip).toHaveAttribute('data-tokens', 'md-comp-filter-chip');
    expect(chip).toHaveClass(
      'rounded-[var(--_md-comp-filter-chip-container-shape)]',
      'text-[color:var(--_md-comp-filter-chip-unselected-label-text-color)]',
      'border-[color:var(--_md-comp-filter-chip-flat-unselected-outline-color)]',
      'data-selected:bg-[var(--_md-comp-filter-chip-flat-selected-container-color)]',
      'data-selected:text-[color:var(--_md-comp-filter-chip-selected-label-text-color)]',
      'data-selected:border-transparent',
      'data-selected:data-hovered:not-data-pressed:not-data-focus-visible:not-data-dragged:shadow-elevation-1',
      'data-focus-visible:not-data-selected:border-on-surface-variant',
      'ps-[calc(16px-var(--m3-chip-border))]',
      'data-selected:ps-[calc(8px-var(--m3-chip-border))]',
      'pe-[calc(16px-var(--m3-chip-border))]',
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
    expect(screen.getByRole('button', { name: 'Leading' })).toHaveClass(
      'ps-[calc(8px-var(--m3-chip-border))]',
      'pe-[calc(16px-var(--m3-chip-border))]',
    );
    expect(screen.getByTestId('l').parentElement).toHaveClass(
      'me-[8px]',
      'text-[color:var(--_md-comp-filter-chip-with-leading-icon-unselected-leading-icon-color)]',
      'group-data-selected/chip:text-on-secondary-container',
    );
    expect(screen.getByRole('button', { name: 'Trailing' })).toHaveClass(
      'ps-[calc(16px-var(--m3-chip-border))]',
      'pe-[calc(8px-var(--m3-chip-border))]',
    );
    expect(screen.getByTestId('t').parentElement).toHaveClass('ms-[8px]');
    expect(screen.getByRole('button', { name: 'Both' })).toHaveClass(
      'ps-[calc(8px-var(--m3-chip-border))]',
      'pe-[calc(8px-var(--m3-chip-border))]',
    );
    expect(screen.getByRole('button', { name: 'Both' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('t2').parentElement).toHaveClass('ms-[8px]');
  });

  it('can be elevated', () => {
    render(<FilterChip elevated>Elevated</FilterChip>);
    expect(screen.getByRole('button', { name: 'Elevated' })).toHaveAttribute(
      'data-elevated',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Elevated' })).toHaveClass(
      'bg-[var(--_md-comp-filter-chip-elevated-unselected-container-color)]',
      'data-selected:bg-secondary-container',
    );
    // The flat chip's selected container token doesn't apply to an elevated chip.
    expect(screen.getByRole('button', { name: 'Elevated' }).className).not.toContain(
      'flat-selected-container-color',
    );
    // Selected or not, an elevated chip's hover is level 2: the flat chip's level 1 isn't here.
    expect(screen.getByRole('button', { name: 'Elevated' }).className).not.toMatch(
      /data-selected:data-hovered[^ ]*:shadow-elevation-1/,
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
    expect(root).toHaveAttribute('data-tokens', 'md-comp-filter-chip');
    expect(root).toHaveClass(
      'min-w-[88px]',
      'rounded-[var(--_md-comp-filter-chip-container-shape)]',
      'pe-[calc(8px-var(--m3-chip-border))]',
      'has-data-focus-visible:not-data-selected:border-on-surface-variant',
    );
    expect(toggle).toHaveClass('ps-[calc(16px-var(--m3-chip-border))]');
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

  it('names its remove button from labels', () => {
    render(
      <FilterChip onRemove={() => {}} labels={{ remove: 'Clear' }}>
        Nearby
      </FilterChip>,
    );
    expect(screen.getByRole('button', { name: 'Clear Nearby' })).toBeInTheDocument();
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
    expect(root).toHaveAttribute('data-tokens', 'md-comp-input-chip');
    expect(root).toHaveClass(
      'rounded-[var(--_md-comp-input-chip-container-shape)]',
      'border-[color:var(--_md-comp-input-chip-unselected-outline-color)]',
      'text-[color:var(--_md-comp-input-chip-unselected-label-text-color)]',
      'min-w-[88px]',
      'pe-[calc(8px-var(--m3-chip-border))]',
    );
    expect(chip).toHaveClass('ps-[calc(4px-var(--m3-chip-border))]');
    expect(root.querySelector('img')!.parentElement).toHaveClass('rounded-corner-medium');
    expect(root.querySelector('img')!.parentElement!.parentElement).toHaveClass('me-[8px]');
    expect(remove).toHaveClass('size-[var(--m3-chip-slot)]', 'rounded-full', 'focus-ring');
    // The close icon is decorative: the button's name says what it does.
    expect(remove.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
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
        labels={{ remove: 'Delete' }}
        data-testid="chip"
      >
        Priya
      </InputChip>,
    );
    const root = screen.getByTestId('chip');
    expect(root).toHaveAttribute('data-selected', 'true');
    expect(root).toHaveAttribute('data-disabled', 'true');
    expect(root).toHaveClass(
      'data-selected:bg-[var(--_md-comp-input-chip-selected-container-color)]',
      'data-selected:text-[color:var(--_md-comp-input-chip-selected-label-text-color)]',
    );
    expect(screen.getByRole('button', { name: 'Priya' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Priya' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete Priya' })).toBeDisabled();
  });

  it('pads 12px with no icons or remove button, and is static without actions', () => {
    render(<InputChip data-testid="chip">Plain</InputChip>);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Plain').closest('[data-chip-primary]')).toHaveClass(
      'ps-[calc(12px-var(--m3-chip-border))]',
      'pe-[calc(12px-var(--m3-chip-border))]',
    );
  });
});

describe('Chip density', () => {
  it("takes the set's or the scope's density unless it sets its own", async () => {
    const { container } = render(
      <ThemeScope density={-1}>
        <ChipSet aria-label="Filters" density={-3}>
          <FilterChip>Inherits</FilterChip>
          <AssistChip density={0}>Own</AssistChip>
          <SuggestionChip density={-2}>Suggestion</SuggestionChip>
          <InputChip density={-2} onRemove={() => {}}>
            Input
          </InputChip>
          <FilterChip density={-2} onRemove={() => {}}>
            Removable
          </FilterChip>
        </ChipSet>
      </ThemeScope>,
    );
    expect(screen.getByRole('group', { name: 'Filters' })).toHaveAttribute('data-density', '-3');
    expect(screen.getByRole('button', { name: 'Inherits' })).not.toHaveAttribute('data-density');
    expect(screen.getByRole('button', { name: 'Own' })).toHaveAttribute('data-density', '0');
    expect(screen.getByRole('button', { name: 'Suggestion' })).toHaveAttribute(
      'data-density',
      '-2',
    );
    const remove = screen.getByRole('button', { name: 'Remove Input' });
    expect(remove.closest('[data-tokens~="md-comp-input-chip"]')).toHaveAttribute(
      'data-density',
      '-2',
    );
    expect(
      screen
        .getByRole('button', { name: 'Removable' })
        .closest('[data-tokens~="md-comp-filter-chip"][data-density]'),
    ).toHaveAttribute('data-density', '-2');
    // The remove button keeps a 48px touch target at every level.
    expect(remove.querySelector('[data-touch-target]')).toHaveClass('h-12');
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('InputChip selection without an action', () => {
  it('describes the remove button of a selected chip with "Selected"', () => {
    render(
      <InputChip selected onRemove={() => {}}>
        Alex
      </InputChip>,
    );
    expect(screen.getByRole('button', { name: 'Remove Alex' })).toHaveAccessibleDescription(
      'Selected',
    );
  });

  it('says a static chip is selected, in its own words', () => {
    render(
      <InputChip selected labels={{ selected: 'Chosen' }}>
        Alex
      </InputChip>,
    );
    expect(screen.getByText(', Chosen')).toBeInTheDocument();
  });

  it('leaves the state to aria-pressed when the chip has an action', () => {
    render(
      <InputChip selected onPress={() => {}} onRemove={() => {}}>
        Alex
      </InputChip>,
    );
    expect(screen.getByRole('button', { name: 'Alex' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Remove Alex' })).not.toHaveAccessibleDescription();
  });
});
