import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { runIdleCallbacks } from '../../../test/setup';
import { Button } from '../button/Button';
import { Menu, MenuItem, MenuTrigger, SubmenuTrigger } from './Menu';

// Counts the loads of the module a menu loads on demand, and holds one back when a test asks.
const loads = vi.hoisted(() => ({ count: 0, gate: Promise.resolve() }));
vi.mock('./menu-in-place', async (importOriginal) => {
  loads.count += 1;
  await loads.gate;
  return importOriginal();
});

function Settings(props: Partial<React.ComponentProps<typeof Menu>>) {
  return (
    <MenuTrigger>
      <Button>Settings</Button>
      <Menu aria-label="Settings" {...props}>
        <SubmenuTrigger>
          <MenuItem key="quality">Quality</MenuItem>
          <Menu>
            <MenuItem key="auto">Auto</MenuItem>
            <MenuItem key="hd">1080p</MenuItem>
          </Menu>
        </SubmenuTrigger>
        <MenuItem key="loop">Loop</MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

// Runs in order: the module is loaded once per file.
describe('Menu code loaded on demand', () => {
  it('never loads the pages, the sheet or the container code for a menu with submenus beside it', async () => {
    render(<Settings />);
    const trigger = screen.getByRole('button', { name: 'Settings' });
    // Neither the idle period nor the pointer or focus on its trigger preloads it.
    runIdleCallbacks();
    await userEvent.hover(trigger);
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menu', { name: 'Settings' })).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}');
    expect(await screen.findByRole('menu', { name: 'Quality' })).toBeInTheDocument();
    runIdleCallbacks();
    expect(loads.count).toBe(0);
  });

  it('loads it when a menu with pages in place first opens, focus on the trigger meanwhile', async () => {
    let release = () => {};
    loads.gate = new Promise<void>((resolve) => (release = resolve));
    render(<Settings submenuPresentation="replace" />);
    const trigger = screen.getByRole('button', { name: 'Settings' });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    // While it loads, nothing shows (never a surface unplaced or of another shape), and focus
    // stays on the open trigger, never on the page.
    expect(loads.count).toBe(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings', hidden: true })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(trigger).toHaveFocus();
    release();
    // Then it opens, its first item focused as on any open.
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Quality' })).toHaveFocus());
    expect(screen.getByRole('menu', { name: 'Settings' }).closest('[data-level]')).toHaveAttribute(
      'data-level',
      '0',
    );
    expect(loads.count).toBe(1);
  });
});
