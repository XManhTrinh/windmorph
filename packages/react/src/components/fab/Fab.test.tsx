import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ExtendedFab, Fab } from './Fab';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe('Fab', () => {
  it('renders a 56px primary-container FAB with level 3 elevation', () => {
    render(<Fab icon={<Icon />} aria-label="Compose" />);
    const fab = screen.getByRole('button', { name: 'Compose' });
    expect(fab).toHaveClass(
      'size-[56px]',
      'rounded-corner-large',
      'bg-primary-container',
      'text-on-primary-container',
      'shadow-elevation-3',
      'data-hovered:shadow-elevation-4',
      'state-layer',
      'focus-ring',
    );
    expect(screen.getByTestId('icon').parentElement).toHaveClass('size-[24px]');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['medium', 'size-[80px]', 'rounded-corner-large-increased', 'size-[28px]'],
    ['large', 'size-[96px]', 'rounded-corner-extra-large', 'size-[36px]'],
  ] as const)('sizes the %s FAB to Compose', (size, box, corner, iconSize) => {
    render(<Fab size={size} icon={<Icon />} aria-label="Add" />);
    expect(screen.getByRole('button')).toHaveClass(box, corner);
    expect(screen.getByTestId('icon').parentElement).toHaveClass(iconSize);
  });

  it.each([
    ['secondary-container', 'bg-secondary-container', 'text-on-secondary-container'],
    ['tertiary-container', 'bg-tertiary-container', 'text-on-tertiary-container'],
    ['primary', 'bg-primary', 'text-on-primary'],
    ['tertiary', 'bg-tertiary', 'text-on-tertiary'],
  ] as const)('uses the %s colour style', (color, bg, text) => {
    render(<Fab color={color} icon={<Icon />} aria-label="Add" />);
    expect(screen.getByRole('button')).toHaveClass(bg, text);
  });

  it('lowers its elevation', () => {
    render(<Fab lowered icon={<Icon />} aria-label="Add" />);
    expect(screen.getByRole('button')).toHaveClass(
      'shadow-elevation-1',
      'data-hovered:shadow-elevation-2',
    );
  });

  it('presses, positions with consumer classes and renders links', async () => {
    const onPress = vi.fn();
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <Fab icon={<Icon />} aria-label="Add" onPress={onPress} className="fixed end-4 bottom-4" />
        <Fab href="/new" icon={<Icon />} aria-label="New" />
      </RouterProvider>,
    );
    const fab = screen.getByRole('button', { name: 'Add' });
    expect(fab).toHaveClass('fixed', 'end-4', 'bottom-4');
    await userEvent.click(fab);
    expect(onPress).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('link', { name: 'New' }));
    expect(navigate).toHaveBeenCalledWith('/new', undefined);
  });

  it('requires an accessible name and has no disabled state in its types', () => {
    // @ts-expect-error aria-label or aria-labelledby is required
    const unnamed = <Fab icon={<Icon />} />;
    // @ts-expect-error FABs have no disabled state
    const disabled = <Fab icon={<Icon />} aria-label="Add" disabled />;
    expect([unnamed, disabled]).toHaveLength(2);
  });
});

describe('ExtendedFab', () => {
  it('renders a 56px extended FAB with icon and label', () => {
    render(<ExtendedFab icon={<Icon />}>Compose</ExtendedFab>);
    const fab = screen.getByRole('button', { name: 'Compose' });
    expect(fab).toHaveClass(
      'h-[56px]',
      'min-w-[56px]',
      'ps-[16px]',
      'pe-[16px]',
      'text-title-medium',
    );
    expect(fab).toHaveAttribute('data-expanded', 'true');
    expect(screen.getByText('Compose')).toHaveClass('ps-[8px]');
  });

  it.each([
    [
      'md',
      ['h-[80px]', 'ps-[26px]', 'rounded-corner-large-increased', 'text-title-large'],
      'ps-[12px]',
      'size-[28px]',
    ],
    [
      'lg',
      ['h-[96px]', 'ps-[28px]', 'rounded-corner-extra-large', 'text-headline-small'],
      'ps-[16px]',
      'size-[32px]',
    ],
  ] as const)('sizes %s to Compose', (size, rootClasses, gap, iconSize) => {
    render(
      <ExtendedFab size={size} icon={<Icon />}>
        Compose
      </ExtendedFab>,
    );
    expect(screen.getByRole('button')).toHaveClass(...rootClasses);
    expect(screen.getByText('Compose')).toHaveClass(gap);
    expect(screen.getByTestId('icon').parentElement).toHaveClass(iconSize);
  });

  it('collapses to the icon while keeping the label as its accessible name', () => {
    const { rerender } = render(<ExtendedFab icon={<Icon />}>Compose</ExtendedFab>);
    const collapse = screen.getByText('Compose').parentElement!.parentElement!;
    expect(collapse).not.toHaveAttribute('data-collapsed');

    rerender(
      <ExtendedFab icon={<Icon />} expanded={false}>
        Compose
      </ExtendedFab>,
    );
    expect(collapse).toHaveAttribute('data-collapsed');
    expect(collapse).toHaveClass('data-collapsed:grid-cols-[0fr]', 'data-collapsed:opacity-0');
    expect(screen.getByRole('button', { name: 'Compose' })).toHaveAttribute(
      'data-expanded',
      'false',
    );
  });

  it('stays expanded without an icon and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<ExtendedFab expanded={false}>Compose</ExtendedFab>);
    expect(screen.getByText('Compose').parentElement!.parentElement).not.toHaveAttribute(
      'data-collapsed',
    );
    expect(screen.getByText('Compose')).toHaveClass('ps-0');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('cannot collapse'));
    warn.mockRestore();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Fab icon={<Icon />} aria-label="Add" />
        <ExtendedFab icon={<Icon />}>Compose</ExtendedFab>
        <ExtendedFab icon={<Icon />} expanded={false}>
          Collapsed
        </ExtendedFab>
      </div>,
    );
    expect(await axeViolations(container)).toEqual([]);
  });
});
