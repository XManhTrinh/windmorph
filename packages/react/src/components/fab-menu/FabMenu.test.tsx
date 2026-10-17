import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { setMediaQueries } from '../../../test/setup';
import { FabMenu, FabMenuItem, type FabMenuProps } from './FabMenu';

const Icon = ({ id }: { id: string }) => <svg data-testid={id} viewBox="0 0 24 24" />;

function Menu(props: Partial<FabMenuProps> & { onReply?: () => void }) {
  const { onReply, ...rest } = props;
  return (
    <FabMenu
      icon={<Icon id="add" />}
      openIcon={<Icon id="close" />}
      aria-label="Create"
      {...(rest as object)}
    >
      <FabMenuItem icon={<Icon id="reply" />} onPress={onReply}>
        Reply
      </FabMenuItem>
      <FabMenuItem icon={<Icon id="forward" />}>Forward</FabMenuItem>
      <FabMenuItem icon={<Icon id="archive" />}>Archive</FabMenuItem>
    </FabMenu>
  );
}

const toggle = () => screen.getByRole('button', { name: 'Create' });
const item = (name: string) => screen.getByText(name).closest('button')!;
const visibleItems = () =>
  ['Reply', 'Forward', 'Archive'].filter((name) => item(name).hasAttribute('data-visible'));
/** Runs the stagger to the end. */
const settle = () => act(() => vi.advanceTimersByTime(500));

describe('FabMenu', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts closed: a named FAB with hidden items', async () => {
    const { container } = render(<Menu />);
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).not.toHaveAttribute('aria-controls');
    expect(toggle()).toHaveClass(
      'size-[56px]',
      'rounded-corner-large',
      'bg-[var(--_md-comp-fab-container-color)]',
      'shadow-elevation-3',
    );
    expect(screen.getByTestId('add')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reply' })).toBeNull();
    expect(screen.getByText('Reply').closest('[hidden]')).not.toBeNull();
    vi.useRealTimers();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('opens with a stagger from the button upwards', async () => {
    const { container } = render(<Menu />);
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(toggle()).toHaveAttribute('data-open', 'true');
    expect(toggle()).toHaveClass(
      'data-open:size-[56px]',
      'data-open:bg-[var(--_md-comp-fab-menu-close-button-container-color)]',
    );
    // Size and corners on fast spatial; colours on fast effects, which never overshoot.
    expect(toggle()).toHaveClass(
      '[--m3-transition-property:width,height,border-radius,background-color,color]',
      '[--m3-transition-easing:var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-spatial-fast-easing),var(--md-sys-motion-spring-effects-fast-easing),var(--md-sys-motion-spring-effects-fast-easing)]',
    );
    expect(screen.getByTestId('close')).toBeInTheDocument();
    // The FAB transforms into the close button: both icons share one cell and hand over
    // halfway through the morph (a visibility switch delayed by half the spring).
    const closedFace = screen.getByTestId('add').parentElement!;
    const openFace = screen.getByTestId('close').parentElement!;
    expect(closedFace).not.toHaveAttribute('data-active');
    expect(openFace).toHaveAttribute('data-active', 'true');
    expect(closedFace).toHaveClass('invisible', 'data-active:visible', 'row-start-1');
    expect(openFace).toHaveClass('invisible', 'data-active:visible', 'row-start-1');
    expect(openFace).not.toHaveClass('opacity-0');
    expect(openFace).toHaveClass(
      '[transition-delay:calc(var(--md-sys-motion-spring-spatial-fast-duration)/2)]',
      'motion-reduce:[transition-delay:0s]',
    );
    const list = document.getElementById(toggle().getAttribute('aria-controls')!)!;
    expect(list).not.toHaveAttribute('hidden');
    expect(visibleItems()).toEqual([]);

    // Compose's slow effects stagger: the bottom item first, the top one last.
    act(() => vi.advanceTimersByTime(55));
    expect(visibleItems()).toEqual(['Archive']);
    await settle();
    expect(visibleItems()).toEqual(['Reply', 'Forward', 'Archive']);
    expect(screen.getByRole('button', { name: 'Reply' })).not.toHaveAttribute('inert');
    vi.useRealTimers();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('shows and hides every item at once under reduced motion', () => {
    setMediaQueries({ '(prefers-reduced-motion)': true, '(prefers-reduced-motion: reduce)': true });
    // Motion keeps the preference it last heard; tell it the default is back afterwards.
    onTestFinished(() =>
      setMediaQueries({
        '(prefers-reduced-motion)': false,
        '(prefers-reduced-motion: reduce)': false,
      }),
    );
    render(<Menu />);
    fireEvent.click(toggle());
    expect(visibleItems()).toEqual(['Reply', 'Forward', 'Archive']);
    expect(item('Reply')).toHaveClass('motion-reduce:data-visible:starting:opacity-0');
    fireEvent.click(toggle());
    expect(visibleItems()).toEqual([]);
  });

  it('rotates and crossfades its icons with iconTransition="rotate"', async () => {
    const { container } = render(<Menu iconTransition="rotate" />);
    const closedFace = screen.getByTestId('add').parentElement!;
    const openFace = screen.getByTestId('close').parentElement!;
    // Closed: the open icon waits a quarter turn behind (mirrored in RTL), faded out.
    expect(closedFace).toHaveAttribute('data-active', 'true');
    expect(openFace).not.toHaveAttribute('data-active');
    expect(openFace).toHaveClass(
      'opacity-0',
      'motion-safe:not-data-active:ltr:rotate-90',
      'motion-safe:not-data-active:rtl:-rotate-90',
      'data-active:opacity-100',
      'row-start-1',
    );
    // Opening, the add icon turns onwards and fades out: rotation on the fast spatial
    // spring, opacity on the fast effects spring, and no visibility switch.
    expect(closedFace).toHaveClass(
      'motion-safe:not-data-active:ltr:-rotate-90',
      'motion-safe:not-data-active:rtl:rotate-90',
    );
    expect(closedFace).toHaveClass(
      '[transition-property:rotate,opacity]',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration),var(--md-sys-motion-spring-effects-fast-duration)]',
    );
    expect(closedFace).not.toHaveClass('invisible');
    // Reduced motion keeps only the crossfade: every rotation is motion-safe.
    for (const face of [closedFace, openFace]) {
      const turns = [...face.classList].filter((name) => /(^|:)-?rotate-(?!0)/.test(name));
      expect(turns.length).toBeGreaterThan(0);
      expect(turns.every((name) => name.startsWith('motion-safe:'))).toBe(true);
    }

    fireEvent.click(toggle());
    expect(openFace).toHaveAttribute('data-active', 'true');
    expect(closedFace).not.toHaveAttribute('data-active');
    await settle();
    vi.useRealTimers();
    expect(await axeViolations(container)).toEqual([]);
  });

  it('keeps one icon without openIcon', () => {
    render(
      <FabMenu icon={<Icon id="add" />} iconTransition="rotate" aria-label="Create">
        <FabMenuItem>Reply</FabMenuItem>
        <FabMenuItem>Forward</FabMenuItem>
      </FabMenu>,
    );
    expect(document.querySelector('[data-icon-face]')).toBeNull();
    fireEvent.click(toggle());
    expect(screen.getByTestId('add').parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps the closed icon in the menu presentation, which has no morph', () => {
    render(<Menu presentation="menu" />);
    fireEvent.click(toggle());
    expect(screen.getByTestId('add').parentElement).toHaveAttribute('data-active', 'true');
  });

  it('closes from the top down and hides the list once the last item has faded', async () => {
    render(<Menu defaultOpen />);
    expect(visibleItems()).toHaveLength(3);
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    act(() => vi.advanceTimersByTime(0));
    expect(visibleItems()).toEqual(['Forward', 'Archive']);
    await settle();
    expect(visibleItems()).toEqual([]);
    // The list stays laid out until the exit transition ends (fallback timeout here).
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('Reply').closest('[hidden]')).not.toBeNull();
  });

  it('runs an item’s action, closes and returns focus to the button', async () => {
    const onReply = vi.fn();
    render(<Menu defaultOpen onReply={onReply} />);
    item('Reply').focus();
    fireEvent.click(item('Reply'));
    expect(onReply).toHaveBeenCalledOnce();
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveFocus();
  });

  it('moves focus with the arrow keys and closes on Escape', () => {
    render(<Menu defaultOpen />);
    toggle().focus();
    fireEvent.keyDown(toggle(), { key: 'ArrowDown' });
    expect(item('Reply')).toHaveFocus();
    fireEvent.keyDown(item('Reply'), { key: 'ArrowDown' });
    expect(item('Forward')).toHaveFocus();
    fireEvent.keyDown(item('Forward'), { key: 'ArrowUp' });
    expect(item('Reply')).toHaveFocus();
    // Up from the top item and down from the bottom one go back to the button.
    fireEvent.keyDown(item('Reply'), { key: 'ArrowUp' });
    expect(toggle()).toHaveFocus();
    item('Archive').focus();
    fireEvent.keyDown(item('Archive'), { key: 'ArrowDown' });
    expect(toggle()).toHaveFocus();

    item('Forward').focus();
    fireEvent.keyDown(item('Forward'), { key: 'Escape' });
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(toggle()).toHaveFocus();
  });

  it('closes when focus moves out of it, not between its parts', () => {
    // Re-audit 2026-10-15: Tab past the last item left the list open over what got focus.
    render(
      <>
        <Menu defaultOpen />
        <button type="button">After</button>
      </>,
    );
    settle();
    act(() => {
      toggle().focus();
      item('Reply').focus();
      item('Archive').focus();
    });
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    act(() => screen.getByRole('button', { name: 'After' }).focus());
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  // Re-audit 2026-10-16: opened from the focused button, Shift+Tab straight out of it left
  // the list open (focus had come in while it was closed).
  it('closes when focus leaves straight from the button it was opened with', async () => {
    vi.useRealTimers();
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Menu />
      </>,
    );
    act(() => toggle().focus());
    await user.keyboard('{Enter}');
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    await user.tab({ shift: true });
    expect(screen.getByRole('button', { name: 'Before' })).toHaveFocus();
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes on an outside press', async () => {
    render(
      <>
        <button type="button">Outside</button>
        <Menu defaultOpen />
      </>,
    );
    vi.useRealTimers();
    await userEvent.click(screen.getByRole('button', { name: 'Outside' }));
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('can be controlled', () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Menu
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        />
      );
    }
    render(<Controlled />);
    fireEvent.click(toggle());
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');

    render(<Menu open={false} aria-label="Fixed" />);
    fireEvent.click(screen.getByRole('button', { name: 'Fixed' }));
    expect(screen.getByRole('button', { name: 'Fixed' })).toHaveAttribute('aria-expanded', 'false');
  });

  it.each([
    ['medium', 'size-[80px]', 'rounded-corner-large-increased', 'size-[28px]'],
    ['large', 'size-[96px]', 'rounded-corner-extra-large', 'size-[32px]'],
  ] as const)('starts as a %s FAB', (size, box, corner, iconSize) => {
    render(<Menu size={size} />);
    expect(toggle()).toHaveClass(box, corner);
    expect(toggle().parentElement).toHaveClass(box);
    expect(screen.getByTestId('add').closest('[aria-hidden="true"]')).toHaveClass(
      iconSize,
      'group-data-open/fab-menu:size-[20px]',
    );
  });

  // Colours are tokens (2026-10-17): the root names the close button's and the items' sets,
  // and the closed button is a FAB of the container colour.
  it.each(['primary', 'secondary', 'tertiary'] as const)('uses the %s colour set', (color) => {
    render(<Menu color={color} defaultOpen data-testid="menu" />);
    const root = screen.getByTestId('menu');
    expect(root).toHaveAttribute('data-color', color);
    expect(root).toHaveAttribute('data-item-color', `${color}-container`);
    expect(toggle()).toHaveAttribute('data-tokens', 'md-comp-fab');
    expect(toggle()).toHaveAttribute('data-color', `${color}-container`);
    expect(item('Reply')).toHaveClass(
      'bg-[var(--_md-comp-fab-menu-list-item-container-color)]',
      'text-[color:var(--_md-comp-fab-menu-list-item-label-text-color)]',
    );
  });

  it('reads its close button’s and items’ corners from its component tokens', () => {
    render(<Menu defaultOpen data-testid="menu" />);
    expect(screen.getByTestId('menu')).toHaveAttribute('data-tokens', 'md-comp-fab-menu');
    expect(toggle()).toHaveAttribute('data-slot', 'button');
    expect(toggle()).toHaveClass(
      'data-open:rounded-[var(--_md-comp-fab-menu-close-button-container-shape)]',
    );
    expect(item('Reply')).toHaveAttribute('data-slot', 'item');
    expect(item('Reply')).toHaveClass(
      'rounded-[var(--_md-comp-fab-menu-menu-item-container-shape)]',
    );
  });

  it('lets a consumer corner class replace an item’s token class', () => {
    render(
      <FabMenu icon={<Icon id="add" />} aria-label="Create" defaultOpen>
        <FabMenuItem className="rounded-corner-small">Reply</FabMenuItem>
        <FabMenuItem>Forward</FabMenuItem>
      </FabMenu>,
    );
    expect(item('Reply')).toHaveClass('rounded-corner-small');
    expect(item('Reply').className).not.toContain('menu-item-container-shape');
  });

  it('puts the label slot on the item label', () => {
    render(
      <FabMenu icon={<Icon id="add" />} aria-label="Create" defaultOpen>
        <FabMenuItem classNames={{ label: 'label-x' }}>Reply</FabMenuItem>
        <FabMenuItem>Forward</FabMenuItem>
      </FabMenu>,
    );
    expect(screen.getByText('Reply')).toHaveClass('label-x');
    expect(screen.getByText('Reply').tagName).toBe('SPAN');
  });

  it('lines up on the trailing edge, with level 3 items', () => {
    render(<Menu defaultOpen data-testid="menu" />);
    expect(screen.getByTestId('menu')).toHaveClass('items-end');
    expect(item('Reply')).toHaveClass('justify-end', 'shadow-elevation-3');
  });

  it('scrolls its items behind the close button on short windows', () => {
    render(<Menu defaultOpen size="large" />);
    const list = document.getElementById(toggle().getAttribute('aria-controls')!)!;
    // The list scrolls, and reaches under the 96px box that keeps the button above it.
    expect(list).toHaveClass(
      'overflow-y-auto',
      'max-h-[calc(100dvh-16px)]',
      '-mb-[104px]',
      'pb-[104px]',
    );
    expect(toggle().parentElement).toHaveClass('relative', 'z-[1]');
  });

  it('takes the same elevation option as Fab, for the button and its items', () => {
    render(
      <FabMenu icon={<Icon id="add" />} aria-label="Create" elevation="flat" defaultOpen>
        <FabMenuItem icon={<Icon id="star" />}>Star</FabMenuItem>
      </FabMenu>,
    );
    expect(toggle()).toHaveClass('shadow-elevation-0');
    expect(toggle()).not.toHaveClass('shadow-elevation-3');
    expect(screen.getByRole('button', { name: 'Star' })).toHaveClass('shadow-elevation-0');
  });

  it('allows an item without an icon, and runs onAction', () => {
    const onAction = vi.fn();
    render(
      <FabMenu icon={<Icon id="add" />} aria-label="Create" defaultOpen>
        <FabMenuItem onAction={onAction}>Plain</FabMenuItem>
        <FabMenuItem icon={<Icon id="star" />}>Star</FabMenuItem>
      </FabMenu>,
    );
    expect(item('Plain').querySelector('[aria-hidden]')).toBeNull();
    fireEvent.click(item('Plain'));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('warns in development when it has fewer than 2 or more than 6 items', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <FabMenu icon={<Icon id="add" />} aria-label="Create">
        <FabMenuItem icon={<Icon id="one" />}>One</FabMenuItem>
      </FabMenu>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('2 to 6 items'));
    warn.mockRestore();
  });

  it('hides its button towards the centre, closing and turning inert', () => {
    const { rerender } = render(<Menu defaultOpen data-testid="menu" />);
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    rerender(<Menu defaultOpen data-testid="menu" visible={false} />);
    expect(screen.getByTestId('menu')).toHaveAttribute('inert');
    expect(toggle().parentElement).toHaveAttribute('data-hidden', 'true');
    expect(toggle().parentElement).toHaveClass('data-hidden:[transform:scale(0.2)]');
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
  });

  it('puts className, style, data-* and ref on the root', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Menu
        data-testid="menu"
        className="fixed end-4 bottom-4"
        style={{ zIndex: 3 }}
        ref={(el) => {
          node = el;
        }}
        classNames={{ button: 'shadow-elevation-1' }}
      />,
    );
    const root = screen.getByTestId('menu');
    expect(root).toBe(node);
    expect(root).toHaveClass('fixed', 'end-4', 'bottom-4', 'flex-col-reverse');
    expect(root).toHaveStyle({ zIndex: '3' });
    expect(toggle()).toHaveClass('shadow-elevation-1');
    expect(toggle()).not.toHaveClass('shadow-elevation-3');
  });

  it('opens a standard menu 4px above the FAB with presentation="menu"', async () => {
    vi.useRealTimers();
    const onReply = vi.fn();
    render(
      <FabMenu icon={<Icon id="add" />} aria-label="Create" presentation="menu">
        <FabMenuItem icon={<Icon id="reply" />} onAction={onReply}>
          Reply
        </FabMenuItem>
        <FabMenuItem icon={<Icon id="forward" />}>Forward</FabMenuItem>
      </FabMenu>,
    );
    expect(toggle()).toHaveAttribute('aria-haspopup', 'true');
    await userEvent.click(toggle());
    const menu = await screen.findByRole('menu', { name: 'Create' });
    // Opens above the FAB; the 4px gap itself is measured in the Playwright spec.
    expect(menu.closest('[data-placement]')).toHaveAttribute(
      'data-placement',
      expect.stringMatching(/^top/),
    );
    expect(screen.getAllByRole('menuitem').map((el) => el.textContent)).toEqual([
      'Reply',
      'Forward',
    ]);
    expect(await axeViolations(document.body)).toEqual([]);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Reply' }));
    expect(onReply).toHaveBeenCalledOnce();
  });

  it('shows its label in a tooltip while closed, not while open, unless turned off', async () => {
    vi.useRealTimers();
    const { rerender } = render(<Menu classNames={{ tooltip: 'tip-x' }} />);
    fireEvent.pointerMove(document.body);
    await userEvent.hover(toggle());
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Create');
    expect(screen.getByRole('tooltip')).toHaveClass('tip-x');
    // It repeats the toggle's name, so it doesn't describe it too.
    expect(toggle()).not.toHaveAttribute('aria-describedby');
    // Opening turns the FAB into the close button: no tooltip.
    await userEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'true');
    expect(toggle()).not.toHaveAttribute('aria-describedby');
    await userEvent.unhover(toggle());
    await userEvent.hover(toggle());
    expect(toggle()).not.toHaveAttribute('aria-describedby');
    await userEvent.unhover(toggle());

    rerender(<Menu tooltip={false} />);
    await userEvent.click(toggle());
    expect(toggle()).toHaveAttribute('aria-expanded', 'false');
    await userEvent.hover(toggle());
    expect(toggle()).not.toHaveAttribute('aria-describedby');
  });

  it('requires FabMenuItem to be inside a FabMenu', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FabMenuItem icon={<Icon id="x" />}>Lost</FabMenuItem>)).toThrow(
      /inside a FabMenu/,
    );
  });
});
