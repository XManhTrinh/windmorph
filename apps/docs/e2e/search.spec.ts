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
    const mic = await rect(page.getByRole('button', { name: 'Voice search' }));
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
    const panel = await rect(dialog);
    expect(panel).toMatchObject({ x: collapsed.x, y: collapsed.y, width: collapsed.width });
    const dropdown = await rect(dialog.locator('> div').last());
    expect(dropdown.y).toBe(collapsed.y + 58);
    expect(
      await dialog
        .locator('> div')
        .last()
        .evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    ).toBe('12px');

    // Type to filter, ↓ into the suggestions, Enter picks one and collapses.
    await page.keyboard.type('fl');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Flight confirmation' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('submitted')).toHaveText('Searched: Flight confirmation');
    await expect(dialog).toBeHidden();
    await expect(page.getByRole('combobox')).toBeFocused();
  });

  test('docked: Escape and a press on the scrim collapse it', async ({ page }) => {
    await openStory(page, 'components-search--playground');
    await page.getByRole('combobox').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('combobox').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(700, 500);
    await expect(page.getByRole('dialog')).toBeHidden();
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
    const field = await rect(dialog.getByRole('searchbox').locator('..'));
    expect(field).toMatchObject({ x: 0, y: 8, width: 412, height: 56 });
    await dialog.getByRole('button', { name: 'Back' }).click();
    await expect(dialog).toBeHidden();
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
