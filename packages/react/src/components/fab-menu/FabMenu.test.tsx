import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
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
      'bg-primary-container',
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
    expect(toggle()).toHaveClass('data-open:size-[56px]', 'data-open:bg-primary');
    expect(screen.getByTestId('close')).toBeInTheDocument();
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
    ['large', 'size-[96px]', 'rounded-corner-extra-large', 'size-[36px]'],
  ] as const)('starts as a %s FAB', (size, box, corner, iconSize) => {
    render(<Menu size={size} />);
    expect(toggle()).toHaveClass(box, corner);
    expect(toggle().parentElement).toHaveClass(box);
    expect(screen.getByTestId('add').parentElement).toHaveClass(
      iconSize,
      'group-data-open/fab-menu:size-[20px]',
    );
  });

  it.each([
    ['secondary', 'bg-secondary-container', 'data-open:bg-secondary'],
    ['tertiary', 'bg-tertiary-container', 'data-open:bg-tertiary'],
  ] as const)('uses the %s colour set', (color, closed, open) => {
    render(<Menu color={color} defaultOpen />);
    expect(toggle()).toHaveClass(closed, open);
    expect(item('Reply')).toHaveClass(closed);
  });

  it('lines up on the start side', () => {
    render(<Menu align="start" data-testid="menu" />);
    expect(screen.getByTestId('menu')).toHaveClass('items-start');
    expect(item('Reply')).toHaveClass('justify-start');
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

  it('requires FabMenuItem to be inside a FabMenu', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<FabMenuItem icon={<Icon id="x" />}>Lost</FabMenuItem>)).toThrow(
      /inside a FabMenu/,
    );
  });
});
