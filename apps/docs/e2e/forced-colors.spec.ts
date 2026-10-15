import { expect, test } from '@playwright/test';
import { canvas, computedStyle } from './forced-colors';
import { openStory } from './story';

/*
 * Forced colours (Windows high contrast) repaint backgrounds as `Canvas` and drop shadows,
 * so anything drawn only with a background or a shadow must take system colours, a border
 * or an outline instead. Each check reads what forced colours leave on screen.
 */
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
});

test('switch: on and off differ without icons', async ({ page }) => {
  await openStory(page, 'components-switch--states');
  const thumb = (name: string) =>
    page
      .getByRole('switch', { name, exact: true })
      .first()
      .locator('xpath=ancestor::label')
      .locator('[data-slot=thumb]');
  const off = await computedStyle(thumb('Off'), 'background-color');
  const on = await computedStyle(thumb('On'), 'background-color');
  expect(off).not.toBe(await canvas(page));
  expect(on).not.toBe(off);
  await expect(page.getByTestId('states')).toHaveScreenshot('switch-states.png');
});

test('radio: the selected option shows its dot', async ({ page }) => {
  await openStory(page, 'components-radio--states');
  const dot = page
    .getByRole('radio', { name: 'Option B' })
    .first()
    .locator('xpath=ancestor::label')
    .locator('[data-slot=ring] > span');
  expect(await computedStyle(dot, 'background-color')).not.toBe(await canvas(page));
  await expect(page.getByTestId('states')).toHaveScreenshot('radio-states.png');
});

test('checkbox: disabled boxes are GrayText', async ({ page }) => {
  await openStory(page, 'components-checkbox--states');
  // Unchecked boxes: enabled, invalid, disabled.
  const box = (index: number) =>
    page
      .getByRole('checkbox', { name: 'Unchecked' })
      .nth(index)
      .locator('xpath=ancestor::label')
      .locator('[data-tokens="md-comp-checkbox"]')
      .last();
  const enabled = await computedStyle(box(0), 'border-top-color');
  const disabled = await computedStyle(box(2), 'border-top-color');
  expect(disabled).not.toBe(enabled);
  await expect(page.getByTestId('states')).toHaveScreenshot('checkbox-states.png');
});

test('slider: the tracks and the handle stay visible', async ({ page }) => {
  await openStory(page, 'components-slider--variants');
  const background = await canvas(page);
  const slider = page.getByTestId('variants').locator('[data-tokens="md-comp-slider"]').first();
  const active = slider.locator('[data-tone=active]').first();
  const inactive = slider.locator('[data-tone=inactive]').first();
  expect(await computedStyle(active, 'background-color')).not.toBe(background);
  expect(await computedStyle(inactive, 'border-top-width')).toBe('1px');
  expect(
    await computedStyle(slider.locator('[data-thumb] > *').first(), 'background-color'),
  ).not.toBe(background);
  await expect(page.getByTestId('variants')).toHaveScreenshot('slider-variants.png');
});

test('chips: elevated chips have an edge and selected chips a thicker one', async ({ page }) => {
  await openStory(page, 'components-chips--types');
  const elevated = page.getByRole('button', { name: 'Elevated assist' }).first();
  expect(await computedStyle(elevated, 'border-top-width')).toBe('1px');
  const selectedInput = page.getByRole('button', { name: 'Remove Selected' }).first();
  const chip = selectedInput.locator('xpath=ancestor::*[@data-selected][1]');
  expect(await computedStyle(chip, 'border-top-width')).toBe('2px');
  await expect(page.getByTestId('types')).toHaveScreenshot('chips-types.png');
});

test('cards: filled and elevated cards have an edge', async ({ page }) => {
  await openStory(page, 'components-card--variants');
  for (const card of await page.getByTestId('variants').locator(':scope > *').all()) {
    expect(await computedStyle(card, 'border-top-width')).toBe('1px');
  }
  await expect(page.getByTestId('variants')).toHaveScreenshot('card-variants.png');
});

test('badges and dividers stay visible', async ({ page }) => {
  await openStory(page, 'components-badge--badges');
  const background = await canvas(page);
  const small = page.getByTestId('small').locator('[data-size=small]');
  expect(await computedStyle(small, 'background-color')).not.toBe(background);
  const large = page.getByTestId('large').locator('[data-size=large]');
  expect(await computedStyle(large, 'outline-style')).toBe('solid');
  await expect(page.getByTestId('badges')).toHaveScreenshot('badges.png');

  await openStory(page, 'components-divider--dividers');
  const divider = page.getByTestId('dividers').locator(':scope > div').first();
  expect(await computedStyle(divider, 'background-color')).not.toBe(await canvas(page));
  await expect(page.getByTestId('dividers')).toHaveScreenshot('dividers.png');
});

test('sheets: an edge against the page and a visible drag handle', async ({ page }) => {
  await openStory(page, 'components-sheet--bottom');
  await page.getByRole('button', { name: 'Open sheet' }).click();
  const panel = page.getByRole('dialog', { name: 'Options' });
  await expect(panel).toBeVisible();
  expect(await computedStyle(panel, 'border-top-width')).toBe('1px');
  const bar = panel.locator('[data-slot=drag-handle]');
  expect(await computedStyle(bar, 'background-color')).not.toBe(await canvas(page));

  await openStory(page, 'components-sheet--side');
  await page.getByRole('button', { name: 'Open filters' }).click();
  const side = page.getByRole('dialog', { name: 'Filters' });
  await expect(side).toBeVisible();
  expect(await computedStyle(side, 'border-inline-start-width')).toBe('1px');
});
