import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Switch } from './Switch';

const trackOf = (input: HTMLElement) =>
  input.closest('label')!.querySelector('.w-\\[52px\\]') as HTMLElement;
const thumbVars = (input: HTMLElement) => {
  const track = trackOf(input);
  return {
    size: track.style.getPropertyValue('--m3-thumb-size'),
    center: track.style.getPropertyValue('--m3-thumb-center'),
  };
};

describe('Switch', () => {
  it('renders a labelled switch with an off thumb', () => {
    render(<Switch>Wi-Fi</Switch>);
    const input = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(input).not.toBeChecked();
    expect(thumbVars(input)).toEqual({ size: '16px', center: '16px' });
    expect(input.closest('label')!.querySelector('[data-touch-target]')).toBeInTheDocument();
  });

  it('switches on and moves the thumb to the end at 24px', async () => {
    const onSelectedChange = vi.fn();
    render(<Switch onSelectedChange={onSelectedChange}>Wi-Fi</Switch>);
    await userEvent.click(screen.getByText('Wi-Fi'));
    const input = screen.getByRole('switch');
    expect(input).toBeChecked();
    expect(onSelectedChange).toHaveBeenCalledWith(true);
    expect(thumbVars(input)).toEqual({ size: '24px', center: '36px' });
    expect(input.closest('label')).toHaveAttribute('data-selected');
  });

  it('grows the thumb to 28px while pressed', async () => {
    const user = userEvent.setup();
    render(<Switch>Wi-Fi</Switch>);
    const input = screen.getByRole('switch');
    await user.keyboard('{Tab}');
    await user.keyboard('[Space>]');
    expect(thumbVars(input).size).toBe('28px');
    await user.keyboard('[/Space]');
    expect(input).toBeChecked();
    expect(thumbVars(input).size).toBe('24px');
  });

  it('shows icons and uses a 24px thumb even when off', async () => {
    render(<Switch icons>Dark mode</Switch>);
    const input = screen.getByRole('switch');
    expect(thumbVars(input)).toEqual({ size: '24px', center: '16px' });
    expect(input.closest('label')!.querySelector('svg')).toBeInTheDocument();
  });

  it('shows only a selected icon when given one', async () => {
    render(<Switch selectedIcon={<svg data-testid="on" />}>Sync</Switch>);
    const input = screen.getByRole('switch');
    expect(screen.queryByTestId('on')).not.toBeInTheDocument();
    expect(thumbVars(input).size).toBe('16px');
    await userEvent.click(input);
    expect(screen.getByTestId('on')).toBeInTheDocument();
  });

  it('is disabled and read-only', async () => {
    const onSelectedChange = vi.fn();
    render(
      <>
        <Switch disabled onSelectedChange={onSelectedChange}>
          Disabled
        </Switch>
        <Switch readOnly onSelectedChange={onSelectedChange}>
          Read only
        </Switch>
      </>,
    );
    await userEvent.click(screen.getByText('Disabled'));
    await userEvent.click(screen.getByText('Read only'));
    expect(onSelectedChange).not.toHaveBeenCalled();
    expect(screen.getByRole('switch', { name: 'Disabled' })).toBeDisabled();
  });

  it('puts data-*, ref, className and style on the root', () => {
    let root: HTMLLabelElement | null = null;
    render(
      <Switch
        ref={(node) => {
          root = node;
        }}
        data-testid="wifi"
        className="flex-row-reverse"
        style={{ marginTop: 2 }}
      >
        Wi-Fi
      </Switch>,
    );
    const label = screen.getByRole('switch').closest('label')!;
    expect(root).toBe(label);
    expect(screen.getByTestId('wifi')).toBe(label);
    expect(label).toHaveClass('flex-row-reverse');
    expect(label).toHaveStyle({ marginTop: '2px' });
  });

  it('requires a label or an accessible name in its types', () => {
    // @ts-expect-error children, aria-label or aria-labelledby is required
    const unnamed = <Switch />;
    expect(unnamed).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Switch>Off</Switch>
        <Switch defaultSelected icons>
          On
        </Switch>
        <Switch disabled>Disabled</Switch>
        <Switch aria-label="No visible label" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
