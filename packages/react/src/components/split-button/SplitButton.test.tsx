import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { Menu, MenuItem } from '../menu/Menu';
import { SplitButton, type SplitButtonProps } from './SplitButton';

const Icon = () => <svg data-testid="icon" viewBox="0 0 24 24" />;

function Send(props: Partial<SplitButtonProps> & { onAction?: (key: React.Key) => void }) {
  const { onAction, ...rest } = props;
  return (
    <SplitButton
      leadingIcon={<Icon />}
      menuLabel="More send options"
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
      'h-[40px]',
      'ps-[16px]',
      'pe-[12px]',
      'bg-primary',
      'rounded-s-[min(var(--md-sys-shape-corner-full),20px)]',
      'rounded-e-corner-extra-small',
      'data-pressed:rounded-e-corner-medium',
    );
    expect(trailing()).toHaveClass(
      'h-[40px]',
      'ps-[13px]',
      'rounded-e-[min(var(--md-sys-shape-corner-full),20px)]',
      'rounded-s-corner-extra-small',
      '[--m3-optical:-2px]',
    );
    expect(trailing().parentElement).toHaveClass('gap-[2px]');
    expect(await axeViolations(container)).toEqual([]);
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
      'h-[32px]',
      'ps-[12px]',
      'rounded-e-corner-extra-small',
      'size-[22px]',
      '[--m3-optical:-1px]',
    ],
    [
      'md',
      'h-[56px]',
      'ps-[24px]',
      'rounded-e-corner-extra-small',
      'size-[26px]',
      '[--m3-optical:-3px]',
    ],
    ['lg', 'h-[96px]', 'ps-[48px]', 'rounded-e-corner-small', 'size-[38px]', '[--m3-optical:-4px]'],
    [
      'xl',
      'h-[136px]',
      'ps-[64px]',
      'rounded-e-corner-medium',
      'size-[50px]',
      '[--m3-optical:-6px]',
    ],
  ] as const)('sizes %s from Compose', (size, height, padding, inner, iconSize, optical) => {
    render(<Send size={size} />);
    expect(leading()).toHaveClass(height, padding, inner);
    expect(trailing()).toHaveClass(height, optical);
    expect(trailing().firstElementChild).toHaveClass(iconSize);
  });

  it.each([
    ['tonal', 'bg-secondary-container'],
    ['outlined', 'border-outline-variant'],
    ['elevated', 'shadow-elevation-1'],
  ] as const)('shares the %s button colours', (variant, cls) => {
    render(<Send variant={variant} />);
    expect(leading()).toHaveClass(cls);
    expect(trailing()).toHaveClass(cls);
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

  it('puts className, style and data-* on the wrapper', () => {
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
    expect(root).toHaveStyle({ zIndex: '2' });
    expect(trailing()).toHaveClass('shadow-elevation-3');
  });
});
