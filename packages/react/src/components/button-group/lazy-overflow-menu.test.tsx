import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The overflow menu's module, loaded slowly: each load is counted and waits until the test
 * lets it finish, so the moment between folding and the menu being ready can be checked.
 */
const menuModule = { loads: 0, finish: () => {}, ready: Promise.resolve(), fail: false };

/** Fresh modules per test, so each starts with the menu not yet loaded. */
async function load() {
  vi.resetModules();
  menuModule.loads = 0;
  menuModule.fail = false;
  menuModule.ready = new Promise<void>((resolve) => {
    menuModule.finish = resolve;
  });
  vi.doMock('./overflow-menu-list', async (importOriginal) => {
    menuModule.loads += 1;
    await menuModule.ready;
    if (menuModule.fail) throw new Error('The network is down');
    return importOriginal();
  });
  const [{ Button }, { ButtonGroup }, { preloadOverflowMenu }] = await Promise.all([
    import('../button/Button'),
    import('./ButtonGroup'),
    import('./lazy-overflow-menu'),
  ]);

  function Actions({ overflow, count }: { overflow: boolean; count: number }) {
    const labels = ['Reply', 'Forward', 'Archive', 'Delete'].slice(0, count);
    return (
      <>
        <ButtonGroup aria-label="Actions" overflow={overflow}>
          {labels.map((label) => (
            <Button key={label}>{label}</Button>
          ))}
        </ButtonGroup>
        <button type="button">Elsewhere</button>
      </>
    );
  }
  return { Actions, preloadOverflowMenu };
}

const finishLoading = () => act(async () => menuModule.finish());
const more = () => screen.getByRole('button', { name: 'More options' });

/** jsdom has no layout: a 200px group, 80px buttons and a 40px indicator, no gap. */
let restoreLayout = () => {};
beforeEach(() => {
  const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(200);
  const rect = vi
    .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: HTMLElement) {
      return { width: this.getAttribute('aria-label') === 'More options' ? 40 : 80 } as DOMRect;
    });
  restoreLayout = () => {
    width.mockRestore();
    rect.mockRestore();
  };
});
afterEach(() => restoreLayout());

describe('ButtonGroup lazy overflow menu', () => {
  it('never loads the menu without overflow, or while every button fits', async () => {
    const { Actions } = await load();
    const off = render(<Actions overflow={false} count={4} />);
    await userEvent.hover(screen.getByRole('button', { name: 'Reply' }));
    off.unmount();
    render(<Actions overflow count={2} />);
    const indicator = screen.getByRole('button', { name: 'More options', hidden: true });
    expect(indicator).toHaveAttribute('data-overflow-hidden');
    await userEvent.hover(screen.getByRole('button', { name: 'Forward' }));
    await act(async () => {});
    expect(menuModule.loads).toBe(0);
  });

  it('loads the menu once a button folds, before the indicator is pressed', async () => {
    const { Actions } = await load();
    const { rerender } = render(<Actions overflow count={2} />);
    expect(menuModule.loads).toBe(0);
    rerender(<Actions overflow count={4} />);
    await waitFor(() => expect(menuModule.loads).toBe(1));
    await finishLoading();
    await userEvent.click(more());
    const items = await screen.findAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual(['Archive', 'Delete']);
    rerender(<Actions overflow count={3} />);
    expect(menuModule.loads).toBe(1);
  });

  it('shows nothing when opened before the menu is ready, then focuses the first item', async () => {
    const { Actions } = await load();
    render(<Actions overflow count={4} />);
    await waitFor(() => expect(menuModule.loads).toBe(1));
    more().focus();
    await userEvent.keyboard('{Enter}');
    expect(more()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('menu')).toBe(null);
    await finishLoading();
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Archive' })).toHaveFocus());
    expect(menuModule.loads).toBe(1);
  });

  it('once loaded, opens in the same pass as the press, with no Suspense delay', async () => {
    const { Actions, preloadOverflowMenu } = await load();
    render(<Actions overflow count={4} />);
    await waitFor(() => expect(menuModule.loads).toBe(1));
    await finishLoading();
    await act(() => preloadOverflowMenu());
    act(() => more().click());
    // Nothing awaited: the render that opens it already has the menu.
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      'Archive',
      'Delete',
    ]);
  });

  it('closes on Escape, a press outside or focus moving on while the menu loads, and never opens after', async () => {
    const { Actions, preloadOverflowMenu } = await load();
    render(<Actions overflow count={4} />);
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    const open = async () => {
      more().focus();
      await userEvent.keyboard('{Enter}');
      expect(more()).toHaveAttribute('aria-expanded', 'true');
      // Nothing to point at yet: no menu is in the page.
      expect(more()).not.toHaveAttribute('aria-controls');
    };
    await open();
    await userEvent.keyboard('{Escape}');
    expect(more()).toHaveAttribute('aria-expanded', 'false');
    await open();
    await userEvent.click(document.body);
    expect(more()).toHaveAttribute('aria-expanded', 'false');
    await open();
    // ↓ asks for the first item without closing it.
    await userEvent.keyboard('{ArrowDown}');
    expect(more()).toHaveAttribute('aria-expanded', 'true');
    act(() => elsewhere.focus());
    expect(more()).toHaveAttribute('aria-expanded', 'false');
    // The code coming in (the load itself, awaited) opens nothing and leaves focus where it went.
    await act(async () => {
      menuModule.finish();
      await preloadOverflowMenu();
    });
    expect(more()).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(elsewhere).toHaveFocus();
  });

  it('closes when the menu fails to load, and loads it again on the next open', async () => {
    const { Actions } = await load();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    menuModule.fail = true;
    menuModule.finish();
    render(<Actions overflow count={4} />);
    more().focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(more()).toHaveAttribute('aria-expanded', 'false'));
    expect(error).toHaveBeenCalledWith(expect.stringContaining("couldn't load"), expect.any(Error));
    menuModule.fail = false;
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    error.mockRestore();
  });
});
