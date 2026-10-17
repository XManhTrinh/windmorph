import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
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
    expect(field).toHaveAttribute('data-tokens', 'md-comp-text-field');
    expect(input.parentElement!.parentElement).toHaveClass(
      'bg-[var(--_md-comp-text-field-container-color)]',
      'rounded-t-[var(--_md-comp-text-field-container-shape)]',
      'min-h-[calc(56px+var(--md-sys-density,0)*4px)]',
    );
  });

  it('paints its parts with the component tokens', () => {
    const { container } = render(
      <TextField label="Email" supportingText="Work email" leadingIcon={<Icon />} />,
    );
    const slot = (name: string) => container.querySelector(`[data-slot="${name}"]`);
    expect(slot('active-indicator')).toHaveClass(
      'bg-[var(--_md-comp-text-field-active-indicator-color)]',
      'group-data-[field-state=focus]/field:bg-[var(--_md-comp-text-field-focus-active-indicator-color)]',
    );
    expect(slot('label')).toHaveClass(
      'text-[color:var(--_md-comp-text-field-label-text-color)]',
      'group-data-[field-state=focus]/field:text-[color:var(--_md-comp-text-field-focus-label-text-color)]',
    );
    expect(slot('input')).toHaveClass(
      'text-[color:var(--_md-comp-text-field-input-text-color)]',
      'caret-[color:var(--_md-comp-text-field-caret-color)]',
    );
    expect(slot('supporting-text')).toHaveClass(
      'text-[color:var(--_md-comp-text-field-supporting-text-color)]',
    );
    expect(slot('supporting-text')).not.toHaveClass('text-on-surface-variant');
    expect(slot('leading-icon')).toHaveClass(
      'text-[color:var(--_md-comp-text-field-leading-icon-color)]',
    );
  });

  it('lets consumer classes replace the token classes', () => {
    const { container } = render(
      <TextField
        label="Email"
        supportingText="Work email"
        classNames={{
          container: 'bg-tertiary-container rounded-t-corner-large',
          label: 'text-tertiary',
          input: 'text-on-tertiary-container',
          supportingText: 'text-tertiary',
        }}
      />,
    );
    const slot = (name: string) => container.querySelector(`[data-slot="${name}"]`);
    expect(slot('container')).toHaveClass('bg-tertiary-container', 'rounded-t-corner-large');
    expect(slot('container')).not.toHaveClass(
      'bg-[var(--_md-comp-text-field-container-color)]',
      'rounded-t-[var(--_md-comp-text-field-container-shape)]',
    );
    expect(slot('label')).not.toHaveClass(
      'text-[color:var(--_md-comp-text-field-label-text-color)]',
    );
    expect(slot('input')).not.toHaveClass(
      'text-[color:var(--_md-comp-text-field-input-text-color)]',
    );
    expect(slot('supporting-text')).toHaveClass('text-tertiary');
    expect(slot('supporting-text')).not.toHaveClass(
      'text-[color:var(--_md-comp-text-field-supporting-text-color)]',
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
    rerender(<TextField label="Bio" maxLength={10} counter={false} />);
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

    const focus = vi.spyOn(HTMLElement.prototype, 'focus');
    fireEvent.pointerDown(screen.getByText('$'));
    expect(input).toHaveFocus();
    // The press is on the field: the page doesn't scroll to it (2026-10-15).
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    focus.mockRestore();

    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders an outlined field with a hidden notch label', () => {
    const { container } = render(<TextField variant="outlined" label="City" />);
    const fieldset = container.querySelector('fieldset')!;
    expect(fieldset).toHaveAttribute('aria-hidden', 'true');
    expect(fieldset.querySelector('legend')).toHaveTextContent('City');
    expect(root(screen.getByLabelText('City'))).toHaveAttribute('data-variant', 'outlined');
    expect(fieldset).toHaveClass(
      'rounded-[var(--_md-comp-text-field-container-shape)]',
      'border-[color:var(--_md-comp-text-field-outline-color)]',
      'group-data-[field-state=hover]/field:border-[color:var(--_md-comp-text-field-hover-outline-color)]',
      'group-data-[field-state=focus]/field:border-[color:var(--_md-comp-text-field-focus-outline-color)]',
    );
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

describe('TextField density', () => {
  it('inherits the density of its scope unless it sets its own', () => {
    render(
      <ThemeScope density={-2} data-testid="scope">
        <TextField label="Inherits" />
        <TextField label="Own" density={-3} />
        <TextField label="Default" density={0} />
      </ThemeScope>,
    );
    expect(screen.getByTestId('scope')).toHaveAttribute('data-density', '-2');
    expect(root(screen.getByLabelText('Inherits'))).not.toHaveAttribute('data-density');
    expect(root(screen.getByLabelText('Own'))).toHaveAttribute('data-density', '-3');
    expect(root(screen.getByLabelText('Default'))).toHaveAttribute('data-density', '0');
  });

  it('sizes the container, padding and label from --md-sys-density', () => {
    render(<TextField label="Name" leadingIcon={<Icon />} density={-1} />);
    const input = screen.getByLabelText('Name');
    const field = input.parentElement!;
    const container = field.parentElement!;
    expect(container).toHaveClass('min-h-[calc(56px+var(--md-sys-density,0)*4px)]');
    // 24 / 8px less 2px a step while the floated label has room (down to -1), then centred.
    expect(field).toHaveClass(
      'pt-[calc(16px+var(--md-sys-density,0)*2px+8px*var(--m3-field-label-room))]',
      'pb-[calc(16px+var(--md-sys-density,0)*2px-8px*var(--m3-field-label-room))]',
    );
    expect(screen.getByText('Name')).toHaveClass(
      'top-[calc(16px+var(--md-sys-density,0)*2px)]',
      'group-data-floated/field:top-[calc(8px+var(--md-sys-density,0)*2px)]',
    );
    expect(container.querySelector('[data-slot="leading-icon"]')).toHaveClass(
      'h-[min(48px,calc(56px+var(--md-sys-density,0)*4px))]',
    );
  });

  it('has no axe violations when dense', async () => {
    const { container } = render(
      <ThemeScope density={-3}>
        <TextField label="Filled" supportingText="Help" />
        <TextField variant="outlined" label="Outlined" invalid errorMessage="Required" />
        <TextField label="Notes" multiline />
      </ThemeScope>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('TextField classNames', () => {
  it('puts the outline and activeIndicator slots on their parts', () => {
    const slots = { outline: 'outline-x', activeIndicator: 'indicator-x' };
    const { container, rerender } = render(
      <TextField variant="outlined" label="Name" classNames={slots} />,
    );
    expect(container.querySelector('[data-slot="outline"]')).toHaveClass('outline-x');
    rerender(<TextField variant="filled" label="Name" classNames={slots} />);
    expect(container.querySelector('[data-slot="active-indicator"]')).toHaveClass('indicator-x');
  });
});

describe('TextField token sets', () => {
  it("puts an app's token set after the field's own", () => {
    const { container } = render(<TextField label="Name" data-tokens="app-profile" />);
    expect(container.firstElementChild).toHaveAttribute(
      'data-tokens',
      'md-comp-text-field app-profile',
    );
  });
});
