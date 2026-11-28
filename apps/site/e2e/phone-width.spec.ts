import { expect, test } from '@playwright/test';
import { gotoReady } from './navigate';
import { exportedPages, isTabPage } from './pages';

/*
 * No page scrolls sideways on a 360px phone (WCAG 1.4.10): every page of the export but the
 * component tabs, which share one template with the overview pages. A live example wider
 * than its preview (a fixed-width panel in a flex row that can't shrink) pushed the whole
 * EmojiPicker page 96px past the window; the smoke suite runs at desktop width and missed it.
 *
 * Such an example scrolls sideways inside its preview instead, so the preview is checked too:
 * it never scrolls vertically (`overflow-x: auto` alone made DataTable's rows that scroll
 * under the header scroll out of sight inside it), and while its content is wider than its box
 * it is a named region in the Tab order, so the keyboard can scroll it (axe's
 * `scrollable-region-focusable`); one that fits is neither.
 */

const PAGES = exportedPages().filter((path) => !isTabPage(path));

test.use({ viewport: { width: 360, height: 740 } });

/**
 * The example previews that a person can scroll vertically, or that don't expose their
 * sideways scrolling as they should.
 */
const wrongPreviews = () =>
  [...document.querySelectorAll<HTMLElement>('[data-example]')]
    .map((example) => example.parentElement)
    .filter((preview): preview is HTMLElement => preview !== null)
    .map((preview) => {
      const wider = preview.scrollWidth > preview.clientWidth + 1;
      return {
        example: preview.querySelector('[data-example]')?.getAttribute('data-example'),
        wider,
        taller:
          ['auto', 'scroll'].includes(getComputedStyle(preview).overflowY) &&
          preview.scrollHeight > preview.clientHeight + 1,
        exposed:
          preview.getAttribute('role') === 'region' &&
          Boolean(preview.getAttribute('aria-label')) &&
          preview.tabIndex === 0,
        inTabOrder: preview.tabIndex === 0 || preview.hasAttribute('role'),
      };
    })
    .filter(({ wider, taller, exposed, inTabOrder }) =>
      wider ? taller || !exposed : taller || inTabOrder,
    );

for (const url of PAGES) {
  test(`${url} fits a 360px phone`, async ({ page }) => {
    await gotoReady(page, url);
    await page.waitForLoadState('load');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      360,
    );
    await expect.poll(() => page.evaluate(wrongPreviews)).toEqual([]);
  });
}
