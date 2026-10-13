import { expect, test } from '@playwright/test';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

test.describe('Autocomplete visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-autocomplete--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const contrast of ['medium', 'high'] as const) {
    test(`variants · contrast ${contrast}`, async ({ page }) => {
      await openStory(page, 'components-autocomplete--variants', { contrast });
      await expect(page.getByTestId('variants')).toHaveScreenshot(
        `variants-contrast-${contrast}.png`,
      );
    });
  }

  for (const mode of MODES) {
    test(`filtered menu · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-autocomplete--interactive', { mode });
      await page.getByRole('combobox', { name: 'City' }).fill('on');
      await expect(page.getByRole('listbox')).toBeVisible();
      await expect(page).toHaveScreenshot(`filtered-${mode}.png`);
    });
  }

  for (const mode of MODES) {
    test(`keyboard focus on the last option · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-autocomplete--interactive', { mode });
      await page.getByRole('combobox', { name: 'City' }).fill('h');
      await page.keyboard.press('ArrowUp');
      // Its outer corners nest in the panel's (12px in 16px), as Menu's do.
      await expect(page.getByRole('option').last()).toHaveAttribute('data-focus-visible', 'true');
      await expect(page).toHaveScreenshot(`focus-last-${mode}.png`);
    });
  }

  test('no results', async ({ page }) => {
    await openStory(page, 'components-autocomplete--interactive');
    await page.getByRole('combobox', { name: 'City' }).fill('zzz');
    await expect(page.getByText('No results')).toBeVisible();
    await expect(page).toHaveScreenshot('no-results.png');
  });

  test('sections', async ({ page }) => {
    await openStory(page, 'components-autocomplete--sections');
    await page.getByRole('button', { name: /Show options/ }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page).toHaveScreenshot('sections.png');
  });

  test('multiple · input chips', async ({ page }) => {
    await openStory(page, 'components-autocomplete--multiple');
    await expect(page.getByTestId('multiple')).toHaveScreenshot('multiple.png');
  });

  test('variants · right-to-left', async ({ page }) => {
    await openStory(page, 'components-autocomplete--variants', { dir: 'rtl' });
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-rtl.png');
  });

  test('variants · forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openStory(page, 'components-autocomplete--variants');
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-forced-colors.png');
  });
});

test.describe('Autocomplete behaviour', () => {
  test('typing filters, ignoring accents, and Enter chooses', async ({ page }) => {
    await openStory(page, 'components-autocomplete--interactive');
    const input = page.getByRole('combobox', { name: 'City' });
    await input.fill('zurich');
    await expect(page.getByRole('option')).toHaveCount(1);
    await page.keyboard.press('ArrowDown');
    // Focus stays in the input; the highlighted option shows the focus ring.
    await expect(page.getByRole('option')).toHaveAttribute('data-focus-visible', 'true');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(input).toHaveValue('Zürich');
    await expect(page.getByTestId('value')).toHaveText('zrh');
    await expect(input).toBeFocused();
  });

  test('the clear button empties the text and the choice', async ({ page }) => {
    await openStory(page, 'components-autocomplete--interactive');
    const input = page.getByRole('combobox', { name: 'City' });
    const clear = page.getByRole('button', { name: 'Clear' });
    await expect(clear).toHaveCount(0);
    await input.fill('zurich');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('value')).toHaveText('zrh');
    await clear.click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(page.getByTestId('value')).toHaveText('(none)');
  });

  test('options ease into their new places as the list filters', async ({ page }) => {
    await openStory(page, 'components-autocomplete--interactive');
    const input = page.getByRole('combobox', { name: 'City' });
    await input.focus();
    await page.getByRole('button', { name: 'Show options' }).click();
    await expect(page.getByRole('option')).toHaveCount(9);
    const sydney = page.getByRole('option', { name: /Sydney/ });
    await input.pressSequentially('y');
    // Sydney moves up and springs home from where it was, then settles.
    await expect
      .poll(() => sydney.evaluate((el) => getComputedStyle(el).transform))
      .not.toBe('none');
    await expect
      .poll(() => sydney.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m42))
      .toBe(0);
  });

  test('the keyboard reaches a disabled option without choosing it', async ({ page }) => {
    await openStory(page, 'components-autocomplete--interactive');
    const input = page.getByRole('combobox', { name: 'City' });
    await input.fill('mala');
    await page.keyboard.press('ArrowDown');
    const malaga = page.getByRole('option', { name: /Málaga/ });
    await expect(malaga).toHaveAttribute('aria-disabled', 'true');
    await expect(input).toHaveAttribute(
      'aria-activedescendant',
      (await malaga.getAttribute('id'))!,
    );
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('value')).toHaveText('(none)');
  });

  test('Escape closes the menu, then clears the text', async ({ page }) => {
    await openStory(page, 'components-autocomplete--interactive');
    const input = page.getByRole('combobox', { name: 'City' });
    await input.fill('lon');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(input).toHaveValue('');
  });

  test('multiple: choose, keep the menu open, remove by chip and Backspace', async ({ page }) => {
    await openStory(page, 'components-autocomplete--multiple');
    const input = page.getByRole('combobox', { name: /Cities/ });
    await input.fill('syd');
    await page.getByRole('option', { name: /Sydney/ }).click();
    await expect(page.getByTestId('value')).toHaveText('zrh, ldn, syd');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Remove Zürich' }).click();
    await expect(page.getByTestId('value')).toHaveText('ldn, syd');
    await input.focus();
    await page.keyboard.press('Backspace');
    await expect(page.getByTestId('value')).toHaveText('ldn');
  });

  test('loads options for what was typed', async ({ page }) => {
    await openStory(page, 'components-autocomplete--async');
    await page.getByRole('combobox', { name: 'City' }).fill('mel');
    await expect(page.getByRole('progressbar', { name: 'Loading options' })).toBeVisible();
    await expect(page.getByRole('option', { name: /Melbourne/ })).toBeVisible();
  });
});

test.describe('Autocomplete layout safety', () => {
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
    for (const transformedAncestor of [false, true]) {
      for (const dir of ['ltr', 'rtl'] as const) {
        test(`${override}${transformedAncestor ? ' · transformed ancestor' : ''} · ${dir}`, async ({
          page,
        }) => {
          await openStory(
            page,
            'components-autocomplete--layout-override',
            { dir },
            { override, transformedAncestor },
          );
          const field = page.getByTestId('target');
          const container = field.locator('div').first();
          expect(await container.evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(56);
          const input = page.getByRole('combobox', { name: 'City' });
          await input.fill('lon');
          await page.getByRole('option', { name: /London/ }).click();
          await expect(input).toHaveValue('London');
        });
      }
    }
  }
});
