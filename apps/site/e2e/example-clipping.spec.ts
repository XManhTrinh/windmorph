import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './navigate';

/*
 * What an example draws past its preview's padding stays visible. A preview clips only while
 * its content is wider than it (it then scrolls sideways, and never vertically); one that fits
 * clips nothing. A slider's value label sits above its thumb, past the 24px padding: a preview
 * that always clipped vertically cut 32 of its 44px.
 */

/** Whether the point at the top of the value indicator, inset by 2px, hits the indicator. */
const labelShows = (page: Page) =>
  page.evaluate(() => {
    const label = document.querySelector<HTMLElement>('[data-slot="value-indicator"]');
    if (!label) return 'no value label';
    const box = label.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + 2);
    return hit !== null && label.contains(hit) ? 'visible' : 'hidden';
  });

for (const width of [360, 1280]) {
  test.describe(`at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    test('a focused slider shows its whole value label', async ({ page }) => {
      await gotoReady(page, '/components/slider');
      const example = page.locator('[data-example="slider/slider-value-label"]');
      const thumb = example.getByRole('slider').first();
      await thumb.scrollIntoViewIfNeeded();
      // Centre the example, so the label above the thumb is inside the window.
      await example
        .locator('xpath=..')
        .evaluate((preview) => preview.scrollIntoView({ block: 'center' }));
      await thumb.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => labelShows(page)).toBe('visible');
    });
  });
}
