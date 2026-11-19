import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadControl, resetOnDemand } from '../../../test/on-demand';
import { setMediaQueries } from '../../../test/setup';
import { Button } from '../button/Button';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';
import { Menu, MenuItem, MenuTrigger, preloadMenuInPlace } from '../menu/Menu';
import { SelectItem } from '../select/option-list';
import { Select } from '../select/Select';
import { preloadBottomSheet } from './lazy-bottom-sheet';

// Parts load through a mock loader, reset before each test, so each starts with the sheet not
// yet loaded without importing the components afresh (slow under a loaded run).
vi.mock('../../utils/load-on-demand', async (importOriginal) =>
  (await import('../../../test/on-demand')).mockOnDemand(importOriginal),
);

/**
 * The sheet's module, loaded slowly: each load is counted and waits until the test lets it
 * finish (`finishSheet`), so the moment between opening and the sheet appearing can be checked.
 */
const sheetModule = loadControl('/BottomSheet');
let finishSheet = () => {};

/** The menu's own module for its sheet, which a test can hold back too. */
const menuModule = loadControl('menu-in-place');

/** The components under test. */
function load() {
  function EditMenu({
    presentation,
    open,
  }: {
    presentation?: 'popover' | 'sheet' | 'auto';
    open?: boolean;
  }) {
    return (
      <MenuTrigger {...(open !== undefined && { open })}>
        <Button>Edit</Button>
        <Menu aria-label="Edit" presentation={presentation}>
          <MenuItem key="cut">Cut</MenuItem>
          <MenuItem key="copy">Copy</MenuItem>
        </Menu>
      </MenuTrigger>
    );
  }

  function Sort({ presentation }: { presentation?: 'menu' | 'sheet' }) {
    return (
      <Select label="Sort by" presentation={presentation}>
        <SelectItem key="newest">Newest first</SelectItem>
        <SelectItem key="oldest">Oldest first</SelectItem>
      </Select>
    );
  }

  return { EditMenu, Sort, preloadBottomSheet, preloadMenuInPlace };
}

const finishLoading = () => act(async () => finishSheet());
const editButton = () => screen.getByRole('button', { name: 'Edit' });
const sortField = () => screen.getByRole('button', { name: /Sort by/ });

describe('lazy bottom sheet', () => {
  beforeEach(() => {
    resetOnDemand();
    finishSheet = sheetModule.hold();
    setMediaQueries({ [COMPACT_WINDOW]: false });
  });

  it('never loads the sheet for a popover menu, an auto menu on a wide window or a menu select', async () => {
    const { EditMenu, Sort } = load();
    const { unmount } = render(<EditMenu />);
    await userEvent.hover(editButton());
    editButton().focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menu', { name: 'Edit' })).toBeInTheDocument();
    unmount();
    const auto = render(<EditMenu presentation="auto" />);
    editButton().focus();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('menu', { name: 'Edit' })).toBeInTheDocument();
    auto.unmount();
    render(<Sort />);
    await userEvent.click(sortField());
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(sheetModule.loads).toBe(0);
  });

  it('loads a sheet menu on first open, showing nothing until it is ready, then focuses the first item', async () => {
    const { EditMenu } = load();
    const { rerender } = render(<EditMenu presentation="sheet" open={false} />);
    expect(sheetModule.loads).toBe(0);
    rerender(<EditMenu presentation="sheet" open />);
    await waitFor(() => expect(sheetModule.loads).toBe(1));
    // No popover in the meantime: the wrong presentation never flashes.
    expect(screen.queryByRole('menu')).toBe(null);
    expect(screen.queryByRole('dialog')).toBe(null);
    await finishLoading();
    const sheet = await screen.findByRole('dialog', { name: 'Edit' });
    expect(sheet).toContainElement(screen.getByRole('menu', { name: 'Edit' }));
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Cut' })).toHaveFocus());
    expect(sheetModule.loads).toBe(1);
  });

  it('preloads the sheet when the pointer is over the trigger', async () => {
    const { EditMenu } = load();
    setMediaQueries({ [COMPACT_WINDOW]: true });
    render(<EditMenu presentation="auto" />);
    expect(sheetModule.loads).toBe(0);
    await userEvent.hover(editButton());
    await waitFor(() => expect(sheetModule.loads).toBe(1));
    await finishLoading();
    editButton().focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('dialog', { name: 'Edit' })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Cut' })).toHaveFocus());
    expect(sheetModule.loads).toBe(1);
  });

  it('loads a sheet select when its field is used', async () => {
    const { Sort } = load();
    render(<Sort presentation="sheet" />);
    expect(sheetModule.loads).toBe(0);
    await userEvent.click(sortField());
    await waitFor(() => expect(sheetModule.loads).toBe(1));
    expect(screen.queryByRole('listbox')).toBe(null);
    await finishLoading();
    expect(await screen.findByRole('dialog', { name: 'Sort by' })).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('starts loading the sheet with the menu’s own code as a sheet menu first opens', async () => {
    const { EditMenu } = load();
    const finishMenu = menuModule.hold();
    const { rerender } = render(<EditMenu presentation="sheet" open={false} />);
    // Opened with nothing preloaded (a controlled open, an app's shortcut): both load at once,
    // not the sheet only once the menu's code has come.
    rerender(<EditMenu presentation="sheet" open />);
    await waitFor(() => expect(menuModule.loads).toBe(1));
    await waitFor(() => expect(sheetModule.loads).toBe(1));
    await act(async () => finishMenu());
    await finishLoading();
    expect(await screen.findByRole('dialog', { name: 'Edit' })).toBeInTheDocument();
  });

  it('closes a sheet select whose sheet fails to load, and loads it again on the next open', async () => {
    const { Sort } = load();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    sheetModule.fail = true;
    render(<Sort presentation="sheet" />);
    await userEvent.click(sortField());
    await finishLoading();
    // Closed, not left open over nothing, and said in development.
    await waitFor(() => expect(sortField()).toHaveAttribute('aria-expanded', 'false'));
    expect(error).toHaveBeenCalledWith(expect.stringContaining("couldn't load"), expect.any(Error));
    expect(sortField()).toHaveFocus();
    // Back online, the next open loads it and shows the sheet.
    sheetModule.fail = false;
    await userEvent.click(sortField());
    expect(await screen.findByRole('dialog', { name: 'Sort by' })).toBeInTheDocument();
    expect(sheetModule.loads).toBe(2);
    error.mockRestore();
  });

  it('closes a sheet select opened while its sheet loads on Escape, a press outside or focus moving on', async () => {
    const { Sort, preloadBottomSheet } = load();
    render(
      <>
        <Sort presentation="sheet" />
        <button type="button">Elsewhere</button>
      </>,
    );
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    const open = async () => {
      sortField().focus();
      await userEvent.keyboard('{Enter}');
      expect(sortField()).toHaveAttribute('aria-expanded', 'true');
      // Nothing to point at yet: no list is in the page.
      expect(sortField()).not.toHaveAttribute('aria-controls');
    };
    await open();
    await userEvent.keyboard('{Escape}');
    expect(sortField()).toHaveAttribute('aria-expanded', 'false');
    expect(sortField()).toHaveFocus();
    await open();
    await userEvent.click(document.body);
    expect(sortField()).toHaveAttribute('aria-expanded', 'false');
    await open();
    await userEvent.tab();
    expect(elsewhere).toHaveFocus();
    expect(sortField()).toHaveAttribute('aria-expanded', 'false');
    // The sheet coming in later (the load itself, awaited) opens nothing and leaves focus where
    // it went.
    await act(async () => {
      finishSheet();
      await preloadBottomSheet();
    });
    expect(sortField()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(elsewhere).toHaveFocus();
  });

  it('once preloaded, opens in the same pass as the open, with no Suspense delay', async () => {
    const { EditMenu, preloadBottomSheet, preloadMenuInPlace } = load();
    const { rerender } = render(<EditMenu presentation="sheet" open={false} />);
    // As the browser's first idle period does: the sheet, and the menu's code for it.
    const preloaded = Promise.all([preloadBottomSheet(), preloadMenuInPlace()]);
    await finishLoading();
    await act(() => preloaded);
    rerender(<EditMenu presentation="sheet" open />);
    // Nothing awaited: the render that opens it already has the sheet.
    expect(screen.getByRole('dialog', { name: 'Edit' })).toContainElement(
      screen.getByRole('menu', { name: 'Edit' }),
    );
    expect(sheetModule.loads).toBe(1);
  });
});
