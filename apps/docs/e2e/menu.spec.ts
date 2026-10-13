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

  test('grouped · gap', async ({ page }) => {
    const menu = await openGrouped(page, {}, { layout: 'gap' });
    await expect(menu).toHaveScreenshot('grouped-gap.png');
  });

  test('submenu open', async ({ page }) => {
    await openStory(page, 'components-menu--submenus');
    await page.getByRole('button', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'Share' }).hover();
    await expect(page.getByRole('menu', { name: 'Share' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Email' }).hover();
    await settle(page);
    await expect(page).toHaveScreenshot('submenu.png');
  });

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
      // In the default divider layout the list is the surface.
      const m = await box(menu);
      expect(Math.round(m.y)).toBe(Math.round(trigger.y + trigger.height));
      if (dir === 'ltr') expect(Math.round(m.x)).toBe(Math.round(trigger.x));
      else expect(Math.round(m.x + m.width)).toBe(Math.round(trigger.x + trigger.width));
      expect(await menu.evaluate((el) => getComputedStyle(el).direction)).toBe(dir);
    });
  }

  test('divider layout: one 16px surface, a 1px divider with 8px around it', async ({ page }) => {
    const menu = await openGrouped(page);
    expect(await menu.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('16px');
    expect(await menu.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
    const divider = menu.getByRole('separator');
    const d = await box(divider);
    expect(d.height).toBe(1);
    expect(Math.round(d.width)).toBe(Math.round((await box(menu)).width));
    const above = await box(page.getByRole('menuitem', { name: /Find/ }));
    expect(Math.round(d.y - (above.y + above.height))).toBe(8);
    const item = await box(page.getByRole('menuitem', { name: /Delete/ }));
    expect(item.height).toBe(44);
  });

  test('gap layout: motion settles to no transform; groups are 2px apart', async ({ page }) => {
    const menu = await openGrouped(page, {}, { layout: 'gap' });
    expect(await menu.evaluate((el) => getComputedStyle(el.parentElement!).scale)).toBe('none');
    const groups = menu.locator('> div');
    const first = await box(groups.nth(0));
    const second = await box(groups.nth(1));
    expect(Math.round(second.y - (first.y + first.height))).toBe(2);
    const item = await box(page.getByRole('menuitem', { name: /Delete/ }));
    expect(item.height).toBe(44);
    const width = (await box(menu)).width;
    expect(width).toBeGreaterThanOrEqual(112);
    expect(width).toBeLessThanOrEqual(296);
    expect(await groups.nth(0).evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe(
      '16px',
    );
  });

  test("the gap layout's scrolling list doesn't clip the groups' shadows", async ({ page }) => {
    const menu = await openGrouped(page, {}, { layout: 'gap' });
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

  test('a gap menu that has to scroll switches to dividers', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 400 });
    await openStory(page, 'components-menu--scrolling');
    await page.getByRole('button', { name: 'Country' }).click();
    const menu = page.getByRole('menu');
    await expect(menu).toHaveAttribute('data-layout', 'divider');
    await expect(menu.getByRole('separator')).toHaveCount(3);
  });

  test('the trigger keeps a pressed layer while the menu is open', async ({ page }) => {
    await openStory(page, 'components-menu--grouped');
    const trigger = page.getByRole('button', { name: 'More' });
    const layer = () => trigger.evaluate((el) => getComputedStyle(el).backgroundImage);
    const closedLayer = await layer();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(trigger).toHaveAttribute('data-menu-open', 'true');
    expect(await layer()).not.toBe(closedLayer);
  });

  test('opening with the mouse focuses the first item', async ({ page }) => {
    await openGrouped(page);
    // M3: "When a menu opens, focus should be placed on the first menu item."
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    // The focus ring is for keyboard focus only.
    await expect(page.getByRole('menuitem').first()).not.toHaveAttribute('data-focus-visible');
    // The arrow keys carry on from there.
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem').nth(1)).toBeFocused();
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

  test('keyboard: disabled items take focus but do nothing; Enter activates', async ({ page }) => {
    await openStory(page, 'components-menu--grouped');
    await page.getByRole('button', { name: 'More' }).focus();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitem', { name: /Delete/ })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    // M3: "Disabled menu items can receive focus but aren't selectable."
    await expect(page.getByRole('menuitem', { name: /Favourite/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByTestId('last')).toHaveText('Last action: none');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitem', { name: /Find/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toHaveText('Last action: search');
  });

  test('Tab closes the menu and its submenus; focus is never left on the body', async ({
    page,
  }) => {
    const focusedTag = () => page.evaluate(() => document.activeElement?.tagName);
    await openGrouped(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect.poll(focusedTag).not.toBe('BODY');

    await openStory(page, 'components-menu--submenus');
    await page.getByRole('button', { name: 'File' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('menuitem', { name: 'Share' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'Email' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect.poll(focusedTag).not.toBe('BODY');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`submenus open beside their item and morph the corners · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-menu--submenus', { dir });
      await page.getByRole('button', { name: 'File' }).click();
      const root = page.getByRole('menu', { name: 'File' });
      const share = page.getByRole('menuitem', { name: 'Share' });
      await share.focus();
      await page.keyboard.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
      const submenu = page.getByRole('menu', { name: 'Share' });
      await expect(page.getByRole('menuitem', { name: 'Email' })).toBeFocused();
      await expect(share).toHaveAttribute('data-menu-open', 'true');
      await settle(page);
      const r = await box(root);
      const sub = await box(submenu);
      // Beside the parent menu, not over it, with its first item level with Share.
      const gap = dir === 'ltr' ? sub.x - (r.x + r.width) : r.x - (sub.x + sub.width);
      expect(gap).toBeGreaterThanOrEqual(1);
      expect(gap).toBeLessThanOrEqual(3);
      const email = await box(page.getByRole('menuitem', { name: 'Email' }));
      expect(Math.abs(email.y - (await box(share)).y)).toBeLessThanOrEqual(1);
      // The focused menu is rounder (24px), the other less round (8px).
      const radius = (menu: typeof root) =>
        menu.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
      await expect.poll(() => radius(submenu)).toBe('24px');
      await expect.poll(() => radius(root)).toBe('8px');
      await page.keyboard.press(dir === 'ltr' ? 'ArrowLeft' : 'ArrowRight');
      await expect(submenu).toHaveCount(0);
      await expect(share).toBeFocused();
      await expect.poll(() => radius(root)).toBe('16px');
    });
  }

  test('a nested submenu runs its action and closes every menu', async ({ page }) => {
    await openStory(page, 'components-menu--submenus');
    await page.getByRole('button', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'Share' }).hover();
    await page.getByRole('menuitem', { name: 'Export as' }).hover();
    await page.getByRole('menuitem', { name: 'CSV' }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: csv');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('a secondary click opens a context menu at the pointer', async ({ page }) => {
    await openStory(page, 'components-menu--context-menu');
    const target = await box(page.getByTestId('target'));
    await page.mouse.click(target.x + 40, target.y + 30, { button: 'right' });
    const menu = page.getByRole('menu', { name: 'Card actions' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem').first()).toBeFocused();
    const m = await box(menu);
    expect(Math.round(m.x)).toBe(Math.round(target.x + 40));
    expect(Math.round(m.y)).toBe(Math.round(target.y + 30));
    await page.getByRole('menuitem', { name: /Delete/ }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: delete');
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

test.describe('Menu under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the menu only fades: its clip stays open', async ({ page }) => {
    await openStory(page, 'components-menu--grouped');
    await page.getByRole('button', { name: 'More' }).click();
    const reveal = page.getByRole('menu').locator('..');
    // Read at once, while the fade is still running, and again while it fades out.
    const clip = () => reveal.evaluate((el) => getComputedStyle(el).clipPath);
    expect(await clip()).toBe('inset(-24px)');
    await page.keyboard.press('Escape');
    expect(await clip()).toBe('inset(-24px)');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });
});

test.describe('Menu presentation and instant', () => {
  test('presentation="auto" opens a bottom sheet on a phone, with the menu keyboard', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-menu--grouped', {}, { presentation: 'auto' });
    await page.getByRole('button', { name: 'More' }).click();
    const sheet = page.getByRole('dialog', { name: 'More' });
    await expect(sheet).toBeVisible();
    const menu = sheet.getByRole('menu');
    await expect(menu.getByRole('menuitem').first()).toBeFocused();
    await settle(page);
    // It spans the sheet (8px in from each side) and sits at the bottom of the window.
    const s = await box(sheet);
    const m = await box(menu);
    expect(Math.round(s.y + s.height)).toBe(800);
    expect(Math.round(m.width)).toBe(Math.round(s.width) - 16);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toHaveText('Last action: edit');
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('button', { name: 'More' })).toBeFocused();
  });

  test('presentation="auto" stays a popover on a wide window', async ({ page }) => {
    const menu = await openGrouped(page, {}, { presentation: 'auto' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('an instant menu appears and leaves with no motion', async ({ page }) => {
    await openStory(page, 'components-menu--grouped', {}, { instant: true });
    await page.getByRole('button', { name: 'More' }).click();
    const reveal = page.getByRole('menu').locator('..');
    // Fully shown at once: no fade or clip in progress.
    expect(
      await reveal.evaluate((el) => {
        const computed = getComputedStyle(el);
        return [computed.opacity, computed.clipPath, computed.transitionProperty];
      }),
    ).toEqual(['1', 'inset(-24px)', 'none']);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0, { timeout: 100 });
  });
});
