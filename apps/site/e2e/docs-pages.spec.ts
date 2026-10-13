import { expect, test } from '@playwright/test';
import { gotoReady } from './navigate';

/** Component page tabs: each is its own URL, and the tabs navigate between them. */
test.describe('Component page tabs', () => {
  test('the tabs navigate between linkable tab pages', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/slider');
    const tabs = page.getByRole('tablist', { name: 'Slider documentation' });
    await expect(tabs.getByRole('tab')).toHaveText([
      'Overview',
      'API',
      'Accessibility',
      'Guidelines',
    ]);
    await expect(tabs.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await tabs.getByRole('tab', { name: 'API' }).click();
    await expect(page).toHaveURL(/\/components\/slider\/api$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Props' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Slider props', exact: true })).toBeVisible();

    // A tab page opens on its own, with its tab selected.
    await gotoReady(page, '/components/slider/guidelines');
    await expect(page.getByRole('tab', { name: 'Guidelines' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(page.getByRole('link', { name: 'Slider on m3.material.io' })).toHaveAttribute(
      'href',
      'https://m3.material.io/components/sliders/overview',
    );
  });

  test('the arrow keys move between tabs and Enter opens one', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/button');
    // Start once the playground has hydrated (its segmented controls are radios then). It
    // leaves the URL alone until a control changes, so nothing re-renders between the presses.
    await expect(page.getByRole('radio', { name: 'outlined', exact: true })).toBeVisible();
    await page.getByRole('tab', { name: 'Overview' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'API' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/components\/button\/accessibility$/);
    await expect(page.getByRole('tab', { name: 'Accessibility' })).toBeFocused();
  });

  test('props are cards on a phone, with no sideways scroll', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/components/button/api');
    await expect(page.getByRole('list', { name: 'Button props' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Button props' })).toBeHidden();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('Example cards', () => {
  test('"Show code" unfolds the source and copying confirms', async ({
    page,
    context,
    baseURL,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/switch');
    const show = page.getByRole('button', { name: 'Show code' }).first();
    await expect(show).toHaveAttribute('aria-expanded', 'false');
    await show.click();
    const hide = page.getByRole('button', { name: 'Hide code' }).first();
    await expect(hide).toHaveAttribute('aria-expanded', 'true');
    const source = page.locator(`#${await hide.getAttribute('aria-controls')}`);
    await expect(source.getByRole('region')).toBeVisible();
    await page.getByRole('button', { name: 'Copy code' }).first().click();
    await expect(page.getByText('Copied', { exact: true })).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard).toContain('Switch');
  });
});

test.describe('Install command', () => {
  test('switches package manager and remembers the choice', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/getting-started');
    const terminal = page.getByRole('region', { name: 'Terminal' });
    await expect(terminal).toHaveText('pnpm add @windmorph/react motion');
    await page.getByRole('radio', { name: 'yarn' }).click();
    await expect(terminal).toHaveText('yarn add @windmorph/react motion');
    await page.reload();
    await expect(page.getByRole('radio', { name: 'yarn' })).toBeChecked();
    await expect(terminal).toHaveText('yarn add @windmorph/react motion');
  });
});

test.describe('Component index', () => {
  test('filter chips and typing narrow the list', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components');
    const cards = page.getByRole('article').locator('a[href^="/components/"]');
    const all = await cards.count();
    await page.getByRole('radio', { name: 'Pro' }).click();
    await expect(page.getByRole('status')).toHaveText(/ of \d+ components/);
    await expect(cards.filter({ hasText: 'Pin input' })).toHaveCount(1);
    await expect(cards.filter({ hasText: /^Button/ })).toHaveCount(0);
    await page.getByRole('radio', { name: 'All' }).click();
    await expect(cards).toHaveCount(all);

    await page.getByRole('searchbox', { name: 'Filter components' }).fill('otp');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toHaveAttribute('href', '/components/pin-input');
    await page.getByRole('searchbox', { name: 'Filter components' }).fill('zzzz');
    await expect(page.getByText('No components match')).toBeVisible();
    await page.getByRole('button', { name: 'Show all' }).click();
    await expect(cards).toHaveCount(all);
  });
});
