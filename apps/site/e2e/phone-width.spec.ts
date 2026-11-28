import { expect, test, type Page } from '@playwright/test';
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
 * `scrollable-region-focusable`); one that fits is neither. Only a preview that scrolls clips,
 * and what it clips vertically is at most a touch target's few pixels past the padding: a preview
 * that always clipped cut a slider's value label above its thumb.
 */

/** How far past a clipping preview's box its content may reach: a 48px target round a 40px control. */
const CLIP_ALLOWANCE = 4;

const PAGES = exportedPages().filter((path) => !isTabPage(path));

test.use({ viewport: { width: 360, height: 740 } });

/**
 * The example previews that a person can scroll vertically, or that don't expose their
 * sideways scrolling as they should.
 */
const wrongPreviews = (clipAllowance: number) =>
  [...document.querySelectorAll<HTMLElement>('[data-example]')]
    .map((example) => example.parentElement)
    .filter((preview): preview is HTMLElement => preview !== null)
    .map((preview) => {
      const wider = preview.scrollWidth > preview.clientWidth + 1;
      const style = getComputedStyle(preview);
      return {
        example: preview.querySelector('[data-example]')?.getAttribute('data-example'),
        wider,
        taller:
          ['auto', 'scroll'].includes(style.overflowY) &&
          preview.scrollHeight > preview.clientHeight + 1,
        clipped:
          ['hidden', 'clip'].includes(style.overflowY) &&
          preview.scrollHeight > preview.clientHeight + clipAllowance,
        exposed:
          preview.getAttribute('role') === 'region' &&
          Boolean(preview.getAttribute('aria-label')) &&
          preview.tabIndex === 0,
        inTabOrder: preview.tabIndex === 0 || preview.hasAttribute('role'),
      };
    })
    .filter(({ wider, taller, clipped, exposed, inTabOrder }) =>
      wider ? taller || clipped || !exposed : taller || clipped || inTabOrder,
    );

for (const url of PAGES) {
  test(`${url} fits a 360px phone`, async ({ page }) => {
    await gotoReady(page, url);
    await page.waitForLoadState('load');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      360,
    );
    await expect.poll(() => page.evaluate(wrongPreviews, CLIP_ALLOWANCE)).toEqual([]);
  });
}

/*
 * A preview that scrolls sideways is a tab stop, so it shows the focus indicator when the
 * keyboard reaches it (WCAG 2.4.7): Tailwind's `outline-none` sets the outline style a later
 * `outline-2` reads, so the preview once drew a 2px outline of style `none`. And it stays a tab
 * stop while it has focus, even when it stops scrolling (a phone turned sideways), so focus
 * never drops to the page; it leaves the Tab order once focus moves on.
 */
test.describe('a preview that scrolls sideways', () => {
  /** The time picker's dial preview, wider than a 360px phone, focused by Tab. */
  const focusOverflowingPreview = async (page: Page) => {
    await gotoReady(page, '/components/time-picker');
    const preview = page
      .locator('[data-example="time-picker/time-picker-dial"]')
      .locator('xpath=..');
    await expect(preview).toHaveAttribute('tabindex', '0');
    // Reach it from the control before it, so the focus is the keyboard's.
    await preview.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(preview).toBeFocused();
    return preview.elementHandle();
  };

  test('shows the focus indicator', async ({ page }) => {
    const preview = await focusOverflowingPreview(page);
    const outline = await preview!.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        focusVisible: element.matches(':focus-visible'),
        style: style.outlineStyle,
        width: Number.parseFloat(style.outlineWidth),
      };
    });
    expect(outline.focusVisible).toBe(true);
    expect(outline.style).not.toBe('none');
    expect(outline.width).toBeGreaterThanOrEqual(2);
  });

  test('keeps focus when it stops scrolling, then leaves the Tab order', async ({ page }) => {
    const preview = (await focusOverflowingPreview(page))!;
    await page.setViewportSize({ width: 1280, height: 740 });
    await expect
      .poll(() => preview.evaluate((element) => element.hasAttribute('data-overflows')))
      .toBe(false);
    expect(await preview.evaluate((element) => element === document.activeElement)).toBe(true);
    expect(await preview.evaluate((element) => element.tabIndex)).toBe(0);
    await preview.evaluate((element) => element.blur());
    await expect
      .poll(() =>
        preview.evaluate((element) => ({
          tabIndex: element.getAttribute('tabindex'),
          role: element.getAttribute('role'),
        })),
      )
      .toEqual({ tabIndex: null, role: null });
  });
});
