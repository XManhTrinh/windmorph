import { expect, test, type Locator, type Page } from '@playwright/test';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const box = async (locator: Locator) => (await locator.boundingBox())!;
const settle = (page: Page) => page.waitForTimeout(600);

async function openGrouped(page: Page, globals = {}, args = {}) {
  await openStory(page, 'components-menu--grouped', globals, args);
  await page.getByRole('button', { name: 'More' }).click();
  await settle(page);
  return page.getByRole('menu');
}

test.describe('Menu visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`grouped · ${theme} · ${mode}`, async ({ page }) => {
        const menu = await openGrouped(page, { theme, mode });
        await expect(menu).toHaveScreenshot(`grouped-${theme}-${mode}.png`);
      });
    }
  }

  for (const mode of MODES) {
    test(`grouped · vibrant · ${mode}`, async ({ page }) => {
      const menu = await openGrouped(page, { mode }, { variant: 'vibrant' });
      await expect(menu).toHaveScreenshot(`grouped-vibrant-${mode}.png`);
    });
  }

  test('single selection', async ({ page }) => {
    await openStory(page, 'components-menu--single-selection');
    await page.getByRole('button', { name: /Sort by/ }).click();
    await settle(page);
    await expect(page.getByRole('menu')).toHaveScreenshot('single-selection.png');
  });
});

test.describe('Menu behaviour', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`opens below the trigger, aligned to its start edge · ${dir}`, async ({ page }) => {
      const menu = await openGrouped(page, { dir });
      const trigger = await box(page.getByRole('button', { name: 'More' }));
      // The visible surface is the first group (the list keeps a shadow margin around it).
      const m = await box(menu.locator('> *').first());
      expect(Math.round(m.y)).toBe(Math.round(trigger.y + trigger.height));
      if (dir === 'ltr') expect(Math.round(m.x)).toBe(Math.round(trigger.x));
      else expect(Math.round(m.x + m.width)).toBe(Math.round(trigger.x + trigger.width));
      expect(await menu.evaluate((el) => getComputedStyle(el).direction)).toBe(dir);
    });
  }

  test('motion settles to no transform; groups are 2px apart; items 44px', async ({ page }) => {
    const menu = await openGrouped(page);
    expect(await menu.evaluate((el) => getComputedStyle(el.parentElement!).scale)).toBe('none');
    const groups = menu.locator('> div');
    const first = await box(groups.nth(0));
    const second = await box(groups.nth(1));
    expect(Math.round(second.y - (first.y + first.height))).toBe(2);
    const item = await box(page.getByRole('menuitem', { name: /Delete/ }));
    expect(item.height).toBe(44);
    const width = (await box(menu)).width;
    expect(width).toBeGreaterThanOrEqual(112);
    expect(width).toBeLessThanOrEqual(280);
    expect(await groups.nth(0).evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe(
      '16px',
    );
  });

  test("the scrolling list doesn't clip the groups' shadows", async ({ page }) => {
    const menu = await openGrouped(page, {});
    // Every group sits at least 8px inside the list's scroll box, so its elevation-2
    // shadow (about 8px) fades out before the box edge and follows the rounded corners.
    const insets = await menu.evaluate((list) => {
      const outer = list.getBoundingClientRect();
      return [...list.children].map((group) => {
        const r = group.getBoundingClientRect();
        return Math.min(
          r.left - outer.left,
          outer.right - r.right,
          r.top - outer.top,
          outer.bottom - r.bottom,
        );
      });
    });
    expect(Math.min(...insets)).toBeGreaterThanOrEqual(8);
    expect(await menu.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto');
  });

  test('opening with the mouse moves focus into the menu', async ({ page }) => {
    const menu = await openGrouped(page);
    expect(await menu.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  });

  test('runs an action and closes; Escape and outside clicks close too', async ({ page }) => {
    await openGrouped(page);
    await page.getByRole('menuitem', { name: /Delete/ }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: delete');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'More' })).toBeFocused();

    await page.getByRole('button', { name: 'More' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);

    await page.getByRole('button', { name: 'More' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.mouse.click(600, 500);
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('keyboard: arrows skip disabled items and Enter activates', async ({ page }) => {
    await openStory(page, 'components-menu--grouped');
    await page.getByRole('button', { name: 'More' }).focus();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitem', { name: /Delete/ })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    // "Favourite" is disabled, so focus skips to "Find".
    await expect(page.getByRole('menuitem', { name: /Find/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toHaveText('Last action: search');
  });

  test('a selected item takes the 12px selected shape and its check expands', async ({ page }) => {
    await openStory(page, 'components-menu--single-selection');
    await page.getByRole('button', { name: /Sort by/ }).click();
    await settle(page);
    const name = page.getByRole('menuitemradio', { name: 'Name' });
    const date = page.getByRole('menuitemradio', { name: 'Date modified' });
    expect(await name.evaluate((el) => getComputedStyle(el).borderBottomLeftRadius)).toBe('12px');
    const check = name.locator('svg').first();
    expect((await box(check)).width).toBe(20);
    expect(
      await date
        .locator('[aria-hidden] > span')
        .first()
        .evaluate((el) => el.getBoundingClientRect().width),
    ).toBe(0);
  });
});
