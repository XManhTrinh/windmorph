import type { Page } from '@playwright/test';
import { storyUrl, type StoryGlobals } from './story';

/**
 * Opens a story with `selector` laid out of sight, as a closed tab, a collapsed panel or a media
 * query hides it (`display: none`), then shows it with no render in between. A part that
 * measures itself as it mounts must measure again once it shows.
 */
export async function openStoryOutOfSight(
  page: Page,
  id: string,
  selector: string,
  globals: StoryGlobals = {},
) {
  await page.addInitScript((target) => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.id = 'out-of-sight';
      style.textContent = `${target} { display: none !important; }`;
      document.head.append(style);
    });
  }, selector);
  await page.goto(storyUrl(id, globals));
  await page.locator(selector).first().waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  // A frame for anything that measures after mounting, then shown.
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
  await page.evaluate(() => document.getElementById('out-of-sight')!.remove());
}
