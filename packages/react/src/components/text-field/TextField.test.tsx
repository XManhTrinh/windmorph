import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { IconButton } from '../icon-button/IconButton';
import { TextField } from './TextField';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;
const root = (input: HTMLElement) => input.closest('[data-field-state]') as HTMLElement;

describe('TextField', () => {
  it('renders a labelled filled field', () => {
    render(<TextField label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input.tagName).toBe('INPUT');
    const field = root(input);
    expect(field).toHaveAttribute('data-variant', 'filled');
    expect(field).toHaveAttribute('data-field-state', 'rest');
    expect(field).toHaveClass('w-[280px]');
    expect(input.parentElement!.parentElement).toHaveClass(
      'bg-surface-container-highest',
      'rounded-t-corner-extra-small',
      'min-h-[56px]',
    );
  });

  it('floats the label when focused or filled', async () => {
    render(<TextField label="Name" />);
    const input = screen.getByLabelText('Name');
    expect(root(input)).not.toHaveAttribute('data-floated');
    await userEvent.click(input);
    expect(root(input)).toHaveAttribute('data-floated');
    expect(root(input)).toHaveAttribute('data-field-state', 'focus');
    await userEvent.type(input, 'Ada');
    await userEvent.tab();
    await userEvent.unhover(input);
    expect(root(input)).toHaveAttribute('data-floated');
    expect(root(input)).toHaveAttribute('data-field-state', 'rest');
  });

  it('is controlled or uncontrolled', async () => {
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState('a');
      return (
        <TextField
          label="Controlled"
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next.toUpperCase());
          }}
        />
      );
    }
    render(
      <>
        <Controlled />
        <TextField label="Uncontrolled" defaultValue="x" />
      </>,
    );
    await userEvent.type(screen.getByLabelText('Controlled'), 'b');
    expect(onChange).toHaveBeenCalledWith('ab');
    expect(screen.getByLabelText('Controlled')).toHaveValue('AB');
    await userEvent.type(screen.getByLabelText('Uncontrolled'), 'y');
    expect(screen.getByLabelText('Uncontrolled')).toHaveValue('xy');
  });

  it('describes the input with supporting text and replaces it with the error when invalid', () => {
    const { rerender } = render(<TextField label="Email" supportingText="Work address" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAccessibleDescription('Work address');

    rerender(
      <TextField
        label="Email"
        supportingText="Work address"
        invalid
        errorMessage="Enter an email"
      />,
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Work address Enter an email');
    expect(screen.getByText('Work address')).toHaveClass('sr-only');
    expect(screen.getByText('Enter an email')).toHaveClass('text-error');
    expect(root(input)).toHaveAttribute('data-field-state', 'error');
  });

  it('shows validate() errors', async () => {
    render(
      <TextField
        label="Code"
        validationBehavior="aria"
        validate={(value) => (value.length < 3 ? 'Too short' : null)}
      />,
    );
    await userEvent.type(screen.getByLabelText('Code'), 'ab');
    expect(screen.getByText('Too short')).toBeInTheDocument();
    expect(root(screen.getByLabelText('Code'))).toHaveAttribute('data-field-state', 'error-focus');
  });

  it('marks required fields', () => {
    render(<TextField label="Name" required />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toBeRequired();
    expect(screen.getByText('*', { exact: false, selector: 'label span' })).toHaveAttribute(
      'aria-hidden',
      'true',
    );
  });

  it('is disabled', async () => {
    render(<TextField label="Name" disabled />);
    const input = screen.getByLabelText('Name');
    expect(input).toBeDisabled();
    expect(root(input)).toHaveAttribute('data-field-state', 'disabled');
  });

  it('counts characters against maxLength', async () => {
    const { rerender } = render(<TextField label="Bio" maxLength={10} />);
    await userEvent.type(screen.getByLabelText('Bio'), 'Hello');
    expect(screen.getByText('5/10')).toBeInTheDocument();
    rerender(<TextField label="Bio" maxLength={10} showCharacterCount={false} />);
    expect(screen.queryByText('5/10')).not.toBeInTheDocument();
  });

  it('renders icons, prefix and suffix and focuses the input from the container', async () => {
    const onClear = vi.fn();
    render(
      <TextField
        label="Price"
        leadingIcon={<Icon />}
        prefix="$"
        suffix="USD"
        trailingIcon={<IconButton icon={<Icon />} aria-label="Clear" onPress={onClear} />}
      />,
    );
    const input = screen.getByLabelText('Price');
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('USD')).toBeInTheDocument();
    expect(screen.getAllByTestId('icon')[0]!.parentElement).toHaveAttribute('aria-hidden', 'true');

    fireEvent.pointerDown(screen.getByText('$'));
    expect(input).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders an outlined field with a hidden notch label', () => {
    const { container } = render(<TextField variant="outlined" label="City" />);
    const fieldset = container.querySelector('fieldset')!;
    expect(fieldset).toHaveAttribute('aria-hidden', 'true');
    expect(fieldset.querySelector('legend')).toHaveTextContent('City');
    expect(root(screen.getByLabelText('City'))).toHaveAttribute('data-variant', 'outlined');
  });

  it('renders a growing textarea when multiline', () => {
    render(<TextField label="Notes" multiline rows={3} maxRows={6} />);
    const textarea = screen.getByLabelText('Notes');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '3');
  });

  it('puts ref, className and style on the root and inputRef on the input', () => {
    let rootElement: HTMLDivElement | null = null;
    let inputElement: HTMLInputElement | HTMLTextAreaElement | null = null;
    render(
      <TextField
        label="Name"
        ref={(node) => {
          rootElement = node;
        }}
        inputRef={(node) => {
          inputElement = node;
        }}
        className="w-full fixed"
        style={{ top: 4 }}
        data-testid="field"
        data-tracking="signup"
      />,
    );
    const input = screen.getByLabelText('Name');
    expect(inputElement).toBe(input);
    expect(rootElement).toBe(root(input));
    expect(root(input)).toHaveClass('w-full', 'fixed');
    expect(root(input)).not.toHaveClass('w-[280px]');
    expect(root(input)).toHaveStyle({ top: '4px' });
    expect(screen.getByTestId('field')).toBe(root(input));
    expect(root(input)).toHaveAttribute('data-tracking', 'signup');
  });

  it('requires a label or an accessible name in its types', () => {
    // @ts-expect-error label, aria-label or aria-labelledby is required
    const unnamed = <TextField placeholder="Search" />;
    expect(unnamed).toBeTruthy();
    render(<TextField aria-label="Search" placeholder="Search" />);
    expect(screen.getByRole('textbox', { name: 'Search' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <TextField label="Filled" supportingText="Help" />
        <TextField variant="outlined" label="Outlined" invalid errorMessage="Required" />
        <TextField label="Notes" multiline maxLength={100} />
        <TextField aria-label="Search" placeholder="Search" leadingIcon={<Icon />} />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
