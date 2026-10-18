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
  page.evaluate(
    () =>
      new Promise((resolve) =>
        Promise.all(document.getAnimations().map((animation) => animation.finished)).then(resolve),
      ),
  );

test.describe('Search visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`collapsed · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-search--collapsed', { theme, mode });
        await expect(page.getByTestId('collapsed')).toHaveScreenshot(
          `collapsed-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const mode of MODES) {
    test(`docked expanded · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-search--docked-expanded', { mode });
      await expect(page.getByRole('dialog')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`docked-expanded-${mode}.png`);
    });

    test(`full screen expanded · ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width: 412, height: 640 });
      await openStory(page, 'components-search--full-screen-expanded', { mode });
      await expect(page.getByRole('dialog')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`full-screen-expanded-${mode}.png`);
    });

    test(`app bar · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-search--app-bar', { mode });
      await expect(page.getByTestId('scroller')).toHaveScreenshot(`app-bar-${mode}.png`);
    });
  }
});

test.describe('Search geometry and behaviour', () => {
  test('the field is 56px with Compose icon and text positions', async ({ page }) => {
    await openStory(page, 'components-search--collapsed');
    const field = page.getByRole('combobox').first();
    const pill = await rect(field.locator('..'));
    expect(pill).toMatchObject({ width: 360, height: 56 });
    const input = await rect(field);
    expect(input.x - pill.x).toBe(52);
    const mic = await rect(page.getByRole('button', { name: 'Voice search' }).first());
    // A 40px icon button centred in the 48px box 4px from the end.
    expect(pill.x + pill.width - (mic.x + mic.width)).toBe(8);
  });

  test('docked: the expanded field covers the bar and the dropdown hangs 2px below', async ({
    page,
  }) => {
    await openStory(page, 'components-search--playground');
    const collapsed = await rect(page.getByTestId('search'));
    await page.getByRole('combobox').click();
    const dialog = page.getByRole('dialog', { name: 'Search mail' });
    await expect(dialog).toBeVisible();
    await settle(page);
    const expandedInput = dialog.getByRole('searchbox');
    await expect(expandedInput).toBeFocused();
    // M3 Expressive: the focused bar widens by 12px on each side (margins 24 → 12dp).
    const panel = await rect(dialog);
    expect(panel).toMatchObject({
      x: collapsed.x - 12,
      y: collapsed.y,
      width: collapsed.width + 24,
    });
    const dropdown = await rect(dialog.locator('> div').nth(1));
    expect(dropdown.y).toBe(collapsed.y + 58);
    expect(
      await dialog
        .locator('> div')
        .nth(1)
        .evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    ).toBe('12px');

    // With the bar, the docked view is at least 240px tall, even with no suggestions.
    await page.keyboard.type('zzz');
    await expect(page.getByText('No suggestions')).toBeVisible();
    expect((await rect(dialog.locator('> div').nth(1))).height + 58).toBeGreaterThanOrEqual(240);
    // The change is announced.
    await expect(dialog.getByRole('status')).toHaveText('0 suggestions');
    for (let i = 0; i < 3; i += 1) await page.keyboard.press('Backspace');

    // Type to filter, ↓ into the suggestions, Enter picks one and collapses.
    await page.keyboard.type('fl');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Flight confirmation' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('submitted')).toHaveText('Searched: Flight confirmation');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('combobox')).toBeFocused();
  });

  test('docked: the focused field is 56px, centred on a shorter bar', async ({ page }) => {
    await openStory(page, 'components-search--app-bar', {}, { wide: true });
    const bar = page.getByTestId('app-bar-search');
    // In the app bar the collapsed field is 56px; a consumer can make it shorter.
    expect((await rect(bar)).height).toBe(56);
    await bar.evaluate((el) => (el.style.height = '48px'));
    const collapsed = await rect(bar);
    await page.getByRole('combobox').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await settle(page);
    // M3: "Search bar container Height 56dp" for the focused bar.
    const field = await rect(dialog.getByRole('searchbox').locator('..'));
    expect(field).toMatchObject({ y: collapsed.y - 4, height: 56, width: collapsed.width + 24 });
  });

  test('docked: Escape and a press on the scrim collapse it', async ({ page }) => {
    await openStory(page, 'components-search--playground');
    await page.getByRole('combobox').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    // Focus returns to the bar once the view has landed on it.
    await expect(page.getByRole('combobox')).toBeFocused();
    await page.getByRole('combobox').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(700, 500);
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  // A leaving docked view is invisible over the bar for a while (the spring's tail); a
  // press there used to run one of its suggestions (2026-10-15).
  for (const wait of [100, 250]) {
    test(`docked: a press on the bar ${wait}ms after Escape reaches the bar`, async ({ page }) => {
      await openStory(page, 'components-search--playground', {}, { view: 'docked' });
      const bar = await rect(page.getByTestId('search'));
      const before = await page.getByTestId('submitted').textContent();
      await page.getByRole('combobox').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await settle(page);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(wait);
      await page.mouse.click(bar.x + 100, bar.y + 40);
      await page.waitForTimeout(300);
      await expect(page.getByTestId('submitted')).toHaveText(before!);
    });
  }

  test('the pill keeps a visible edge in forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openStory(page, 'components-search--collapsed');
    const pill = page.getByRole('combobox').first().locator('..');
    expect(
      await pill.evaluate((el) => {
        const style = getComputedStyle(el);
        return { style: style.borderTopStyle, width: style.borderTopWidth };
      }),
    ).toEqual({ style: 'solid', width: '1px' });
  });

  test('full screen: the surface grows to the window and the field moves to the top', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 412, height: 640 });
    await openStory(page, 'components-search--playground', {}, { view: 'full-screen' });
    await page.getByRole('combobox').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await settle(page);
    expect(await rect(dialog)).toMatchObject({ x: 0, y: 0, width: 412, height: 640 });
    expect(await dialog.evaluate((el) => getComputedStyle(el).clipPath)).toMatch(/inset\(0px/);
    // The contained style: the filled field sits 16px from each side on a
    // surface-container-low view.
    const field = await rect(dialog.getByRole('searchbox').locator('..'));
    expect(field).toMatchObject({ x: 16, y: 8, width: 380, height: 56 });
    const [view, pill] = await Promise.all([
      dialog.evaluate((el) => getComputedStyle(el).backgroundColor),
      dialog
        .getByRole('searchbox')
        .locator('..')
        .evaluate((el) => getComputedStyle(el).backgroundColor),
    ]);
    expect(pill).not.toBe(view);
    await dialog.getByRole('button', { name: 'Back' }).click();
    await expect(dialog).toBeHidden();
  });

  test('by default: full screen on a compact window, docked from 600px wide', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 640 });
    await openStory(page, 'components-search--playground');
    await page.getByRole('combobox').click();
    const dialog = page.getByRole('dialog');
    await settle(page);
    // M3: "Full-screen layout: Default for compact breakpoints".
    expect(await rect(dialog)).toMatchObject({ x: 0, y: 0, width: 412, height: 640 });
    await dialog.getByRole('button', { name: 'Back' }).click();
    await expect(dialog).toBeHidden();

    // "Docked layout: Best for medium and expanded windows."
    await page.setViewportSize({ width: 600, height: 640 });
    await expect(page.getByTestId('search')).toHaveAttribute('data-view', 'docked');
    await page.getByRole('combobox').click();
    await settle(page);
    expect((await rect(dialog)).width).toBeLessThan(600);
  });

  test('typing into the collapsed bar expands it with the query', async ({ page }) => {
    await openStory(page, 'components-search--playground');
    await page.getByRole('combobox').focus();
    await page.keyboard.type('h');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('searchbox')).toHaveValue('h');
    await expect(dialog.getByRole('searchbox')).toBeFocused();
  });

  test('two trailing icon buttons, or an avatar at 30px; centred text', async ({ page }) => {
    await openStory(page, 'components-search--collapsed');
    const two = page.getByTestId('two-trailing');
    const voice = await rect(two.getByRole('button', { name: 'Voice search' }));
    const clear = await rect(two.getByRole('button', { name: 'Clear' }));
    expect(clear.x).toBeGreaterThan(voice.x + voice.width - 1);
    const avatar = await rect(page.getByRole('img', { name: 'Account' }));
    expect(avatar).toMatchObject({ width: 30, height: 30 });
    expect(
      await page
        .getByTestId('avatar')
        .getByRole('combobox')
        .evaluate((el) => getComputedStyle(el).textAlign),
    ).toBe('center');
  });

  // Compose lays two 48dp buttons side by side; 40px buttons with no gap overlapped their
  // targets by 8px, and the first target reached the text (2026-10-15).
  test("two trailing buttons' 48px targets meet edge to edge, 4px from the text", async ({
    page,
  }) => {
    await openStory(page, 'components-search--collapsed');
    const two = page.getByTestId('two-trailing');
    const voice = await rect(two.getByRole('button', { name: 'Voice search' }));
    const clear = await rect(two.getByRole('button', { name: 'Clear' }));
    // Each 40px button's target reaches 4px past it.
    expect(clear.x - 4 - (voice.x + voice.width + 4)).toBe(0);
    const input = two.getByRole('combobox');
    const textEnd = await input.evaluate((el) => {
      const box = el.getBoundingClientRect();
      return Math.round(box.right - parseFloat(getComputedStyle(el).paddingInlineEnd));
    });
    expect(voice.x - 4 - textEnd).toBe(4);
  });

  // The slots pass their colour (and their icon colour tokens) to icon buttons.
  test('icon buttons in the slots take the icon colour tokens', async ({ page }) => {
    await openStory(page, 'components-search--collapsed');
    const two = page.getByTestId('two-trailing');
    await two.evaluate((el) =>
      el.style.setProperty('--md-comp-search-bar-trailing-icon-color', 'rgb(0, 0, 250)'),
    );
    const voice = two.getByRole('button', { name: 'Voice search' });
    await expect
      .poll(() => voice.locator('svg').evaluate((el) => getComputedStyle(el).color))
      .toBe('rgb(0, 0, 250)');
  });

  test('in an app bar the field fills the free space up to 312px, then half of it', async ({
    page,
  }) => {
    await openStory(page, 'components-search--app-bar');
    // Narrow: the free space is under 312px, so the field fills it (less 8px each side).
    const narrowSlot = await rect(page.getByTestId('app-bar-search').locator('..'));
    const narrow = await rect(page.getByTestId('app-bar-search'));
    expect(narrowSlot.width - 16).toBeLessThan(312);
    expect(narrow.width).toBe(narrowSlot.width - 16);
    await openStory(page, 'components-search--app-bar', {}, { wide: true });
    const slot = await rect(page.getByTestId('app-bar-search').locator('..'));
    const wide = await rect(page.getByTestId('app-bar-search'));
    expect(Math.abs(wide.width - (slot.width - 16) / 2)).toBeLessThanOrEqual(1);
    // Centred in the free space.
    expect(
      Math.abs(wide.x - slot.x - (slot.x + slot.width - (wide.x + wide.width))),
    ).toBeLessThanOrEqual(1);
  });

  test('the app bar hides on scroll down and returns on scroll up', async ({ page }) => {
    await openStory(page, 'components-search--app-bar');
    const scroller = page.getByTestId('scroller');
    const frame = () =>
      page.evaluate(
        () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
      );
    await scroller.evaluate((el) => el.scrollTo(0, 400));
    await frame();
    const top = (await rect(scroller)).y;
    expect((await rect(page.getByTestId('bar'))).y + 64).toBeLessThanOrEqual(top + 1);
    await scroller.evaluate((el) => el.scrollTo(0, 200));
    await frame();
    expect((await rect(page.getByTestId('bar'))).y).toBe(top + 1);
    await expect(page.getByTestId('bar')).toHaveAttribute('data-scrolled', 'true');
  });
});

test.describe('Search layout safety', () => {
  layoutSafetySuite('components-search--layout-override', {
    height: 56,
    width: 360,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      await target.getByRole('button', { name: 'Voice search' }).click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
      expect(
        await target
          .locator('> div')
          .first()
          .evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
      ).not.toBe('0px');
    },
  });
});

test.describe('Search under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the full-screen view fades in over the window instead of growing', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 640 });
    await openStory(page, 'components-search--playground', {}, { view: 'full-screen' });
    await page.getByRole('combobox').click();
    const dialog = page.getByRole('dialog');
    const style = await dialog.evaluate((el) => {
      const computed = getComputedStyle(el);
      return { clip: computed.clipPath, property: computed.transitionProperty };
    });
    expect(style).toEqual({ clip: 'inset(0px)', property: 'opacity' });
    // The field is in place at once.
    expect(await rect(dialog.getByRole('searchbox').locator('..'))).toMatchObject({
      x: 16,
      y: 8,
    });
    await dialog.getByRole('button', { name: 'Back' }).click();
    await expect(dialog).toBeHidden();
  });

  test('the docked view is at its focused width at once and the dropdown only fades', async ({
    page,
  }) => {
    await openStory(page, 'components-search--playground', {}, { view: 'docked' });
    const bar = await rect(page.getByTestId('search'));
    await page.getByRole('combobox').click();
    const dialog = page.getByRole('dialog');
    expect((await rect(dialog)).width).toBe(bar.width + 24);
    const translate = await dialog
      .locator('[tabindex="-1"]')
      .last()
      .evaluate((el) => getComputedStyle(el).translate);
    expect(translate).toMatch(/^(none|0px)$/);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test.describe('Search text padding', () => {
  /**
   * The text's start and end (the input's content box) against the pill, the leading slot
   * and the first trailing tap target, in reading order.
   */
  const gaps = (bar: Locator) =>
    bar.evaluate((root) => {
      const rtl = getComputedStyle(root).direction === 'rtl';
      const input = root.querySelector('input')!;
      const style = getComputedStyle(input);
      const box = input.getBoundingClientRect();
      const left = box.left + parseFloat(style.paddingLeft);
      const right = box.right - parseFloat(style.paddingRight);
      const field = input.parentElement!;
      const pill = field.getBoundingClientRect();
      // The icon slots are the 48px tap-target boxes.
      const [leading, trailing] = [input.previousElementSibling, input.nextElementSibling].map(
        (el) => el?.getBoundingClientRect(),
      );
      // Distances from the text to whatever comes before and after it.
      const before = rtl
        ? (leading ? leading.left : pill.right) - right
        : left - (leading ? leading.right : pill.left);
      const after = rtl
        ? left - (trailing ? trailing.right : pill.left)
        : (trailing ? trailing.left : pill.right) - right;
      return { before: Math.round(before), after: Math.round(after), height: pill.height };
    });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`4px from the tap targets, 16px from the edge without icons · ${dir}`, async ({
      page,
    }) => {
      await openStory(page, 'components-search--collapsed', { dir });
      const bars = page.getByTestId('collapsed').locator('> div');
      // M3: "Leading icon and label padding (from tap target): 4dp", and the same before
      // the trailing icon.
      expect(await gaps(bars.nth(0))).toEqual({ before: 4, after: 4, height: 56 });
      expect(await gaps(bars.nth(1))).toEqual({ before: 16, after: 16, height: 56 });
      expect(await gaps(page.getByTestId('two-trailing'))).toEqual({
        before: 4,
        after: 4,
        height: 56,
      });
      expect(await gaps(page.getByTestId('avatar'))).toEqual({ before: 4, after: 4, height: 56 });
    });
  }

  test('the expanded field keeps the same gaps', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 640 });
    await openStory(page, 'components-search--playground', {}, { view: 'full-screen' });
    await page.getByRole('combobox').click();
    const dialog = page.getByRole('dialog');
    await settle(page);
    const header = dialog.getByRole('searchbox').locator('../..');
    expect(await gaps(header)).toEqual({ before: 4, after: 4, height: 56 });
  });
});
