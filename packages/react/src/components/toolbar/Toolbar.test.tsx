import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { IconButton } from '../icon-button/IconButton';
import { DockedToolbar, FloatingToolbar, ToolbarFab } from './Toolbar';
import { useToolbarScrollExit, useToolbarScrollExpansion } from './use-toolbar-scroll-expansion';

const Icon = () => <svg viewBox="0 0 24 24" />;
const button = (name: string) => <IconButton icon={<Icon />} aria-label={name} />;

describe('DockedToolbar', () => {
  it('renders a named 64px surface-container toolbar', async () => {
    const { container } = render(
      <DockedToolbar aria-label="Actions" className="fixed bottom-0" data-testid="bar">
        {button('Archive')}
        {button('Delete')}
      </DockedToolbar>,
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Actions' });
    expect(toolbar).toBe(screen.getByTestId('bar'));
    expect(toolbar).toHaveClass(
      'h-[64px]',
      'w-full',
      'bg-surface-container',
      'text-on-surface-variant',
      'ps-[16px]',
      'pe-[16px]',
      'justify-center',
      'gap-[32px]',
      'fixed',
      'bottom-0',
    );
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('spreads its items out for compact windows', () => {
    render(
      <DockedToolbar aria-label="Actions" arrangement="space-between">
        {button('Archive')}
      </DockedToolbar>,
    );
    expect(screen.getByRole('toolbar')).toHaveClass('justify-between');
    expect(screen.getByRole('toolbar')).not.toHaveClass('gap-[32px]');
  });

  it('slides off the bottom when hidden, and turns inert', () => {
    render(
      <DockedToolbar aria-label="Actions" visible={false} data-testid="bar">
        {button('Archive')}
      </DockedToolbar>,
    );
    const toolbar = screen.getByTestId('bar');
    expect(toolbar).toHaveAttribute('data-hidden', 'true');
    expect(toolbar).toHaveAttribute('inert');
    expect(toolbar).toHaveClass(
      'data-hidden:[transform:translateY(100%)]',
      'motion-reduce:data-hidden:opacity-0',
    );
  });

  it('moves focus between controls with the arrow keys', async () => {
    render(
      <DockedToolbar aria-label="Actions">
        {button('One')}
        {button('Two')}
      </DockedToolbar>,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'One' })).toHaveFocus();
  });

  it('follows the DOM direction for arrow keys', async () => {
    render(
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <DockedToolbar aria-label="Actions">
          {button('One')}
          {button('Two')}
        </DockedToolbar>
      </div>,
    );
    await userEvent.tab();
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getByRole('button', { name: 'Two' })).toHaveFocus();
  });

  it('requires a name in its types', () => {
    // @ts-expect-error aria-label or aria-labelledby is required
    const unnamed = <DockedToolbar>{button('One')}</DockedToolbar>;
    expect(unnamed).toBeTruthy();
  });
});

describe('FloatingToolbar', () => {
  it('renders a standard, elevated pill with 8px padding', async () => {
    const { container } = render(
      <FloatingToolbar aria-label="Formatting">{button('Bold')}</FloatingToolbar>,
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar).toHaveClass(
      'rounded-corner-full',
      'p-[8px]',
      'min-h-[64px]',
      'bg-surface-container',
      'text-on-surface-variant',
      'shadow-elevation-1',
    );
    expect(toolbar).toHaveAttribute('data-expanded', 'true');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('drops its elevation over visually distinct content', () => {
    render(
      <FloatingToolbar aria-label="Formatting" elevated={false}>
        {button('Bold')}
      </FloatingToolbar>,
    );
    expect(screen.getByRole('toolbar').className).not.toMatch(/shadow-elevation-1/);
  });

  it('recolours icon buttons in a vibrant toolbar, but not in its overlays', () => {
    render(
      <FloatingToolbar aria-label="Tools" color="vibrant">
        <IconButton icon={<Icon />} aria-label="Pen" />
        <IconButton toggle variant="tonal" defaultSelected icon={<Icon />} aria-label="Bold" />
      </FloatingToolbar>,
    );
    // Standard icons read the colour token, which the vibrant toolbar sets to its own
    // on-primary-container text colour; portalled overlays don't inherit it.
    expect(screen.getByRole('toolbar')).toHaveClass(
      'text-on-primary-container',
      '[--md-comp-icon-button-icon-color:currentColor]',
    );
    expect(screen.getByRole('button', { name: 'Pen' })).toHaveClass(
      'text-[color:var(--md-comp-icon-button-icon-color,var(--md-sys-color-on-surface-variant))]',
    );
    const bold = screen.getByRole('button', { name: 'Bold' });
    expect(bold).toHaveClass(
      'data-selected:not-data-disabled:bg-surface-container',
      'data-selected:not-data-disabled:text-on-surface',
    );
    expect(bold).not.toHaveClass('data-selected:not-data-disabled:bg-secondary');
  });

  it('gives the toolbar FAB an elevation option, as Fab has', () => {
    render(
      <FloatingToolbar
        aria-label="Tools"
        fab={<ToolbarFab icon={<Icon />} aria-label="Add" elevation="flat" />}
      >
        {button('Pen')}
      </FloatingToolbar>,
    );
    const fab = screen.getByRole('button', { name: 'Add' });
    expect(fab).toHaveClass('shadow-elevation-0');
    expect(fab).not.toHaveClass('shadow-elevation-2');
  });

  it('warns once about square icon buttons in a floating toolbar, not on every render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const toolbar = (label: string) => (
      <FloatingToolbar aria-label="Tools">
        <IconButton shape="square" icon={<Icon />} aria-label={label} />
      </FloatingToolbar>
    );
    const { rerender } = render(toolbar('Pen'));
    rerender(toolbar('Marker'));
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('square icon buttons'));
    warn.mockRestore();
  });

  it('slides off its exit edge when hidden', () => {
    render(
      <FloatingToolbar aria-label="Tools" visible={false} exitEdge="end" orientation="vertical">
        {button('Pen')}
      </FloatingToolbar>,
    );
    const toolbar = screen.getByRole('toolbar', { hidden: true });
    expect(toolbar).toHaveAttribute('inert');
    expect(toolbar).toHaveClass(
      'data-hidden:[transform:translateX(calc(100%+24px))]',
      'rtl:data-hidden:[transform:translateX(calc(-100%-24px))]',
    );
  });

  it('uses vibrant colours and a vertical layout', () => {
    render(
      <FloatingToolbar aria-label="Tools" color="vibrant" orientation="vertical">
        {button('Pen')}
      </FloatingToolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveClass('bg-primary-container', 'text-on-primary-container', 'flex-col');
    expect(toolbar).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('collapses leading and trailing content, which stays reachable', () => {
    const { rerender } = render(
      <FloatingToolbar aria-label="Edit" leading={button('Undo')} trailing={button('Redo')}>
        {button('Bold')}
      </FloatingToolbar>,
    );
    expect(screen.getByRole('button', { name: 'Undo' })).toBeVisible();
    rerender(
      <FloatingToolbar
        aria-label="Edit"
        expanded={false}
        leading={button('Undo')}
        trailing={button('Redo')}
      >
        {button('Bold')}
      </FloatingToolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('data-expanded', 'false');
    const undoSlot = screen
      .getByRole('button', { name: 'Undo' })
      .closest('[data-toolbar-collapsible]');
    expect(undoSlot).toHaveAttribute('data-collapsed', 'true');
    expect(undoSlot).toHaveClass('data-collapsed:grid-cols-[0fr]');
    // Clipped to nothing, but still in the tab order and the accessibility tree.
    expect(undoSlot!.firstElementChild).toHaveClass('data-collapsed:[clip-path:inset(50%)]');
    expect(toolbar.querySelector('[inert]')).toBe(null);
  });

  it('expands when focus reaches collapsed content', () => {
    render(
      <FloatingToolbar aria-label="Edit" expanded={false} trailing={button('Redo')}>
        {button('Bold')}
      </FloatingToolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    // Pointer focus on an always-shown control leaves it collapsed…
    fireEvent.pointerDown(document.body, { pointerType: 'mouse' });
    act(() => screen.getByRole('button', { name: 'Bold' }).focus());
    expect(toolbar).toHaveAttribute('data-expanded', 'false');
    // …while focus on collapsed content (a screen reader or the keyboard) expands it.
    act(() => screen.getByRole('button', { name: 'Redo' }).focus());
    expect(toolbar).toHaveAttribute('data-expanded', 'true');
    act(() => screen.getByRole('button', { name: 'Redo' }).blur());
    expect(toolbar).toHaveAttribute('data-expanded', 'false');
  });

  it('expands while keyboard focus is inside', async () => {
    render(
      <FloatingToolbar aria-label="Edit" expanded={false} leading={button('Undo')}>
        {button('Bold')}
      </FloatingToolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('data-expanded', 'false');
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveFocus();
    expect(toolbar).toHaveAttribute('data-expanded', 'true');
    await userEvent.tab();
    expect(toolbar).toHaveAttribute('data-expanded', 'false');
  });

  it('puts a FAB beside the toolbar and grows it while collapsed', () => {
    const onPress = vi.fn();
    const { rerender } = render(
      <FloatingToolbar
        aria-label="Actions"
        fab={<ToolbarFab icon={<Icon />} aria-label="New" onPress={onPress} />}
      >
        {button('Search')}
      </FloatingToolbar>,
    );
    const fab = screen.getByRole('button', { name: 'New' });
    expect(fab).toHaveClass(
      'size-full',
      'rounded-corner-large',
      'bg-primary-container',
      'shadow-elevation-2',
      // Hover 3, pressed 2: the hover level never applies while pressed.
      'data-hovered:not-data-pressed:shadow-elevation-3',
    );
    expect(fab.parentElement).toHaveClass('size-[56px]', 'data-collapsed:size-[80px]');
    const surface = screen.getByRole('button', { name: 'Search' }).parentElement!.parentElement!;
    expect(surface).toHaveClass(
      'bg-surface-container',
      'shadow-elevation-1',
      'rounded-corner-full',
    );
    expect(screen.getByRole('toolbar')).toHaveClass('min-h-[80px]', 'gap-[8px]');
    fireEvent.click(fab);

    rerender(
      <FloatingToolbar
        aria-label="Actions"
        color="vibrant"
        expanded={false}
        fabPosition="start"
        fab={<ToolbarFab icon={<Icon />} aria-label="New" />}
      >
        {button('Search')}
      </FloatingToolbar>,
    );
    expect(screen.getByRole('button', { name: 'New' })).toHaveClass('bg-tertiary-container');
    expect(screen.getByRole('button', { name: 'New' }).parentElement).toHaveAttribute(
      'data-collapsed',
      'true',
    );
    expect(screen.getByRole('toolbar')).toHaveClass('flex-row-reverse');
    expect(surface).toHaveAttribute('data-collapsed', 'true');
    expect(surface).not.toHaveAttribute('inert');
  });

  it('passes consumer classes, styles and data attributes to the root', () => {
    render(
      <FloatingToolbar
        aria-label="Edit"
        className="fixed bottom-4"
        style={{ zIndex: 3 }}
        data-testid="toolbar"
        classNames={{ items: 'custom-items' }}
      >
        {button('Bold')}
      </FloatingToolbar>,
    );
    const toolbar = screen.getByTestId('toolbar');
    expect(toolbar).toHaveClass('fixed', 'bottom-4');
    expect(toolbar.style.zIndex).toBe('3');
    expect(screen.getByRole('button', { name: 'Bold' }).parentElement).toHaveClass('custom-items');
  });

  it('keeps FABs and leading content apart in its types', () => {
    const fab = <ToolbarFab icon={<Icon />} aria-label="New" />;
    const noFab = (
      // @ts-expect-error a FAB position needs a FAB
      <FloatingToolbar aria-label="A" fabPosition="end">
        x
      </FloatingToolbar>
    );
    const both = (
      // @ts-expect-error leading content and a FAB don't combine
      <FloatingToolbar aria-label="A" fab={fab} leading={button('Undo')}>
        x
      </FloatingToolbar>
    );
    const vertical = (
      <FloatingToolbar aria-label="A" orientation="vertical" fab={fab} fabPosition="top">
        x
      </FloatingToolbar>
    );
    expect([noFab, both, vertical]).toHaveLength(3);
  });
});

describe('ToolbarFab', () => {
  it('shows its label in a tooltip on hover', async () => {
    render(
      <FloatingToolbar aria-label="Actions" fab={<ToolbarFab icon={<Icon />} aria-label="New" />}>
        {button('Search')}
      </FloatingToolbar>,
    );
    fireEvent.pointerMove(document.body);
    await userEvent.hover(screen.getByRole('button', { name: 'New' }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('New');
  });

  it('shows one icon, with no faces, without expandedIcon', () => {
    const { rerender } = render(
      <FloatingToolbar aria-label="Actions" fab={<ToolbarFab icon={<Icon />} aria-label="New" />}>
        {button('Search')}
      </FloatingToolbar>,
    );
    const fab = screen.getByRole('button', { name: 'New' });
    const icon = fab.firstElementChild!;
    expect(icon).toHaveClass('inline-flex', 'size-[24px]');
    expect(icon.firstElementChild!.tagName).toBe('svg');
    rerender(
      <FloatingToolbar
        aria-label="Actions"
        expanded={false}
        fab={<ToolbarFab icon={<Icon />} aria-label="New" />}
      >
        {button('Search')}
      </FloatingToolbar>,
    );
    expect(fab.querySelector('[data-icon-face]')).toBeNull();
  });

  const twoIcons = (expanded: boolean, iconTransition?: 'swap' | 'rotate') => (
    <FloatingToolbar
      aria-label="Actions"
      expanded={expanded}
      fab={
        <ToolbarFab
          icon={<svg data-testid="edit" />}
          expandedIcon={<svg data-testid="close" />}
          iconTransition={iconTransition}
          aria-label="Compose"
        />
      }
    >
      {button('Search')}
    </FloatingToolbar>
  );

  it('hands over to expandedIcon halfway through the expand spring by default', async () => {
    const { container, rerender } = render(twoIcons(false));
    const collapsedFace = screen.getByTestId('edit').parentElement!;
    const expandedFace = screen.getByTestId('close').parentElement!;
    expect(collapsedFace.parentElement).toHaveClass('inline-grid', 'size-[24px]');
    expect(collapsedFace).toHaveAttribute('data-active', 'true');
    expect(expandedFace).not.toHaveAttribute('data-active');
    expect(expandedFace).toHaveClass(
      'invisible',
      'data-active:visible',
      '[transition-delay:calc(var(--md-sys-motion-spring-spatial-fast-duration)/2)]',
      'motion-reduce:[transition-delay:0s]',
    );
    expect(expandedFace).not.toHaveClass('opacity-0');

    rerender(twoIcons(true));
    expect(expandedFace).toHaveAttribute('data-active', 'true');
    expect(collapsedFace).not.toHaveAttribute('data-active');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('rotates and crossfades with iconTransition="rotate", mirrored in RTL', () => {
    const { rerender } = render(twoIcons(true, 'rotate'));
    const collapsedFace = screen.getByTestId('edit').parentElement!;
    const expandedFace = screen.getByTestId('close').parentElement!;
    expect(expandedFace).toHaveAttribute('data-active', 'true');
    expect(collapsedFace).toHaveClass(
      'opacity-0',
      'motion-safe:not-data-active:ltr:rotate-90',
      'motion-safe:not-data-active:rtl:-rotate-90',
      '[transition-property:rotate,opacity]',
    );
    expect(expandedFace).toHaveClass(
      'motion-safe:not-data-active:ltr:-rotate-90',
      'motion-safe:not-data-active:rtl:rotate-90',
    );
    expect(expandedFace).not.toHaveClass('invisible');

    rerender(twoIcons(false, 'rotate'));
    expect(collapsedFace).toHaveAttribute('data-active', 'true');
    expect(expandedFace).not.toHaveAttribute('data-active');
  });

  it('shows expandedIcon when focus expands a collapsed toolbar', () => {
    render(twoIcons(false));
    act(() => screen.getByRole('button', { name: 'Search' }).focus());
    expect(screen.getByTestId('close').parentElement).toHaveAttribute('data-active', 'true');
  });
});

describe('useToolbarScrollExit', () => {
  it('hides after scrolling 40px down and returns after 40px back up', () => {
    window.scrollY = 0;
    const { result } = renderHook(() => useToolbarScrollExit());
    expect(result.current).toBe(true);
    act(() => {
      window.scrollY = 50;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(false);
    act(() => {
      window.scrollY = 5;
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(true);
  });
});

describe('useToolbarScrollExpansion', () => {
  const scrollTo = (y: number) => {
    act(() => {
      window.scrollY = y;
      window.dispatchEvent(new Event('scroll'));
    });
  };

  it('collapses after scrolling 40px down and expands after 40px back up', () => {
    window.scrollY = 0;
    const { result } = renderHook(() => useToolbarScrollExpansion());
    expect(result.current).toBe(true);
    scrollTo(30);
    expect(result.current).toBe(true);
    scrollTo(45);
    expect(result.current).toBe(false);
    scrollTo(300);
    scrollTo(280);
    expect(result.current).toBe(false);
    scrollTo(250);
    expect(result.current).toBe(true);
  });
});
