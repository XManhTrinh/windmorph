import { expect, test, type Locator, type Page } from '@playwright/test';
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

const shadow = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).boxShadow);
const box = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right };
  });

/** A colour role's computed value, to compare with a computed colour. */
const role = (page: Page, name: string) =>
  page.evaluate((name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(--md-sys-color-${name})`;
    document.querySelector('#storybook-root')!.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  }, name);

test.describe('Chips states', () => {
  test('a press never raises a chip: hover elevation waits until the press ends', async ({
    page,
  }) => {
    await openStory(page, 'components-chips--types');
    // Elevated: level 1 at rest, 2 on hover, 1 while pressed.
    const elevated = page.getByRole('button', { name: 'Elevated assist' }).first();
    const rest = await shadow(elevated);
    await elevated.hover();
    await expect.poll(() => shadow(elevated)).not.toBe(rest);
    await page.mouse.down();
    await expect(elevated).toHaveAttribute('data-pressed', 'true');
    await expect.poll(() => shadow(elevated)).toBe(rest);
    await page.mouse.up();

    // Flat selected filter: level 0 at rest, 1 on hover, 0 while pressed.
    await page.mouse.move(0, 0);
    const selected = page.getByRole('button', { name: 'Selected', exact: true }).first();
    const flat = await shadow(selected);
    await selected.hover();
    await expect.poll(() => shadow(selected)).not.toBe(flat);
    await page.mouse.down();
    await expect(selected).toHaveAttribute('data-pressed', 'true');
    await expect.poll(() => shadow(selected)).toBe(flat);
    await page.mouse.up();
  });

  test('an elevated selected filter chip rises to level 2 on hover, like an unselected one', async ({
    page,
  }) => {
    await openStory(page, 'components-chips--types');
    const unselected = page.getByRole('button', { name: 'Elevated', exact: true }).first();
    await unselected.hover();
    await expect(unselected).toHaveAttribute('data-hovered', 'true');
    await page.waitForTimeout(500);
    const level2 = await shadow(unselected);

    const selected = page.getByRole('button', { name: 'Elevated selected' }).first();
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    await selected.hover();
    await expect.poll(() => shadow(selected)).toBe(level2);
  });

  test('a keyboard-focused flat chip darkens its border', async ({ page }) => {
    await openStory(page, 'components-chips--types');
    const onSurface = await role(page, 'on-surface');
    const onSurfaceVariant = await role(page, 'on-surface-variant');
    const border = (locator: Locator) =>
      locator.evaluate((el) => getComputedStyle(el).borderTopColor);
    const focusByKeyboard = async (locator: Locator) => {
      await locator.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(locator).toHaveAttribute('data-focus-visible', 'true');
    };

    const assist = page.getByRole('button', { name: 'Assist', exact: true }).first();
    await focusByKeyboard(assist);
    await expect.poll(() => border(assist)).toBe(onSurface);

    const filter = page.getByRole('button', { name: 'Filter', exact: true }).first();
    await focusByKeyboard(filter);
    await expect.poll(() => border(filter)).toBe(onSurfaceVariant);

    // A two-part chip's border follows whichever of its buttons is focused.
    const remove = page.getByRole('button', { name: 'Remove Alex' }).first();
    await focusByKeyboard(remove);
    const chip = remove.locator('..');
    await expect.poll(() => border(chip)).toBe(onSurfaceVariant);
  });

  test('padding counts from the edge: the 1px border takes none of it', async ({ page }) => {
    await openStory(page, 'components-chips--types');
    // 8px before a leading icon, 16px after the label.
    const assist = page.getByRole('button', { name: 'Assist', exact: true }).first();
    const assistBox = await box(assist);
    expect((await box(assist.locator('svg'))).left - assistBox.left).toBe(8);
    expect(assistBox.right - (await box(assist.getByText('Assist'))).right).toBe(16);
    // 16px each side without icons.
    const suggestion = page.getByRole('button', { name: 'Suggestion', exact: true }).first();
    const suggestionBox = await box(suggestion);
    const label = await box(suggestion.getByText('Suggestion'));
    expect(label.left - suggestionBox.left).toBe(16);
    expect(suggestionBox.right - label.right).toBe(16);
    // An input chip: 4px before the avatar, 8px after the remove icon.
    const alex = page.getByRole('button', { name: 'Remove Alex' }).first().locator('..');
    const alexBox = await box(alex);
    expect((await box(alex.locator('img'))).left - alexBox.left).toBe(4);
    expect(alexBox.right - (await box(alex.locator('[data-chip-remove] svg'))).right).toBe(8);
  });

  test('removing the focused chip moves focus to the next, the previous, then the set', async ({
    page,
  }) => {
    await openStory(page, 'components-chips--recipients');
    await page.getByRole('button', { name: 'Remove Sam' }).focus();
    await page.keyboard.press('Delete');
    await expect(page.getByRole('button', { name: 'Remove Priya' })).toBeFocused();
    await page.keyboard.press('Backspace');
    await expect(page.getByRole('button', { name: 'Remove Alex' })).toBeFocused();
    await page.keyboard.press('Backspace');
    await expect(page.getByRole('group', { name: 'Recipients' })).toBeFocused();
  });

  test('the remove button is named by its words alone, its icon hidden', async ({ page }) => {
    await openStory(page, 'components-chips--recipients');
    await expect(page.getByRole('group', { name: 'Recipients' })).toMatchAriaSnapshot(`
      - group "Recipients":
        - button "Remove Alex"
        - button "Remove Sam"
        - button "Remove Priya"
    `);
  });
});

test.describe('Chips layout safety', () => {
  layoutSafetySuite('components-chips--layout-override', { height: 32, radius: '8px' });
});
