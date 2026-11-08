import { expect, test } from '@playwright/test';
import { LAYOUT_OVERRIDE_NAMES } from '../stories/layout-overrides';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const VARIANTS = 'components-timefield--variants';

test.describe('TimeField visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, VARIANTS, { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }
  for (const contrast of ['medium', 'high'] as const) {
    test(`variants · contrast ${contrast}`, async ({ page }) => {
      await openStory(page, VARIANTS, { contrast });
      await expect(page.getByTestId('variants')).toHaveScreenshot(`variants-${contrast}.png`);
    });
  }
  test('variants · right-to-left', async ({ page }) => {
    await openStory(page, VARIANTS, { dir: 'rtl' });
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-rtl.png');
  });
  test('schedule · density -2', async ({ page }) => {
    await openStory(page, 'components-timefield--schedule');
    await expect(page.getByTestId('schedule')).toHaveScreenshot('schedule.png');
  });
});

test.describe('TimeField behaviour', () => {
  test('is 48px tall at density -2', async ({ page }) => {
    await openStory(page, 'components-timefield--schedule');
    const box = (await page.getByRole('textbox', { name: 'Monday Opens' }).boundingBox())!;
    expect(box.height).toBeLessThanOrEqual(48);
    const container = await page
      .getByRole('textbox', { name: 'Monday Opens' })
      .evaluate((node) => node.closest('[data-field-state]')!.getBoundingClientRect().height);
    expect(container).toBe(48);
  });

  test('normalizes typing when it leaves the field', async ({ page }) => {
    await openStory(page, 'components-timefield--schedule');
    const field = page.getByRole('textbox', { name: 'Monday Opens' });
    await field.fill('9h30');
    await page.keyboard.press('Tab');
    await expect(field).toHaveValue('09:30');
  });

  test('accepts a pasted time', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await openStory(page, 'components-timefield--schedule');
    await page.evaluate(() => navigator.clipboard.writeText('9:30 pm'));
    const field = page.getByRole('textbox', { name: 'Monday Opens' });
    await field.focus();
    await page.keyboard.press('ControlOrMeta+V');
    await page.keyboard.press('Enter');
    await expect(field).toHaveValue('21:30');
  });

  test('opens from inside a dialog, commits, and returns focus to the field', async ({ page }) => {
    await openStory(page, 'components-timefield--in-dialog');
    await page.getByRole('button', { name: 'Edit hours' }).click();
    const field = page.getByRole('textbox', { name: 'Opens at' });
    await expect(field).toBeVisible();
    await page.getByRole('button', { name: 'Open time picker' }).click();
    const picker = page.getByRole('dialog', { name: 'Select time' });
    await expect(picker).toBeVisible();
    const hour = picker.getByRole('textbox').or(picker.getByRole('spinbutton')).first();
    await hour.fill('11');
    await picker.getByRole('button', { name: 'OK' }).click();
    await expect(picker).toHaveCount(0);
    await expect(field).toHaveValue('11:30');
    await expect(field).toBeFocused();
    await expect(page.getByRole('dialog', { name: 'Opening hours' })).toBeVisible();
  });

  test('Cancel discards, and the picker fills a compact window', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 700 });
    await openStory(page, 'components-timefield--in-dialog');
    await page.getByRole('button', { name: 'Edit hours' }).click();
    await page.getByRole('button', { name: 'Open time picker' }).click();
    const picker = page.getByRole('dialog', { name: 'Select time' });
    await expect(picker).toBeVisible();
    await page.waitForTimeout(500);
    const box = (await picker.boundingBox())!;
    expect(box.width).toBe(360);
    await page.getByRole('button', { name: 'Close' }).first().click();
    await expect(picker).toHaveCount(0);
    await expect(page.getByRole('textbox', { name: 'Opens at' })).toHaveValue('09:30');
  });
});

test.describe('TimeField under consumer classes', () => {
  for (const override of LAYOUT_OVERRIDE_NAMES) {
    for (const dir of ['ltr', 'rtl'] as const) {
      for (const transformedAncestor of [false, true]) {
        test(`${override} · ${dir}${transformedAncestor ? ' · transformed parent' : ''}`, async ({
          page,
        }) => {
          await openStory(
            page,
            'components-timefield--layout-override',
            { dir },
            { override, transformedAncestor },
          );
          const button = page.getByRole('button', { name: 'Open time picker' });
          await expect(button).toBeVisible();
          await button.click();
          await expect(page.getByRole('dialog', { name: 'Select time' })).toBeVisible();
        });
      }
    }
  }
});
