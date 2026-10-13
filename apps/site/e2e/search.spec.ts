import { expect, test, type Page } from '@playwright/test';

/** The documentation search: shortcuts, grouped results, keyboard, recents and layouts. */

const LABEL = 'Search documentation';

const view = (page: Page) => page.getByRole('dialog', { name: LABEL });

/**
 * Presses ⌘K / Ctrl+K once the page has hydrated: the bar on screen advertises its shortcuts
 * only then.
 */
async function openWithShortcut(page: Page) {
  await expect(page.getByRole('combobox', { name: LABEL })).toHaveAttribute(
    'aria-keyshortcuts',
    /K/,
  );
  await page.keyboard.press('ControlOrMeta+K');
  await expect(view(page).getByRole('searchbox')).toBeFocused();
}

test.describe('Docs search', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test('⌘K / Ctrl+K opens it from anywhere; Escape closes it and returns focus', async ({
    page,
  }) => {
    await page.goto('/theming');
    const link = page.getByRole('main').getByRole('link').first();
    await link.focus();
    await openWithShortcut(page);
    await page.keyboard.press('Escape');
    await expect(view(page)).toBeHidden();
    await expect(link).toBeFocused();
  });

  test('/ opens it, except while typing in a field', async ({ page }) => {
    await page.goto('/components');
    await expect(page.getByRole('combobox', { name: LABEL })).toHaveAttribute(
      'aria-keyshortcuts',
      /\//,
    );
    const filter = page.getByRole('searchbox', { name: 'Filter components' });
    await filter.pressSequentially('a/b');
    await expect(filter).toHaveValue('a/b');
    await expect(view(page)).toBeHidden();
    await page.getByRole('heading', { level: 1 }).click();
    await page.keyboard.press('/');
    await expect(view(page).getByRole('searchbox')).toBeFocused();
  });

  test('shows the shortcut in the bar', async ({ page }) => {
    await page.goto('/getting-started');
    const bar = page.getByRole('combobox', { name: LABEL });
    await expect(bar).toHaveAttribute('aria-keyshortcuts', 'Meta+K Control+K /');
    await expect(bar.locator('..').locator('kbd')).toHaveText(/^(⌘K|Ctrl K)$/);
  });

  test('groups results by category, labels and highlights them, and announces the count', async ({
    page,
  }) => {
    await page.goto('/getting-started');
    await openWithShortcut(page);
    await view(page).getByRole('searchbox').fill('button');
    const actions = view(page).getByRole('grid', { name: 'Actions' });
    const first = actions.getByRole('row').first();
    await expect(first).toContainText('Component');
    await expect(first.locator('mark').first()).toHaveText('Button');
    await expect(view(page).getByRole('heading', { name: 'Inputs & selection' })).toBeVisible();
    await expect(view(page).getByRole('status')).toHaveText(/^\d+ results$/);
  });

  test('a code name opens the API tab', async ({ page }) => {
    await page.goto('/getting-started');
    await openWithShortcut(page);
    await view(page).getByRole('searchbox').fill('IconButton');
    const row = view(page).getByRole('row').first();
    await expect(row).toContainText('API');
    await row.click();
    await expect(page).toHaveURL(/\/components\/icon-button\/api$/);
  });

  test('the arrow keys move through every group and back to the field', async ({ page }) => {
    await page.goto('/getting-started');
    await openWithShortcut(page);
    const input = view(page).getByRole('searchbox');
    await input.fill('button');
    const grids = view(page).getByRole('grid');
    const firstGroup = grids.first().getByRole('row');
    await expect(firstGroup.first()).toBeVisible();
    const count = await firstGroup.count();
    await page.keyboard.press('ArrowDown');
    await expect(firstGroup.first()).toBeFocused();
    for (let step = 1; step < count; step++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(grids.nth(1).getByRole('row').first()).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(firstGroup.last()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/components\/[a-z-]+(\?|$)/);
  });

  test('remembers recent searches across visits, and forgets one on request', async ({ page }) => {
    await page.goto('/getting-started');
    await openWithShortcut(page);
    await view(page).getByRole('searchbox').fill('theming');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/theming$/);
    await page.reload();
    await openWithShortcut(page);
    const recent = view(page).getByRole('grid', { name: 'Recent searches' });
    await expect(recent.getByRole('row')).toHaveText(['theming']);
    await expect(view(page).getByRole('grid', { name: 'Suggestions' })).toBeVisible();
    await recent.getByRole('button', { name: 'Remove theming from recent searches' }).click();
    await expect(recent).toBeHidden();
  });

  test('compact windows open the full-screen view without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/components/button');
    await page.getByRole('combobox', { name: LABEL }).click();
    await expect(view(page)).toBeVisible();
    await view(page).getByRole('searchbox').fill('date');
    const box = (await view(page).boundingBox())!;
    expect(box.width).toBe(390);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    await view(page).getByRole('button', { name: 'Close search' }).click();
    await expect(view(page)).toBeHidden();
    await expect(page.getByRole('combobox', { name: LABEL })).toBeFocused();
  });
});
