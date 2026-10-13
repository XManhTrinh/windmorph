import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  });

test.describe('Pickers visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`date · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-pickers--date', { theme, mode });
        await expect(page.getByTestId('picker')).toHaveScreenshot(`date-${theme}-${mode}.png`);
      });
    }
  }

  for (const story of ['date-range', 'time-12', 'time-24', 'time-input'] as const) {
    test(story, async ({ page }) => {
      await openStory(page, `components-pickers--${story}`);
      await expect(page.getByTestId('picker')).toHaveScreenshot(`${story}.png`);
    });
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`date range · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-pickers--date-range', { dir });
      await expect(page.getByTestId('picker')).toHaveScreenshot(`date-range-${dir}.png`);
    });
  }

  test('time dialog', async ({ page }) => {
    await openStory(page, 'components-pickers--time-dialog');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.evaluate(() =>
      Promise.allSettled(document.getAnimations().map((a) => a.finished)).then(() => undefined),
    );
    await expect(page.getByRole('dialog')).toHaveScreenshot('time-dialog.png');
  });
});

test.describe('Date picker', () => {
  test('follows Compose geometry', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    const picker = page.getByTestId('picker');
    expect(await rect(picker)).toMatchObject({ width: 360, height: 512 });
    const day = page.getByRole('button', { name: /March 14, 2030/ });
    expect(await rect(day)).toMatchObject({ width: 40, height: 40 });
    const next = page.getByRole('button', { name: /March 15, 2030/ });
    expect((await rect(next)).x - (await rect(day)).x).toBe(48);
  });

  test('keyboard moves through the days and selects', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    await page.getByRole('button', { name: /March 14, 2030/ }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-22');
  });

  test('the dialog confirms the picked date', async ({ page }) => {
    await openStory(page, 'components-pickers--date-dialog');
    await page.getByRole('button', { name: 'Pick a date' }).click();
    const dialog = page.getByRole('dialog', { name: 'Select date' });
    await dialog.getByRole('button', { name: /March 20, 2030/ }).click();
    await dialog.getByRole('button', { name: 'OK' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-20');
  });
});

test.describe('Time picker', () => {
  test('dragging the dial sets the hour then switches to minutes', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const dial = page.getByRole('slider', { name: 'Clock' });
    const box = await rect(dial);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // 3 o'clock: straight right of the centre on the outer ring.
    await page.mouse.move(cx + 101, cy);
    await page.mouse.down();
    await page.mouse.up();
    await expect(page.getByTestId('value')).toHaveText('Value 15:35:00');
    await expect(page.getByRole('button', { name: /^Minute/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    // 6 o'clock on the minute face: 30 minutes.
    await page.mouse.click(cx, cy + 101);
    await expect(page.getByTestId('value')).toHaveText('Value 15:30:00');
  });

  test('selectors and dial follow Compose sizes', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    expect(await rect(page.getByRole('button', { name: /^Hour/ }))).toMatchObject({
      width: 96,
      height: 80,
    });
    expect(await rect(page.getByRole('slider'))).toMatchObject({ width: 256, height: 256 });
    expect(await rect(page.getByRole('radiogroup', { name: 'AM or PM' }))).toMatchObject({
      width: 52,
      height: 80,
    });
  });
});

test.describe('Pickers layout safety', () => {
  layoutSafetySuite('components-pickers--layout-override', {
    height: 512,
    width: 360,
    radius: '0px',
    interactive: false,
  });
});
