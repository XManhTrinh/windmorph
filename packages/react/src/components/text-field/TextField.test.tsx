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

  it('marks required fields with an asterisk that is part of the accessible name', () => {
    const { container } = render(<TextField variant="outlined" label="Name" required />);
    // M3: "The accessibility label must include the asterisk."
    const input = screen.getByRole('textbox', { name: 'Name *' });
    expect(input).toBeRequired();
    // The notch's copy stays hidden with its fieldset.
    expect(container.querySelector('fieldset')).toHaveAttribute('aria-hidden', 'true');
  });

  it('announces the error message as an alert', () => {
    render(<TextField label="Email" invalid errorMessage="Enter an email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Enter an email');
  });

  it('shows a named error icon while invalid, unless a trailing icon or false replaces it', () => {
    const { rerender } = render(<TextField label="Email" />);
    expect(screen.queryByRole('img', { name: 'Error' })).not.toBeInTheDocument();
    rerender(<TextField label="Email" invalid />);
    const icon = screen.getByRole('img', { name: 'Error' });
    expect(icon.parentElement).toHaveClass('group-data-[field-state=error]/field:text-error');
    rerender(<TextField label="Email" invalid labels={{ error: 'Erreur' }} />);
    expect(screen.getByRole('img', { name: 'Erreur' })).toBeInTheDocument();
    rerender(<TextField label="Email" invalid errorIcon={false} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(<TextField label="Email" invalid trailingIcon={<Icon />} />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(<TextField label="Email" invalid errorIcon={<Icon />} />);
    expect(screen.getByRole('img', { name: 'Error' })).toContainElement(screen.getByTestId('icon'));
  });

  it('colours the supporting text as an error while invalid, even without a message', () => {
    render(<TextField label="Password" supportingText="At least 8 characters" invalid />);
    const text = screen.getByText('At least 8 characters');
    expect(text).not.toHaveClass('sr-only');
    expect(text).toHaveClass(
      'group-data-[field-state=error]/field:text-error',
      'group-data-[field-state=error-focus]/field:text-error',
    );
  });

  it('can show the supporting text only on focus, keeping it in the description', () => {
    render(<TextField label="Name" supportingText="As on your passport" supportingTextOnFocus />);
    expect(screen.getByText('As on your passport')).toHaveClass(
      'opacity-0',
      'group-data-focused/field:opacity-100',
    );
    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription('As on your passport');
  });

  it('marks a read-only field on its root', () => {
    render(<TextField label="Account" readOnly defaultValue="A-1024" />);
    const input = screen.getByLabelText('Account');
    expect(input).toHaveAttribute('readonly');
    expect(root(input)).toHaveAttribute('data-readonly', 'true');
  });

  it('is disabled', async () => {
    render(<TextField label="Name" disabled />);
    const input = screen.getByLabelText('Name');
    expect(input).toBeDisabled();
    expect(root(input)).toHaveAttribute('data-field-state', 'disabled');
  });

  it('counts characters against maxLength, labelled as the character count', async () => {
    const { rerender } = render(<TextField label="Bio" maxLength={10} supportingText="Short" />);
    await userEvent.type(screen.getByLabelText('Bio'), 'Hello');
    expect(screen.getByText('5/10')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByLabelText('Bio')).toHaveAccessibleDescription(
      'Short Character count: 5 of 10',
    );
    rerender(
      <TextField
        label="Bio"
        maxLength={10}
        labels={{ characterCount: (count, max) => `${max - count} left` }}
      />,
    );
    expect(screen.getByLabelText('Bio')).toHaveAccessibleDescription('5 left');
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
    // M3: the prefix and suffix have ids and describe the input.
    expect(input).toHaveAccessibleDescription('$ USD');
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
    // OutlinedTextFieldTokens.HoverLabelColor is on-surface.
    expect(screen.getByText('City', { selector: 'label' })).toHaveClass(
      'group-data-[field-state=hover]/field:text-on-surface',
    );
  });

  it('reads an affix as its label when given one', () => {
    render(<TextField label="Price" prefix="$" prefixLabel="US dollars" suffix="kg" />);
    expect(screen.getByLabelText('Price')).toHaveAccessibleDescription('US dollars kg');
    expect(screen.getByText('$')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a fixed-height text area when multiline', () => {
    render(<TextField label="Notes" multiline />);
    const textarea = screen.getByLabelText('Notes');
    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea).toHaveAttribute('rows', '4');
    expect(textarea).toHaveClass('overflow-y-auto');
    expect(textarea.style.height).toBe('');
  });

  it('grows a multiline field with autoGrow', () => {
    render(<TextField label="Notes" multiline autoGrow maxRows={6} />);
    const textarea = screen.getByLabelText('Notes');
    expect(textarea).toHaveAttribute('rows', '1');
    expect(textarea).not.toHaveClass('overflow-y-auto');
    expect(textarea.style.height).not.toBe('');
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
        <TextField variant="outlined" label="Outlined" required invalid errorMessage="Required" />
        <TextField label="Notes" multiline maxLength={100} />
        <TextField label="Price" prefix="$" prefixLabel="US dollars" suffix="kg" readOnly />
        <TextField aria-label="Search" placeholder="Search" leadingIcon={<Icon />} />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
