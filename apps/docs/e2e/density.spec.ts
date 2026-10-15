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
    } else if (variant === 'filled' && level <= -2) {
      // Below 52px there's no room for a floated label (MDC hides it): it's hidden and the
      // value is centred, as in a field without a label (2026-10-15).
      await expect.poll(() => label.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
      if ((await value.evaluate((el) => el.tagName)) === 'TEXTAREA') {
        // A text area keeps its rows: the padding above and below is the unlabelled one.
        const padding = await value.evaluate((el) => {
          const style = getComputedStyle(el.parentElement!);
          return [style.paddingTop, style.paddingBottom];
        });
        expect(padding).toEqual([`${16 + level * 2}px`, `${16 + level * 2}px`]);
      } else {
        expect(v.y + v.height / 2 - c.y).toBeCloseTo(fieldHeight(level) / 2, 0);
      }
    } else if (variant === 'filled') {
      expect(l.y - c.y).toBeCloseTo(8 + level * 2, 0);
      expect(l.y + l.height).toBeLessThanOrEqual(v.y + 0.5);
      expect(await label.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
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

  for (const level of LEVELS) {
    test(`the search field at ${level}`, async ({ page }) => {
      await openStory(
        page,
        'components-select--density-searchable',
        {},
        {
          density: String(level),
        },
      );
      await settle(page);
      const search = page.getByRole('searchbox').locator('xpath=..');
      const s = await box(search);
      expect(s.height).toBeCloseTo(48 + level * 4, 0);
      // The leading icon never makes the field taller.
      expect((await box(search.locator('[data-slot="leading"]'))).height).toBeCloseTo(s.height, 0);
      // Up to 4px more below (the gap above the list) and above (the panel's padding): 48px
      // at -1 and -2, 44px at -3, never reaching the first option.
      const below = Math.min(4, -2 * level);
      const above = Math.min(4, -4 * level - below);
      expect(s.height + above + below).toBeGreaterThanOrEqual(level === -3 ? 44 : 48);
      const x = s.x + s.width / 2;
      expect(await hits(page, search, x, s.y - above + 0.5)).toBe(true);
      expect(await hits(page, search, x, s.y + s.height + below - 0.5)).toBe(true);
      const first = page.getByRole('option').first();
      const o = await box(first);
      expect(o.y).toBeGreaterThanOrEqual(s.y + s.height + below - 0.5);
      expect(await hits(page, first, x, o.y + 0.5)).toBe(true);
      expect((await box(first)).height).toBeCloseTo(44 + level * 4, 0);
      await page.getByRole('searchbox').blur();
      await page.mouse.click(x, s.y - above + 1);
      await expect(page.getByRole('searchbox')).toBeFocused();
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
    test(`select search ${level}`, async ({ page }) => {
      await openStory(
        page,
        'components-select--density-searchable',
        {},
        {
          density: String(level),
        },
      );
      await settle(page);
      await expect(page).toHaveScreenshot(`density-select-search-${level}.png`, {
        clip: { x: 0, y: 0, width: 420, height: 440 },
      });
    });
  }

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

/*
 * Controls (2026-10-15). Checkboxes, radio buttons, switches, chips, icon buttons, tabs and list
 * items take 4px a step off their containers or state layers, after Material Components Web's
 * density (checkbox and radio 40 → 28px, switch state layer 48 → 28px, chips 32 → 24px, icon
 * button 48 → 28px, tabs 48 → 32px, list items 4px a step). Targets stay 48px where nothing
 * stacked sits next to them; tabs and list items are adjacent rows.
 */

const center = (b: Box) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });

/** A press anywhere on `target`'s own box, 1px inside each edge, lands on it. */
async function ownsItsBox(page: Page, target: Locator) {
  const b = await box(target);
  const { x, y } = center(b);
  for (const [px, py] of [
    [x, b.y + 1],
    [x, b.y + b.height - 1],
    [b.x + 1, y],
    [b.x + b.width - 1, y],
  ] as const) {
    expect(await hits(page, target, px, py), `${px},${py}`).toBe(true);
  }
}

/** A 48 × 48px touch target centred on `on`, from the `[data-touch-target]` inside `scope`. */
async function checkTouchTarget(scope: Locator, on: Locator) {
  const t = await box(scope.locator('[data-touch-target]').first());
  expect(t.width).toBeGreaterThanOrEqual(48);
  expect(t.height).toBeCloseTo(48, 0);
  const c = center(await box(on));
  expect(center(t).x).toBeCloseTo(c.x, 0);
  expect(center(t).y).toBeCloseTo(c.y, 0);
}

test.describe('Density · Checkbox', () => {
  test('the state layer loses 4px a step; the box and target stay', async ({ page }) => {
    await openStory(page, 'components-checkbox--density');
    for (const level of LEVELS) {
      for (const name of ['unchecked', 'checked', 'indeterminate', 'invalid', 'disabled']) {
        const root = page.getByTestId(`${level}-${name}`);
        const control = root.locator('[data-selection-control]');
        const c = await box(control);
        expect(c.width).toBeCloseTo(40 + level * 4, 0);
        expect(c.height).toBeCloseTo(40 + level * 4, 0);
        expect((await box(control.locator('[data-slot="box"]'))).width).toBeCloseTo(18, 0);
        await checkTouchTarget(root, control);
        await ownsItsBox(page, root);
      }
      const bare = page.getByTestId(`${level}-unlabelled`);
      const { x, y } = center(await box(bare));
      expect(await hits(page, bare, x, y - 23.5)).toBe(true);
      expect(await hits(page, bare, x + 23.5, y)).toBe(true);
    }
  });

  test("inherits its scope's density; its own wins; right to left", async ({ page }) => {
    await openStory(page, 'components-checkbox--states', { density: '-2' });
    const first = page.locator('[data-selection-control]').first();
    expect((await box(first)).width).toBeCloseTo(32, 0);
    await openStory(page, 'components-checkbox--density', { density: '-3', dir: 'rtl' });
    const own = page.getByTestId('0-checked');
    const control = await box(own.locator('[data-selection-control]'));
    expect(control.width).toBeCloseTo(40, 0);
    // The control sits at the start, which is the right in RTL.
    const dense = page.getByTestId('-3-checked');
    const r = await box(dense);
    const d = await box(dense.locator('[data-selection-control]'));
    expect(d.width).toBeCloseTo(28, 0);
    expect(d.x + d.width).toBeCloseTo(r.x + r.width, 0);
  });
});

test.describe('Density · Radio', () => {
  test('rows come 2px closer a step; no target reaches the next ring', async ({ page }) => {
    await openStory(page, 'components-radio--density');
    for (const level of LEVELS) {
      const group = page.getByTestId(`${level}-vertical`);
      const options = group.locator('label');
      await expect(options).toHaveCount(4);
      let previous: Box | null = null;
      for (let index = 0; index < 4; index++) {
        const option = options.nth(index);
        const control = option.locator('[data-selection-control]');
        const c = await box(control);
        expect(c.height).toBeCloseTo(40 + level * 4, 0);
        await checkTouchTarget(option, control);
        await ownsItsBox(page, option);
        const ring = await box(control.locator('[aria-hidden="true"]').last());
        expect(ring.width).toBeCloseTo(20, 0);
        if (previous) {
          // 2px more between rows per step (0 at density 0)…
          expect(c.y - (previous.y + previous.height)).toBeCloseTo(-2 * level, 0);
          // …so the row above's 48px target ends at or above this ring.
          const target = await box(options.nth(index - 1).locator('[data-touch-target]'));
          expect(target.y + target.height).toBeLessThanOrEqual(ring.y + 0.5);
        }
        previous = c;
      }
      const row = page.getByTestId(`${level}-horizontal`).locator('label');
      for (let index = 0; index < 3; index++) {
        await checkTouchTarget(row.nth(index), row.nth(index).locator('[data-selection-control]'));
        await ownsItsBox(page, row.nth(index));
      }
    }
  });

  test("a group's density reaches its options", async ({ page }) => {
    await openStory(page, 'components-radio--states', { density: '-3' });
    const control = page.locator('[data-selection-control]').first();
    expect((await box(control)).height).toBeCloseTo(28, 0);
  });
});

test.describe('Density · Switch', () => {
  test('only the state layer shrinks, to 32px', async ({ page }) => {
    await openStory(page, 'components-switch--density');
    for (const level of LEVELS) {
      for (const name of ['off', 'on', 'icons', 'disabled']) {
        const root = page.getByTestId(`${level}-${name}`);
        const track = root.locator('[data-selection-control]');
        const t = await box(track);
        expect(t.width).toBeCloseTo(52, 0);
        expect(t.height).toBeCloseTo(32, 0);
        const layer = await box(track.locator('.state-layer'));
        const size = Math.max(32, 40 + level * 4);
        expect(layer.width).toBeCloseTo(size, 0);
        // Centred on the thumb.
        const thumb = await box(track.locator('[data-slot="thumb"]'));
        expect(center(layer).x).toBeCloseTo(center(thumb).x, 0);
        expect(center(layer).y).toBeCloseTo(center(thumb).y, 0);
        await checkTouchTarget(root, track);
      }
    }
  });

  test('right to left, from its scope', async ({ page }) => {
    await openStory(page, 'components-switch--states', { density: '-3', dir: 'rtl' });
    const track = page.locator('[data-selection-control]').first();
    const layer = await box(track.locator('.state-layer'));
    const thumb = await box(track.locator('[data-slot="thumb"]'));
    expect(layer.width).toBeCloseTo(32, 0);
    expect(center(layer).x).toBeCloseTo(center(thumb).x, 0);
  });
});

/** The chips of a set (each kind's container) and their boxes. */
const chipsOf = (set: Locator) => set.locator(':scope > [data-tokens*="-chip"]');

test.describe('Density · Chips', () => {
  test('chips lose 4px a step to 24px; targets stay 48px and clear of other rows', async ({
    page,
  }) => {
    await openStory(page, 'components-chips--density');
    for (const level of LEVELS) {
      const height = Math.max(24, 32 + level * 4);
      const set = page.getByTestId(`${level}-wrap`);
      const chips = chipsOf(set);
      const count = await chips.count();
      expect(count).toBe(7);
      const boxes: Box[] = [];
      for (let index = 0; index < count; index++) boxes.push(await box(chips.nth(index)));
      expect(new Set(boxes.map((b) => Math.round(b.y))).size).toBeGreaterThan(1);
      for (let index = 0; index < count; index++) {
        const chip = chips.nth(index);
        expect(boxes[index]!.height).toBeCloseTo(height, 0);
        const targets = chip.locator('[data-touch-target]');
        for (let t = 0; t < (await targets.count()); t++) {
          const target = await box(targets.nth(t));
          expect(target.height).toBeCloseTo(48, 0);
          expect(target.width).toBeGreaterThanOrEqual(48);
          // A target never reaches into another chip's container.
          for (const [other, b] of boxes.entries()) {
            if (other === index) continue;
            const overlapX =
              Math.min(target.x + target.width, b.x + b.width) - Math.max(target.x, b.x);
            const overlapY =
              Math.min(target.y + target.height, b.y + b.height) - Math.max(target.y, b.y);
            expect(Math.min(overlapX, overlapY), `chip ${index} → ${other}`).toBeLessThanOrEqual(
              0.5,
            );
          }
        }
        await ownsItsBox(page, chip);
      }
      // Rows 8px apart, 2px more a step (12px at -2 and -3).
      const rows = [...new Set(boxes.map((b) => Math.round(b.y)))].sort((a, b) => a - b);
      expect(rows[1]! - rows[0]! - height).toBeCloseTo(8 + Math.min(4, -2 * level), 0);
      // The avatar and the remove button fit inside a flat chip's border.
      const input = chips.nth(4);
      const avatar = await box(input.locator('[data-slot="leading"] > span'));
      expect(avatar.height).toBeLessThanOrEqual(height - 2 + 0.5);
      const remove = await box(input.getByRole('button'));
      expect(remove.height).toBeLessThanOrEqual(height - 2 + 0.5);
      // A scrolling set keeps its targets inside the scroll area.
      const scroll = page.getByTestId(`${level}-scroll`);
      const area = await box(scroll);
      const first = await box(chipsOf(scroll).first().locator('[data-touch-target]').first());
      expect(first.y).toBeGreaterThanOrEqual(area.y - 0.5);
      expect(first.y + first.height).toBeLessThanOrEqual(area.y + area.height + 0.5);
    }
  });

  test("chips take their scope's density; right to left", async ({ page }) => {
    await openStory(page, 'components-chips--types', { density: '-2', dir: 'rtl' });
    const chip = page.locator('[data-tokens*="-chip"]').first();
    expect((await box(chip)).height).toBeCloseTo(24, 0);
  });
});

/** Icon button heights and widths at density 0, per size and width. */
const ICON_BUTTON = {
  xs: { h: 32, narrow: 28, default: 32, wide: 40, min: 24 },
  sm: { h: 40, narrow: 32, default: 40, wide: 52, min: 28 },
  md: { h: 56, narrow: 48, default: 56, wide: 72, min: 0 },
  lg: { h: 96, narrow: 64, default: 96, wide: 128, min: 0 },
  xl: { h: 136, narrow: 104, default: 136, wide: 184, min: 0 },
} as const;

test.describe('Density · IconButton', () => {
  test('every size and width loses 4px a step; targets stay 48px', async ({ page }) => {
    await openStory(page, 'components-iconbutton--density');
    for (const level of LEVELS) {
      for (const [size, spec] of Object.entries(ICON_BUTTON)) {
        for (const width of ['narrow', 'default', 'wide'] as const) {
          const button = page.getByTestId(`${level}-${size}-${width}`);
          await button.scrollIntoViewIfNeeded();
          const b = await box(button);
          expect(b.height, `${size} ${width}`).toBeCloseTo(
            Math.max(spec.min, spec.h + level * 4),
            0,
          );
          expect(b.width, `${size} ${width}`).toBeCloseTo(
            Math.max(spec.min, spec[width] + level * 4),
            0,
          );
          // A 48px band through the centre lands on the button (the rows are far apart)…
          const { x, y } = center(b);
          expect(await hits(page, button, x, y - 23.5)).toBe(true);
          expect(await hits(page, button, x, y + 23.5)).toBe(true);
          // …and the target is at least 48 × 48px: `TouchTarget` at XS and S, the content's
          // `::after` at M, the container itself at L and XL.
          const target = await button.evaluate((el) => {
            const own = el.querySelector('[data-touch-target]');
            if (own) return own.getBoundingClientRect();
            const after = getComputedStyle(el.firstElementChild!, '::after');
            return after.content === 'none'
              ? el.getBoundingClientRect()
              : { width: parseFloat(after.width), height: parseFloat(after.height) };
          });
          expect(target.width).toBeGreaterThanOrEqual(48);
          expect(target.height).toBeGreaterThanOrEqual(48);
        }
      }
      // Round corners stay full at the dense height.
      const xs = page.getByTestId(`${level}-xs-default`);
      const radius = await xs.evaluate((el) =>
        parseFloat(getComputedStyle(el).borderTopLeftRadius),
      );
      expect(radius).toBeCloseTo((await box(xs)).height / 2, 0);
      expect((await box(page.getByTestId(`${level}-toggle`))).height).toBeCloseTo(
        40 + level * 4,
        0,
      );
    }
  });

  test("inherits its scope's density; icon buttons in a field keep theirs", async ({ page }) => {
    await openStory(page, 'components-iconbutton--variants', { density: '-3' });
    expect((await box(page.getByRole('button').first())).height).toBeCloseTo(28, 0);
    await openStory(page, 'components-textfield--density', { density: '-3' });
    const clear = page.getByTestId('-3-icons').getByRole('button', { name: 'Clear' });
    expect((await box(clear)).height).toBeCloseTo(40, 0);
  });
});

test.describe('Density · ButtonGroup', () => {
  test('groups of icon buttons follow; no target reaches a neighbour', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--density');
    for (const level of LEVELS) {
      for (const size of ['xs', 'sm', 'md'] as const) {
        const group = page.getByTestId(`${level}-standard-${size}`);
        const buttons = group.getByRole('button');
        await expect(buttons).toHaveCount(3);
        const spec = ICON_BUTTON[size];
        const g = await box(group);
        expect(g.height).toBeCloseTo(Math.max(spec.min, spec.h + level * 4), 0);
        for (let index = 0; index < 3; index++) await ownsItsBox(page, buttons.nth(index));
      }
      const connected = page.getByTestId(`${level}-connected-xs`).getByRole('button');
      for (let index = 0; index < 3; index++) {
        const b = await box(connected.nth(index));
        expect(b.width).toBeGreaterThanOrEqual(48);
        expect(b.height).toBeCloseTo(Math.max(24, 32 + level * 4), 0);
        await ownsItsBox(page, connected.nth(index));
      }
    }
  });
});

test.describe('Density · Tabs', () => {
  test('tabs lose 4px a step; adjacent tabs keep their own full-height targets', async ({
    page,
  }) => {
    await openStory(page, 'components-tabs--density');
    for (const level of LEVELS) {
      for (const [name, base] of [
        ['text', 48],
        ['icon-top', 64],
        ['icon-start', 48],
        ['icon-only', 48],
        ['panel', 48],
      ] as const) {
        const tabs = page.getByTestId(`${level}-${name}`).getByRole('tab');
        const count = await tabs.count();
        let previous: Box | null = null;
        for (let index = 0; index < count; index++) {
          const b = await box(tabs.nth(index));
          expect(b.height, name).toBeCloseTo(base + level * 4, 0);
          expect(b.height).toBeGreaterThanOrEqual(24);
          if (previous) expect(b.x).toBeGreaterThanOrEqual(previous.x + previous.width - 0.5);
          await ownsItsBox(page, tabs.nth(index));
          previous = b;
        }
      }
      // The panel keeps density 0: its paragraph's 16px padding.
      const panel = page.getByTestId(`${level}-panel`).getByRole('tabpanel');
      expect(
        await panel.evaluate((el) =>
          getComputedStyle(el).getPropertyValue('--md-sys-density').trim(),
        ),
      ).toBe('0');
    }
  });

  test("tabs take their scope's density; right to left", async ({ page }) => {
    await openStory(page, 'components-tabs--variants', { density: '-3', dir: 'rtl' });
    const tab = page.getByRole('tab').first();
    expect((await box(tab)).height).toBeCloseTo(36, 0);
    await ownsItsBox(page, tab);
  });
});

test.describe('Density · List', () => {
  test('items and subheaders lose 4px a step; rows never overlap', async ({ page }) => {
    // Tall enough that every row can be pressed without scrolling.
    await page.setViewportSize({ width: 1280, height: 1000 });
    await openStory(page, 'components-list--density');
    for (const level of LEVELS) {
      const lines = page.getByTestId(`${level}-lines`).getByRole('row');
      await expect(lines).toHaveCount(4);
      // One line (56px), an avatar with two lines (72px), three lines (88px), and a 56px
      // image with 10px above and below (76px): 4px less a step.
      for (const [index, base] of [56, 72, 88, 76].entries()) {
        expect((await box(lines.nth(index))).height, `item ${index}`).toBeCloseTo(
          base + level * 4,
          0,
        );
      }
      await checkRows(page, lines);
      const nested = page.getByTestId(`${level}-nested`).getByRole('row');
      await expect(nested).toHaveCount(4);
      for (let index = 0; index < 4; index++) {
        expect((await box(nested.nth(index))).height).toBeCloseTo(56 + level * 4, 0);
      }
      await checkRows(page, nested);
      // The chevron's target stays inside its row (48px, 44px at -3).
      const row = await box(nested.first());
      const chevron = await box(nested.first().locator('[data-touch-target]'));
      expect(chevron.height).toBeCloseTo(Math.min(48, 56 + level * 4), 0);
      expect(chevron.y).toBeGreaterThanOrEqual(row.y - 0.5);
      expect(chevron.y + chevron.height).toBeLessThanOrEqual(row.y + row.height + 0.5);
      const sections = page.getByTestId(`${level}-sections`);
      const header = sections.getByText('Privacy', { exact: true });
      expect((await box(header)).height).toBeCloseTo(48 + level * 4, 0);
      await checkRows(page, sections.locator('li:not(:has(li))'));
    }
  });

  test("a list takes its scope's density", async ({ page }) => {
    await openStory(page, 'components-list--static', { density: '-3' });
    const items = page.getByRole('listitem');
    expect((await box(items.first())).height).toBeGreaterThanOrEqual(44 - 0.5);
    await checkRows(page, items);
  });
});

test.describe('Density · control screenshots', () => {
  for (const name of [
    'checkbox',
    'radio',
    'switch',
    'chips',
    'iconbutton',
    'buttongroup',
    'tabs',
    'list',
  ]) {
    for (const mode of MODES) {
      test(`${name} · ${mode}`, async ({ page }) => {
        const title = name === 'buttongroup' ? 'composites' : 'components';
        await openStory(page, `${title}-${name}--density`, { mode });
        await settle(page);
        await expect(page.getByTestId('density')).toHaveScreenshot(`density-${name}-${mode}.png`);
      });
    }
  }
});

test.describe('Density · icon buttons in parts that keep their size', () => {
  /** The size of every icon button in the story, in document order (portalled ones too). */
  const iconButtonSizes = (page: Page) =>
    page.locator('[data-tokens="md-comp-icon-button"]').evaluateAll((buttons) =>
      buttons.map((button) => {
        const { width, height } = button.getBoundingClientRect();
        return `${button.getAttribute('aria-label')}: ${Math.round(width)} × ${Math.round(height)}`;
      }),
    );

  for (const id of [
    'components-topappbar--variants',
    'components-search--app-bar',
    'components-toolbar--docked',
    'components-toolbar--floating',
    'components-toolbar--with-fab',
    'components-navigation--rail',
    'components-dialog--full-screen',
    'components-sheet--side',
  ]) {
    test(`${id}: the same sizes at -3 as at 0`, async ({ page }) => {
      const open = async (density: '0' | '-3') => {
        await openStory(page, id, { density });
        // Dialog and sheet stories open from a trigger.
        const trigger = page.locator('#storybook-root button').first();
        if (/dialog|sheet/.test(id)) {
          await trigger.click();
          await page.getByRole('dialog').first().waitFor();
          await page.evaluate(() =>
            Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined))),
          );
        }
        return iconButtonSizes(page);
      };
      const atZero = await open('0');
      expect(atZero.length).toBeGreaterThan(0);
      expect(await open('-3')).toEqual(atZero);
    });
  }

  test('a standalone icon button still shrinks', async ({ page }) => {
    await openStory(page, 'components-iconbutton--variants', { density: '0' });
    const atZero = await iconButtonSizes(page);
    await openStory(page, 'components-iconbutton--variants', { density: '-3' });
    const dense = await iconButtonSizes(page);
    expect(dense.length).toBe(atZero.length);
    expect(dense).not.toEqual(atZero);
  });
});
