import { expect, test } from '@playwright/test';
import { gotoReady } from './navigate';
import { exportedPages, isTabPage } from './pages';

/*
 * No page scrolls sideways on a 360px phone (WCAG 1.4.10): every page of the export but the
 * component tabs, which share one template with the overview pages. A live example wider
 * than its preview (a fixed-width panel in a flex row that can't shrink) pushed the whole
 * EmojiPicker page 96px past the window; the smoke suite runs at desktop width and missed it.
 */

const PAGES = exportedPages().filter((path) => !isTabPage(path));

test.use({ viewport: { width: 360, height: 740 } });

for (const url of PAGES) {
  test(`${url} fits a 360px phone`, async ({ page }) => {
    await gotoReady(page, url);
    await page.waitForLoadState('load');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      360,
    );
  });
}
