import { expect, type Page } from '@playwright/test';

/**
 * Opens `url` and waits until its live examples are interactive. Component pages load each
 * example's code on demand (`components/lazy-example.tsx`), so an example only responds
 * once its chunk has arrived; it then gets `data-ready`.
 */
export async function gotoReady(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await expect(page.locator('[data-example]:not([data-ready])')).toHaveCount(0);
}
