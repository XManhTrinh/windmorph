import { expect, test, type Locator } from '@playwright/test';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

const dashOffset = (path: Locator) =>
  path.evaluate((el) => Number.parseFloat(getComputedStyle(el).strokeDashoffset));

test.describe('Checkbox visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`states · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-checkbox--states', { theme, mode });
        await expect(page.getByTestId('states')).toHaveScreenshot(`states-${theme}-${mode}.png`);
      });
    }
  }
});

test.describe('Checkbox interaction', () => {
  test('the check draws in on checking and snaps away after unchecking', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const checkbox = page.getByRole('checkbox', { name: 'Label' });
    const check = page.locator('svg path').first();
    expect(await dashOffset(check)).toBe(1);

    await page.getByText('Label').click();
    await expect(checkbox).toBeChecked();
    await expect.poll(() => dashOffset(check)).toBeCloseTo(0, 1);

    await page.getByText('Label').click();
    await expect(checkbox).not.toBeChecked();
    await expect.poll(() => dashOffset(check), { timeout: 1000 }).toBe(1);
  });

  test('box geometry: 18px box, 2px outline, 40px state layer', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const box = page.locator('[aria-hidden="true"].rounded-\\[2px\\]');
    const control = page.locator('.state-layer');
    expect((await box.boundingBox())!.width).toBe(18);
    expect(await box.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('2px');
    expect((await control.boundingBox())!.width).toBe(40);
  });

  test('hover shows the state layer and keyboard focus the ring', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const control = page.locator('.state-layer');
    await control.hover();
    await expect(control).toHaveAttribute('data-hovered', 'true');
    await shotWithMargin(page, control, 'state-hover.png');
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await expect(control).toHaveAttribute('data-focus-visible', 'true');
    await shotWithMargin(page, control, 'state-focus.png');
  });

  test('the 48px touch target extends past the 40px state layer', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const control = (await page.locator('.state-layer').boundingBox())!;
    await page.mouse.click(control.x + control.width / 2, control.y - 3);
    await expect(page.getByRole('checkbox')).toBeChecked();
  });

  test('select all becomes indeterminate and checks every child', async ({ page }) => {
    await openStory(page, 'components-checkbox--select-all');
    const all = page.getByRole('checkbox', { name: 'All fruit' });
    expect(await all.evaluate((el) => (el as HTMLInputElement).indeterminate)).toBe(true);
    await page.getByText('All fruit').click();
    for (const name of ['Apples', 'Pears', 'Plums']) {
      await expect(page.getByRole('checkbox', { name })).toBeChecked();
    }
    expect(await all.evaluate((el) => (el as HTMLInputElement).indeterminate)).toBe(false);
  });
});

test.describe('Checkbox layout safety', () => {
  const overrides = [
    'none',
    'fixed',
    'absolute',
    'sticky',
    'static',
    'overflowHidden',
    'fullWidth',
    'transform',
  ];
  for (const override of overrides) {
    for (const dir of ['ltr', 'rtl'] as const) {
      test(`${override} · ${dir}`, async ({ page }) => {
        await openStory(page, 'components-checkbox--layout-override', { dir }, { override });
        const control = page.getByTestId('target').locator('.state-layer');
        expect(await control.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(40);
        await page.getByText('Layout').click();
        await expect(page.getByRole('checkbox')).toBeChecked();
      });
    }
  }
});
