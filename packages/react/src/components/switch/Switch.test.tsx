import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
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
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange}>Wi-Fi</Switch>);
    await userEvent.click(screen.getByText('Wi-Fi'));
    const input = screen.getByRole('switch');
    expect(input).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(thumbVars(input)).toEqual({ size: '24px', center: '36px' });
    expect(input.closest('label')).toHaveAttribute('data-checked');
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

  it('toggles on Enter, growing the thumb while the key is down', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange}>Wi-Fi</Switch>);
    const input = screen.getByRole('switch');
    await user.keyboard('{Tab}');
    await user.keyboard('[Enter>]');
    expect(thumbVars(input).size).toBe('28px');
    await user.keyboard('[/Enter]');
    expect(input).toBeChecked();
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    await user.keyboard('{Enter}');
    expect(input).not.toBeChecked();
  });

  it('follows a drag with the thumb and switches from where it is released', async () => {
    const user = userEvent.setup();
    render(<Switch>Wi-Fi</Switch>);
    const input = screen.getByRole('switch');
    const track = trackOf(input);
    await user.pointer([
      { keys: '[MouseLeft>]', target: track, coords: { clientX: 10 } },
      { target: track, coords: { clientX: 20 } },
    ]);
    expect(thumbVars(input)).toEqual({ size: '28px', center: '26px' });
    expect(input.closest('label')).toHaveAttribute('data-dragged');
    await user.pointer([
      { target: track, coords: { clientX: 40 } },
      { keys: '[/MouseLeft]', target: track },
    ]);
    expect(input).toBeChecked();
    expect(thumbVars(input)).toEqual({ size: '24px', center: '36px' });
    // Dragged back past the middle, it stays off even though the press ended over it.
    await user.pointer([
      { keys: '[MouseLeft>]', target: track, coords: { clientX: 40 } },
      { target: track, coords: { clientX: 0 } },
      { keys: '[/MouseLeft]', target: track },
    ]);
    expect(input).not.toBeChecked();
    // A tap still toggles.
    await user.click(track);
    expect(input).toBeChecked();
  });

  it('ignores Enter when read-only', async () => {
    const user = userEvent.setup();
    render(<Switch readOnly>Wi-Fi</Switch>);
    await user.keyboard('{Tab}{Enter}');
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('shows icons and uses a 24px thumb even when off', async () => {
    render(<Switch icons>Dark mode</Switch>);
    const input = screen.getByRole('switch');
    expect(thumbVars(input)).toEqual({ size: '24px', center: '16px' });
    expect(input.closest('label')!.querySelector('svg')).toBeInTheDocument();
  });

  it('shows only a selected icon when given one', async () => {
    render(<Switch checkedIcon={<svg data-testid="on" />}>Sync</Switch>);
    const input = screen.getByRole('switch');
    expect(screen.queryByTestId('on')).not.toBeInTheDocument();
    expect(thumbVars(input).size).toBe('16px');
    await userEvent.click(input);
    expect(screen.getByTestId('on')).toBeInTheDocument();
  });

  it('is disabled and read-only', async () => {
    const onCheckedChange = vi.fn();
    render(
      <>
        <Switch disabled onCheckedChange={onCheckedChange}>
          Disabled
        </Switch>
        <Switch readOnly onCheckedChange={onCheckedChange}>
          Read only
        </Switch>
      </>,
    );
    await userEvent.click(screen.getByText('Disabled'));
    await userEvent.click(screen.getByText('Read only'));
    expect(onCheckedChange).not.toHaveBeenCalled();
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

  it('marks the root and the thumb for its component tokens, and paints the switch with them', () => {
    render(<Switch>Wi-Fi</Switch>);
    const input = screen.getByRole('switch');
    expect(input.closest('label')).toHaveAttribute('data-tokens', 'md-comp-switch');
    const track = trackOf(input);
    expect(track).toHaveAttribute('data-slot', 'track');
    expect(track).toHaveClass(
      'bg-[var(--_md-comp-switch-unselected-track-color)]',
      'border-[color:var(--_md-comp-switch-unselected-track-outline-color)]',
    );
    const thumb = track.querySelector('[data-slot="thumb"]');
    expect(thumb).toHaveAttribute('data-tokens', 'md-comp-switch');
    expect(thumb).toHaveClass(
      'bg-[var(--_md-comp-switch-unselected-handle-color)]',
      'text-[color:var(--_md-comp-switch-unselected-icon-color)]',
      'control-checked:bg-[var(--_md-comp-switch-selected-handle-color)]',
    );
  });

  it('lets consumer track and thumb classes replace the token classes', () => {
    render(<Switch classNames={{ control: 'bg-tertiary', thumb: 'bg-on-tertiary' }}>Wi-Fi</Switch>);
    const track = trackOf(screen.getByRole('switch'));
    expect(track).toHaveClass('bg-tertiary');
    expect(track).not.toHaveClass('bg-[var(--_md-comp-switch-unselected-track-color)]');
    const thumb = track.querySelector('[data-slot="thumb"]');
    expect(thumb).toHaveClass('bg-on-tertiary');
    expect(thumb).not.toHaveClass('bg-[var(--_md-comp-switch-unselected-handle-color)]');
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
        <Switch defaultChecked icons>
          On
        </Switch>
        <Switch disabled>Disabled</Switch>
        <Switch aria-label="No visible label" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('Switch classNames', () => {
  it('puts the stateLayer slot on the state layer beside the thumb', () => {
    const { container } = render(
      <Switch classNames={{ thumb: 'thumb-x', stateLayer: 'layer-x' }}>Wi-Fi</Switch>,
    );
    const layer = container.querySelector('.layer-x')!;
    expect(layer).toHaveAttribute('aria-hidden', 'true');
    expect(layer.parentElement).toHaveAttribute('data-slot', 'track');
    expect(layer.nextElementSibling).toHaveClass('thumb-x');
  });
});

describe('Switch density', () => {
  it('shrinks only its state layer, from its own density or its scope', async () => {
    const { container } = render(
      <ThemeScope density={-3}>
        <Switch>Inherits</Switch>
        <Switch density={-1}>Own</Switch>
      </ThemeScope>,
    );
    const root = (name: string) => screen.getByText(name).closest('label')!;
    expect(root('Inherits')).not.toHaveAttribute('data-density');
    expect(root('Own')).toHaveAttribute('data-density', '-1');
    const control = root('Own').querySelector('[data-selection-control]')!;
    // The track keeps its size; the state layer is 40px less 4px a step, at least 32px.
    expect(control).toHaveClass('h-[32px]', 'w-[52px]');
    expect(control.querySelector('[data-slot="state-layer"], .state-layer')).toHaveClass(
      '[--m3-switch-layer:max(32px,calc(40px+var(--md-sys-density,0)*4px))]',
      'size-[var(--m3-switch-layer)]',
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
