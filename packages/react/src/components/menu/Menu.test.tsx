import { fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { RouterProvider, UNSAFE_PortalProvider } from 'react-aria';
import { Item, useTreeState, type Selection } from 'react-stately';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { labelInNameViolations } from '../../../test/label-in-name';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { ThemeScope } from '../../theme/ThemeScope';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { BottomSheet } from '../sheet/BottomSheet';
import { SheetTrigger } from '../sheet/SheetTrigger';
import {
  ContextMenuTrigger,
  Menu,
  MenuGroup,
  MenuItem,
  MenuTrigger,
  preloadMenuInPlace,
  SubmenuTrigger,
} from './Menu';

// The sheet, pages in place and a `portalContainer` load on demand (`menu-in-place.test.tsx`
// covers the load): loaded once here, they open in the same pass as a press, as in the browser
// once the module is in.
beforeAll(() => preloadMenuInPlace());

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

/**
 * Whether the menu its trigger opens is still open. A closing menu stays in the page while it
 * plays its exit, so its presence proves nothing; the trigger's `aria-expanded` turns `false`
 * as it starts to close. (The open menu hides the trigger from assistive tech.)
 */
const expectOpen = (trigger: string) =>
  expect(screen.getByRole('button', { name: trigger, hidden: true })).toHaveAttribute(
    'aria-expanded',
    'true',
  );

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

  it('wraps the arrow keys from the first item to the last and back', async () => {
    render(<EditMenu />);
    screen.getByRole('button', { name: 'Edit' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus();
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
    expectOpen('View');
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
    expectOpen('View');
  });

  it('holds a group of choices beside plain actions: the group has a selection of its own', async () => {
    const onSelectionChange = vi.fn();
    const onAction = vi.fn();
    function AccountMenu() {
      return (
        <MenuTrigger>
          <Button>Account</Button>
          <Menu aria-label="Account" onAction={onAction}>
            <MenuGroup
              title="Signed in as"
              selectionMode="single"
              defaultSelectedKeys={['alex']}
              onSelectionChange={onSelectionChange}
            >
              <MenuItem key="alex">Alex Morgan</MenuItem>
              <MenuItem key="studio">Morgan Studio</MenuItem>
            </MenuGroup>
            <MenuGroup aria-label="Accounts">
              <MenuItem key="add">Add an account</MenuItem>
              <MenuItem key="settings">Settings</MenuItem>
            </MenuGroup>
          </Menu>
        </MenuTrigger>
      );
    }
    const { baseElement } = render(<AccountMenu />);
    await openMenu('Account');
    const alex = screen.getByRole('menuitemradio', { name: 'Alex Morgan' });
    expect(alex).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('menuitemradio', { name: 'Morgan Studio' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    // The actions stay actions: no check, no checked state.
    const add = screen.getByRole('menuitem', { name: 'Add an account' });
    expect(add).not.toHaveAttribute('aria-checked');
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(2);
    expect(await axeViolations(baseElement)).toEqual([]);
    // A choice selects within its group and closes the menu, as a single-select menu does.
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Morgan Studio' }));
    expect([...onSelectionChange.mock.calls[0]![0]]).toEqual(['studio']);
    expect(onAction.mock.calls[0]?.[0]).toBe('studio');
    await closed();
    // An action closes the menu without selecting anything. (Uncontrolled, the group starts from
    // `defaultSelectedKeys` each time the menu opens, as a whole menu's selection does.)
    await openMenu('Account');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(onAction.mock.lastCall?.[0]).toBe('settings');
    expect(onSelectionChange).toHaveBeenCalledOnce();
    await closed();
  });

  it('keeps each group’s selection apart, controlled or not, and a multiple group open', async () => {
    const onLayout = vi.fn();
    function ViewMenu() {
      const [layout, setLayout] = useState<Selection>(new Set(['grid']));
      return (
        <MenuTrigger>
          <Button>View</Button>
          <Menu aria-label="View">
            <MenuGroup
              title="Layout"
              selectionMode="single"
              selectedKeys={layout}
              deselectable={false}
              onSelectionChange={(keys) => {
                onLayout(keys);
                setLayout(keys);
              }}
            >
              <MenuItem key="grid">Grid</MenuItem>
              <MenuItem key="list">List</MenuItem>
            </MenuGroup>
            <MenuGroup title="Show" selectionMode="multiple" defaultSelectedKeys={['names']}>
              <MenuItem key="names">Names</MenuItem>
              <MenuItem key="sizes">Sizes</MenuItem>
            </MenuGroup>
            <MenuGroup aria-label="More">
              <MenuItem key="reset">Reset view</MenuItem>
            </MenuGroup>
          </Menu>
        </MenuTrigger>
      );
    }
    render(<ViewMenu />);
    await openMenu('View');
    // A toggle in a multiple group keeps the menu open, Enter included, and leaves the other
    // group's choice alone.
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Sizes' }));
    expect(screen.getByRole('menuitemcheckbox', { name: 'Sizes' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expectOpen('View');
    screen.getByRole('menuitemcheckbox', { name: 'Names' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Names' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expectOpen('View');
    expect(screen.getByRole('menuitemradio', { name: 'Grid' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(onLayout).not.toHaveBeenCalled();
    // `deselectable={false}`: the chosen layout can't be cleared.
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Grid' }));
    expect(onLayout).not.toHaveBeenCalled();
    await closed();
    await openMenu('View');
    expect(screen.getByRole('menuitemradio', { name: 'Grid' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // The arrows move across groups as one menu.
    screen.getByRole('menuitemradio', { name: 'List' }).focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Names' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{Enter}');
    expect([...onLayout.mock.calls[0]![0]]).toEqual(['list']);
  });

  it('makes a group with selectionMode="none" plain actions in a selectable menu', async () => {
    const onSelectionChange = vi.fn();
    const onAction = vi.fn();
    render(
      <MenuTrigger>
        <Button>Sort</Button>
        <Menu
          aria-label="Sort"
          selectionMode="single"
          defaultSelectedKeys={['name']}
          onSelectionChange={onSelectionChange}
          onAction={onAction}
        >
          <MenuGroup title="Sort by">
            <MenuItem key="name">Name</MenuItem>
            <MenuItem key="date">Date</MenuItem>
          </MenuGroup>
          <MenuGroup aria-label="Actions" selectionMode="none">
            <MenuItem key="reset">Reset sorting</MenuItem>
          </MenuGroup>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('Sort');
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(2);
    const reset = screen.getByRole('menuitem', { name: 'Reset sorting' });
    expect(reset).not.toHaveAttribute('aria-checked');
    // Space closes the menu after an action, though it keeps a single-select menu open.
    reset.focus();
    await userEvent.keyboard(' ');
    expect(onAction.mock.lastCall?.[0]).toBe('reset');
    expect(onSelectionChange).not.toHaveBeenCalled();
    await closed();
  });

  it('reports only its own keys from a multiple group with every item selected', async () => {
    const onShow = vi.fn();
    const onSort = vi.fn();
    const onDensity = vi.fn();
    render(
      <MenuTrigger>
        <Button>View</Button>
        <Menu
          aria-label="View"
          selectionMode="single"
          defaultSelectedKeys={['comfortable']}
          onSelectionChange={onDensity}
        >
          <MenuGroup
            title="Show"
            selectionMode="multiple"
            defaultSelectedKeys="all"
            onSelectionChange={onShow}
          >
            <MenuItem key="names">Names</MenuItem>
            <MenuItem key="sizes">Sizes</MenuItem>
            <MenuItem key="dates">Dates</MenuItem>
          </MenuGroup>
          <MenuGroup
            title="Sort by"
            selectionMode="single"
            defaultSelectedKeys={['name']}
            onSelectionChange={onSort}
          >
            <MenuItem key="name">Name</MenuItem>
            <MenuItem key="size">Size</MenuItem>
          </MenuGroup>
          <MenuGroup title="Density">
            <MenuItem key="comfortable">Comfortable</MenuItem>
            <MenuItem key="compact">Compact</MenuItem>
          </MenuGroup>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('View');
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Sizes' }));
    expect([...onShow.mock.calls[0]![0]].sort()).toEqual(['dates', 'names']);
    const checked = (role: string, name: string) =>
      screen.getByRole(role, { name }).getAttribute('aria-checked');
    expect(checked('menuitemcheckbox', 'Names')).toBe('true');
    expect(checked('menuitemcheckbox', 'Sizes')).toBe('false');
    expect(checked('menuitemradio', 'Name')).toBe('true');
    expect(checked('menuitemradio', 'Size')).toBe('false');
    expect(checked('menuitemradio', 'Comfortable')).toBe('true');
    expect(checked('menuitemradio', 'Compact')).toBe('false');
    expect(onSort).not.toHaveBeenCalled();
    expect(onDensity).not.toHaveBeenCalled();
  });

  it("keeps a group's keys out of the menu's own 'all', from its keys or a select-all", async () => {
    const onSelectionChange = vi.fn();
    render(
      <MenuTrigger>
        <Button>View</Button>
        <Menu
          aria-label="View"
          selectionMode="multiple"
          defaultSelectedKeys="all"
          onSelectionChange={onSelectionChange}
        >
          <MenuGroup title="Show">
            <MenuItem key="names">Names</MenuItem>
            <MenuItem key="sizes">Sizes</MenuItem>
          </MenuGroup>
          <MenuGroup aria-label="Actions" selectionMode="none">
            <MenuItem key="reset">Reset the view</MenuItem>
          </MenuGroup>
          <MenuGroup title="Sort by" selectionMode="single" defaultSelectedKeys={['name']}>
            <MenuItem key="name">Name</MenuItem>
            <MenuItem key="size">Size</MenuItem>
          </MenuGroup>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('View');
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Sizes' }));
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['names']);
    // A select-all (Ctrl + A) is the menu's own items too, once a toggle spells it out.
    screen.getByRole('menuitemcheckbox', { name: 'Names' }).focus();
    await userEvent.keyboard('{Control>}a{/Control}');
    expect(onSelectionChange.mock.lastCall![0]).toBe('all');
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Names' }));
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['sizes']);
  });

  it('fails loudly in development if the selection manager a group builds changes shape', () => {
    // A group's manager comes from the menu manager's own constructor, React Stately's
    // `SelectionManager` (not exported): take a method away from it, as a change would.
    const { result } = renderHook(() => useTreeState({ children: <Item key="a">A</Item> }));
    const prototype = Object.getPrototypeOf(result.current.selectionManager) as {
      select?: unknown;
    };
    const select = prototype.select;
    delete prototype.select;
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <MenuTrigger defaultOpen>
            <Button>Account</Button>
            <Menu aria-label="Account">
              <MenuGroup title="Signed in as" selectionMode="single">
                <MenuItem key="alex">Alex Morgan</MenuItem>
              </MenuGroup>
            </Menu>
          </MenuTrigger>,
        ),
      ).toThrow(/^\[@windmorph\/react\] MenuGroup: the selection manager .* lacks select\. /);
    } finally {
      prototype.select = select;
      error.mockRestore();
    }
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

  it('names the menu by its own aria-label or aria-labelledby in the popover and the sheet alike, else by its trigger', async () => {
    type Naming = { 'aria-label'?: string; 'aria-labelledby'?: string };
    function Options({
      naming,
      presentation,
    }: {
      naming: Naming;
      presentation: 'popover' | 'sheet';
    }) {
      return (
        <>
          <h2 id="document-heading">Document</h2>
          <MenuTrigger>
            <Button>More options</Button>
            <Menu presentation={presentation} {...naming}>
              <MenuItem key="rename">Rename</MenuItem>
              <MenuItem key="share">Share</MenuItem>
            </Menu>
          </MenuTrigger>
        </>
      );
    }
    const cases: [Naming, string][] = [
      [{ 'aria-label': 'Settings' }, 'Settings'],
      [{ 'aria-labelledby': 'document-heading' }, 'Document'],
      // `aria-labelledby` wins over `aria-label`, so the sheet's dialog takes it too.
      [{ 'aria-label': 'Settings', 'aria-labelledby': 'document-heading' }, 'Document'],
      [{}, 'More options'],
    ];
    for (const presentation of ['popover', 'sheet'] as const) {
      for (const [naming, name] of cases) {
        const view = render(<Options naming={naming} presentation={presentation} />);
        await openMenu('More options');
        expect(await screen.findByRole('menu', { name })).toBeInTheDocument();
        if (presentation === 'sheet') {
          expect(screen.getByRole('dialog', { name })).toBeInTheDocument();
        }
        view.unmount();
      }
    }
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
    // The pages read which way the last change went, from the first change on, so the menu
    // itself never comes in as a page as the sheet opens.
    const pages = within(sheet).getByRole('menu', { name: 'File' }).parentElement!;
    expect(pages).not.toHaveAttribute('data-page-direction');
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
    expect(pages).toHaveAttribute('data-page-direction', 'forward');
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
    expect(root.parentElement).toHaveAttribute('data-page-direction', 'back');
    // Shown again, the menu comes in as a page does.
    expect(root.className).toContain('starting:opacity-0');

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

  it('opens its sheet again with the first page still, after a page went back', async () => {
    render(
      <MenuTrigger>
        <Button>File</Button>
        <Menu aria-label="File" presentation="sheet" submenuTransition="slide">
          <MenuItem key="open">Open</MenuItem>
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
    let sheet = await screen.findByRole('dialog', { name: 'File' });
    within(sheet).getByRole('menuitem', { name: 'Share' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await within(sheet).findByRole('menu', { name: 'Share' });
    await userEvent.keyboard('{ArrowLeft}');
    const pages = within(sheet).getByRole('menu', { name: 'File' }).parentElement!;
    await waitFor(() => expect(pages).toHaveAttribute('data-page-direction', 'back'));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(), {
      timeout: 1500,
    });
    // Opened again, the first page comes in with the sheet, not as a page coming back.
    await openMenu('File');
    sheet = await screen.findByRole('dialog', { name: 'File' });
    expect(within(sheet).getByRole('menu', { name: 'File' }).parentElement).not.toHaveAttribute(
      'data-page-direction',
    );
  });

  // The menu's own sheet read the state of a sheet trigger around it: inside a sheet that a
  // SheetTrigger opened it stayed up after a choice, and closing it closed the outer sheet.
  it('in a sheet a trigger opened, its own sheet closes alone', async () => {
    const onAction = vi.fn();
    render(
      <SheetTrigger>
        <Button>Filters</Button>
        <BottomSheet aria-label="Filters">
          <EditMenu presentation="sheet" onAction={onAction} />
        </BottomSheet>
      </SheetTrigger>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    await screen.findByRole('dialog', { name: 'Filters' });
    await openMenu('Edit');
    await screen.findByRole('dialog', { name: 'Edit' });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /Cut/ })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    expect(onAction.mock.calls[0]?.[0]).toBe('cut');
    await waitFor(
      () => expect(screen.queryByRole('dialog', { name: 'Edit' })).not.toBeInTheDocument(),
      { timeout: 1500 },
    );
    // The sheet around it is still open, and still its trigger's.
    expect(screen.getByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
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

/**
 * A player's settings menu with its submenus in place: Quality and Subtitles pages, Subtitles
 * with a page of its own, a "Loop" checkbox group and an action on the first page.
 */
function PlayerSettings({
  onAction,
  quality: qualityProps,
  ...props
}: Partial<React.ComponentProps<typeof Menu>> & {
  quality?: Partial<React.ComponentProps<typeof Menu>>;
}) {
  const [quality, setQuality] = useState<Selection>(new Set(['auto']));
  const qualityLabel = { auto: 'Auto', '1080': '1080p', '720': '720p' }[
    [...(quality as Set<string>)][0] as 'auto'
  ];
  return (
    <MenuTrigger>
      <IconButton icon={<svg />} aria-label="Settings" />
      <Menu aria-label="Settings" submenuPresentation="replace" onAction={onAction} {...props}>
        <SubmenuTrigger>
          <MenuItem key="quality" description={qualityLabel}>
            Quality
          </MenuItem>
          <Menu
            selectionMode="single"
            deselectable={false}
            selectedKeys={quality}
            onSelectionChange={setQuality}
            onAction={onAction}
            {...qualityProps}
          >
            <MenuGroup aria-label="Resolutions">
              <MenuItem key="auto">Auto</MenuItem>
              <MenuItem key="1080">1080p</MenuItem>
              <MenuItem key="720">720p</MenuItem>
            </MenuGroup>
            <MenuGroup aria-label="Playback problems" selectionMode="none">
              <MenuItem key="stats">Show playback stats</MenuItem>
            </MenuGroup>
          </Menu>
        </SubmenuTrigger>
        <SubmenuTrigger>
          <MenuItem key="subtitles">Subtitles</MenuItem>
          <Menu onAction={onAction}>
            <MenuItem key="off">Off</MenuItem>
            <MenuItem key="english">English</MenuItem>
            <MenuItem key="french">French</MenuItem>
            <SubmenuTrigger>
              <MenuItem key="size">Font size</MenuItem>
              <Menu onAction={onAction}>
                <MenuItem key="small">Small</MenuItem>
                <MenuItem key="large">Large</MenuItem>
              </Menu>
            </SubmenuTrigger>
          </Menu>
        </SubmenuTrigger>
        <MenuGroup aria-label="Playback" selectionMode="multiple">
          <MenuItem key="loop">Loop</MenuItem>
        </MenuGroup>
        <MenuGroup aria-label="Help">
          <MenuItem key="report">Report a problem</MenuItem>
        </MenuGroup>
      </Menu>
    </MenuTrigger>
  );
}

/** Opens the settings menu and the page of one of its items with the arrow key. */
async function openPage(item: string, page = item) {
  await openMenu('Settings');
  screen.getByRole('menuitem', { name: new RegExp(`^${item}`) }).focus();
  await userEvent.keyboard('{ArrowRight}');
  return screen.findByRole('menu', { name: new RegExp(`^${page}`) });
}

describe('Menu submenus in place (submenuPresentation="replace")', () => {
  it('shows a submenu in place of the menu on one surface, below a back button and its label', async () => {
    render(<PlayerSettings classNames={{ panel: 'app-surface' }} />);
    await openMenu('Settings');
    const root = screen.getByRole('menu', { name: 'Settings' });
    const surface = root.closest('[data-level]')!;
    expect(surface).toHaveAttribute('data-level', '0');
    expect(surface).toHaveAttribute('data-tokens', 'md-comp-menus');
    // `panel` is the surface around the pages; the lists have none of their own.
    expect(surface).toHaveClass('app-surface');
    expect(root).not.toHaveClass('app-surface');
    expect(root).toHaveClass('bg-transparent', 'shadow-none');
    // Hovering doesn't open it: it would replace the content under the pointer.
    const quality = screen.getByRole('menuitem', { name: /^Quality/ });
    await userEvent.hover(quality);
    await new Promise((resolve) => setTimeout(resolve, 300));
    expect(screen.queryByRole('menu', { name: /^Quality/ })).not.toBeInTheDocument();

    await userEvent.click(quality);
    const page = await screen.findByRole('menu', { name: /^Quality/ });
    // The same surface, after the menu it hides, below a back button and the item's label.
    expect(page.closest('[data-level]')).toBe(surface);
    expect(surface).toHaveAttribute('data-level', '1');
    const panel = page.closest<HTMLElement>('[data-submenu-panel]')!;
    expect(root.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(panel).getByRole('button', { name: 'Back' })).toBeInTheDocument();
    expect(panel.firstElementChild).toHaveTextContent('Quality');
    // Opened by a press, focus moves in, to the selected choice.
    await waitFor(() =>
      expect(within(page).getByRole('menuitemradio', { name: 'Auto' })).toHaveFocus(),
    );
    expect(await axeViolations(document.body)).toEqual([]);
  });

  it('goes back one page with Escape, the back arrow or the back button, focusing the item', async () => {
    render(<PlayerSettings />);
    const subtitles = await openPage('Subtitles');
    await waitFor(() =>
      expect(within(subtitles).getByRole('menuitem', { name: 'Off' })).toHaveFocus(),
    );
    // Typeahead stays within the page.
    await userEvent.keyboard('f');
    expect(within(subtitles).getByRole('menuitem', { name: 'French' })).toHaveFocus();
    await userEvent.keyboard('f');
    expect(within(subtitles).getByRole('menuitem', { name: /^Font size/ })).toHaveFocus();
    // Two pages deep, each way back goes up one level.
    await userEvent.keyboard('{ArrowRight}');
    const size = await screen.findByRole('menu', { name: /^Font size/ });
    await waitFor(() =>
      expect(within(size).getByRole('menuitem', { name: 'Small' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(size).not.toBeInTheDocument());
    await waitFor(() =>
      expect(within(subtitles).getByRole('menuitem', { name: /^Font size/ })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() => expect(subtitles).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /^Subtitles/ })).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    const again = await screen.findByRole('menu', { name: /^Subtitles/ });
    await userEvent.click(screen.getByRole('button', { name: 'Back' }));
    await waitFor(() => expect(again).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('menuitem', { name: /^Subtitles/ })).toHaveFocus());
    // On the first page, Escape closes the menu.
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus());
  });

  it('closes on a choice (Space keeps the page), stays on a toggle, and closes on an action', async () => {
    const onAction = vi.fn();
    render(<PlayerSettings onAction={onAction} />);
    const quality = await openPage('Quality');
    await waitFor(() =>
      expect(within(quality).getByRole('menuitemradio', { name: 'Auto' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown} ');
    expect(within(quality).getByRole('menuitemradio', { name: '1080p' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expectOpen('Settings');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await closed();
    // A toggle in the first page's checkbox group keeps the menu open.
    await openMenu('Settings');
    await userEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Loop' }));
    expectOpen('Settings');
    // An action from a page closes the whole menu and returns focus to the trigger.
    screen.getByRole('menuitem', { name: /^Subtitles/ }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await screen.findByRole('menu', { name: /^Subtitles/ });
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onAction.mock.lastCall?.[0]).toBe('english');
    await closed();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus());
  });

  it('tells the pages which way they changed, from the first change on, and marks a slide', async () => {
    const { unmount } = render(<PlayerSettings />);
    await openMenu('Settings');
    expect(screen.getByRole('menu', { name: 'Settings' }).parentElement).toHaveAttribute(
      'data-page-transition',
      'fade',
    );
    unmount();
    render(<PlayerSettings submenuTransition="slide" />);
    await openMenu('Settings');
    const pages = screen.getByRole('menu', { name: 'Settings' }).parentElement!;
    expect(pages).toHaveAttribute('data-page-transition', 'slide');
    // Opening, the first page comes in with the menu's reveal, not as a page.
    expect(pages).not.toHaveAttribute('data-page-direction');
    screen.getByRole('menuitem', { name: /^Quality/ }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await screen.findByRole('menu', { name: /^Quality/ });
    expect(pages).toHaveAttribute('data-page-direction', 'forward');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(pages).toHaveAttribute('data-page-direction', 'back'));
  });

  it('goes back after a choice with afterSelect="back", showing the choice on the page it returns to', async () => {
    const onAction = vi.fn();
    render(<PlayerSettings onAction={onAction} quality={{ afterSelect: 'back' }} />);
    const quality = await openPage('Quality');
    await waitFor(() =>
      expect(within(quality).getByRole('menuitemradio', { name: 'Auto' })).toHaveFocus(),
    );
    // Space chooses and keeps the page.
    await userEvent.keyboard('{ArrowDown} ');
    expect(quality).toBeInTheDocument();
    // Enter chooses and goes back: the item shows the new choice and takes focus.
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(quality).not.toBeInTheDocument());
    expectOpen('Settings');
    const item = screen.getByRole('menuitem', { name: /^Quality/ });
    expect(item).toHaveTextContent('720p');
    await waitFor(() => expect(item).toHaveFocus());
    // A press goes back too.
    await userEvent.keyboard('{Enter}');
    const again = await screen.findByRole('menu', { name: /^Quality/ });
    await userEvent.click(within(again).getByRole('menuitemradio', { name: 'Auto' }));
    await waitFor(() => expect(again).not.toBeInTheDocument());
    expect(item).toHaveTextContent('Auto');
    await waitFor(() => expect(item).toHaveFocus());
    // An action on the page still closes the whole menu.
    await userEvent.keyboard('{Enter}');
    const last = await screen.findByRole('menu', { name: /^Quality/ });
    await userEvent.click(within(last).getByRole('menuitem', { name: 'Show playback stats' }));
    expect(onAction.mock.lastCall?.[0]).toBe('stats');
    await closed();
  });

  it('keeps a multi-select page open on a toggle with afterSelect="back"', async () => {
    render(<PlayerSettings quality={{ afterSelect: 'back', selectionMode: 'multiple' }} />);
    const quality = await openPage('Quality');
    await userEvent.click(within(quality).getByRole('menuitemcheckbox', { name: '1080p' }));
    await userEvent.keyboard('{Enter}');
    expect(quality).toBeInTheDocument();
    expectOpen('Settings');
  });

  it('closes only the submenu beside its item after a choice with afterSelect="back"', async () => {
    render(<PlayerSettings submenuPresentation="beside" quality={{ afterSelect: 'back' }} />);
    const quality = await openPage('Quality');
    await waitFor(() =>
      expect(within(quality).getByRole('menuitemradio', { name: 'Auto' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    const item = screen.getByRole('menuitem', { name: /^Quality/ });
    await waitFor(() => expect(item).toHaveFocus());
    expect(item).toHaveTextContent('1080p');
    await waitFor(() => expect(quality).not.toBeInTheDocument(), { timeout: 1500 });
    expectOpen('Settings');
  });

  it('keeps the page, and focus in it, while the menu leaves after an action on it', async () => {
    const onAction = vi.fn();
    render(<PlayerSettings onAction={onAction} />);
    const subtitles = await openPage('Subtitles');
    await waitFor(() =>
      expect(within(subtitles).getByRole('menuitem', { name: 'Off' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    expect(onAction.mock.lastCall?.[0]).toBe('off');
    // Closing, the menu plays its exit with the page it closed from, focus still on its item.
    expect(screen.getByRole('button', { name: 'Settings', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(subtitles).toBeInTheDocument();
    expect(subtitles.closest('[data-level]')).toHaveAttribute('data-level', '1');
    expect(document.activeElement).not.toBe(document.body);
    await closed();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Settings' })).toHaveFocus());
  });

  it('closes every page and the menu on Tab', async () => {
    render(
      <>
        <PlayerSettings />
        <Button>After</Button>
      </>,
    );
    await openPage('Subtitles');
    await userEvent.keyboard('{Tab}');
    await closed();
  });

  it('changes pages with no motion when instant', async () => {
    render(<PlayerSettings instant />);
    const quality = await openPage('Quality');
    expect(quality.closest('[data-submenu-panel]')).toHaveClass('[transition-property:none]');
    expect(quality.closest('[data-level]')).not.toHaveAttribute('data-paging');
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('menu', { name: 'Settings' })).toHaveClass(
      '[transition-property:none]',
    );
  });

  it('leaves a sheet in place as always, and follows submenuPresentation from 600px up with auto', async () => {
    setMediaQueries({ [COMPACT_WINDOW]: true });
    const { unmount } = render(
      <PlayerSettings presentation="auto" submenuPresentation="beside" submenuTransition="slide" />,
    );
    const sheetPage = await openPage('Quality');
    expect(sheetPage.closest('[role="dialog"]')).toBeInTheDocument();
    expect(sheetPage.closest('[data-submenu-panel]')).toBeInTheDocument();
    // The sheet's pages slide too.
    expect(sheetPage.closest('[data-page-transition]')).toHaveAttribute(
      'data-page-transition',
      'slide',
    );
    unmount();
    setMediaQueries({ [COMPACT_WINDOW]: false });
    render(<PlayerSettings presentation="auto" />);
    const page = await openPage('Quality');
    expect(screen.queryByRole('dialog')).toBe(null);
    expect(page.closest('[data-submenu-panel]')).toBeInTheDocument();
  });
});

/** A player whose settings menu opens inside it (`portalContainer`), as an app passes it. */
function Player({
  menu,
  scope,
}: {
  menu?: Partial<React.ComponentProps<typeof Menu>>;
  scope?: Partial<React.ComponentProps<typeof ThemeScope>>;
}) {
  const [player, setPlayer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setPlayer} data-testid="player" style={{ position: 'relative' }}>
      <ThemeScope {...scope}>
        <MenuTrigger>
          <IconButton icon={<svg />} aria-label="Settings" />
          <Menu aria-label="Settings" portalContainer={player} {...menu}>
            <MenuItem key="quality">Quality</MenuItem>
            <SubmenuTrigger>
              <MenuItem key="speed">Playback speed</MenuItem>
              <Menu>
                <MenuItem key="normal">Normal</MenuItem>
                <MenuItem key="fast">1.5×</MenuItem>
              </Menu>
            </SubmenuTrigger>
          </Menu>
        </MenuTrigger>
      </ThemeScope>
    </div>
  );
}

describe('Menu in an element (portalContainer)', () => {
  it('opens inside the element, with only the theme attributes that differ there', async () => {
    const { unmount } = render(
      <ThemeProvider defaultTheme="ocean" storage="none">
        <Player />
      </ThemeProvider>,
    );
    await openMenu('Settings');
    const player = screen.getByTestId('player');
    const wrapper = screen.getByRole('menu').closest('[data-overlay-scope]')!;
    expect(wrapper.parentElement).toBe(player);
    // Declared where the player's theme is in effect: nothing to write again, so an app's
    // `:root` values reach it.
    for (const name of ['data-theme', 'data-mode', 'data-contrast', 'data-motion']) {
      expect(wrapper).not.toHaveAttribute(name);
    }
    unmount();
    // Declared in another theme and direction than the player's: they go with it.
    render(
      <ThemeProvider defaultTheme="ocean" storage="none">
        <Player scope={{ theme: 'rose', dir: 'rtl' }} />
      </ThemeProvider>,
    );
    await openMenu('Settings');
    const rose = screen.getByRole('menu').closest('[data-overlay-scope]')!;
    expect(rose.parentElement).toBe(screen.getByTestId('player'));
    expect(rose).toHaveAttribute('data-theme', 'rose');
    expect(rose).toHaveAttribute('dir', 'rtl');
    expect(rose).not.toHaveAttribute('data-motion');
  });

  it('keeps the menu, and a submenu beside it, within the element; a portal provider is no boundary', async () => {
    const { unmount } = render(<Player />);
    const player = screen.getByTestId('player');
    // React Aria reads the boundary's box to keep the menu within it.
    const box = vi.spyOn(player, 'getBoundingClientRect');
    await openMenu('Settings');
    expect(box).toHaveBeenCalled();
    // React Aria measures a stand-in in the page where the player sits in its own coordinates.
    const standIn = document.querySelector<HTMLElement>('[data-menu-boundary]')!;
    expect(standIn.parentElement).toBe(document.documentElement);
    expect(standIn).toHaveAttribute('aria-hidden', 'true');
    expect(standIn.style.visibility).toBe('hidden');
    const before = box.mock.calls.length;
    screen.getByRole('menuitem', { name: 'Playback speed' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    await screen.findByRole('menu', { name: 'Playback speed' });
    expect(box.mock.calls.length).toBeGreaterThan(before);
    await userEvent.keyboard('{Escape}{Escape}');
    await closed();
    expect(standIn).not.toBeInTheDocument();
    unmount();

    // In an app's portal provider's container, the menu is placed within the window.
    const provided = document.createElement('div');
    document.body.append(provided);
    const providedBox = vi.spyOn(provided, 'getBoundingClientRect');
    render(
      <UNSAFE_PortalProvider getContainer={() => provided}>
        <Player menu={{ portalContainer: null }} />
      </UNSAFE_PortalProvider>,
    );
    await openMenu('Settings');
    expect(provided).toContainElement(screen.getByRole('menu'));
    expect(providedBox).not.toHaveBeenCalled();
    provided.remove();
  });

  it('moves focus with Home, End, Page Up and Page Down without scrolling what holds the menu', async () => {
    render(<Player />);
    await openMenu('Settings');
    // Their default would scroll a pane around the player, and the menu with it.
    for (const key of ['End', 'Home', 'PageDown', 'PageUp']) {
      expect(fireEvent.keyDown(document.activeElement!, { key }), key).toBe(false);
    }
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Playback speed' })).toHaveFocus();
  });

  it('warns in development when the element draws none of its children', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const video = document.createElement('video');
    document.body.append(video);
    render(
      <MenuTrigger>
        <Button>Speed</Button>
        <Menu aria-label="Speed" portalContainer={video}>
          <MenuItem key="normal">Normal</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('Speed');
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('a <video> never shows'));
    warn.mockRestore();
    video.remove();
  });

  it('opens a sheet over the window, not in the element', async () => {
    render(<Player menu={{ presentation: 'sheet' }} />);
    await openMenu('Settings');
    const sheet = await screen.findByRole('dialog', { name: 'Settings' });
    expect(screen.getByTestId('player')).not.toContainElement(sheet);
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

  it("puts header, back and title on the row above a submenu's page, with the menu's back icon", async () => {
    render(
      <MenuTrigger>
        <Button>File</Button>
        <Menu
          aria-label="File"
          presentation="sheet"
          backIcon={<svg data-testid="back-icon" />}
          classNames={{ header: 'app-header', back: 'app-back', title: 'app-title' }}
        >
          <SubmenuTrigger>
            <MenuItem key="share">Share</MenuItem>
            <Menu aria-label="Share" classNames={{ title: 'share-title' }}>
              <MenuItem key="email">Email</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('File');
    const sheet = await screen.findByRole('dialog', { name: 'File' });
    within(sheet).getByRole('menuitem', { name: 'Share' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    const back = await within(sheet).findByRole('button', { name: 'Back' });
    expect(back).toHaveClass('app-back');
    expect(within(back).getByTestId('back-icon')).toBeInTheDocument();
    const header = back.parentElement!;
    expect(header).toHaveClass('app-header');
    expect(within(header).getByText('Share')).toHaveClass('app-title', 'share-title');
    // The row reads the menu's tokens, as the items do, so `vibrant` and overrides reach it.
    const page = header.closest('[data-submenu-panel]')!;
    expect(page).toHaveAttribute('data-tokens', 'md-comp-menus');
    expect(page).toHaveAttribute('data-variant', 'standard');
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

describe('MenuItem links', () => {
  function ExportMenu() {
    return (
      <MenuTrigger>
        <Button>Export</Button>
        <Menu aria-label="Export" disabledKeys={['archive']}>
          <MenuItem key="guide" href="/docs/guide">
            Read the guide
          </MenuItem>
          <MenuItem key="report" href="/files/report.pdf" download="report.pdf">
            Download the report
          </MenuItem>
          <MenuItem key="status" href="https://status.example.com" target="_blank">
            Service status
          </MenuItem>
          <MenuItem key="archive" href="/files/archive.zip">
            Download the archive
          </MenuItem>
        </Menu>
      </MenuTrigger>
    );
  }

  it('renders a link item as a real link, keeping the menu item role', async () => {
    const { baseElement } = render(<ExportMenu />);
    await openMenu('Export');
    const guide = screen.getByRole('menuitem', { name: 'Read the guide' });
    expect(guide.tagName).toBe('A');
    expect(guide).toHaveAttribute('href', '/docs/guide');
    const report = screen.getByRole('menuitem', { name: 'Download the report' });
    expect(report).toHaveAttribute('download', 'report.pdf');
    const status = screen.getByRole('menuitem', { name: 'Service status' });
    expect(status).toHaveAttribute('target', '_blank');
    expect(status).toHaveAttribute('rel', 'noopener noreferrer');
    // A disabled item isn't a link at all.
    const archive = screen.getByRole('menuitem', { name: 'Download the archive' });
    expect(archive.tagName).toBe('DIV');
    expect(archive).not.toHaveAttribute('href');
    expect(await axeViolations(baseElement)).toEqual([]);
  });

  it('follows a link through the router and closes the menu, by press or Enter', async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <ExportMenu />
      </RouterProvider>,
    );
    await openMenu('Export');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Read the guide' }));
    expect(navigate).toHaveBeenLastCalledWith('/docs/guide', undefined);
    await closed();
    // Opened by the keyboard, the menu focuses its first item, the guide.
    await openMenu('Export');
    expect(screen.getByRole('menuitem', { name: 'Read the guide' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledTimes(2);
    await closed();
  });

  it('leaves a download to the browser and closes the menu', async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider navigate={navigate}>
        <ExportMenu />
      </RouterProvider>,
    );
    await openMenu('Export');
    // jsdom can't download: cancel the click's default action once React has handled it (a
    // window listener runs after React's), where a browser would download the file.
    const cancel = (event: MouseEvent) => event.preventDefault();
    window.addEventListener('click', cancel);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Download the report' }));
    window.removeEventListener('click', cancel);
    expect(navigate).not.toHaveBeenCalled();
    await closed();
  });
});
