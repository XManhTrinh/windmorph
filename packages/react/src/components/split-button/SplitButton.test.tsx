import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Dialog, DialogContent, DialogTrigger } from '../dialog/Dialog';
import { Menu, MenuItem } from '../menu/Menu';
import { SplitButton, type SplitButtonProps } from './SplitButton';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

function Send(props: Partial<SplitButtonProps> & { onAction?: (key: React.Key) => void }) {
  const { onAction, ...rest } = props;
  return (
    <SplitButton
      leadingIcon={<Icon />}
      labels={{ menu: 'More send options' }}
      menu={
        <Menu aria-label="Send options" onAction={onAction}>
          <MenuItem key="later">Send later</MenuItem>
          <MenuItem key="draft">Save draft</MenuItem>
        </Menu>
      }
      {...(rest as object)}
    >
      Send
    </SplitButton>
  );
}

const leading = () => screen.getByRole('button', { name: 'Send' });
const trailing = () => screen.getByRole('button', { name: 'More send options' });

/** jsdom re-focuses a clicked trigger after the menu takes focus, so open with the keyboard. */
async function openMenu() {
  trailing().focus();
  await userEvent.keyboard('{Enter}');
}

describe('SplitButton', () => {
  it('renders a leading action and a menu trigger', async () => {
    const { container } = render(<Send />);
    expect(leading()).not.toHaveAttribute('aria-haspopup');
    expect(leading()).not.toHaveAttribute('aria-expanded');
    expect(trailing()).toHaveAttribute('aria-haspopup', 'true');
    expect(trailing()).toHaveAttribute('aria-expanded', 'false');
    expect(leading()).toHaveClass(
      'min-h-[40px]',
      'ps-[calc(16px-var(--m3-button-border,0px))]',
      'pe-[calc(12px-var(--m3-button-border,0px))]',
      'bg-[var(--_md-comp-button-container-color)]',
      'rounded-s-[var(--_md-comp-split-button-container-shape-capped)]',
      'rounded-e-corner-extra-small',
      'data-pressed:rounded-e-corner-medium',
    );
    expect(trailing()).toHaveClass(
      'min-h-[40px]',
      'ps-[calc(13px-var(--m3-button-border,0px))]',
      'rounded-e-[var(--_md-comp-split-button-container-shape-capped)]',
      'rounded-s-corner-extra-small',
      '[--m3-optical:-1px]',
    );
    const root = trailing().parentElement!;
    expect(root).toHaveClass('gap-[2px]');
    expect(root).toHaveAttribute('data-tokens', 'md-comp-split-button');
    expect(root).toHaveAttribute('data-variant', 'filled');
    expect(root).toHaveAttribute('data-size', 'sm');
    for (const [half, slot] of [
      [leading(), 'leading'],
      [trailing(), 'trailing'],
    ] as const) {
      expect(half).toHaveAttribute('data-tokens', 'md-comp-button');
      expect(half).toHaveAttribute('data-variant', 'filled');
      expect(half).toHaveAttribute('data-slot', slot);
    }
    expect(await axeViolations(container)).toEqual([]);
  });

  it('morphs both halves on the non-bouncing effects spring', () => {
    // Re-audit 2026-10-15: Compose's split button uses DefaultEffects.
    render(<Send />);
    for (const half of [leading(), trailing()]) {
      expect(half).toHaveClass(
        '[--m3-shape-spring-duration:var(--md-sys-motion-spring-effects-default-duration)]',
      );
    }
  });

  it('runs the leading action without opening the menu', async () => {
    const onPress = vi.fn();
    render(<Send onPress={onPress} />);
    await userEvent.click(leading());
    expect(onPress).toHaveBeenCalledOnce();
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens the menu from the trailing button, which turns round', async () => {
    const onAction = vi.fn();
    const onOpenChange = vi.fn();
    render(<Send onAction={onAction} onOpenChange={onOpenChange} />);
    // While the menu is open React Aria hides the rest of the page, trigger included.
    const button = trailing();
    await openMenu();
    const menu = screen.getByRole('menu', { name: 'More send options' });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(button).toHaveAttribute('data-open', 'true');
    expect(button).toHaveClass(
      'data-open:not-data-pressed:rounded-s-[min(var(--md-sys-shape-corner-full),20px)]',
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Send later' }));
    expect(onAction.mock.calls[0]?.[0]).toBe('later');
    await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));
    expect(button).not.toHaveAttribute('data-open');
  });

  it.each([
    [
      'xs',
      'min-h-[32px]',
      'ps-[calc(12px-var(--m3-button-border,0px))]',
      'rounded-e-corner-extra-small',
      'size-[22px]',
      '[--m3-optical:-1px]',
    ],
    [
      'md',
      'h-[56px]',
      'ps-[calc(24px-var(--m3-button-border,0px))]',
      'rounded-e-corner-extra-small',
      'size-[26px]',
      '[--m3-optical:-2px]',
    ],
    [
      'lg',
      'h-[96px]',
      'ps-[calc(48px-var(--m3-button-border,0px))]',
      'rounded-e-corner-small',
      'size-[38px]',
      '[--m3-optical:-3px]',
    ],
    [
      'xl',
      'h-[136px]',
      'ps-[calc(64px-var(--m3-button-border,0px))]',
      'rounded-e-corner-medium',
      'size-[50px]',
      '[--m3-optical:-6px]',
    ],
  ] as const)('sizes %s from the spec', (size, height, padding, inner, iconSize, optical) => {
    render(<Send size={size} />);
    expect(leading()).toHaveClass(height, padding, inner);
    expect(trailing()).toHaveClass(height, optical);
    expect(trailing().querySelector('[data-motion]')).toHaveClass(iconSize);
  });

  it.each(['xs', 'sm'] as const)(
    'grows its %s halves with the text, together, without a stretching parent',
    (size) => {
      render(<Send size={size} />);
      // A minimum height (Compose's heightIn), both halves stretched to the taller one, and a
      // root that keeps its content height in a flex or grid parent.
      // (S joined XS on 2026-10-15: a fixed 40px overflowed at 250% text.)
      for (const half of [leading(), trailing()]) {
        expect(half).not.toHaveClass('h-[32px]');
        expect(half).not.toHaveClass('h-[40px]');
      }
      expect(leading().parentElement).toHaveClass('h-fit', 'items-stretch');
    },
  );

  it.each([
    ['tonal', 'bg-[var(--_md-comp-button-container-color)]'],
    ['outlined', 'border-[color:var(--_md-comp-button-outline-color)]'],
    ['elevated', 'shadow-[shadow:var(--_md-comp-button-container-elevation)]'],
  ] as const)('shares the %s button colours', (variant, cls) => {
    render(<Send variant={variant} />);
    for (const half of [leading(), trailing()]) {
      expect(half).toHaveAttribute('data-variant', variant);
      expect(half).toHaveClass(cls);
    }
  });

  it('lets consumer corner and colour classes replace the token classes', () => {
    render(
      <Send
        classNames={{ leading: 'rounded-s-corner-small bg-tertiary', trailing: 'bg-tertiary' }}
      />,
    );
    expect(leading()).toHaveClass('rounded-s-corner-small', 'bg-tertiary');
    expect(leading()).not.toHaveClass(
      'rounded-s-[var(--_md-comp-split-button-container-shape-capped)]',
      'bg-[var(--_md-comp-button-container-color)]',
    );
    expect(trailing()).not.toHaveClass('bg-[var(--_md-comp-button-container-color)]');
  });

  it('disables both halves', () => {
    render(<Send disabled />);
    expect(leading()).toBeDisabled();
    expect(trailing()).toBeDisabled();
  });

  it('renders the leading action as a link', () => {
    render(<Send href="/compose" />);
    expect(screen.getByRole('link', { name: 'Send' })).toHaveAttribute('href', '/compose');
  });

  it('puts className, style and data-* on the wrapper, a group', () => {
    render(
      <Send
        data-testid="split"
        className="fixed bottom-4"
        style={{ zIndex: 2 }}
        classNames={{ trailing: 'shadow-elevation-3' }}
      />,
    );
    const root = screen.getByTestId('split');
    expect(root).toHaveClass('fixed', 'bottom-4', 'inline-flex');
    expect(root).toHaveAttribute('role', 'group');
    expect(root).toHaveStyle({ zIndex: '2' });
    expect(trailing()).toHaveClass('shadow-elevation-3');
  });

  it.each([
    ['xs', 'rounded-e-corner-small'],
    ['sm', 'rounded-e-corner-medium'],
    ['md', 'rounded-e-corner-medium'],
    ['lg', 'rounded-e-corner-large-increased'],
    ['xl', 'rounded-e-corner-large-increased'],
  ] as const)('changes the %s inner corners on hover and keyboard focus too', (size, corner) => {
    render(<Send size={size} />);
    expect(leading()).toHaveClass(
      `data-hovered:${corner}`,
      `data-focus-visible:${corner}`,
      `data-pressed:${corner}`,
    );
    const start = corner.replace('rounded-e-', 'rounded-s-');
    expect(trailing()).toHaveClass(
      `not-data-open:data-hovered:${start}`,
      `not-data-open:data-focus-visible:${start}`,
      `data-pressed:${start}`,
    );
  });

  it('gives both halves a 48px touch target at XS and S only', () => {
    const { rerender } = render(<Send size="xs" />);
    for (const button of [leading(), trailing()]) {
      const target = button.querySelector('[data-touch-target]');
      expect(target).not.toBeNull();
      expect(target?.parentElement).toHaveClass('relative');
    }
    rerender(<Send size="md" />);
    expect(document.querySelector('[data-touch-target]')).toBeNull();
  });

  it('turns the chevron inwards on the standard scheme spring, mirrored in RTL', () => {
    render(<Send />);
    const icon = trailing().querySelector('[data-motion]');
    expect(icon).toHaveAttribute('data-motion', 'standard');
    expect(icon).toHaveClass(
      'in-data-open:ltr:rotate-180',
      'in-data-open:rtl:-rotate-180',
      '[transition-duration:var(--md-sys-motion-spring-spatial-fast-duration)]',
      'motion-reduce:transition-none',
    );
  });

  it('opens its menu when a mouse press is released, so the pressed shape shows', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<Send onOpenChange={onOpenChange} />);
    const button = trailing();
    await user.pointer({ keys: '[MouseLeft>]', target: button });
    expect(button).toHaveAttribute('data-pressed');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).not.toHaveBeenCalled();
    await user.pointer({ keys: '[/MouseLeft]', target: button });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('does not open its menu when the mouse is released elsewhere', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(<Send onOpenChange={onOpenChange} />);
    await user.pointer([
      { keys: '[MouseLeft>]', target: trailing() },
      { target: document.body },
      { keys: '[/MouseLeft]', target: document.body },
    ]);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('can show only an icon in the leading button, named by leadingLabel', async () => {
    const { container } = render(
      <SplitButton
        leadingIcon={<Icon />}
        leadingLabel="Send"
        labels={{ menu: 'More send options' }}
        menu={
          <Menu aria-label="Send options">
            <MenuItem key="later">Send later</MenuItem>
          </Menu>
        }
      />,
    );
    expect(leading()).toHaveAccessibleName('Send');
    expect(leading()).toHaveTextContent('');
    expect(await axeViolations(container)).toEqual([]);
  });

  it('opens another overlay through an enclosing trigger', async () => {
    render(
      <DialogTrigger>
        <SplitButton labels={{ menu: 'More send options' }}>Send</SplitButton>
        <Dialog role="dialog" aria-label="Schedule send">
          <DialogContent>Pick a time.</DialogContent>
        </Dialog>
      </DialogTrigger>,
    );
    expect(leading()).not.toHaveAttribute('aria-haspopup');
    await userEvent.click(trailing());
    expect(await screen.findByRole('dialog', { name: 'Schedule send' })).toBeInTheDocument();
  });

  it('reports trailing presses and toggles open without a menu', async () => {
    const onTrailingPress = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <SplitButton
        labels={{ menu: 'More send options' }}
        onTrailingPress={onTrailingPress}
        onOpenChange={onOpenChange}
      >
        Send
      </SplitButton>,
    );
    await userEvent.click(trailing());
    expect(onTrailingPress).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trailing()).toHaveAttribute('aria-expanded', 'true');
    expect(trailing()).toHaveAttribute('data-open', 'true');
  });
});
