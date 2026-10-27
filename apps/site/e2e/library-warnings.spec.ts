import { expect, test } from '@playwright/test';
import { gotoReady } from './navigate';

/**
 * The library warns in development when it's used against the M3 rules (a connected button
 * group without toggle buttons, a container-less button in a group). The site's own examples
 * follow those rules, so these pages log no library warning. Production builds drop the
 * warnings, so this runs under `next dev` only (the `next-dev` project).
 */
const PAGES = ['/components/button-group', '/'];

for (const url of PAGES) {
  test(`${url} logs no library warning`, async ({ page }) => {
    const warnings: string[] = [];
    page.on('console', (message) => {
      if (message.text().startsWith('[@windmorph/')) warnings.push(message.text());
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, url);
    // Warnings are logged from effects once each part has mounted and laid out.
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 500))),
    );
    expect(warnings).toEqual([]);
  });
}
