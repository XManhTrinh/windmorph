import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ButtonContext } from '../button/ButtonContext';
import { IconButton } from './IconButton';

const Star = () => <svg data-testid="star" viewBox="0 0 24 24" />;
const StarFilled = () => <svg data-testid="star-filled" viewBox="0 0 24 24" />;

describe('IconButton', () => {
  it('renders a standard, small, round icon button that inherits the text colour', () => {
    render(<IconButton icon={<Star />} aria-label="Favourite" />);
    const button = screen.getByRole('button', { name: 'Favourite' });
    expect(button).toHaveClass('bg-transparent', 'text-inherit', 'h-[40px]', 'w-[40px]');
    expect(button).toHaveClass('rounded-[min(var(--md-sys-shape-corner-full),20px)]');
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
    ['filled', ['bg-primary', 'text-on-primary', 'data-disabled:text-on-surface/38']],
    ['tonal', ['bg-secondary-container', 'text-on-secondary-container']],
    ['outlined', ['border-current', 'text-inherit', 'data-disabled:text-current/38']],
  ] as const)('styles the %s variant', (variant, classes) => {
    render(<IconButton variant={variant} icon={<Star />} aria-label="Fav" />);
    expect(screen.getByRole('button')).toHaveClass(...classes);
  });

  it.each([
    ['xs', 'narrow', 'h-[32px]', 'w-[28px]', 'size-[20px]'],
    ['sm', 'wide', 'h-[40px]', 'w-[52px]', 'size-[24px]'],
    ['md', 'default', 'h-[56px]', 'w-[56px]', 'size-[24px]'],
    ['lg', 'default', 'h-[96px]', 'w-[96px]', 'size-[32px]'],
    ['xl', 'wide', 'h-[136px]', 'w-[184px]', 'size-[40px]'],
  ] as const)('sizes %s / %s to the Compose measurements', (size, width, h, w, iconSize) => {
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
    expect(button).not.toHaveClass('w-[40px]');
    expect(button).not.toHaveClass('text-inherit');
    expect(button).toHaveStyle({ top: '8px' });
  });

  it('takes size, shape and disabled from ButtonContext but not the Button variant', () => {
    render(
      <ButtonContext value={{ variant: 'elevated', size: 'lg', shape: 'square', disabled: true }}>
        <IconButton icon={<Star />} aria-label="Fav" />
      </ButtonContext>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('h-[96px]', 'rounded-corner-extra-large', 'bg-transparent');
    expect(button).toBeDisabled();
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
    expect(button).toHaveClass('bg-surface-container', 'text-on-surface-variant');
    expect(screen.getByTestId('star')).toBeInTheDocument();

    await userEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(button).toHaveAttribute('data-selected');
    expect(screen.getByTestId('star-filled')).toBeInTheDocument();
    expect(screen.queryByTestId('star')).not.toBeInTheDocument();
    expect(onSelectedChange).toHaveBeenCalledWith(true);
  });

  it('swaps shape on selection with the non-bouncing effects spring', () => {
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
      'data-selected:not-data-pressed:not-data-disabled:rounded-corner-large',
    );
    expect(round).toHaveClass('container-motion');
    expect(round).not.toHaveClass('container-motion-spatial');
    expect(screen.getByRole('button', { name: 'Square' })).toHaveClass(
      'data-selected:not-data-pressed:not-data-disabled:rounded-[min(var(--md-sys-shape-corner-full),28px)]',
    );
  });

  it('uses primary for a selected standard toggle', () => {
    render(<IconButton toggle defaultSelected icon={<Star />} aria-label="Fav" />);
    expect(screen.getByRole('button')).toHaveClass('data-selected:not-data-disabled:text-primary');
  });
});
