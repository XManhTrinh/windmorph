import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
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
    expect(root).toHaveAttribute('data-selected');
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

  it('has no axe violations', async () => {
    const { container } = render(<Delivery defaultValue="express" supportingText="Choose one" />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
