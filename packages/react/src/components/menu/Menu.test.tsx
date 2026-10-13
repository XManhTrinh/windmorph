import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { ContextMenuTrigger, Menu, MenuGroup, MenuItem, MenuTrigger, SubmenuTrigger } from './Menu';

/**
 * Opens a menu from its trigger with the keyboard. (In jsdom a simulated click re-focuses
 * the trigger after the menu has taken focus, which closes it; real browsers, covered by
 * the Playwright suite, open it on press.)
 */
async function openMenu(name: string) {
  screen.getByRole('button', { name }).focus();
  await userEvent.keyboard('{Enter}');
}

const closed = () =>
  waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument(), { timeout: 1500 });

function EditMenu(props: Partial<React.ComponentProps<typeof Menu>>) {
  return (
    <MenuTrigger>
      <Button>Edit</Button>
      <Menu aria-label="Edit" {...props}>
        <MenuGroup title="Clipboard">
          <MenuItem key="cut" shortcut="⌘X">
            Cut
          </MenuItem>
          <MenuItem key="copy" shortcut="⌘C">
            Copy
          </MenuItem>
          <MenuItem key="paste" description="From history">
            Paste
          </MenuItem>
        </MenuGroup>
        <MenuGroup aria-label="Danger">
          <MenuItem key="delete">Delete</MenuItem>
        </MenuGroup>
      </Menu>
    </MenuTrigger>
  );
}

describe('Menu', () => {
  it('opens from its trigger with grouped items', async () => {
    render(<EditMenu />);
    const trigger = screen.getByRole('button', { name: 'Edit' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    await openMenu('Edit');
    const menu = screen.getByRole('menu', { name: 'Edit' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(4);
    expect(within(menu).getByRole('group', { name: 'Clipboard' })).toBeInTheDocument();
    expect(within(menu).getByRole('group', { name: 'Danger' })).toBeInTheDocument();
  });

  it('sets groups apart with dividers on one surface by default', async () => {
    render(<EditMenu />);
    await openMenu('Edit');
    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('data-layout', 'divider');
    expect(menu).toHaveClass('shadow-elevation-2', 'p-[4px]', 'bg-surface-container-low');
    expect(menu).toHaveClass('rounded-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]');
    const clipboard = screen.getByRole('group', { name: 'Clipboard' }).parentElement!;
    expect(clipboard).toHaveClass('rounded-none', 'shadow-none', 'p-0');
    // One divider between the two groups; it can't take focus.
    const dividers = within(menu).getAllByRole('separator');
    expect(dividers).toHaveLength(1);
    expect(dividers[0]).toHaveClass('bg-outline-variant', 'my-[8px]');
    expect(dividers[0]).not.toHaveAttribute('tabindex');
    // The last item nests in the surface's bottom corners; Cut sits under the heading.
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveClass(
      'rounded-t-corner-extra-small',
    );
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass(
      'rounded-b-[calc(var(--m3-menu-corner,var(--md-sys-shape-corner-large))-4px)]',
    );
  });

  it('gives gap-layout groups and items their position corners', async () => {
    render(<EditMenu layout="gap" />);
    await openMenu('Edit');
    expect(screen.getByRole('menu')).toHaveAttribute('data-layout', 'gap');
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    const clipboard = screen.getByRole('group', { name: 'Clipboard' }).parentElement!;
    expect(clipboard).toHaveClass(
      'rounded-t-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]',
      'rounded-b-corner-small',
      'shadow-elevation-2',
    );
    expect(screen.getByRole('group', { name: 'Danger' }).parentElement).toHaveClass(
      'rounded-t-corner-small',
      'rounded-b-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]',
    );
    // Item corners nest inside the group's: 12px only where an item meets a 16px corner.
    // Cut sits under the heading and Paste above the group's 8px corner, so both stay 4px.
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveClass(
      'rounded-t-corner-extra-small',
      'rounded-b-corner-extra-small',
    );
    expect(screen.getByRole('menuitem', { name: /Paste/ })).toHaveClass(
      'rounded-t-corner-extra-small',
      'rounded-b-corner-extra-small',
    );
    expect(screen.getByRole('menuitem', { name: /Delete/ })).toHaveClass(
      'rounded-t-corner-extra-small',
      'rounded-b-[calc(var(--m3-menu-corner,var(--md-sys-shape-corner-large))-4px)]',
    );
  });

  it('nests the corners of a single group of items inside its 16px corners', async () => {
    render(
      <MenuTrigger>
        <Button>Send</Button>
        <Menu aria-label="Send" layout="gap">
          <MenuItem key="later">Send later</MenuItem>
          <MenuItem key="draft">Save draft</MenuItem>
          <MenuItem key="discard">Discard</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('Send');
    const later = screen.getByRole('menuitem', { name: 'Send later' });
    expect(later.parentElement).toHaveClass(
      'rounded-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]',
      'p-[4px]',
    );
    expect(later).toHaveClass(
      'rounded-t-[calc(var(--m3-menu-corner,var(--md-sys-shape-corner-large))-4px)]',
      'rounded-b-corner-extra-small',
    );
    expect(screen.getByRole('menuitem', { name: 'Save draft' })).toHaveClass(
      'rounded-t-corner-extra-small',
      'rounded-b-corner-extra-small',
    );
    expect(screen.getByRole('menuitem', { name: 'Discard' })).toHaveClass(
      'rounded-t-corner-extra-small',
      'rounded-b-[calc(var(--m3-menu-corner,var(--md-sys-shape-corner-large))-4px)]',
    );
  });

  it('runs an action, closes and returns focus to the trigger', async () => {
    const onAction = vi.fn();
    render(<EditMenu onAction={onAction} />);
    await openMenu('Edit');
    await userEvent.click(screen.getByRole('menuitem', { name: /Copy/ }));
    expect(onAction.mock.calls[0]?.[0]).toBe('copy');
    await closed();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus());
  });

  it('opens from the keyboard and navigates with arrows and typeahead', async () => {
    const onAction = vi.fn();
    render(<EditMenu onAction={onAction} />);
    screen.getByRole('button', { name: 'Edit' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /Copy/ })).toHaveFocus();
    await userEvent.keyboard('d');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onAction.mock.calls[0]?.[0]).toBe('delete');
  });

  it('closes on Escape', async () => {
    render(<EditMenu />);
    await openMenu('Edit');
    await userEvent.keyboard('{Escape}');
    await closed();
  });

  it('describes items and shows shortcuts', async () => {
    render(<EditMenu />);
    await openMenu('Edit');
    expect(screen.getByRole('menuitem', { name: /Paste/ })).toHaveAccessibleDescription(
      'From history',
    );
    expect(screen.getByText('⌘C').tagName).toBe('KBD');
  });

  it('supports single selection with a selected shape and check', async () => {
    const onSelectionChange = vi.fn();
    render(
      <MenuTrigger>
        <Button>Sort</Button>
        <Menu
          aria-label="Sort"
          selectionMode="single"
          defaultSelectedKeys={['name']}
          onSelectionChange={onSelectionChange}
        >
          <MenuItem key="name">Name</MenuItem>
          <MenuItem key="date">Date</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('Sort');
    const name = screen.getByRole('menuitemradio', { name: 'Name' });
    expect(name).toHaveAttribute('aria-checked', 'true');
    expect(name).toHaveAttribute('data-selected');
    expect(name).toHaveClass(
      'data-selected:rounded-corner-medium',
      'data-selected:bg-tertiary-container',
    );
    expect(name.querySelector('svg')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Date' }));
    expect([...onSelectionChange.mock.calls[0]![0]]).toEqual(['date']);
  });

  it('stays open for multiple selection', async () => {
    render(
      <MenuTrigger>
        <Button>View</Button>
        <Menu aria-label="View" selectionMode="multiple">
          <MenuItem key="grid">Grid lines</MenuItem>
          <MenuItem key="rulers">Rulers</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('View');
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Grid lines' }));
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Rulers' }));
    expect(screen.getByRole('menuitemcheckbox', { name: 'Grid lines' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('menuitemcheckbox', { name: 'Rulers' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // Enter selects too, and the menu stays open (M3).
    screen.getByRole('menuitemcheckbox', { name: 'Grid lines' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Grid lines' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('disables items, which can still take focus', async () => {
    const onAction = vi.fn();
    render(<EditMenu disabledKeys={['copy']} onAction={onAction} />);
    await openMenu('Edit');
    const copy = screen.getByRole('menuitem', { name: /Copy/ });
    expect(copy).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(copy);
    expect(onAction).not.toHaveBeenCalled();
    // M3: "Disabled menu items can receive focus but aren't selectable."
    screen.getByRole('menuitem', { name: /Cut/ }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(copy).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('keeps a pressed layer on its trigger while open', async () => {
    render(<EditMenu />);
    const trigger = screen.getByRole('button', { name: 'Edit' });
    expect(trigger).not.toHaveAttribute('data-menu-open');
    await openMenu('Edit');
    expect(trigger).toHaveAttribute('data-menu-open', 'true');
    expect(trigger).toHaveClass('state-layer');
    await userEvent.keyboard('{Escape}');
    await closed();
    expect(trigger).not.toHaveAttribute('data-menu-open');
  });

  it('shows a badge, read as part of the item description', async () => {
    render(
      <MenuTrigger>
        <Button>Mail</Button>
        <Menu aria-label="Mail">
          <MenuItem key="inbox" badge={<span>12</span>}>
            Inbox
          </MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('Mail');
    expect(screen.getByRole('menuitem', { name: 'Inbox' })).toHaveAccessibleDescription('12');
  });

  it('takes 4px off the item height per density step', async () => {
    render(<EditMenu density={-2} />);
    await openMenu('Edit');
    expect(screen.getByRole('menu').style.getPropertyValue('--m3-menu-density')).toBe('-2');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass(
      'min-h-[calc(44px+var(--m3-menu-density,0)*4px)]',
    );
  });

  it('uses vibrant colours', async () => {
    render(<EditMenu variant="vibrant" layout="gap" />);
    await openMenu('Edit');
    expect(screen.getByRole('group', { name: 'Clipboard' }).parentElement).toHaveClass(
      'bg-tertiary-container',
    );
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass(
      'text-on-tertiary-container',
    );
  });

  it('wraps loose items in an implicit group', async () => {
    render(
      <MenuTrigger>
        <IconButton icon={<svg />} aria-label="More" />
        <Menu aria-label="More" layout="gap">
          <MenuItem key="a">Alpha</MenuItem>
          <MenuItem key="b">Beta</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('More');
    const group = screen.getByRole('menuitem', { name: 'Alpha' }).parentElement!;
    expect(group).toHaveAttribute('role', 'presentation');
    expect(group).toHaveClass(
      'rounded-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]',
      'bg-surface-container-low',
    );
  });

  it("opens a submenu with the arrow keys and morphs the menus' corners", async () => {
    const onShare = vi.fn();
    render(
      <MenuTrigger>
        <Button>File</Button>
        <Menu aria-label="File">
          <MenuItem key="open">Open</MenuItem>
          <SubmenuTrigger>
            <MenuItem key="share">Share</MenuItem>
            <Menu aria-label="Share" onAction={onShare}>
              <MenuItem key="email">Email</MenuItem>
              <MenuItem key="link">Copy link</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('File');
    const share = screen.getByRole('menuitem', { name: 'Share' });
    expect(share).toHaveAttribute('aria-haspopup', 'menu');
    expect(share.querySelector('svg')).toBeInTheDocument();
    share.focus();
    await userEvent.keyboard('{ArrowRight}');
    const submenu = await screen.findByRole('menu', { name: 'Share' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus());
    expect(share).toHaveAttribute('aria-expanded', 'true');
    // The item that opened it shows its active layer; the focused menu is the rounder one.
    expect(share).toHaveAttribute('data-menu-open', 'true');
    const root = screen.getByRole('menu', { name: 'File' });
    expect(submenu).toHaveAttribute('data-shape', 'active');
    expect(root).toHaveAttribute('data-shape', 'inactive');
    // Inside the root popover, so it isn't hidden from assistive tech.
    expect(root.closest('[data-overlay-scope]')!.parentElement!.contains(submenu)).toBe(true);
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(screen.queryByRole('menu', { name: 'Share' })).not.toBeInTheDocument(),
    );
    expect(share).toHaveFocus();
    expect(root).not.toHaveAttribute('data-shape');
    await userEvent.keyboard('{Enter}');
    await screen.findByRole('menu', { name: 'Share' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    expect(onShare.mock.calls[0]?.[0]).toBe('email');
    await closed();
  });

  it('opens a context menu at the pointer on a secondary click', async () => {
    const onAction = vi.fn();
    render(
      <ContextMenuTrigger>
        <p>Selected text</p>
        <Menu aria-label="Text" onAction={onAction}>
          <MenuItem key="copy">Copy</MenuItem>
        </Menu>
      </ContextMenuTrigger>,
    );
    const wrapper = screen.getByText('Selected text').parentElement!;
    expect(wrapper).toHaveClass('contents');
    expect(wrapper).not.toHaveAttribute('aria-haspopup');
    fireEvent.contextMenu(screen.getByText('Selected text'), { clientX: 40, clientY: 60 });
    expect(await screen.findByRole('menu', { name: 'Text' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(onAction.mock.calls[0]?.[0]).toBe('copy');
    await closed();
  });

  it('expands along the axis away from its anchor', async () => {
    render(<EditMenu />);
    await openMenu('Edit');
    const motion = screen.getByRole('menu').parentElement!;
    expect(motion).toHaveClass('starting:[clip-path:inset(-24px_-24px_100%_-24px)]');
    expect(motion).not.toHaveClass('starting:scale-80');
  });

  it('keeps the theme and direction of where it was rendered', async () => {
    render(
      <ThemeScope theme="rose" mode="dark" dir="rtl">
        <EditMenu />
      </ThemeScope>,
    );
    await openMenu('Edit');
    const scope = screen.getByRole('menu').closest('[data-overlay-scope]');
    expect(scope).toHaveAttribute('data-theme', 'rose');
    expect(scope).toHaveAttribute('dir', 'rtl');
  });

  it('has no axe violations when open', async () => {
    const { baseElement } = render(<EditMenu disabledKeys={['copy']} />);
    await openMenu('Edit');
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});
