import { expect, test, type Locator, type Page } from '@playwright/test';
import { MODES } from './shots';
import { openStory, type StoryGlobals } from './story';

/*
 * Web density (M3: "On web only … Increasing density decreases the top and bottom padding").
 * Every level takes 4px off a field's container (56 → 52 → 48 → 44px) and off a menu item
 * (44 → 40 → 36 → 32px). The `Density` stories render each case at every level, one column
 * per level, as `data-testid="<level>-<case>"`.
 */

const LEVELS = [0, -1, -2, -3] as const;
const VARIANTS = ['filled', 'outlined'] as const;
type Box = { x: number; y: number; width: number; height: number };

const box = async (locator: Locator): Promise<Box> => (await locator.boundingBox())!;
const container = (field: Locator) => field.locator('[data-slot="container"]').first();
const fieldHeight = (level: number) => 56 + level * 4;

/** Waits for the label's float transition (a fast spring) to settle. */
const settle = (page: Page) => page.waitForTimeout(400);

/** A press at (x, y) lands in `target` (or one of its descendants). */
async function hits(page: Page, target: Locator, x: number, y: number) {
  return target.evaluate(
    (element, [px, py]) => {
      const hit = document.elementFromPoint(px!, py!);
      return hit !== null && element.contains(hit);
    },
    [x, y],
  );
}

/**
 * The container is the level's height, its value row sits inside it, a resting label is
 * centred and a floated filled label clears the value, and a 48px band around its centre
 * still lands on it (2px of extra hit area at -3).
 */
async function checkField(
  page: Page,
  field: Locator,
  { height, level, floated }: { height: number; level: number; floated: boolean | null },
) {
  const shell = container(field);
  const c = await box(shell);
  expect(c.height).toBeCloseTo(height, 0);

  const value = field
    .locator('input:not([type="hidden"]), textarea, button[aria-haspopup]')
    .first();
  const v = await box(value);
  expect(v.y).toBeGreaterThanOrEqual(c.y - 0.5);
  expect(v.y + v.height).toBeLessThanOrEqual(c.y + c.height + 0.5);

  const label = field.locator('label[data-slot="label"]');
  if (floated !== null) {
    const l = await box(label);
    const variant = await field.getAttribute('data-variant');
    if (!floated) {
      // At rest the label is centred on the first row (56px less 4px a step, as the container).
      expect(l.y + l.height / 2 - c.y).toBeCloseTo(fieldHeight(level) / 2, 0);
    } else if (variant === 'filled') {
      expect(l.y - c.y).toBeCloseTo(8 + level * 2, 0);
      expect(l.y + l.height).toBeLessThanOrEqual(v.y + 0.5);
    } else {
      // Outlined: centred on the top border at every level.
      expect(l.y + l.height / 2 - c.y).toBeCloseTo(0, 0);
    }
  }

  const cx = c.x + c.width / 2;
  const cy = c.y + fieldHeight(level) / 2;
  expect(await hits(page, shell, cx, cy - 23.5)).toBe(true);
  expect(await hits(page, shell, cx, cy + 23.5)).toBe(true);
}

/** An icon button (or the arrow) is centred on the first row and keeps a 48×48 target. */
async function checkIconButton(field: Locator, button: Locator, level: number) {
  const c = await box(container(field));
  const b = await box(button);
  expect(b.y + b.height / 2 - c.y).toBeCloseTo(fieldHeight(level) / 2, 0);
  const target = await box(button.locator('[data-touch-target]'));
  expect(target.width).toBeGreaterThanOrEqual(48);
  expect(target.height).toBeGreaterThanOrEqual(48);
}

test.describe('Density · TextField', () => {
  for (const variant of VARIANTS) {
    test(`container heights, labels and targets · ${variant}`, async ({ page }) => {
      await openStory(page, 'components-textfield--density', {}, { variant });
      for (const level of LEVELS) {
        const field = (name: string) => page.getByTestId(`${level}-${name}`);
        const h = fieldHeight(level);
        await checkField(page, field('empty'), { height: h, level, floated: false });
        await checkField(page, field('value'), { height: h, level, floated: true });
        await checkField(page, field('no-label'), { height: h, level, floated: null });
        await checkField(page, field('icons'), { height: h, level, floated: true });
        await checkField(page, field('error'), { height: h, level, floated: true });
        await checkField(page, field('disabled'), { height: h, level, floated: true });
        await checkField(page, field('affixes'), { height: h, level, floated: true });
        // Two rows of a text area: 48px of text plus the padding.
        await checkField(page, field('text-area'), { height: h + 24, level, floated: true });
        await checkIconButton(field('icons'), field('icons').getByRole('button'), level);
        // The leading icon box never makes the field taller than the level.
        const icon = await box(field('icons').locator('[data-slot="leading-icon"]'));
        expect(icon.height).toBeCloseTo(Math.min(48, h), 0);
      }
    });

    test(`the label floats to the level's position on focus · ${variant}`, async ({ page }) => {
      await openStory(page, 'components-textfield--density', {}, { variant });
      for (const level of LEVELS) {
        const field = page.getByTestId(`${level}-empty`);
        await field.getByRole('textbox').focus();
        await settle(page);
        await checkField(page, field, { height: fieldHeight(level), level, floated: true });
      }
    });
  }

  test('inherits the density of the ThemeScope around it', async ({ page }) => {
    await openStory(page, 'components-textfield--variants', { density: '-2' });
    const field = page.getByLabel('Filled in', { exact: true }).first();
    const root = field.locator('xpath=ancestor::*[@data-field-state][1]');
    expect((await box(container(root))).height).toBeCloseTo(48, 0);
  });

  test("a field's own density wins over its scope's", async ({ page }) => {
    await openStory(page, 'components-textfield--density', { density: '-3' });
    expect((await box(container(page.getByTestId('0-value')))).height).toBeCloseTo(56, 0);
    expect((await box(container(page.getByTestId('-1-value')))).height).toBeCloseTo(52, 0);
  });
});

test.describe('Density · Select', () => {
  for (const variant of VARIANTS) {
    test(`container heights, labels and the arrow · ${variant}`, async ({ page }) => {
      await openStory(page, 'components-select--density', {}, { variant });
      for (const level of LEVELS) {
        const field = (name: string) => page.getByTestId(`${level}-${name}`);
        const h = fieldHeight(level);
        await checkField(page, field('empty'), { height: h, level, floated: false });
        await checkField(page, field('value'), { height: h, level, floated: true });
        await checkField(page, field('no-label'), { height: h, level, floated: null });
        await checkField(page, field('error'), { height: h, level, floated: false });
        await checkField(page, field('disabled'), { height: h, level, floated: true });
        const arrow = await box(field('value').locator('[data-slot="trailing-icon"] svg'));
        const c = await box(container(field('value')));
        expect(arrow.y + arrow.height / 2 - c.y).toBeCloseTo(h / 2, 0);
      }
    });
  }

  for (const level of LEVELS) {
    test(`option heights at ${level}`, async ({ page }) => {
      await openStory(page, 'components-select--density-open', {}, { density: String(level) });
      const options = page.getByRole('option');
      await expect(options).toHaveCount(4);
      await settle(page);
      for (const index of [0, 2, 3]) {
        expect((await box(options.nth(index))).height).toBeCloseTo(44 + level * 4, 0);
      }
      // With a description: two lines and 8px above and below, 2px less a step.
      expect((await box(options.nth(1))).height).toBeCloseTo(60 + level * 4, 0);
      await checkRows(page, options);
    });
  }

  test("an open menu takes its scope's density", async ({ page }) => {
    await openStory(page, 'components-select--open', { density: '-3' });
    await settle(page);
    expect((await box(page.getByRole('option').first())).height).toBeCloseTo(32, 0);
  });
});

test.describe('Density · Autocomplete', () => {
  for (const variant of VARIANTS) {
    test(`container heights, chips and the clear and arrow buttons · ${variant}`, async ({
      page,
    }) => {
      await openStory(page, 'components-autocomplete--density', {}, { variant });
      for (const level of LEVELS) {
        const field = (name: string) => page.getByTestId(`${level}-${name}`);
        const h = fieldHeight(level);
        await checkField(page, field('empty'), { height: h, level, floated: false });
        await checkField(page, field('clear'), { height: h, level, floated: true });
        await checkField(page, field('no-label'), { height: h, level, floated: null });
        await checkField(page, field('error'), { height: h, level, floated: false });
        await checkField(page, field('disabled'), { height: h, level, floated: true });
        // A filled field's floated label sits above the first row of chips: 8px more.
        const chipsHeight = variant === 'filled' ? h + 8 : h;
        const chips = field('chips');
        expect((await box(container(chips))).height).toBeCloseTo(chipsHeight, 0);
        expect((await box(container(field('chips-no-label')))).height).toBeCloseTo(h, 0);
        const chip = await box(chips.locator('[data-tokens="md-comp-input-chip"]').first());
        const chipsContainer = await box(container(chips));
        const label = await box(chips.locator('label[data-slot="label"]'));
        expect(chip.y).toBeGreaterThanOrEqual(chipsContainer.y);
        expect(chip.y + chip.height).toBeLessThanOrEqual(chipsContainer.y + chipsContainer.height);
        if (variant === 'filled') expect(label.y + label.height).toBeLessThanOrEqual(chip.y + 0.5);
        await checkIconButton(
          field('clear'),
          field('clear').getByRole('button', { name: 'Clear' }),
          level,
        );
        await checkIconButton(
          field('clear'),
          field('clear').getByRole('button', { name: 'Show options' }),
          level,
        );
      }
    });
  }
});

test.describe('Density · pickers', () => {
  test("the date fields and the time input lose 4px a step; the calendar doesn't", async ({
    page,
  }) => {
    await openStory(page, 'components-pickers--density');
    for (const level of LEVELS) {
      const h = fieldHeight(level);
      const dateField = page.getByTestId(`${level}-date-field`);
      await checkField(page, dateField, { height: h, level, floated: true });
      await checkIconButton(dateField, dateField.getByRole('button'), level);
      const dateInput = page.getByTestId(`${level}-date-input`).locator('[data-field-state]');
      await checkField(page, dateInput, { height: h, level, floated: true });
      const time = page.getByTestId(`${level}-time-input`);
      for (const name of ['Hour', 'Minute']) {
        const input = await box(time.getByRole('textbox', { name }));
        expect(input.height).toBeCloseTo(72 + level * 4, 0);
      }
    }
    // The docked calendar keeps its 48px rows at -3.
    await page.getByTestId('-3-date-field').getByRole('button', { name: 'Open calendar' }).click();
    await settle(page);
    const day = await box(page.getByRole('gridcell').nth(10));
    expect(day.height).toBeCloseTo(48, 0);
  });
});

/**
 * Rows don't overlap, and a press at each row's centre lands on it. Dense rows are below the
 * 48px touch target (M3 makes density a choice people make); they stay above WCAG 2.5.8's
 * 24px minimum.
 */
async function checkRows(page: Page, rows: Locator) {
  const count = await rows.count();
  let previousBottom = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < count; index++) {
    const row = rows.nth(index);
    const b = await box(row);
    expect(b.height).toBeGreaterThanOrEqual(24);
    expect(b.y).toBeGreaterThanOrEqual(previousBottom - 0.5);
    previousBottom = b.y + b.height;
    expect(await hits(page, row, b.x + b.width / 2, b.y + b.height / 2)).toBe(true);
  }
}

test.describe('Density · Menu', () => {
  for (const level of LEVELS) {
    test(`item heights and divider spacing at ${level}`, async ({ page }) => {
      await openStory(page, 'components-menu--density', {}, { density: String(level) });
      const items = page.getByRole('menuitemradio');
      await expect(items).toHaveCount(5);
      await settle(page);
      for (const index of [0, 2, 3, 4]) {
        expect((await box(items.nth(index))).height).toBeCloseTo(44 + level * 4, 0);
      }
      expect((await box(items.nth(1))).height).toBeCloseTo(60 + level * 4, 0);
      const divider = await box(page.getByRole('menu').getByRole('separator'));
      const above = await box(items.nth(2));
      expect(divider.y - (above.y + above.height)).toBeCloseTo(8 + level * 2, 0);
      await checkRows(page, items);
    });
  }

  test("takes its scope's density", async ({ page }) => {
    await openStory(page, 'components-menu--grouped', { density: '-3' });
    await page.getByRole('button', { name: 'More' }).click();
    await settle(page);
    expect((await box(page.getByRole('menuitem', { name: 'Delete' }))).height).toBeCloseTo(32, 0);
  });
});

test.describe('Density · screenshots', () => {
  const stories: [string, string, Record<string, string>[]][] = [
    [
      'textfield',
      'components-textfield--density',
      [{ variant: 'filled' }, { variant: 'outlined' }],
    ],
    ['select', 'components-select--density', [{ variant: 'filled' }, { variant: 'outlined' }]],
    [
      'autocomplete',
      'components-autocomplete--density',
      [{ variant: 'filled' }, { variant: 'outlined' }],
    ],
    ['pickers', 'components-pickers--density', [{}]],
  ];
  for (const [name, id, argSets] of stories) {
    for (const args of argSets) {
      for (const mode of MODES) {
        const suffix = [name, args.variant, mode].filter(Boolean).join('-');
        test(`${suffix}`, async ({ page }) => {
          await openStory(page, id, { mode } satisfies StoryGlobals, args);
          await expect(page.getByTestId('density')).toHaveScreenshot(`density-${suffix}.png`);
        });
      }
    }
  }

  test('textfield · rtl', async ({ page }) => {
    await openStory(page, 'components-textfield--density', { dir: 'rtl' }, { variant: 'outlined' });
    await expect(page.getByTestId('density')).toHaveScreenshot('density-textfield-rtl.png');
  });

  for (const level of LEVELS) {
    for (const mode of MODES) {
      test(`menu ${level} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-menu--density', { mode }, { density: String(level) });
        await settle(page);
        await expect(page).toHaveScreenshot(`density-menu-${level}-${mode}.png`, {
          clip: { x: 0, y: 0, width: 420, height: 440 },
        });
      });
    }
  }
});
