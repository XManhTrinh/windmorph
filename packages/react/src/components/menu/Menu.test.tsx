import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axeViolations } from '../../../test/axe';
import { ThemeScope } from '../../theme/ThemeScope';
import { Button } from '../button/Button';
import { IconButton } from '../icon-button/IconButton';
import { Menu, MenuGroup, MenuItem, MenuTrigger } from './Menu';

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

  it('gives groups and items their position corners', async () => {
    render(<EditMenu />);
    await openMenu('Edit');
    const clipboard = screen.getByRole('group', { name: 'Clipboard' }).parentElement!;
    expect(clipboard).toHaveClass(
      'rounded-t-corner-large',
      'rounded-b-corner-small',
      'shadow-elevation-2',
    );
    expect(screen.getByRole('group', { name: 'Danger' }).parentElement).toHaveClass(
      'rounded-t-corner-small',
      'rounded-b-corner-large',
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
      'rounded-b-corner-medium',
    );
  });

  it('nests the corners of a single group of items inside its 16px corners', async () => {
    render(
      <MenuTrigger>
        <Button>Send</Button>
        <Menu aria-label="Send">
          <MenuItem key="later">Send later</MenuItem>
          <MenuItem key="draft">Save draft</MenuItem>
          <MenuItem key="discard">Discard</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('Send');
    const later = screen.getByRole('menuitem', { name: 'Send later' });
    expect(later.parentElement).toHaveClass('rounded-corner-large', 'p-[4px]');
    expect(later).toHaveClass('rounded-t-corner-medium', 'rounded-b-corner-extra-small');
    expect(screen.getByRole('menuitem', { name: 'Save draft' })).toHaveClass(
      'rounded-t-corner-extra-small',
      'rounded-b-corner-extra-small',
    );
    expect(screen.getByRole('menuitem', { name: 'Discard' })).toHaveClass(
      'rounded-t-corner-extra-small',
      'rounded-b-corner-medium',
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
  });

  it('disables items', async () => {
    const onAction = vi.fn();
    render(<EditMenu disabledKeys={['cut']} onAction={onAction} />);
    await openMenu('Edit');
    const cut = screen.getByRole('menuitem', { name: /Cut/ });
    expect(cut).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(cut);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('uses vibrant colours', async () => {
    render(<EditMenu variant="vibrant" />);
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
        <Menu aria-label="More">
          <MenuItem key="a">Alpha</MenuItem>
          <MenuItem key="b">Beta</MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await openMenu('More');
    const group = screen.getByRole('menuitem', { name: 'Alpha' }).parentElement!;
    expect(group).toHaveAttribute('role', 'presentation');
    expect(group).toHaveClass('rounded-corner-large', 'bg-surface-container-low');
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
    const { baseElement } = render(<EditMenu />);
    await openMenu('Edit');
    expect(await axeViolations(baseElement)).toEqual([]);
  });
});
