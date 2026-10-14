import { expect, test, type Locator, type Page } from '@playwright/test';

/** The documentation search: shortcuts, grouped results, keyboard, recents and layouts. */

const LABEL = 'Search documentation';

const view = (page: Page) => page.getByRole('dialog', { name: LABEL });

/** A group of the results list: a section named by its subheader. */
const group = (page: Page, name: string) => view(page).getByRole('rowgroup', { name });

/** The item rows in a list or group, without the sections' subheader rows. */
const items = (page: Page, container: Locator) =>
  container.getByRole('row').filter({ hasNot: page.getByRole('rowheader') });

/** Waits until the bar on screen has hydrated, when it answers its shortcuts. */
async function waitForBar(page: Page) {
  await expect(
    page.locator('[data-ready]').filter({ has: page.getByRole('combobox', { name: LABEL }) }),
  ).toHaveCount(1);
}

/** Presses ⌘K / Ctrl+K once the bar on screen answers it. */
async function openWithShortcut(page: Page) {
  await waitForBar(page);
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
    await waitForBar(page);
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
    const first = items(page, group(page, 'Actions')).first();
    await expect(first).toContainText('Component');
    await expect(first.locator('mark').first()).toHaveText('Button');
    await expect(
      group(page, 'Inputs & selection').getByRole('rowheader', { name: 'Inputs & selection' }),
    ).toBeVisible();
    await expect(view(page).getByRole('status')).toHaveText(/^\d+ results$/);
  });

  test('a code name opens the API tab', async ({ page }) => {
    await page.goto('/getting-started');
    await openWithShortcut(page);
    await view(page).getByRole('searchbox').fill('IconButton');
    const row = items(page, view(page)).first();
    await expect(row).toContainText('API');
    await row.click();
    await expect(page).toHaveURL(/\/components\/icon-button\/api$/);
  });

  test('a prop name opens the API tab of the component that takes it, at the prop', async ({
    page,
  }) => {
    await page.goto('/getting-started');
    await openWithShortcut(page);
    await view(page).getByRole('searchbox').fill('scrolledColor');
    // The first item, after the group's subheader row.
    const row = items(page, view(page)).first();
    await expect(row).toContainText('Top app bar');
    await expect(row).toContainText('API');
    await row.click();
    await expect(page).toHaveURL(/\/components\/top-app-bar\/api#prop-TopAppBar-scrolledColor$/);
    await expect(page.locator('#prop-TopAppBar-scrolledColor')).toBeInViewport();
  });

  test('the arrow keys move through every group and back to the field', async ({ page }) => {
    await page.goto('/getting-started');
    await openWithShortcut(page);
    const input = view(page).getByRole('searchbox');
    await input.fill('button');
    const groups = view(page).getByRole('rowgroup');
    const firstGroup = items(page, groups.first());
    await expect(firstGroup.first()).toBeVisible();
    const count = await firstGroup.count();
    await page.keyboard.press('ArrowDown');
    await expect(firstGroup.first()).toBeFocused();
    for (let step = 1; step < count; step++) await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(items(page, groups.nth(1)).first()).toBeFocused();
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
    const recent = group(page, 'Recent searches');
    await expect(items(page, recent)).toHaveText(['theming']);
    await expect(group(page, 'Suggestions')).toBeVisible();
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
