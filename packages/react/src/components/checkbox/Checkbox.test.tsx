import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { Checkbox } from './Checkbox';

const rootOf = (input: HTMLElement) => input.closest('label') as HTMLLabelElement;

describe('Checkbox', () => {
  it('renders a labelled native checkbox inside a 40px control with a touch target', () => {
    const { container } = render(<Checkbox>Remember me</Checkbox>);
    const input = screen.getByRole('checkbox', { name: 'Remember me' });
    expect(input).not.toBeChecked();
    const control = input.closest('.state-layer') as HTMLElement;
    expect(control).toHaveClass(
      'size-[calc(40px+var(--md-sys-density,0)*4px)]',
      'rounded-full',
      'focus-ring',
    );
    expect(container.querySelector('[data-touch-target]')).toBeInTheDocument();
    expect(container.querySelector('svg')!.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('toggles when the label is clicked and reports the change', async () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange}>Remember me</Checkbox>);
    await userEvent.click(screen.getByText('Remember me'));
    const input = screen.getByRole('checkbox');
    expect(input).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(rootOf(input)).toHaveAttribute('data-checked');
  });

  it('toggles with the space key', async () => {
    render(<Checkbox>Remember me</Checkbox>);
    await userEvent.tab();
    await userEvent.keyboard(' ');
    expect(screen.getByRole('checkbox')).toBeChecked();
    expect(rootOf(screen.getByRole('checkbox'))).toHaveAttribute('data-focus-visible');
  });

  it('can be controlled', async () => {
    function Controlled() {
      const [checked, setChecked] = useState(true);
      return (
        <Checkbox checked={checked} onCheckedChange={setChecked}>
          Controlled
        </Checkbox>
      );
    }
    render(<Controlled />);
    const input = screen.getByRole('checkbox');
    expect(input).toBeChecked();
    await userEvent.click(input);
    expect(input).not.toBeChecked();
  });

  it('shows the indeterminate state as mixed', () => {
    render(<Checkbox indeterminate>Select all</Checkbox>);
    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
    expect(rootOf(input)).toHaveAttribute('data-indeterminate');
    expect(rootOf(input)).not.toHaveAttribute('data-checked');
  });

  it('is disabled, read-only, required and invalid', async () => {
    const onCheckedChange = vi.fn();
    render(
      <>
        <Checkbox disabled onCheckedChange={onCheckedChange}>
          Disabled
        </Checkbox>
        <Checkbox readOnly onCheckedChange={onCheckedChange}>
          Read only
        </Checkbox>
        <Checkbox required invalid name="terms" value="yes">
          Terms
        </Checkbox>
      </>,
    );
    await userEvent.click(screen.getByText('Disabled'));
    await userEvent.click(screen.getByText('Read only'));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'Disabled' })).toBeDisabled();
    expect(rootOf(screen.getByRole('checkbox', { name: 'Disabled' }))).toHaveAttribute(
      'data-disabled',
    );
    const terms = screen.getByRole('checkbox', { name: 'Terms' });
    expect(terms).toBeRequired();
    expect(terms).toHaveAttribute('aria-invalid', 'true');
    expect(terms).toHaveAttribute('name', 'terms');
    expect(terms).toHaveAttribute('value', 'yes');
    expect(rootOf(terms)).toHaveAttribute('data-invalid');
  });

  it('puts ref, className and style on the root and inputRef on the input', () => {
    let root: HTMLLabelElement | null = null;
    let input: HTMLInputElement | null = null;
    render(
      <Checkbox
        ref={(node) => {
          root = node;
        }}
        inputRef={(node) => {
          input = node;
        }}
        className="flex gap-2"
        style={{ marginTop: 4 }}
        data-testid="consent"
      >
        Option
      </Checkbox>,
    );
    const checkbox = screen.getByRole('checkbox');
    expect(input).toBe(checkbox);
    expect(root).toBe(rootOf(checkbox));
    expect(rootOf(checkbox)).toHaveClass('flex', 'gap-2');
    expect(rootOf(checkbox)).not.toHaveClass('inline-flex');
    expect(rootOf(checkbox)).toHaveStyle({ marginTop: '4px' });
    expect(screen.getByTestId('consent')).toBe(rootOf(checkbox));
  });

  it('marks the root and the box for its component tokens, and paints the box with them', () => {
    const { container } = render(<Checkbox>Remember me</Checkbox>);
    expect(rootOf(screen.getByRole('checkbox'))).toHaveAttribute('data-tokens', 'md-comp-checkbox');
    const box = container.querySelector('[data-slot="box"]');
    expect(box).toHaveAttribute('data-tokens', 'md-comp-checkbox');
    expect(box).toHaveClass(
      'border-[color:var(--_md-comp-checkbox-unselected-outline-color)]',
      'text-[color:var(--_md-comp-checkbox-selected-icon-color)]',
      'group-data-checked/control:bg-[var(--_md-comp-checkbox-selected-container-color)]',
    );
  });

  it('lets consumer box classes replace the token classes', () => {
    const { container } = render(
      <Checkbox classNames={{ box: 'border-tertiary text-on-tertiary' }}>Remember me</Checkbox>,
    );
    const box = container.querySelector('[data-slot="box"]');
    expect(box).toHaveClass('border-tertiary', 'text-on-tertiary');
    expect(box).not.toHaveClass(
      'border-[color:var(--_md-comp-checkbox-unselected-outline-color)]',
      'text-[color:var(--_md-comp-checkbox-selected-icon-color)]',
    );
  });

  it('requires a label or an accessible name in its types', () => {
    // @ts-expect-error children, aria-label or aria-labelledby is required
    const unnamed = <Checkbox />;
    expect(unnamed).toBeTruthy();
    render(<Checkbox aria-label="Select row" />);
    expect(screen.getByRole('checkbox', { name: 'Select row' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Checkbox>Unchecked</Checkbox>
        <Checkbox defaultChecked>Checked</Checkbox>
        <Checkbox indeterminate>Mixed</Checkbox>
        <Checkbox disabled>Disabled</Checkbox>
        <Checkbox invalid>Invalid</Checkbox>
        <Checkbox aria-label="No visible label" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('Checkbox classNames', () => {
  it('puts the icon slot on the drawn check', () => {
    const { container } = render(
      <Checkbox classNames={{ box: 'box-x', icon: 'icon-x' }}>Accept</Checkbox>,
    );
    const box = container.querySelector('[data-slot="box"]')!;
    expect(box).toHaveClass('box-x');
    expect(box.querySelector('svg')).toHaveClass('icon-x');
  });
});

describe('Checkbox density', () => {
  it("takes its scope's density unless it sets its own, and stays accessible", async () => {
    const { container } = render(
      <ThemeScope density={-3}>
        <Checkbox>Inherits</Checkbox>
        <Checkbox density={-1}>Own</Checkbox>
      </ThemeScope>,
    );
    const root = (name: string) => screen.getByText(name).closest('label')!;
    expect(root('Inherits')).not.toHaveAttribute('data-density');
    expect(root('Own')).toHaveAttribute('data-density', '-1');
    // The state layer reads the level; the box and the 48px touch target don't.
    const control = root('Own').querySelector('[data-selection-control]')!;
    expect(control).toHaveClass(
      'size-[calc(40px+var(--md-sys-density,0)*4px)]',
      '[--m3-ripple-size:calc(20px+var(--md-sys-density,0)*2px)]',
    );
    expect(control.querySelector('[data-slot="box"]')).toHaveClass('size-[18px]');
    expect(control.querySelector('[data-touch-target]')).toHaveClass('h-[48px]');
    expect(await axeViolations(container)).toEqual([]);
  });
});
