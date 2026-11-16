import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Moves focus to `target` with the Tab key, as a keyboard user does, from wherever the
 * browser's sequential navigation starts: Chromium 159 starts it where the last press or blur
 * was, so a single Tab can pass the target or leave the page (it wraps back in on the next).
 */
export async function tabTo(page: Page, target: Locator, most = 12) {
  for (let presses = 0; presses < most; presses += 1) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  await expect(target).toBeFocused();
}
