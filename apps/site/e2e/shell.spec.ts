import { expect, test } from '@playwright/test';

/** The docs shell: page search, display settings and the direction switch. */
test.describe('Docs shell', () => {
  test("the top bar's search is 48px, and opens over itself at that height", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/getting-started');
    const input = page.getByRole('combobox', { name: 'Search documentation' });
    // The pill fills the bar: one height, set on the bar.
    const pill = input.locator('..');
    expect((await pill.boundingBox())!.height).toBe(48);
    await input.click();
    const dialog = page.getByRole('dialog', { name: 'Search documentation' });
    const field = dialog.getByRole('searchbox').locator('..');
    await expect.poll(async () => (await field.boundingBox())!.height).toBe(48);
  });

  test('search finds a component page and opens it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/getting-started');
    await page.getByRole('combobox', { name: 'Search documentation' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search documentation' });
    await dialog.getByRole('searchbox').fill('slid');
    await dialog.getByRole('row', { name: /^Slider/ }).click();
    // Slider has a full Playground, whose island reflects its state in the query string once
    // it hydrates — so allow an optional query (same pattern as rail.spec.ts).
    await expect(page).toHaveURL(/\/components\/slider(\?|$)/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Slider/);
  });

  test('finds a component by a keyword that is not in its title', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/getting-started');
    await page.getByRole('combobox', { name: 'Search documentation' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search documentation' });
    await dialog.getByRole('searchbox').fill('otp');
    await dialog.getByRole('row', { name: /^PIN input/ }).click();
    await expect(page).toHaveURL(/\/components\/pin-input(\?|$)/);
  });

  test('Enter opens the best match; no match says so', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/getting-started');
    await page.getByRole('combobox', { name: 'Search documentation' }).click();
    const input = page.getByRole('dialog').getByRole('searchbox');
    await input.fill('zzzz');
    await expect(page.getByText('No pages match “zzzz”.')).toBeVisible();
    await input.fill('theming');
    await input.press('Enter');
    await expect(page).toHaveURL(/\/theming$/);
  });

  test('compact windows search from the app bar and show no crowded controls', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/components/button');
    const heading = page.getByRole('heading', { level: 1 });
    // The bar stays one 64px row above the page heading.
    const appBar = page
      .locator('header:visible')
      .filter({ has: page.getByRole('combobox', { name: 'Search documentation' }) });
    const bar = await appBar.boundingBox();
    const top = await heading.boundingBox();
    expect(bar!.height).toBe(64);
    expect(top!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height);
    await page.getByRole('combobox', { name: 'Search documentation' }).click();
    const dialog = page.getByRole('dialog', { name: 'Search documentation' });
    await dialog.getByRole('searchbox').fill('menu');
    await dialog.getByRole('row', { name: /^Menu/ }).click();
    await expect(page).toHaveURL(/\/components\/menu$/);
  });

  test('display settings switch the mode and the direction, which persists', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/button');
    await page.getByRole('button', { name: 'Display settings' }).click();
    const sheet = page.getByRole('dialog', { name: 'Display' });
    await sheet.getByRole('radio', { name: 'Dark' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
    // Users press the switch's label (its input is visually hidden under the touch target).
    await sheet.getByText('Right to left').click();
    await expect(sheet.getByRole('switch', { name: 'Right to left' })).toBeChecked();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  });
});
