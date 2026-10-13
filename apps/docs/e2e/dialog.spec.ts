import { expect, test, type Page } from '@playwright/test';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const settle = (page: Page) => page.waitForTimeout(600);

test.describe('Dialog visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`with icon · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-dialog--with-icon', { theme, mode });
        await settle(page);
        await expect(page).toHaveScreenshot(`with-icon-${theme}-${mode}.png`);
      });
    }
  }

  for (const mode of MODES) {
    test(`full screen · phone · ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 760 });
      await openStory(page, 'components-dialog--full-screen-compact', { mode });
      await page.getByRole('button', { name: 'Edit name' }).click();
      await settle(page);
      await expect(page).toHaveScreenshot(`full-screen-phone-${mode}.png`);
    });
  }

  test('long content · rtl', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 700 });
    await openStory(page, 'components-dialog--long-content', { dir: 'rtl' });
    await settle(page);
    // The dialog is portalled out of the RTL story root but keeps its direction.
    expect(
      await page.getByRole('alertdialog').evaluate((el) => getComputedStyle(el).direction),
    ).toBe('rtl');
    await expect(page).toHaveScreenshot('long-content-rtl.png');
  });
});

test.describe('Dialog behaviour', () => {
  test('opens expanding from its top edge, named by its title, focusing its first action', async ({
    page,
  }) => {
    await openStory(page, 'components-dialog--basic');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Discard draft?' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await settle(page);
    const motion = dialog.locator('xpath=..');
    expect(await motion.evaluate((el) => getComputedStyle(el).scale)).toBe('none');
    expect(await motion.evaluate((el) => getComputedStyle(el).clipPath)).toBe('inset(-32px)');
    expect(await motion.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    const box = (await dialog.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(280);
    expect(box.width).toBeLessThanOrEqual(560);
    expect(await dialog.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('28px');
  });

  test('traps focus, closes on Escape and returns focus to the trigger', async ({ page }) => {
    await openStory(page, 'components-dialog--basic');
    const trigger = page.getByRole('button', { name: 'Open dialog' });
    await trigger.click();
    const dialog = page.getByRole('alertdialog');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('a plain dialog closes when pressing the scrim; basic (alert) dialogs do not', async ({
    page,
  }) => {
    await openStory(page, 'components-dialog--plain');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await openStory(page, 'components-dialog--alert');
    await page.getByRole('button', { name: 'Reset settings' }).click();
    await page.mouse.click(10, 10);
    await settle(page);
    await expect(page.getByRole('alertdialog', { name: 'Reset all settings?' })).toBeVisible();
  });

  test('locks page scroll while open', async ({ page }) => {
    await openStory(page, 'components-dialog--basic');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden',
    );
  });

  test('long content scrolls inside; stacked actions put the confirm action on top', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 420, height: 700 });
    await openStory(page, 'components-dialog--long-content');
    await settle(page);
    const dialog = page.getByRole('alertdialog');
    const content = page.getByTestId('content');
    expect((await dialog.boundingBox())!.height).toBeLessThanOrEqual(700 - 48);
    expect(await content.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    const accept = (await page.getByRole('button', { name: /Accept/ }).boundingBox())!;
    const decline = (await page.getByRole('button', { name: /Decline/ }).boundingBox())!;
    expect(accept.y).toBeLessThan(decline.y);
  });

  test('full screen on a phone: fills the window, header carries close and the action', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await openStory(page, 'components-dialog--full-screen-compact');
    const trigger = page.getByRole('button', { name: 'Edit name' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Edit name' });
    await settle(page);
    const box = (await dialog.boundingBox())!;
    expect(box).toMatchObject({ x: 0, y: 0, width: 390, height: 760 });
    expect(await dialog.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('0px');
    const header = dialog.getByRole('heading', { name: 'Edit name' }).locator('xpath=..');
    expect((await header.boundingBox())!.height).toBe(56);
    // The spec: content 24px from the top, and an on-surface close icon like the headline.
    const content = page.getByTestId('content');
    expect(await content.evaluate((el) => getComputedStyle(el).paddingTop)).toBe('24px');
    const headline = dialog.getByRole('heading', { name: 'Edit name' });
    expect(
      await dialog
        .getByRole('button', { name: 'Close' })
        .evaluate((el) => getComputedStyle(el).color),
    ).toBe(await headline.evaluate((el) => getComputedStyle(el).color));
    // One Save (the header's); the DialogActions row is hidden.
    await expect(dialog.getByRole('button', { name: 'Save' })).toHaveCount(1);
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toHaveCount(0);
    const close = dialog.getByRole('button', { name: 'Close' });
    const target = (await close.locator('[data-touch-target]').boundingBox())!;
    expect(target.width).toBeGreaterThanOrEqual(48);
    expect(target.height).toBeGreaterThanOrEqual(48);
    await close.click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('full screen "compact" stays a basic dialog on larger windows', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 760 });
    await openStory(page, 'components-dialog--full-screen-compact');
    await page.getByRole('button', { name: 'Edit name' }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit name' });
    await settle(page);
    expect((await dialog.boundingBox())!.width).toBeLessThanOrEqual(560);
    expect(await dialog.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('28px');
    await expect(dialog.getByRole('button', { name: 'Close' })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    // Initial focus skips the header's hidden close button.
    await expect(dialog.getByRole('textbox', { name: 'Name' })).toBeFocused();
  });

  test('a placed dialog keeps 56px from the edge of a wide window', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 760 });
    await openStory(page, 'components-dialog--placement-top');
    await settle(page);
    expect((await page.getByRole('alertdialog').boundingBox())!.y).toBe(56);
  });

  test('full screen without a header action shows a 56px bottom action bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await openStory(page, 'components-dialog--full-screen-bottom-bar');
    await page.getByRole('button', { name: 'Filters' }).click();
    const dialog = page.getByRole('dialog', { name: 'Filters' });
    await settle(page);
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    const apply = (await dialog.getByRole('button', { name: 'Apply' }).boundingBox())!;
    expect(apply.y + apply.height).toBeGreaterThan(760 - 56);
    await expect(page).toHaveScreenshot('full-screen-bottom-bar.png');
  });
});
