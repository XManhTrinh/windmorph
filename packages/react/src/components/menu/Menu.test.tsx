import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { labelInNameViolations } from '../../../test/label-in-name';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';
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
    expect(menu).toHaveAttribute('data-tokens', 'md-comp-menus');
    expect(menu).toHaveAttribute('data-variant', 'standard');
    expect(menu).toHaveClass(
      'shadow-[shadow:var(--_md-comp-menus-container-elevation)]',
      'p-[4px]',
      'bg-[var(--_md-comp-menus-container-color)]',
    );
    expect(menu).toHaveClass('[--m3-menu-corner:var(--_md-comp-menus-container-shape)]');
    expect(menu).toHaveClass('rounded-[var(--m3-menu-corner,var(--md-sys-shape-corner-large))]');
    const clipboard = screen.getByRole('group', { name: 'Clipboard' }).parentElement!;
    expect(clipboard).toHaveClass('rounded-none', 'shadow-none', 'p-0');
    // One divider between the two groups; it can't take focus.
    const dividers = within(menu).getAllByRole('separator');
    expect(dividers).toHaveLength(1);
    expect(dividers[0]).toHaveClass(
      'bg-[var(--_md-comp-divider-color)]',
      'my-[calc(8px+var(--md-sys-density,0)*2px)]',
    );
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
      'shadow-[shadow:var(--_md-comp-menus-container-elevation)]',
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

  it('closes on Tab, moving focus on past the trigger', async () => {
    render(
      <>
        <EditMenu />
        <Button>Next</Button>
      </>,
    );
    await openMenu('Edit');
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();
    await userEvent.tab();
    await closed();
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus();
  });

  it('closes on Tab with nothing after the trigger, returning focus to it', async () => {
    render(<EditMenu />);
    await openMenu('Edit');
    await userEvent.tab();
    await closed();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus());
  });

  it('closes every menu on Tab from a submenu', async () => {
    render(
      <MenuTrigger>
        <Button>File</Button>
        <Menu aria-label="File">
          <SubmenuTrigger>
            <MenuItem key="share">Share</MenuItem>
            <Menu aria-label="Share">
              <MenuItem key="email">Email</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('File');
    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus());
    await userEvent.tab();
    await closed();
    await waitFor(() => expect(screen.getByRole('button', { name: 'File' })).toHaveFocus());
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

  // M3 keyboard table: "Letters — Focus moves to the next menu item starting with letter".
  it('moves typeahead to the next item starting with the letter, wrapping', async () => {
    render(<EditMenu />);
    await openMenu('Edit');
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();
    await userEvent.keyboard('c');
    expect(screen.getByRole('menuitem', { name: /Copy/ })).toHaveFocus();
    await userEvent.keyboard('c');
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();
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
    expect(screen.getByRole('menuitem', { name: /^Paste\s*From history$/ })).toBeInTheDocument();
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
    expect(name).toHaveAttribute('data-tokens', 'md-comp-menus');
    expect(name).toHaveAttribute('data-variant', 'standard');
    expect(name).toHaveClass(
      'data-selected:rounded-corner-medium',
      'data-selected:bg-[var(--_md-comp-menus-menu-item-selected-container-color)]',
      'data-selected:text-[color:var(--_md-comp-menus-menu-item-selected-label-text-color)]',
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

  // 2026-10-16: an item with a description was named by its label and described by its
  // supporting text, so its name left out visible text (axe's label-content-name-mismatch,
  // WCAG 2.5.3), as List options were.
  it('names an item by its label and supporting text, each read once', async () => {
    render(
      <MenuTrigger>
        <Button>Edit</Button>
        <Menu aria-label="Edit">
          <MenuItem key="paste" description="From history" shortcut="⌘V">
            Paste
          </MenuItem>
          <MenuItem key="inbox" description="All mail" badge={<span>12</span>}>
            Inbox
          </MenuItem>
          <MenuItem key="delete">Delete</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('Edit');
    const menu = screen.getByRole('menu');
    expect(await labelInNameViolations(menu)).toEqual([]);
    const paste = screen.getByRole('menuitem', { name: /^Paste\s*From history$/ });
    expect(paste).not.toHaveAttribute('aria-labelledby');
    // The shortcut and the badge stay descriptions, read once after the name.
    expect(paste).toHaveAccessibleDescription('⌘V');
    expect(
      screen.getByRole('menuitem', { name: /^Inbox\s*All mail$/ }),
    ).toHaveAccessibleDescription('12');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).not.toHaveAccessibleDescription();
    expect(await axeViolations(menu)).toEqual([]);
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
    expect(screen.getByRole('menu')).toHaveAttribute('data-density', '-2');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass(
      'min-h-[calc(44px+var(--md-sys-density,0)*4px)]',
    );
  });

  it("takes its scope's density unless it sets its own", async () => {
    const { unmount } = render(
      <ThemeScope density={-3}>
        <EditMenu />
      </ThemeScope>,
    );
    await openMenu('Edit');
    const menu = screen.getByRole('menu');
    expect(menu).not.toHaveAttribute('data-density');
    expect(menu.closest('[data-overlay-scope]')).toHaveAttribute('data-density', '-3');
    expect(await axeViolations(menu.closest('[data-overlay-scope]')!)).toEqual([]);
    unmount();
    render(
      <ThemeScope density={-3}>
        <EditMenu density={0} />
      </ThemeScope>,
    );
    await openMenu('Edit');
    expect(screen.getByRole('menu')).toHaveAttribute('data-density', '0');
  });

  it('uses vibrant colours', async () => {
    render(<EditMenu variant="vibrant" layout="gap" />);
    await openMenu('Edit');
    expect(screen.getByRole('menu')).toHaveAttribute('data-variant', 'vibrant');
    expect(screen.getByRole('group', { name: 'Clipboard' }).parentElement).toHaveClass(
      'bg-[var(--_md-comp-menus-container-color)]',
    );
    const item = screen.getByRole('menuitem', { name: 'Delete' });
    expect(item).toHaveAttribute('data-variant', 'vibrant');
    expect(item).toHaveClass('text-[color:var(--_md-comp-menus-menu-item-label-text-color)]');
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
      'bg-[var(--_md-comp-menus-container-color)]',
    );
  });

  it("stays open when the page scrolls while its trigger's tooltip leaves", async () => {
    render(
      <MenuTrigger>
        <IconButton icon={<svg />} aria-label="More" />
        <Menu aria-label="More">
          <MenuItem key="a">Alpha</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    // Keyboard focus shows the icon button's tooltip; opening the menu sends it out.
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('tooltip')).toHaveAttribute('data-exiting', 'true');
    // A scroll of the trigger's page used to reach the tooltip's close on scroll, which
    // fell back to the menu's close, as both share the trigger.
    fireEvent.scroll(document);
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.getByRole('menu', { name: 'More' }).closest('[data-exiting]')).toBeNull();
    expect(screen.getByRole('button', { name: 'More', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'true',
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
    // M3: "When a menu opens, focus should be placed on the first menu item."
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Copy' })).toHaveFocus());
    await userEvent.click(screen.getByRole('menuitem', { name: 'Copy' }));
    expect(onAction.mock.calls[0]?.[0]).toBe('copy');
    await closed();
  });

  it('opens in a bottom sheet with presentation="sheet", keeping the menu keyboard', async () => {
    const onAction = vi.fn();
    const { baseElement } = render(<EditMenu presentation="sheet" onAction={onAction} />);
    await openMenu('Edit');
    const sheet = await screen.findByRole('dialog', { name: 'Edit' });
    const menu = within(sheet).getByRole('menu', { name: 'Edit' });
    // The list spans the sheet, on its surface.
    expect(menu).toHaveClass('w-full', 'bg-transparent', 'shadow-none');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /Copy/ })).toHaveFocus();
    expect(await axeViolations(baseElement)).toEqual([]);
    await userEvent.keyboard('{Enter}');
    expect(onAction.mock.calls[0]?.[0]).toBe('copy');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Edit' })).toHaveFocus());
  });

  // On a short phone, half the window cut off the last items (WCAG 2.4.11).
  it('opens its sheet fully, never at half the window', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(349);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(620);
    try {
      render(<EditMenu presentation="sheet" />);
      await openMenu('Edit');
      const sheet = await screen.findByRole('dialog', { name: 'Edit' });
      expect(sheet).toHaveAttribute('data-detent', 'expanded');
    } finally {
      vi.restoreAllMocks();
    }
  });

  it('opens a submenu in its sheet in place of the menu, with a way back', async () => {
    const onAction = vi.fn();
    render(
      <MenuTrigger>
        <Button>File</Button>
        <Menu
          aria-label="File"
          presentation="sheet"
          onAction={onAction}
          labels={{ back: 'Go back' }}
        >
          <MenuItem key="open">Open</MenuItem>
          <SubmenuTrigger>
            <MenuItem key="share">Share</MenuItem>
            <Menu aria-label="Share" onAction={onAction}>
              <MenuItem key="email">Email</MenuItem>
              <MenuItem key="link">Copy link</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('File');
    const sheet = await screen.findByRole('dialog', { name: 'File' });
    const share = within(sheet).getByRole('menuitem', { name: 'Share' });
    // Hovering doesn't open it: it would replace the menu under the pointer.
    await userEvent.hover(share);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByRole('menu', { name: 'Share' })).not.toBeInTheDocument();

    share.focus();
    await userEvent.keyboard('{ArrowRight}');
    const submenu = await within(sheet).findByRole('menu', { name: 'Share' });
    await waitFor(() =>
      expect(within(submenu).getByRole('menuitem', { name: 'Email' })).toHaveFocus(),
    );
    // After the menu that opened it, which the sheet's styles hide, below a back button and
    // the item's label; the list spans the sheet like the menu's.
    const panel = submenu.closest('[data-submenu-panel]')!;
    const root = within(sheet).getByRole('menu', { name: 'File' });
    expect(root.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(panel).toHaveTextContent('Share');
    expect(submenu).toHaveClass('w-full', 'bg-transparent', 'shadow-none');

    // ← goes back, and the item that opened it takes focus again.
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(screen.queryByRole('menu', { name: 'Share' })).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(share).toHaveFocus());

    // So does the back button.
    await userEvent.keyboard('{Enter}');
    await within(sheet).findByRole('menu', { name: 'Share' });
    await userEvent.click(within(sheet).getByRole('button', { name: 'Go back' }));
    await waitFor(() =>
      expect(screen.queryByRole('menu', { name: 'Share' })).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(share).toHaveFocus());

    // An action in the submenu closes the sheet and returns focus to the trigger.
    await userEvent.keyboard('{Enter}');
    await within(sheet).findByRole('menu', { name: 'Share' });
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onAction.mock.lastCall?.[0]).toBe('link');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    await waitFor(() => expect(screen.getByRole('button', { name: 'File' })).toHaveFocus());
  });

  it('closes its sheet on Escape', async () => {
    render(<EditMenu presentation="sheet" />);
    await openMenu('Edit');
    await screen.findByRole('dialog', { name: 'Edit' });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
  });

  it('presentation="auto" opens a sheet on compact windows and a popover on larger ones', async () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    const { unmount } = render(<EditMenu presentation="auto" />);
    await openMenu('Edit');
    expect(await screen.findByRole('dialog', { name: 'Edit' })).toBeInTheDocument();
    unmount();
    setMediaQueries({ [COMPACT_WINDOW]: false });
    render(<EditMenu presentation="auto" />);
    await openMenu('Edit');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBe(null);
  });

  it('opens and closes at once when instant', async () => {
    render(<EditMenu instant />);
    await openMenu('Edit');
    expect(screen.getByRole('menu').parentElement).toHaveClass('[transition-property:none]');
    await userEvent.keyboard('{Escape}');
    // No exit transition to wait for.
    expect(screen.queryByRole('menu')).toBe(null);
  });

  it('expands along the axis away from its anchor', async () => {
    render(<EditMenu />);
    await openMenu('Edit');
    const motion = screen.getByRole('menu').parentElement!;
    // Under reduced motion only the fade is left: the clip stays open.
    expect(motion).toHaveClass(
      'motion-safe:data-entering:[clip-path:inset(-24px_-24px_100%_-24px)]',
      'motion-safe:data-[placement=top]:data-entering:[clip-path:inset(100%_-24px_-24px_-24px)]',
    );
    expect(motion).not.toHaveClass('starting:scale-80');
    // The closed state waits for the placement (a `@starting-style` was resolved before React
    // Aria set it, so a menu above its anchor opened from its top edge), then opens.
    expect(motion).toHaveAttribute('data-placement');
    expect(motion).not.toHaveAttribute('data-entering');
    // Leaving, it lets presses through: an item clicked as it faded out ran its action.
    expect(motion).toHaveClass('data-exiting:**:pointer-events-none');
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

describe('Menu classNames', () => {
  it('puts each item part slot on its part', async () => {
    render(
      <MenuTrigger>
        <Button>Edit</Button>
        <Menu
          aria-label="Edit"
          classNames={{
            heading: 'heading-x',
            icon: 'icon-x',
            description: 'description-x',
            shortcut: 'shortcut-x',
            trailingIcon: 'trailing-x',
          }}
        >
          <MenuGroup title="Clipboard">
            <MenuItem
              key="cut"
              shortcut="⌘X"
              leadingIcon={<svg data-testid="leading" />}
              trailingIcon={<svg data-testid="trailing" />}
            >
              Cut
            </MenuItem>
            <MenuItem key="paste" description="From history">
              Paste
            </MenuItem>
          </MenuGroup>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('Edit');
    expect(screen.getByText('Clipboard')).toHaveClass('heading-x');
    expect(screen.getByTestId('leading').parentElement).toHaveClass('icon-x');
    expect(screen.getByTestId('trailing').parentElement).toHaveClass('trailing-x');
    expect(screen.getByText('⌘X')).toHaveClass('shortcut-x');
    expect(screen.getByText('From history')).toHaveClass('description-x');
  });

  it('puts className and style on the placed popover, and the panel slot on the menu', async () => {
    render(
      <EditMenu
        className="fixed right-4 bottom-4"
        style={{ outline: '1px solid' }}
        classNames={{ panel: 'bg-surface-container' }}
      />,
    );
    await openMenu('Edit');
    const menu = screen.getByRole('menu');
    expect(menu).toHaveClass('bg-surface-container');
    expect(menu).not.toHaveClass('fixed');
    // The menu, then the reveal wrapper, then the popover.
    const popover = menu.parentElement!.parentElement!;
    expect(popover).toHaveClass('fixed', 'right-4', 'bottom-4');
    expect(popover).toHaveStyle({ outline: '1px solid' });
    // React Aria places it (inline position wins over a consumer class); the menu inside
    // keeps its own width.
    expect(popover.style.position).not.toBe('');
    expect(menu.parentElement).toHaveClass('w-max');
  });

  it('puts className on the sheet and classNames.sheet on its surface in a sheet', async () => {
    render(
      <EditMenu
        presentation="sheet"
        className="absolute"
        classNames={{ sheet: 'bg-surface-container', panel: 'panel-x' }}
      />,
    );
    await openMenu('Edit');
    const sheet = await screen.findByRole('dialog', { name: 'Edit' });
    expect(sheet).toHaveClass('bg-surface-container');
    expect(sheet).not.toHaveClass('absolute');
    // The sheet's outermost element: around the layer that moves the panel.
    expect(sheet.parentElement!.parentElement).toHaveClass('absolute');
    expect(within(sheet).getByRole('menu')).toHaveClass('panel-x');
  });
});

describe('Menu token sets', () => {
  it("puts an app's token set after the menu's own", async () => {
    render(<EditMenu data-tokens="app-actions" />);
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(screen.getByRole('menu', { name: 'Edit' })).toHaveAttribute(
      'data-tokens',
      'md-comp-menus app-actions',
    );
    // Items keep the menu's set alone.
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveAttribute(
      'data-tokens',
      'md-comp-menus',
    );
  });
});
