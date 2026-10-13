import { expect, test, type Locator, type Page } from '@playwright/test';
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

const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(document.getAnimations().map((a) => a.finished)).then(() => undefined),
  );

test.describe('Pickers visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`date · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-pickers--date', { theme, mode });
        await expect(page.getByTestId('picker')).toHaveScreenshot(`date-${theme}-${mode}.png`);
      });
    }
  }

  for (const story of [
    'date-input',
    'date-range',
    'time-12',
    'time-24',
    'time-horizontal',
    'time-input',
  ] as const) {
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

  test('docked', async ({ page }) => {
    await openStory(page, 'components-pickers--docked');
    await page.getByRole('button', { name: 'Open calendar' }).click();
    const calendar = page.getByRole('dialog', { name: 'Choose a date' });
    await expect(calendar).toBeVisible();
    await settle(page);
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot('docked.png', {
      clip: { x: 0, y: 0, width: 420, height: 560 },
    });
  });

  test('date range full screen', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-pickers--date-range-full-screen');
    await expect(page.getByRole('dialog')).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('date-range-full-screen.png');
  });

  test('time dialog', async ({ page }) => {
    await openStory(page, 'components-pickers--time-dialog');
    await expect(page.getByRole('dialog')).toBeVisible();
    await settle(page);
    await expect(page.getByRole('dialog')).toHaveScreenshot('time-dialog.png');
  });
});

test.describe('Date picker', () => {
  test('follows Compose geometry with 48px day targets', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    const picker = page.getByTestId('picker');
    expect(await rect(picker)).toMatchObject({ width: 360, height: 512 });
    const day = page.getByRole('button', { name: /March 14, 2030/ });
    const box = await rect(day);
    expect(box).toMatchObject({ width: 40, height: 40 });
    const next = page.getByRole('button', { name: /March 15, 2030/ });
    expect((await rect(next)).x - box.x).toBe(48);
    // The 4px around the circle still hit the day: the target fills the 48px cell.
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x!, y!)?.textContent,
      [box.x - 3, box.y - 3],
    );
    expect(hit).toBe('14');
  });

  test('keyboard moves through the days and selects', async ({ page }) => {
    await openStory(page, 'components-pickers--date');
    await page.getByRole('button', { name: /March 14, 2030/ }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-22');
  });

  test('the dialog confirms the picked date, and Enter closes and saves', async ({ page }) => {
    await openStory(page, 'components-pickers--date-dialog');
    await page.getByRole('button', { name: 'Pick a date' }).click();
    const dialog = page.getByRole('dialog', { name: 'Select date' });
    await dialog.getByRole('button', { name: /March 20, 2030/ }).click();
    await dialog.getByRole('button', { name: 'OK' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-20');
    await page.getByRole('button', { name: 'Pick a date' }).click();
    await dialog.getByRole('button', { name: /March 20, 2030/ }).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-21');
  });

  test('the dialog fills a compact window', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await openStory(page, 'components-pickers--date-dialog');
    await page.getByRole('button', { name: 'Pick a date' }).click();
    const dialog = page.getByRole('dialog', { name: 'Select date' });
    await settle(page);
    expect(await rect(dialog)).toMatchObject({ x: 0, y: 0, width: 390, height: 780 });
    await dialog.getByRole('button', { name: /March 20, 2030/ }).click();
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-20');
  });

  test('the typed date reformats on Enter', async ({ page }) => {
    await openStory(page, 'components-pickers--date-input');
    const field = page.getByRole('textbox', { name: 'Date' });
    await field.fill('4.2.2030');
    await field.press('Enter');
    await expect(field).toHaveValue('04/02/2030');
    await expect(page.getByTestId('value')).toHaveText('Value 2030-04-02');
  });

  test('the range picker scrolls through the months', async ({ page }) => {
    await openStory(page, 'components-pickers--date-range');
    const picker = page.getByTestId('picker');
    expect(await rect(picker)).toMatchObject({ width: 360, height: 520 });
    const april = page.getByRole('button', { name: /April 2, 2030/ });
    await page.getByRole('button', { name: /March 20, 2030/ }).hover();
    await page.mouse.wheel(0, 400);
    await expect(april).toBeInViewport();
    await april.click();
    await page.getByRole('button', { name: /April 5, 2030/ }).click();
    await expect(page.getByText('Apr 2 – Apr 5')).toBeVisible();
  });
});

test.describe('Docked date picker', () => {
  test('opens below the field, 360px wide, and Enter saves', async ({ page }) => {
    await openStory(page, 'components-pickers--docked');
    const field = page.getByRole('textbox', { name: 'Date' });
    await page.getByRole('button', { name: 'Open calendar' }).click();
    const calendar = page.getByRole('dialog', { name: 'Choose a date' });
    await expect(page.getByRole('button', { name: /March 14, 2030/ })).toBeFocused();
    await settle(page);
    const panel = await rect(calendar);
    expect(panel.width).toBe(360);
    expect(panel.y).toBeGreaterThan((await rect(field)).y);
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(calendar).toBeHidden();
    await expect(field).toHaveValue('03/15/2030');
    await expect(page.getByTestId('value')).toHaveText('Value 2030-03-15');
  });
});

test.describe('Time picker', () => {
  test('dragging the dial sets the hour then switches to minutes', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const dial = page.getByRole('group', { name: 'Clock' });
    const box = await rect(dial);
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    // 3 o'clock: straight right of the centre on the outer ring.
    await page.mouse.move(cx + 101, cy);
    await page.mouse.down();
    await page.mouse.up();
    await expect(page.getByTestId('value')).toHaveText('Value 15:35:00');
    await expect(page.getByRole('textbox', { name: 'Minute' })).toHaveAttribute(
      'data-selected',
      'true',
    );
    // 6 o'clock on the minute face: 30 minutes.
    await page.mouse.click(cx, cy + 101);
    await expect(page.getByTestId('value')).toHaveText('Value 15:30:00');
  });

  test('the dial numbers are 48px buttons you can Tab to and press', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    const two = page.getByRole('button', { name: '2 hours of 12', exact: true });
    expect(await rect(two)).toMatchObject({ width: 48, height: 48 });
    await page.getByRole('radio', { name: 'PM' }).focus();
    await page.keyboard.press('Tab');
    await expect(two).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('value')).toHaveText('Value 15:35:00');
    await expect(page.getByRole('button', { name: '35 minutes of 60' })).toBeFocused();
  });

  test('selectors and dial follow Compose sizes', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    expect(await rect(page.getByRole('textbox', { name: 'Hour' }))).toMatchObject({
      width: 96,
      height: 80,
    });
    expect(await rect(page.getByRole('group', { name: 'Clock' }))).toMatchObject({
      width: 256,
      height: 256,
    });
    expect(await rect(page.getByRole('radiogroup', { name: 'AM or PM' }))).toMatchObject({
      width: 52,
      height: 80,
    });
  });

  test('24-hour input fields are 96px wide', async ({ page }) => {
    await openStory(page, 'components-pickers--time-input');
    const hour = page.getByTestId('picker-24').getByRole('textbox', { name: 'Hour' });
    expect(await rect(hour)).toMatchObject({ width: 96, height: 72 });
  });

  test('the horizontal layout puts the dial beside a 216 × 38px period selector', async ({
    page,
  }) => {
    await openStory(page, 'components-pickers--time-horizontal');
    const period = await rect(page.getByRole('radiogroup', { name: 'AM or PM' }));
    expect(period).toMatchObject({ width: 216, height: 38 });
    const dial = await rect(page.getByRole('group', { name: 'Clock' }));
    expect(dial.x - (period.x + period.width)).toBe(36);
  });

  test('the dialog never scrolls: horizontal on short windows, input with no room', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 500 });
    await openStory(page, 'components-pickers--time-dialog');
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('group', { name: 'Clock' })).toBeVisible();
    const noScroll = () => dialog.evaluate((el) => el.scrollHeight <= el.clientHeight);
    expect(await noScroll()).toBe(true);
    await page.setViewportSize({ width: 500, height: 420 });
    await expect(dialog.getByRole('group', { name: 'Clock' })).toBeHidden();
    await expect(dialog.getByRole('textbox', { name: 'Hour' })).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Toggle input picker' })).toBeHidden();
    expect(await noScroll()).toBe(true);
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
