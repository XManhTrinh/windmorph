import { expect, test, type Locator, type Page } from '@playwright/test';
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

  // M3: "A menu should open when a person … Selects an element, such as … a text field".
  test('pressing the field opens the menu', async ({ page }) => {
    await openStory(page, 'components-autocomplete--interactive');
    await page.getByRole('combobox', { name: 'City' }).click();
    await expect(page.getByRole('option')).toHaveCount(9);
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

test.describe('Autocomplete height', () => {
  const height = (locator: Locator) => locator.evaluate((el) => el.getBoundingClientRect().height);
  const fieldOf = (page: Page, name: string) =>
    page.getByRole('combobox', { name }).locator('xpath=ancestor::*[@data-slot="container"][1]');

  for (const variant of ['filled', 'outlined'] as const) {
    test(`typing, choosing and the clear button keep 56px · ${variant}`, async ({ page }) => {
      await openStory(page, 'components-autocomplete--clearable', {}, { variant });
      for (const name of ['City', 'Town']) {
        const field = fieldOf(page, name);
        expect(await height(field)).toBe(56);
        await page.getByRole('combobox', { name }).fill('zur');
        // The open menu hides the rest of the page from assistive technology, so by label.
        const clear = field.locator('button[aria-label="Clear"]');
        await expect(clear).toBeVisible();
        expect(await height(field)).toBe(56);
        await page.getByRole('option', { name: /Zürich/ }).click();
        await expect(page.getByRole('combobox', { name })).toHaveValue('Zürich');
        expect(await height(field)).toBe(56);

        // A 40px button with a 48px touch target, centred with the menu arrow.
        const button = (await clear.boundingBox())!;
        const target = (await clear.locator('[data-touch-target]').boundingBox())!;
        const arrow = (await field.locator('button[aria-label="Show options"]').boundingBox())!;
        const arrowButton = field.locator('button[aria-label="Show options"]');
        const arrowTarget = (await arrowButton.locator('[data-touch-target]').boundingBox())!;
        expect([arrowTarget.width, arrowTarget.height]).toEqual([48, 48]);
        expect([button.width, button.height]).toEqual([40, 40]);
        expect([target.width, target.height]).toEqual([48, 48]);
        expect(button.y + button.height / 2).toBe(arrow.y + arrow.height / 2);
      }
    });

    // One row of input chips fits an outlined field's 56px; a filled field's floated label
    // keeps the top 24px, so its row sits below it (24 + 32 + 8).
    test(`a first input chip · ${variant}`, async ({ page }) => {
      await openStory(page, 'components-autocomplete--clearable', {}, { variant });
      const field = fieldOf(page, 'Cities');
      expect(await height(field)).toBe(56);
      await page.getByRole('combobox', { name: 'Cities' }).fill('zur');
      expect(await height(field)).toBe(56);
      await page.getByRole('option', { name: /Zürich/ }).click();
      // The menu stays open (multiple) and hides the rest from assistive technology.
      await expect(field.getByText('Zürich', { exact: true })).toBeVisible();
      expect(await height(field)).toBe(variant === 'filled' ? 64 : 56);
    });

    // The input stays on the chips' last row while its 48px minimum fits there, and wraps
    // to a row of its own only when less is left.
    test(`the input shares the chips' last row while it fits · ${variant}`, async ({ page }) => {
      await openStory(page, 'components-autocomplete--clearable', {}, { variant });
      const input = page.getByRole('combobox', { name: 'Cities' });
      const field = fieldOf(page, 'Cities');
      const outcomes = new Set<'same row' | 'wrapped'>();
      // Chosen from the whole list, so no typed text (or clear button) narrows the row.
      await field.locator('button[aria-label="Show options"]').click();
      for (const city of ['Zürich', 'London', 'Sydney']) {
        await page.getByRole('option', { name: new RegExp(city) }).click();
        await expect(field.getByText(city, { exact: true })).toBeVisible();
        const layout = await input.evaluate((el) => {
          const row = el.parentElement!.getBoundingClientRect();
          const chips = [...el.parentElement!.children].filter((child) => child !== el);
          const last = chips.at(-1)!.getBoundingClientRect();
          const box = el.getBoundingClientRect();
          const gap = parseFloat(getComputedStyle(el.parentElement!).columnGap);
          return {
            room: row.right - last.right - gap,
            lastBottom: last.bottom,
            inputTop: box.top,
            inputMiddle: box.top + box.height / 2,
            lastMiddle: last.top + last.height / 2,
          };
        });
        if (layout.room >= 48) {
          outcomes.add('same row');
          expect(layout.inputMiddle).toBe(layout.lastMiddle);
        } else {
          outcomes.add('wrapped');
          expect(layout.inputTop).toBeGreaterThanOrEqual(layout.lastBottom);
        }
      }
      // In a 280px field the input keeps Zürich's row, then wraps below Zürich and London.
      expect([...outcomes].sort()).toEqual(['same row', 'wrapped']);
    });
  }
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
          // Let the menu's reveal finish: above a field at the bottom it opens upwards, so
          // the first option is clipped until the end (a click retried meanwhile scrolls,
          // which closes the combobox's menu).
          await page.evaluate(() =>
            Promise.allSettled(document.getAnimations().map((a) => a.finished)),
          );
          await page.getByRole('option', { name: /London/ }).click();
          await expect(input).toHaveValue('London');
        });
      }
    }
  }
});
