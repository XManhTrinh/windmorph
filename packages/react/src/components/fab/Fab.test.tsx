import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider } from 'react-aria';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { FloatingToolbar } from '../toolbar/Toolbar';
import { ExtendedFab, Fab } from './Fab';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

describe('Fab', () => {
  it('renders a 56px primary-container FAB with level 3 elevation', () => {
    render(<Fab icon={<Icon />} aria-label="Compose" />);
    const fab = screen.getByRole('button', { name: 'Compose' });
    expect(fab).toHaveAttribute('data-tokens', 'md-comp-fab');
    expect(fab).toHaveAttribute('data-color', 'primary-container');
    expect(fab).toHaveAttribute('data-size', 'default');
    expect(fab).toHaveClass(
      'size-[56px]',
      'rounded-[var(--_md-comp-fab-container-shape)]',
      'bg-[var(--_md-comp-fab-container-color)]',
      'text-[color:var(--_md-comp-fab-icon-color)]',
      'shadow-elevation-3',
      // Pressed is level 3 again: the hover level never applies while pressed.
      'data-hovered:not-data-pressed:shadow-elevation-4',
      'state-layer',
      'focus-ring',
    );
    expect(screen.getByTestId('icon').parentElement).toHaveClass('size-[24px]');
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['medium', 'size-[80px]', 'size-[28px]'],
    ['large', 'size-[96px]', 'size-[32px]'],
  ] as const)('sizes the %s FAB to the spec tokens', (size, box, iconSize) => {
    render(<Fab size={size} icon={<Icon />} aria-label="Add" />);
    expect(screen.getByRole('button')).toHaveClass(box);
    // The corners come from the size's token (--md-comp-fab-<size>-container-shape).
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size);
    expect(screen.getByTestId('icon').parentElement).toHaveClass(iconSize);
  });

  it.each(['secondary-container', 'tertiary-container', 'primary', 'tertiary'] as const)(
    'marks the %s colour style for its component tokens',
    (color) => {
      render(<Fab color={color} icon={<Icon />} aria-label="Add" />);
      expect(screen.getByRole('button')).toHaveAttribute('data-color', color);
    },
  );

  it('lets consumer colour and corner classes replace the token classes', () => {
    render(
      <Fab
        icon={<Icon />}
        aria-label="Add"
        className="bg-tertiary text-on-tertiary rounded-corner-small"
      />,
    );
    const fab = screen.getByRole('button');
    expect(fab).toHaveClass('bg-tertiary', 'text-on-tertiary', 'rounded-corner-small');
    expect(fab.className).not.toMatch(/--_md-comp-fab-/);
  });

  it('lowers its elevation, or sits flat (level 0) when nested in another component', () => {
    render(
      <>
        <Fab elevation="lowered" icon={<Icon />} aria-label="Lowered" />
        <Fab elevation="flat" icon={<Icon />} aria-label="Flat" />
        <ExtendedFab elevation="flat" icon={<Icon />}>
          Compose
        </ExtendedFab>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Lowered' })).toHaveClass(
      'shadow-elevation-1',
      'data-hovered:not-data-pressed:shadow-elevation-2',
    );
    for (const name of ['Flat', 'Compose']) {
      const fab = screen.getByRole('button', { name });
      expect(fab).toHaveClass('shadow-elevation-0', 'state-layer');
      expect(fab.className).not.toMatch(/data-hovered:shadow/);
    }
  });

  it('disappears towards its centre and reappears, inert while hidden', async () => {
    const { rerender } = render(<Fab icon={<Icon />} aria-label="Add" />);
    const fab = screen.getByRole('button', { name: 'Add' });
    expect(fab).not.toHaveAttribute('data-hidden');
    expect(fab).not.toHaveAttribute('inert');
    expect(fab).toHaveClass(
      'data-hidden:[transform:scale(0.2)]',
      'data-hidden:opacity-0',
      'motion-reduce:data-hidden:[transform:none]',
    );

    rerender(<Fab icon={<Icon />} aria-label="Add" visible={false} />);
    expect(fab).toHaveAttribute('data-hidden', 'true');
    expect(fab).toHaveAttribute('inert');

    rerender(<Fab icon={<Icon />} aria-label="Add" appear />);
    expect(fab).not.toHaveAttribute('inert');
    expect(fab).toHaveAttribute('data-appear', 'true');
    expect(fab).toHaveClass('data-appear:starting:[transform:scale(0.2)]');
    expect(await axeViolations(fab.parentElement!)).toEqual([]);
  });

  it('shows its label in a tooltip on hover, unless turned off', async () => {
    render(
      <>
        <Fab icon={<Icon />} aria-label="Compose" />
        <Fab icon={<Icon />} aria-label="Plain" tooltip={false} />
      </>,
    );
    fireEvent.pointerMove(document.body);
    await userEvent.hover(screen.getByRole('button', { name: 'Compose' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Compose');
    await userEvent.unhover(screen.getByRole('button', { name: 'Compose' }));
    await userEvent.hover(screen.getByRole('button', { name: 'Plain' }));
    expect(screen.queryAllByRole('tooltip').map((tip) => tip.textContent)).not.toContain('Plain');
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
    expect(fab).toHaveAttribute('data-tokens', 'md-comp-extended-fab');
    expect(fab).toHaveAttribute('data-color', 'primary-container');
    expect(fab).toHaveAttribute('data-size', 'sm');
    expect(fab).toHaveClass(
      'h-[56px]',
      'min-w-[56px]',
      'ps-[16px]',
      'pe-[16px]',
      'text-title-medium',
      'rounded-[var(--_md-comp-extended-fab-container-shape)]',
      'bg-[var(--_md-comp-extended-fab-container-color)]',
      'text-[color:var(--_md-comp-extended-fab-label-text-color)]',
    );
    expect(fab).toHaveAttribute('data-expanded', 'true');
    expect(screen.getByText('Compose')).toHaveClass('ps-[8px]');
  });

  it('shows its label in a tooltip only while collapsed, unless turned off', async () => {
    const { rerender } = render(<ExtendedFab icon={<Icon />}>Compose</ExtendedFab>);
    const fab = screen.getByRole('button', { name: 'Compose' });
    fireEvent.pointerMove(document.body);
    // Expanded, the label is visible, so there is no tooltip.
    await userEvent.hover(fab);
    expect(screen.queryByRole('tooltip')).toBeNull();
    await userEvent.unhover(fab);

    rerender(
      <ExtendedFab icon={<Icon />} expanded={false}>
        Compose
      </ExtendedFab>,
    );
    // The same element: collapsing never remounts the FAB.
    expect(screen.getByRole('button', { name: 'Compose' })).toBe(fab);
    await userEvent.hover(fab);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Compose');
    expect(fab).toHaveAttribute('aria-describedby');

    // Expanding again closes it.
    rerender(<ExtendedFab icon={<Icon />}>Compose</ExtendedFab>);
    expect(fab).not.toHaveAttribute('aria-describedby');
    await userEvent.unhover(fab);

    rerender(
      <ExtendedFab icon={<Icon />} expanded={false} tooltip={false}>
        Plain
      </ExtendedFab>,
    );
    await userEvent.hover(screen.getByRole('button', { name: 'Plain' }));
    expect(screen.queryAllByRole('tooltip').map((tip) => tip.textContent)).not.toContain('Plain');
  });

  it('hides like a FAB', () => {
    render(
      <ExtendedFab icon={<Icon />} visible={false}>
        Compose
      </ExtendedFab>,
    );
    const fab = screen.getByText('Compose').closest('button')!;
    expect(fab).toHaveAttribute('data-hidden', 'true');
    expect(fab).toHaveAttribute('inert');
  });

  it.each([
    ['md', ['h-[80px]', 'ps-[26px]', 'text-title-large'], 'ps-[16px]', 'size-[28px]'],
    ['lg', ['h-[96px]', 'ps-[28px]', 'text-headline-small'], 'ps-[20px]', 'size-[32px]'],
  ] as const)('sizes %s to the spec tokens', (size, rootClasses, gap, iconSize) => {
    render(
      <ExtendedFab size={size} icon={<Icon />}>
        Compose
      </ExtendedFab>,
    );
    expect(screen.getByRole('button')).toHaveClass(...rootClasses);
    expect(screen.getByRole('button')).toHaveAttribute('data-size', size);
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
    // Both directions run on the fast spatial and fast effects springs.
    expect(collapse.className).not.toMatch(/-default-/);
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

  it('warns once when paired with a floating toolbar, and only in development', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const toolbar = (label: string) => (
      <FloatingToolbar
        aria-label="Actions"
        fab={<ExtendedFab icon={<Icon />}>{label}</ExtendedFab>}
      >
        <button type="button">Search</button>
      </FloatingToolbar>
    );
    const { rerender, unmount } = render(toolbar('Compose'));
    rerender(toolbar('Write'));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('not an extended FAB'));
    unmount();

    // Outside a toolbar, or in production, it stays silent.
    warn.mockClear();
    render(<ExtendedFab icon={<Icon />}>Compose</ExtendedFab>);
    vi.stubEnv('NODE_ENV', 'production');
    render(toolbar('Compose'));
    vi.unstubAllEnvs();
    expect(warn).not.toHaveBeenCalled();
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
