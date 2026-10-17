import { expect, test } from '@playwright/test';
import { openStory } from './story';

// Playwright's default headless shell hides scrollbars (`--hide-scrollbars`); measure them
// in full Chromium with them shown.
test.use({ channel: 'chromium', launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

test('a scrolling menu shows a persistent scrollbar', async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 400 });
  await openStory(page, 'components-menu--scrolling');
  await page.getByRole('button', { name: 'Country' }).click();
  const menu = page.getByRole('menu');
  await expect(menu).toHaveAttribute('data-layout', 'divider');
  const bar = await menu.evaluate((el: HTMLElement) => ({
    overflows: el.scrollHeight > el.clientHeight,
    width: el.offsetWidth - el.clientWidth,
  }));
  expect(bar.overflows).toBe(true);
  // M3: "menus show a persistent scrollbar"; an overlay scrollbar takes no width.
  expect(bar.width).toBe(12);
});

test('a menu that fits shows no scrollbar', async ({ page }) => {
  await openStory(page, 'components-menu--grouped');
  await page.getByRole('button', { name: 'More' }).click();
  const menu = page.getByRole('menu');
  expect(await menu.evaluate((el: HTMLElement) => el.offsetWidth - el.clientWidth)).toBe(0);
});

// A scrolling chip set keeps its scrollbar, thin and in `outline` (2026-10-17): hidden, a
// mouse user had no sign of the chips past the edge.
test('a scrolling chip set shows a thin scrollbar', async ({ page }) => {
  await openStory(page, 'components-chips--single-select');
  const set = page.getByTestId('single');
  const bar = await set.evaluate((el: HTMLElement) => {
    const style = getComputedStyle(el);
    return {
      overflows: el.scrollWidth > el.clientWidth,
      width: style.scrollbarWidth,
      color: style.scrollbarColor,
    };
  });
  expect(bar.overflows).toBe(true);
  expect(bar.width).toBe('thin');
  // The platform decides whether it overlays (macOS) or takes room; either way it is drawn.
  expect(bar.color).not.toBe('auto');
});
