import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
      bottom: Math.round(r.bottom),
      right: Math.round(r.right),
    };
  });
const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(document.getAnimations().map((a) => a.finished)).then(() => undefined),
  );

test.describe('Bottom sheet', () => {
  for (const mode of MODES) {
    test(`short sheet · ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width: 412, height: 800 });
      await openStory(page, 'components-sheet--bottom', { mode });
      await page.getByRole('button', { name: 'Open sheet' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`bottom-${mode}.png`);
    });
  }

  test('a short sheet opens fully against the bottom edge', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    const box = await rect(sheet);
    expect(box.bottom).toBe(800);
    expect(box.width).toBe(412);
    // Handle area 48px + 4 items × 56px + 24px padding.
    expect(box.height).toBe(48 + 4 * 56 + 24);
    expect(await sheet.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('28px');
  });

  test('a tall sheet opens to half the window and expands from the handle', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom-tall');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    expect((await rect(sheet)).y).toBe(400);
    await page.getByRole('button', { name: 'Expand sheet' }).click();
    await settle(page);
    expect((await rect(sheet)).y).toBe(0);
    // Escape returns it to half, then closes it; focus returns to the trigger.
    await page.keyboard.press('Escape');
    await settle(page);
    expect((await rect(sheet)).y).toBe(400);
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open sheet' })).toBeFocused();
  });

  test('dragging the handle down closes it; a short drag springs back', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    const top = (await rect(sheet)).y;
    const handle = await rect(page.getByRole('button', { name: 'Close sheet' }));
    const x = handle.x + handle.width / 2;
    const y = handle.y + handle.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(x, y + i * 3);
    await page.waitForTimeout(150);
    await page.mouse.up();
    await settle(page);
    expect((await rect(sheet)).y).toBe(top);
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(x, y + i * 15);
    await page.mouse.up();
    await expect(sheet).toBeHidden();
  });

  test('pressing the scrim closes it', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(200, 50);
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Side sheet', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`modal sheet slides in at the end edge · ${dir}`, async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 600 });
      await openStory(page, 'components-sheet--side', { dir });
      await page.getByRole('button', { name: 'Open filters' }).click();
      const sheet = page.getByRole('dialog', { name: 'Filters' });
      await settle(page);
      const box = await rect(sheet);
      expect(box).toMatchObject({ width: 256, height: 600, y: 0 });
      expect(dir === 'ltr' ? box.right : box.x).toBe(dir === 'ltr' ? 800 : 0);
      await expect(page).toHaveScreenshot(`side-${dir}.png`);
      await sheet.getByRole('button', { name: 'Close' }).click();
      await expect(sheet).toBeHidden();
    });
  }

  test('detached sheet floats 16px from the edges', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await openStory(page, 'components-sheet--side', {}, { detached: true });
    await page.getByRole('button', { name: 'Open filters' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    expect(await rect(sheet)).toMatchObject({ y: 16, right: 784, height: 568 });
  });

  test('standard sheet opens and closes its width in the layout', async ({ page }) => {
    await openStory(page, 'components-sheet--side-standard');
    const sheet = page.getByTestId('sheet');
    expect((await rect(sheet)).width).toBe(256);
    await expect(page.getByTestId('layout')).toHaveScreenshot('side-standard.png');
    await page.getByRole('button', { name: 'Hide details' }).click();
    await expect.poll(async () => (await rect(sheet)).width).toBe(0);
    await page.getByRole('button', { name: 'Show details' }).click();
    await expect.poll(async () => (await rect(sheet)).width).toBe(256);
  });

  test.describe('layout safety', () => {
    layoutSafetySuite('components-sheet--layout-override', {
      height: 300,
      width: 256,
      radius: '0px',
      interactive: false,
      async check(page, target) {
        await target.getByRole('button', { name: 'Action' }).click();
        await expect(page.getByTestId('count')).toHaveText('Pressed 1');
      },
    });
  });
});
