import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ButtonContext } from '../button/ButtonContext';
import { ThemeScope } from '../../theme/ThemeScope';
import { Tooltip, TooltipTrigger } from '../tooltip/Tooltip';
import { Menu, MenuItem, MenuTrigger } from '../menu/Menu';
import { IconButton } from './IconButton';

const Star = () => <svg data-testid="star" viewBox="0 0 24 24" />;
const StarFilled = () => <svg data-testid="star-filled" viewBox="0 0 24 24" />;

describe('IconButton', () => {
  it('renders a filled, small, round icon button by default (M3 Expressive)', () => {
    render(<IconButton icon={<Star />} aria-label="Favourite" />);
    const button = screen.getByRole('button', { name: 'Favourite' });
    expect(button).toHaveAttribute('data-tokens', 'md-comp-icon-button');
    expect(button).toHaveAttribute('data-variant', 'filled');
    expect(button).toHaveAttribute('data-size', 'sm');
    expect(button).toHaveClass(
      'bg-[var(--_md-comp-icon-button-container-color)]',
      'text-[color:var(--_md-comp-icon-button-icon-color)]',
      'h-[var(--m3-icon-button-height)]',
      '[--m3-icon-button-height:calc(40px+var(--md-sys-density,0)*4px)]',
      'w-[calc(40px+var(--md-sys-density,0)*4px)]',
    );
    expect(button).toHaveClass(
      'rounded-[min(var(--_md-comp-icon-button-container-shape-round-capped),calc(var(--m3-icon-button-height)/2))]',
    );
    expect(button).toHaveClass('data-pressed:rounded-corner-small', 'state-layer', 'focus-ring');
    expect(screen.getByTestId('star').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onPress and does not when disabled', async () => {
    const onPress = vi.fn();
    const { rerender } = render(<IconButton icon={<Star />} aria-label="Fav" onPress={onPress} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(<IconButton icon={<Star />} aria-label="Fav" onPress={onPress} disabled />);
    await userEvent.click(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it.each([
    ['filled', ['bg-[var(--_md-comp-icon-button-container-color)]']],
    ['tonal', ['bg-[var(--_md-comp-icon-button-container-color)]']],
    [
      'outlined',
      [
        'bg-transparent',
        'border-solid',
        'border-[color:var(--_md-comp-icon-button-outline-color)]',
      ],
    ],
    ['standard', ['bg-transparent']],
  ] as const)('marks the %s variant for its component tokens', (variant, classes) => {
    render(<IconButton variant={variant} icon={<Star />} aria-label="Fav" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', variant);
    expect(button).toHaveClass(
      'text-[color:var(--_md-comp-icon-button-icon-color)]',
      'data-disabled:text-on-surface/38',
      ...classes,
    );
  });

  it('lets consumer colour, corner and outline classes replace the token classes', () => {
    render(
      <IconButton
        variant="outlined"
        className="bg-tertiary text-on-tertiary rounded-corner-small border-primary"
        icon={<Star />}
        aria-label="Fav"
      />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-tertiary',
      'text-on-tertiary',
      'rounded-corner-small',
      'border-primary',
    );
    expect(button).not.toHaveClass(
      'text-[color:var(--_md-comp-icon-button-icon-color)]',
      'rounded-[min(var(--_md-comp-icon-button-container-shape-round-capped),calc(var(--m3-icon-button-height)/2))]',
      'border-[color:var(--_md-comp-icon-button-outline-color)]',
    );
  });

  it.each([
    // Each size's height and width less 4px per density step (`--md-sys-density`, 0 by default).
    [
      'xs',
      'narrow',
      '[--m3-icon-button-height:max(24px,calc(32px+var(--md-sys-density,0)*4px))]',
      'w-[max(24px,calc(28px+var(--md-sys-density,0)*4px))]',
      'size-[20px]',
    ],
    [
      'sm',
      'wide',
      '[--m3-icon-button-height:calc(40px+var(--md-sys-density,0)*4px)]',
      'w-[calc(52px+var(--md-sys-density,0)*4px)]',
      'size-[24px]',
    ],
    [
      'md',
      'default',
      '[--m3-icon-button-height:calc(56px+var(--md-sys-density,0)*4px)]',
      'w-[calc(56px+var(--md-sys-density,0)*4px)]',
      'size-[24px]',
    ],
    [
      'lg',
      'default',
      '[--m3-icon-button-height:calc(96px+var(--md-sys-density,0)*4px)]',
      'w-[calc(96px+var(--md-sys-density,0)*4px)]',
      'size-[32px]',
    ],
    [
      'xl',
      'wide',
      '[--m3-icon-button-height:calc(136px+var(--md-sys-density,0)*4px)]',
      'w-[calc(184px+var(--md-sys-density,0)*4px)]',
      'size-[40px]',
    ],
  ] as const)('sizes %s / %s to the token measurements', (size, width, h, w, iconSize) => {
    render(<IconButton size={size} width={width} icon={<Star />} aria-label="Fav" />);
    const button = screen.getByRole('button');
    expect(button).toHaveClass(h, w);
    expect(screen.getByTestId('star').parentElement).toHaveClass(iconSize);
  });

  it('adds a 48px touch target to XS and S only', () => {
    const { container } = render(
      <>
        <IconButton size="xs" icon={<Star />} aria-label="A" />
        <IconButton size="sm" icon={<Star />} aria-label="B" />
        <IconButton size="md" icon={<Star />} aria-label="C" />
      </>,
    );
    expect(container.querySelectorAll('[data-touch-target]')).toHaveLength(2);
  });

  it('puts className, style and ref on the root and lets consumer classes win', () => {
    let element: HTMLButtonElement | null = null;
    render(
      <IconButton
        ref={(node) => {
          element = node;
        }}
        icon={<Star />}
        aria-label="Fav"
        className="fixed w-full text-error"
        style={{ top: 8 }}
      />,
    );
    const button = screen.getByRole('button');
    expect(element).toBe(button);
    expect(button).toHaveClass('fixed', 'w-full', 'text-error');
    expect(button).not.toHaveClass('w-[calc(40px+var(--md-sys-density,0)*4px)]');
    expect(button).not.toHaveClass('text-[color:var(--_md-comp-icon-button-icon-color)]');
    expect(button).toHaveStyle({ top: '8px' });
  });

  it('lets a consumer colour replace the standard icon colour', () => {
    render(
      <IconButton variant="standard" className="text-error" icon={<Star />} aria-label="Fav" />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-error');
    expect(button).not.toHaveClass('text-[color:var(--_md-comp-icon-button-icon-color)]');
  });

  it('takes size, shape and disabled from ButtonContext but not the Button variant', () => {
    render(
      <ButtonContext value={{ variant: 'elevated', size: 'lg', shape: 'square', disabled: true }}>
        <IconButton icon={<Star />} aria-label="Fav" />
      </ButtonContext>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'filled');
    expect(button).toHaveAttribute('data-size', 'lg');
    expect(button).toHaveClass(
      '[--m3-icon-button-height:calc(96px+var(--md-sys-density,0)*4px)]',
      'rounded-[var(--_md-comp-icon-button-container-shape-square)]',
    );
    expect(button).toBeDisabled();
  });

  it('takes its default variant from ButtonContext, and its own variant wins', () => {
    render(
      <ButtonContext value={{ iconButtonVariant: 'standard' }}>
        <IconButton icon={<Star />} aria-label="Search" />
        <IconButton variant="tonal" icon={<Star />} aria-label="Share" />
      </ButtonContext>,
    );
    expect(screen.getByRole('button', { name: 'Search' })).toHaveAttribute(
      'data-variant',
      'standard',
    );
    expect(screen.getByRole('button', { name: 'Share' })).toHaveAttribute('data-variant', 'tonal');
  });

  it('shows its label as a tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<IconButton icon={<Star />} aria-label="Favourite" classNames={{ tooltip: 'tip-x' }} />);
    await user.hover(screen.getByRole('button'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Favourite');
    expect(screen.getByRole('tooltip')).toHaveClass('tip-x');
  });

  it("doesn't describe itself with a tooltip that repeats its name", async () => {
    const user = userEvent.setup();
    render(
      <MenuTrigger>
        <IconButton icon={<Star />} aria-label="More" />
        <Menu>
          <MenuItem key="a">A</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    const button = screen.getByRole('button', { name: 'More' });
    await user.hover(button);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('More');
    // Announced once: the tooltip isn't linked, and the menu trigger's props still arrive.
    expect(button).not.toHaveAttribute('aria-describedby');
    expect(button).toHaveAttribute('aria-haspopup', 'true');
  });

  it('skips its tooltip when turned off, labelled elsewhere or already in a TooltipTrigger', async () => {
    const user = userEvent.setup();
    render(
      <>
        <IconButton tooltip={false} icon={<Star />} aria-label="Off" />
        <span id="name">Named</span>
        <IconButton icon={<Star />} aria-labelledby="name" />
        <TooltipTrigger>
          <IconButton icon={<Star />} aria-label="Wrapped" />
          <Tooltip>Add to favourites</Tooltip>
        </TooltipTrigger>
      </>,
    );
    await user.hover(screen.getByRole('button', { name: 'Off' }));
    await user.hover(screen.getByRole('button', { name: 'Named' }));
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.hover(screen.getByRole('button', { name: 'Wrapped' }));
    const tooltips = await screen.findAllByRole('tooltip');
    expect(tooltips).toHaveLength(1);
    expect(within(tooltips[0]!).getByText('Add to favourites')).toBeInTheDocument();
  });

  it('renders a link that navigates through the RouterProvider', async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <IconButton href="/settings" icon={<Star />} aria-label="Settings" />
      </RouterProvider>,
    );
    await userEvent.click(screen.getByRole('link', { name: 'Settings' }));
    expect(navigate).toHaveBeenCalledWith('/settings', undefined);
  });

  it('requires an accessible name in its types', () => {
    // @ts-expect-error aria-label or aria-labelledby is required
    const unnamed = <IconButton icon={<Star />} />;
    expect(unnamed).toBeTruthy();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        {(['standard', 'filled', 'tonal', 'outlined'] as const).map((variant) => (
          <IconButton key={variant} variant={variant} icon={<Star />} aria-label={variant} />
        ))}
        <IconButton toggle icon={<Star />} aria-label="Toggle" />
        <span id="label">Labelled elsewhere</span>
        <IconButton icon={<Star />} aria-labelledby="label" />
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe('IconButton icon transition', () => {
  it('swaps the icon at once by default, with no faces', async () => {
    render(
      <IconButton toggle icon={<Star />} selectedIcon={<StarFilled />} aria-label="Favourite" />,
    );
    const button = screen.getByRole('button', { name: 'Favourite' });
    expect(button.querySelector('[data-icon-face]')).toBeNull();
    await userEvent.click(button);
    expect(screen.getByTestId('star-filled')).toBeInTheDocument();
    expect(screen.queryByTestId('star')).not.toBeInTheDocument();
  });

  it('rotate keeps both icons as faces and moves data-active to the selected one', async () => {
    render(
      <IconButton
        toggle
        icon={<Star />}
        selectedIcon={<StarFilled />}
        iconTransition="rotate"
        aria-label="Favourite"
      />,
    );
    const button = screen.getByRole('button', { name: 'Favourite' });
    const face = (kind: string) => button.querySelector(`[data-icon-face="${kind}"]`)!;
    expect(face('primary')).toHaveAttribute('data-active');
    expect(face('alternate')).not.toHaveAttribute('data-active');
    expect(face('primary').parentElement).toHaveClass('inline-grid');
    await userEvent.click(button);
    expect(face('primary')).not.toHaveAttribute('data-active');
    expect(face('alternate')).toHaveAttribute('data-active');
    expect(screen.getByTestId('star')).toBeInTheDocument();
    expect(screen.getByTestId('star-filled')).toBeInTheDocument();
  });

  it('rotate without selectedIcon shows the icon alone', () => {
    render(<IconButton toggle icon={<Star />} iconTransition="rotate" aria-label="Favourite" />);
    expect(
      screen.getByRole('button', { name: 'Favourite' }).querySelector('[data-icon-face]'),
    ).toBeNull();
  });
});

describe('IconButton toggle', () => {
  it('toggles aria-pressed, the selected colours and the selected icon', async () => {
    const onSelectedChange = vi.fn();
    render(
      <IconButton
        toggle
        variant="filled"
        icon={<Star />}
        selectedIcon={<StarFilled />}
        aria-label="Favourite"
        onSelectedChange={onSelectedChange}
      />,
    );
    const button = screen.getByRole('button', { name: 'Favourite' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(button).toHaveClass(
      'bg-[var(--_md-comp-icon-button-unselected-container-color)]',
      'text-[color:var(--_md-comp-icon-button-unselected-icon-color)]',
      'data-selected:not-data-disabled:bg-[var(--_md-comp-icon-button-selected-container-color)]',
      'data-selected:not-data-disabled:text-[color:var(--_md-comp-icon-button-selected-icon-color)]',
    );
    expect(button).not.toHaveClass('bg-[var(--_md-comp-icon-button-container-color)]');
    expect(screen.getByTestId('star')).toBeInTheDocument();

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-selected');
    expect(screen.getByTestId('star-filled')).toBeInTheDocument();
    expect(screen.queryByTestId('star')).not.toBeInTheDocument();
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it('swaps shape on selection, morphing with the container motion', () => {
    render(
      <>
        <IconButton toggle defaultSelected size="md" icon={<Star />} aria-label="Round" />
        <IconButton
          toggle
          defaultSelected
          size="md"
          shape="square"
          icon={<Star />}
          aria-label="Square"
        />
      </>,
    );
    const round = screen.getByRole('button', { name: 'Round' });
    expect(round).toHaveClass(
      'data-selected:not-data-pressed:not-data-disabled:rounded-[var(--_md-comp-icon-button-container-shape-square)]',
    );
    expect(round).toHaveClass('container-motion');
    expect(screen.getByRole('button', { name: 'Square' })).toHaveClass(
      'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--_md-comp-icon-button-container-shape-round-capped),calc(var(--m3-icon-button-height)/2))]',
    );
  });

  it('reads the selected icon colour for a selected standard toggle', () => {
    render(
      <IconButton toggle variant="standard" defaultSelected icon={<Star />} aria-label="Fav" />,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('data-variant', 'standard');
    expect(button).toHaveClass(
      'data-selected:not-data-disabled:text-[color:var(--_md-comp-icon-button-selected-icon-color)]',
    );
  });

  it('dims a disabled outline and drops the outline of a selected outlined toggle', () => {
    render(
      <>
        <IconButton variant="outlined" disabled icon={<Star />} aria-label="Off" />
        <IconButton
          toggle
          variant="outlined"
          defaultSelected
          disabled
          icon={<Star />}
          aria-label="Selected off"
        />
      </>,
    );
    expect(screen.getByRole('button', { name: 'Off' })).toHaveClass(
      'data-disabled:not-data-selected:border-outline-variant/10',
    );
    const selected = screen.getByRole('button', { name: 'Selected off' });
    expect(selected).toHaveAttribute('data-selected');
    expect(selected).toHaveClass('data-selected:border-transparent');
    expect(selected.className).not.toMatch(/not-data-disabled:border-transparent/);
  });
});

describe('IconButton density', () => {
  it("takes its scope's density unless it sets its own, and stays accessible", async () => {
    const { container } = render(
      <ThemeScope density={-3}>
        <IconButton icon={<Star />} aria-label="Inherits" />
        <IconButton icon={<Star />} aria-label="Own" density={-1} />
      </ThemeScope>,
    );
    expect(screen.getByRole('button', { name: 'Inherits' })).not.toHaveAttribute('data-density');
    expect(screen.getByRole('button', { name: 'Own' })).toHaveAttribute('data-density', '-1');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('caps the round corners at half the dense height', () => {
    render(<IconButton size="md" icon={<Star />} aria-label="Search" />);
    expect(screen.getByRole('button')).toHaveClass(
      'h-[var(--m3-icon-button-height)]',
      'rounded-[min(var(--_md-comp-icon-button-container-shape-round-capped),calc(var(--m3-icon-button-height)/2))]',
    );
  });
});
