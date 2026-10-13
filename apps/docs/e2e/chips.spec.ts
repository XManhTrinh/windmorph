import { expect, test } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

test.describe('Chips visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`types · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-chips--types', { theme, mode });
        await expect(page.getByTestId('types')).toHaveScreenshot(`types-${theme}-${mode}.png`);
      });
    }
  }

  test('types · rtl', async ({ page }) => {
    await openStory(page, 'components-chips--types', { dir: 'rtl' });
    await expect(page.getByTestId('types')).toHaveScreenshot('types-rtl.png');
  });
});

test.describe('Chips behaviour', () => {
  test('filter chips toggle and turn round', async ({ page }) => {
    await openStory(page, 'components-chips--filters');
    const vegan = page.getByRole('button', { name: 'Vegan' });
    await expect(vegan).toHaveAttribute('aria-pressed', 'false');
    expect(await vegan.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('12px');
    await vegan.click();
    await expect(vegan).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('selected')).toHaveText('Selected: Spicy, Vegan');
    await page.mouse.move(0, 0);
    await expect
      .poll(() => vegan.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('16px');
    await page.keyboard.press('Space');
    await expect(vegan).toHaveAttribute('aria-pressed', 'false');
  });

  test('input chips remove by button or keyboard', async ({ page }) => {
    await openStory(page, 'components-chips--recipients');
    await page.getByRole('button', { name: 'Remove Bob' }).click();
    await expect(page.getByRole('button', { name: 'Bob', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Alice', exact: true }).focus();
    await page.keyboard.press('Backspace');
    await expect(page.getByRole('button', { name: 'Alice', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Carol', exact: true })).toBeVisible();
  });
});

test.describe('Chips layout safety', () => {
  layoutSafetySuite('components-chips--layout-override', { height: 32, radius: '8px' });
});
