import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { IconButton } from '../icon-button/IconButton';
import { DockedToolbar, FloatingToolbar, ToolbarFab } from './Toolbar';
import { useToolbarScrollExpansion } from './use-toolbar-scroll-expansion';

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
      'text-on-surface',
      'ps-[16px]',
      'pe-[16px]',
      'justify-between',
      'fixed',
      'bottom-0',
    );
    expect(toolbar).toHaveAttribute('aria-orientation', 'horizontal');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('centres its items 32px apart', () => {
    render(
      <DockedToolbar aria-label="Actions" arrangement="centered">
        {button('Archive')}
      </DockedToolbar>,
    );
    expect(screen.getByRole('toolbar')).toHaveClass('justify-center', 'gap-[32px]');
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
  it('renders a standard pill with 8px padding', async () => {
    const { container } = render(
      <FloatingToolbar aria-label="Formatting">{button('Bold')}</FloatingToolbar>,
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Formatting' });
    expect(toolbar).toHaveClass(
      'rounded-corner-full',
      'p-[8px]',
      'min-h-[64px]',
      'bg-surface-container',
      'text-on-surface',
    );
    expect(toolbar).toHaveAttribute('data-expanded', 'true');
    expect(await axeViolations(container)).toEqual([]);
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

  it('collapses leading and trailing content, which becomes inert', () => {
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
    const undoSlot = screen.getByRole('button', { name: 'Undo', hidden: true }).closest('[inert]');
    expect(undoSlot).toHaveAttribute('data-collapsed', 'true');
    expect(undoSlot).toHaveClass('data-collapsed:grid-cols-[0fr]');
    expect(screen.getByRole('button', { name: 'Redo', hidden: true }).closest('[inert]')).not.toBe(
      null,
    );
    expect(screen.getByRole('button', { name: 'Bold' }).closest('[inert]')).toBe(null);
  });

  it('expands while keyboard focus is inside', async () => {
    render(
      <FloatingToolbar aria-label="Edit" expanded={false} leading={button('Undo')}>
        {button('Bold')}
      </FloatingToolbar>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('data-expanded', 'false');
    // jsdom ignores `inert`; browsers skip the collapsed Undo (covered by Playwright).
    await userEvent.tab();
    expect(toolbar).toContainElement(document.activeElement as HTMLElement);
    expect(toolbar).toHaveAttribute('data-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Undo' }).closest('[inert]')).toBe(null);
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
    expect(surface).toHaveAttribute('inert');
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
