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
  test('filter chips toggle, keeping 8px corners', async ({ page }) => {
    await openStory(page, 'components-chips--filters');
    const vegan = page.getByRole('button', { name: 'Vegan' });
    await expect(vegan).toHaveAttribute('aria-pressed', 'false');
    expect(await vegan.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('8px');
    await vegan.click();
    await expect(vegan).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('selected')).toHaveText('Selected: Spicy, Vegan');
    await page.mouse.move(0, 0);
    expect(await vegan.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('8px');
    await page.keyboard.press('Space');
    await expect(vegan).toHaveAttribute('aria-pressed', 'false');
  });

  test('a chip set is one Tab stop with arrow keys between chips', async ({ page }) => {
    await openStory(page, 'components-chips--filters');
    await page.getByRole('button', { name: 'Vegan' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('button', { name: 'Gluten free' })).toBeFocused();
    await page.keyboard.press('End');
    await expect(page.getByRole('button', { name: 'Under 30 min' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Vegan' })).not.toBeFocused();
  });

  test('a single-select chip set is a radio group', async ({ page }) => {
    await openStory(page, 'components-chips--single-select');
    await expect(page.getByRole('radiogroup', { name: 'Sort by' })).toBeVisible();
    await page.getByRole('radio', { name: 'Distance' }).click();
    await expect(page.getByRole('radio', { name: 'Distance' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await expect(page.getByRole('radio', { name: 'Relevance' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
  });

  test('input chips remove by button or keyboard, with a 48px target', async ({ page }) => {
    await openStory(page, 'components-chips--recipients');
    const remove = page.getByRole('button', { name: 'Remove Sam' });
    const target = await remove.locator('[data-touch-target]').boundingBox();
    expect(target?.width).toBe(48);
    expect(target?.height).toBe(48);
    const chip = await page.getByTestId('recipients').locator(':scope > div').first().boundingBox();
    expect(chip?.width).toBeGreaterThanOrEqual(88);
    await remove.click();
    await expect(page.getByRole('button', { name: 'Remove Sam' })).toHaveCount(0);
    // A remove-only chip is one focus stop: the remove button.
    await page.getByRole('button', { name: 'Remove Alex' }).focus();
    await page.keyboard.press('Backspace');
    await expect(page.getByRole('button', { name: 'Remove Alex' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Remove Priya' })).toBeVisible();
  });
});

test.describe('Chips layout safety', () => {
  layoutSafetySuite('components-chips--layout-override', { height: 32, radius: '8px' });
});
