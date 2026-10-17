import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { Radio, RadioGroup } from './RadioGroup';

const Delivery = (props: Partial<React.ComponentProps<typeof RadioGroup>>) => (
  <RadioGroup label="Delivery" name="delivery" {...(props as object)}>
    <Radio value="standard">Standard</Radio>
    <Radio value="express">Express</Radio>
    <Radio value="pickup" disabled>
      Pickup
    </Radio>
  </RadioGroup>
);

describe('RadioGroup', () => {
  it('renders a labelled radio group', () => {
    render(<Delivery />);
    const group = screen.getByRole('radiogroup', { name: 'Delivery' });
    expect(group).toHaveAttribute('data-orientation', 'vertical');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    for (const radio of screen.getAllByRole('radio'))
      expect(radio).toHaveAttribute('name', 'delivery');
  });

  it('selects one option at a time and reports the value', async () => {
    const onChange = vi.fn();
    render(<Delivery defaultValue="standard" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
    await userEvent.click(screen.getByText('Express'));
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Standard' })).not.toBeChecked();
    expect(onChange).toHaveBeenCalledWith('express');
    const root = screen.getByRole('radio', { name: 'Express' }).closest('label')!;
    expect(root).toHaveAttribute('data-checked');
  });

  it('moves the selection with the arrow keys and skips disabled options', async () => {
    render(<Delivery defaultValue="standard" />);
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Standard' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Express' })).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
  });

  it('follows the laid-out direction for ← / → in an RTL region with an LTR locale', async () => {
    render(
      <div dir="rtl">
        <RadioGroup label="Size" orientation="horizontal" defaultValue="small">
          <Radio value="small">Small</Radio>
          <Radio value="medium">Medium</Radio>
          <Radio value="large">Large</Radio>
        </RadioGroup>
      </div>,
    );
    await userEvent.tab();
    expect(screen.getByRole('radio', { name: 'Small' })).toHaveFocus();
    // "Small" is laid out rightmost, so ← goes to "Medium", its neighbour on the left.
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Medium' })).toBeChecked();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('radio', { name: 'Small' })).toBeChecked();
  });

  // 2026-10-15: with nowhere to move, React Aria left the key alone and it scrolled the page.
  it('keeps arrow keys in a group of one radio', () => {
    render(
      <RadioGroup aria-label="Layout">
        <Radio value="only">Only</Radio>
      </RadioGroup>,
    );
    const radio = screen.getByRole('radio', { name: 'Only' });
    radio.focus();
    expect(fireEvent.keyDown(radio, { key: 'ArrowDown' })).toBe(false);
    expect(fireEvent.keyDown(radio, { key: 'Tab' })).toBe(true);
  });

  it('can be controlled', async () => {
    const onChange = vi.fn();
    render(<Delivery value="standard" onChange={onChange} />);
    await userEvent.click(screen.getByText('Express'));
    expect(onChange).toHaveBeenCalledWith('express');
    expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked();
  });

  it('disables the whole group and individual options', async () => {
    render(<Delivery disabled />);
    for (const radio of screen.getAllByRole('radio')) expect(radio).toBeDisabled();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('data-disabled');
  });

  it('shows supporting text, then the error when invalid', () => {
    const { rerender } = render(<Delivery supportingText="Choose one" />);
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription('Choose one');
    rerender(
      <Delivery supportingText="Choose one" invalid errorMessage="Pick a delivery option" />,
    );
    expect(screen.getByText('Pick a delivery option')).toHaveClass('text-error');
    expect(screen.queryByText('Choose one')).not.toBeInTheDocument();
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-invalid', 'true');
  });

  it('lays options out horizontally', () => {
    render(<Delivery orientation="horizontal" />);
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('puts data-* on the radio root and requires a group', () => {
    render(
      <RadioGroup aria-label="Size">
        <Radio value="s" data-testid="small">
          Small
        </Radio>
      </RadioGroup>,
    );
    expect(screen.getByTestId('small')).toBe(screen.getByRole('radio').closest('label'));

    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Radio value="x">Orphan</Radio>)).toThrow(/inside <RadioGroup>/);
    error.mockRestore();
  });

  it('marks the root and the ring for its component tokens, and paints the ring with them', () => {
    const { container } = render(<Delivery />);
    const radio = screen.getByRole('radio', { name: 'Standard' });
    expect(radio.closest('label')).toHaveAttribute('data-tokens', 'md-comp-radio-button');
    const ring = container.querySelector('[data-slot="ring"]');
    expect(ring).toHaveAttribute('data-tokens', 'md-comp-radio-button');
    expect(ring).toHaveClass(
      'border-[color:var(--_md-comp-radio-button-unselected-icon-color)]',
      'text-[color:var(--_md-comp-radio-button-selected-icon-color)]',
      'control-checked:border-[color:var(--_md-comp-radio-button-selected-icon-color)]',
    );
  });

  it('lets consumer ring classes replace the token classes', () => {
    const { container } = render(
      <RadioGroup aria-label="Size">
        <Radio value="s" classNames={{ ring: 'border-tertiary text-tertiary' }}>
          Small
        </Radio>
      </RadioGroup>,
    );
    const ring = container.querySelector('[data-slot="ring"]');
    expect(ring).toHaveClass('border-tertiary', 'text-tertiary');
    expect(ring).not.toHaveClass(
      'border-[color:var(--_md-comp-radio-button-unselected-icon-color)]',
      'text-[color:var(--_md-comp-radio-button-selected-icon-color)]',
    );
  });

  it('has no axe violations', async () => {
    const { container } = render(<Delivery defaultValue="express" supportingText="Choose one" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('RadioGroup density', () => {
  it('passes its density to its options, which can set their own', async () => {
    const { container } = render(
      <ThemeScope density={-2}>
        <RadioGroup label="Delivery" density={-3} defaultValue="standard">
          <Radio value="standard">Standard</Radio>
          <Radio value="express" density={0}>
            Express
          </Radio>
        </RadioGroup>
      </ThemeScope>,
    );
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('data-density', '-3');
    const option = (name: string) => screen.getByText(name).closest('label')!;
    expect(option('Standard')).not.toHaveAttribute('data-density');
    expect(option('Express')).toHaveAttribute('data-density', '0');
    // Rows 2px further apart per step, so a 48px target never reaches the next ring.
    expect(option('Standard').parentElement).toHaveClass(
      'gap-y-[calc(0px-var(--md-sys-density,0)*2px)]',
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
