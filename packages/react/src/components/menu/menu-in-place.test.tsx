import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ComponentProps } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runIdleCallbacks } from '../../../test/setup';
import { LOAD_RETRY_DELAY } from '../../utils/use-loaded';
import type * as LoadOnDemand from '../../utils/load-on-demand';

/**
 * Counts the loads of the module a menu loads on demand (`count`, as the module is imported)
 * and the loads asked for of any part loaded on demand (`requested`, as `preload` asks, at once);
 * a test can hold a load back, or fail it.
 */
const loads = { count: 0, requested: 0, gate: Promise.resolve(), fail: false };

/**
 * The menu's modules, imported afresh for each test, so each starts with nothing loaded,
 * whichever ran before it, and each load of the module on demand runs the counting mock again.
 */
async function freshMenu() {
  vi.resetModules();
  vi.doMock('../../utils/load-on-demand', async (importOriginal) => {
    const original = await importOriginal<typeof LoadOnDemand>();
    const onDemand: typeof original.onDemand = (load) =>
      original.onDemand(() => {
        loads.requested += 1;
        return load();
      });
    return { ...original, onDemand };
  });
  vi.doMock('./menu-in-place', async (importOriginal) => {
    loads.count += 1;
    await loads.gate;
    if (loads.fail) throw new Error('The network is down');
    return importOriginal();
  });
  const [menu, button, sheet] = await Promise.all([
    import('./Menu'),
    import('../button/Button'),
    import('../sheet/lazy-bottom-sheet'),
  ]);
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
  function Region(props: MenuProps) {
    return (
      <menu.ContextMenuTrigger>
        <p tabIndex={0}>Selected text</p>
        <menu.Menu aria-label="Text" submenuPresentation="replace" {...props}>
          <menu.MenuItem key="copy">Copy</menu.MenuItem>
        </menu.Menu>
      </menu.ContextMenuTrigger>
    );
  }
  return {
    Settings,
    Region,
    preload: menu.preloadMenuInPlace,
    preloadAll: () => Promise.all([menu.preloadMenuInPlace(), sheet.preloadBottomSheet()]),
  };
}

/** Holds the next load back until the returned function is called. */
function holdLoad() {
  let release = () => {};
  loads.gate = new Promise<void>((resolve) => (release = resolve));
  return () => release();
}

const trigger = () => screen.getByRole('button', { name: 'Settings', hidden: true });

/** The times a menu said its code failed to load (React's own warnings aside). */
const loadErrors = (error: { mock: { calls: unknown[][] } }) =>
  error.mock.calls.filter(([message]) => String(message).includes("couldn't load")).length;

beforeEach(() => {
  loads.count = 0;
  loads.requested = 0;
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

  it('treats the page’s body or root as no container, so there is nothing to load', async () => {
    const { Settings } = await freshMenu();
    for (const page of [document.body, document.documentElement]) {
      const { unmount } = render(<Settings portalContainer={page} />);
      runIdleCallbacks();
      trigger().focus();
      await userEvent.keyboard('{Enter}');
      // Open at once, in the page, as a menu with no container is.
      expect(screen.getByRole('menu', { name: 'Settings' })).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      unmount();
    }
    expect(loads.requested).toBe(0);
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

  it('reports a failed load once for a sheet menu with pages in place or a container', async () => {
    const { Settings } = await freshMenu();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    loads.fail = true;
    render(
      <Settings
        presentation="sheet"
        submenuPresentation="replace"
        portalContainer={document.body}
      />,
    );
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger()).toHaveAttribute('aria-expanded', 'false'));
    // The sheet's code alone: the popover's isn't wanted, and isn't loaded or reported.
    expect(loadErrors(error)).toBe(1);
    error.mockRestore();
  });

  it('loads its code again after a pause while it stays open, when its app holds it open', async () => {
    const { Settings } = await freshMenu();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    loads.fail = true;
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    try {
      // A controlled `open` with no `onOpenChange`: the failed load's close changes nothing.
      render(<Settings open submenuPresentation="replace" />);
      await vi.waitFor(() => expect(loadErrors(error)).toBe(1));
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      // Back online: tried again after a pause, the menu shows, with no second report.
      loads.fail = false;
      await act(() => vi.advanceTimersByTimeAsync(LOAD_RETRY_DELAY));
      await vi.waitFor(() =>
        expect(screen.getByRole('menu', { name: 'Settings' })).toBeInTheDocument(),
      );
      expect(loadErrors(error)).toBe(1);
    } finally {
      vi.useRealTimers();
      error.mockRestore();
    }
  });

  it('loads a sheet menu’s code when the browser is idle, not as the page mounts', async () => {
    const { Settings } = await freshMenu();
    render(<Settings presentation="sheet" />);
    // Mounting asked for nothing: its effects have run, and a load is asked for in them at once.
    expect(loads.requested).toBe(0);
    runIdleCallbacks();
    expect(loads.requested).toBeGreaterThan(0);
    await waitFor(() => expect(loads.count).toBe(1));
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Settings' })).toBeInTheDocument();
  });

  it('loads, opens, changes pages and closes under StrictMode, leaving no stand-in behind', async () => {
    const { Settings } = await freshMenu();
    const player = document.body.appendChild(document.createElement('div'));
    player.style.position = 'relative';
    const { unmount } = render(
      <StrictMode>
        <Settings submenuPresentation="replace" portalContainer={player} />
      </StrictMode>,
    );
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    const quality = screen.getByRole('menuitem', { name: 'Quality' });
    await waitFor(() => expect(quality).toHaveFocus());
    expect(player).toContainElement(screen.getByRole('menu', { name: 'Settings' }));
    // One stand-in for the container, however often StrictMode ran the effects.
    expect(document.querySelectorAll('[data-menu-boundary]')).toHaveLength(1);
    await userEvent.keyboard('{ArrowRight}');
    const page = await screen.findByRole('menu', { name: 'Quality' });
    await waitFor(() => expect(page).toContainElement(document.activeElement as HTMLElement));
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(quality).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    expect(trigger()).toHaveFocus();
    expect(document.querySelectorAll('[data-menu-boundary]')).toHaveLength(0);
    expect(loads.count).toBe(1);
    unmount();
    player.remove();
  });
});

describe('Menu opened while its code loads', () => {
  for (const presentation of ['popover', 'sheet'] as const) {
    it(`closes on Escape, a press outside or focus moving on, and never opens after · ${presentation}`, async () => {
      const { Settings, preloadAll } = await freshMenu();
      const release = holdLoad();
      render(
        <>
          <Settings presentation={presentation} submenuPresentation="replace" />
          <button type="button">Elsewhere</button>
        </>,
      );
      const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
      const open = async () => {
        trigger().focus();
        await userEvent.keyboard('{Enter}');
        expect(trigger()).toHaveAttribute('aria-expanded', 'true');
        // Nothing to point at yet: no menu is in the page.
        expect(trigger()).not.toHaveAttribute('aria-controls');
      };
      await open();
      await userEvent.keyboard('{Escape}');
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      expect(trigger()).toHaveFocus();
      await open();
      await userEvent.click(document.body);
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      await open();
      await userEvent.tab();
      expect(elsewhere).toHaveFocus();
      expect(trigger()).toHaveAttribute('aria-expanded', 'false');
      // The code coming in later opens nothing and leaves focus where it went.
      await act(async () => {
        release();
        await preloadAll();
      });
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(elsewhere).toHaveFocus();
    });
  }

  it('keeps the menu open on an arrow key at the trigger, and focuses the item it asked for once it comes', async () => {
    const { Settings, preloadAll } = await freshMenu();
    const release = holdLoad();
    render(<Settings submenuPresentation="replace" />);
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    // ↑ asks for the last item, as on a trigger whose menu is in, without closing it.
    await userEvent.keyboard('{ArrowUp}');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}{Alt>}{ArrowUp}{/Alt}');
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await act(async () => {
      release();
      await preloadAll();
    });
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Loop' })).toHaveFocus());
  });

  it('stays open as the window loses focus, and closes on a Tab past the page’s last control', async () => {
    const { Settings } = await freshMenu();
    holdLoad();
    render(<Settings submenuPresentation="replace" />);
    trigger().focus();
    await userEvent.keyboard('{Enter}');
    // Another window or tab took focus: nothing left the menu.
    fireEvent.focusOut(trigger(), { relatedTarget: null });
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    await userEvent.tab();
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes a context menu on a press in its region while its code loads', async () => {
    const { Region, preloadAll } = await freshMenu();
    const release = holdLoad();
    render(<Region />);
    const text = screen.getByText('Selected text');
    fireEvent.contextMenu(text, { clientX: 40, clientY: 60 });
    await userEvent.pointer({ keys: '[MouseLeft]', target: text });
    await act(async () => {
      release();
      await preloadAll();
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('leaves the arrow keys to a context menu’s region while its code loads', async () => {
    const { Region } = await freshMenu();
    holdLoad();
    render(<Region />);
    const text = screen.getByText('Selected text');
    fireEvent.contextMenu(text, { clientX: 40, clientY: 60 });
    text.focus();
    // The region's own content (a text area, a list) takes its arrows as ever.
    expect(fireEvent.keyDown(text, { key: 'ArrowDown' })).toBe(true);
    expect(fireEvent.keyDown(text, { key: 'ArrowUp' })).toBe(true);
  });
});
