import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runIdleCallbacks } from '../../../test/setup';

// Counts the loads of the module a menu loads on demand; a test can hold one back, or fail it.
const loads = { count: 0, gate: Promise.resolve(), fail: false };

/**
 * The menu's modules, imported afresh for each test, so each starts with nothing loaded,
 * whichever ran before it, and each load of the module on demand runs the counting mock again.
 */
async function freshMenu() {
  vi.resetModules();
  vi.doMock('./menu-in-place', async (importOriginal) => {
    loads.count += 1;
    await loads.gate;
    if (loads.fail) throw new Error('The network is down');
    return importOriginal();
  });
  const [menu, button] = await Promise.all([import('./Menu'), import('../button/Button')]);
  type MenuProps = Partial<ComponentProps<typeof menu.Menu>>;
  function Settings({ open, ...props }: MenuProps & { open?: boolean }) {
    return (
      <menu.MenuTrigger {...(open !== undefined && { open })}>
        <button.Button>Settings</button.Button>
        <menu.Menu aria-label="Settings" {...props}>
          <menu.SubmenuTrigger>
            <menu.MenuItem key="quality">Quality</menu.MenuItem>
            <menu.Menu>
              <menu.MenuItem key="auto">Auto</menu.MenuItem>
              <menu.MenuItem key="hd">1080p</menu.MenuItem>
            </menu.Menu>
          </menu.SubmenuTrigger>
          <menu.MenuItem key="loop">Loop</menu.MenuItem>
        </menu.Menu>
      </menu.MenuTrigger>
    );
  }
  return { Settings, preload: menu.preloadMenuInPlace };
}

/** Holds the next load back until the returned function is called. */
function holdLoad() {
  let release = () => {};
  loads.gate = new Promise<void>((resolve) => (release = resolve));
  return () => release();
}

const trigger = () => screen.getByRole('button', { name: 'Settings', hidden: true });

beforeEach(() => {
  loads.count = 0;
  loads.gate = Promise.resolve();
  loads.fail = false;
});

describe('Menu code loaded on demand', () => {
  it('never loads the pages, the sheet or the container code for a menu with submenus beside it', async () => {
    const { Settings } = await freshMenu();
    render(<Settings />);
    // Neither the idle period nor the pointer or focus on its trigger preloads it.
    runIdleCallbacks();
    await userEvent.hover(trigger());
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menu', { name: 'Settings' })).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}');
    expect(await screen.findByRole('menu', { name: 'Quality' })).toBeInTheDocument();
    runIdleCallbacks();
    expect(loads.count).toBe(0);
  });

  it('loads it when a menu with pages in place first opens, focus on the trigger meanwhile', async () => {
    const { Settings } = await freshMenu();
    const release = holdLoad();
    render(<Settings submenuPresentation="replace" />);
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    // While it loads, nothing shows (never a surface unplaced or of another shape), and focus
    // stays on the open trigger, never on the page.
    expect(loads.count).toBe(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(trigger()).toHaveFocus();
    release();
    // Then it opens, its first item focused as on any open.
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Quality' })).toHaveFocus());
    expect(screen.getByRole('menu', { name: 'Settings' }).closest('[data-level]')).toHaveAttribute(
      'data-level',
      '0',
    );
    expect(loads.count).toBe(1);
  });

  it('never shows a menu closed before its code came in', async () => {
    const { Settings, preload } = await freshMenu();
    const release = holdLoad();
    const onAction = vi.fn();
    const { rerender } = render(
      <Settings open submenuPresentation="replace" onAction={onAction} />,
    );
    trigger().focus();
    rerender(<Settings open={false} submenuPresentation="replace" onAction={onAction} />);
    // The load in flight resolves once the module is in and every waiting menu has heard.
    await act(async () => {
      release();
      await preload();
    });
    // Closed, it stays closed: no menu exiting out of sight takes focus or runs keys.
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onAction).not.toHaveBeenCalled();
  });

  it('closes its trigger when its code fails to load, and loads it again on the next open', async () => {
    const { Settings } = await freshMenu();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    loads.fail = true;
    render(<Settings submenuPresentation="replace" />);
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger()).toHaveAttribute('aria-expanded', 'false'));
    expect(error).toHaveBeenCalledWith(expect.stringContaining("couldn't load"), expect.any(Error));
    expect(trigger()).toHaveFocus();
    // Back online, the next open loads it and shows the menu.
    loads.fail = false;
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Quality' })).toHaveFocus());
    error.mockRestore();
  });

  it('loads a sheet menu’s code when the browser is idle, not as the page mounts', async () => {
    const { Settings } = await freshMenu();
    render(<Settings presentation="sheet" />);
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(loads.count).toBe(0);
    runIdleCallbacks();
    await waitFor(() => expect(loads.count).toBe(1));
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });
});
