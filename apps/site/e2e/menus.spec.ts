import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';

/**
 * Opens every menu on every component page. Pages only render menus when opened, so the
 * smoke suite alone can't catch a menu that fails to build its items (e.g. items created in
 * a server component).
 */
const here = dirname(fileURLToPath(import.meta.url));
const slugs = readdirSync(resolve(here, '../out/components'))
  .filter((name) => name.endsWith('.html'))
  .map((name) => name.slice(0, -'.html'.length));

for (const slug of slugs) {
  test(`every menu on /components/${slug} opens`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/components/${slug}`);
    const triggers = page.locator('main [aria-haspopup="true"], main [aria-haspopup="menu"]');
    const count = await triggers.count();
    for (let index = 0; index < count; index++) {
      const trigger = triggers.nth(index);
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      await expect(page.getByRole('menu')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('menu')).toBeHidden();
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });
}
