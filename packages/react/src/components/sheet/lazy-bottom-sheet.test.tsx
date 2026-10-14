import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setMediaQueries } from '../../../test/setup';
import { COMPACT_WINDOW } from '../date-picker/use-media-query';

/**
 * The sheet's module, loaded slowly: each load is counted and waits until the test lets it
 * finish, so the moment between opening and the sheet appearing can be checked.
 */
const sheetModule = { loads: 0, finish: () => {}, ready: Promise.resolve() };

/** Fresh modules per test, so each starts with the sheet not yet loaded. */
async function load() {
  vi.resetModules();
  sheetModule.loads = 0;
  sheetModule.ready = new Promise<void>((resolve) => {
    sheetModule.finish = resolve;
  });
  vi.doMock('./BottomSheet', async (importOriginal) => {
    sheetModule.loads += 1;
    await sheetModule.ready;
    return importOriginal();
  });
  const [{ Button }, menu, select, options, { preloadBottomSheet }] = await Promise.all([
    import('../button/Button'),
    import('../menu/Menu'),
    import('../select/Select'),
    import('../select/option-list'),
    import('./lazy-bottom-sheet'),
  ]);
  const { Menu, MenuItem, MenuTrigger } = menu;
  const { Select } = select;
  const { SelectItem } = options;

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

  return { EditMenu, Sort, preloadBottomSheet };
}

const finishLoading = () => act(async () => sheetModule.finish());
const editButton = () => screen.getByRole('button', { name: 'Edit' });
const sortField = () => screen.getByRole('button', { name: /Sort by/ });

describe('lazy bottom sheet', () => {
  beforeEach(() => setMediaQueries({ [COMPACT_WINDOW]: false }));

  it('never loads the sheet for a popover menu, an auto menu on a wide window or a menu select', async () => {
    const { EditMenu, Sort } = await load();
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
    const { EditMenu } = await load();
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
    const { EditMenu } = await load();
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
    const { Sort } = await load();
    render(<Sort presentation="sheet" />);
    expect(sheetModule.loads).toBe(0);
    await userEvent.click(sortField());
    await waitFor(() => expect(sheetModule.loads).toBe(1));
    expect(screen.queryByRole('listbox')).toBe(null);
    await finishLoading();
    expect(await screen.findByRole('dialog', { name: 'Sort by' })).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('once preloaded, opens in the same pass as the open, with no Suspense delay', async () => {
    const { EditMenu, preloadBottomSheet } = await load();
    const { rerender } = render(<EditMenu presentation="sheet" open={false} />);
    const preloaded = preloadBottomSheet();
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
