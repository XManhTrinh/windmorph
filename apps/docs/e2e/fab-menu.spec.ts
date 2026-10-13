import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const width = (locator: Locator) =>
  locator.evaluate((el) => Math.round((el as HTMLElement).getBoundingClientRect().width));

test.describe('FabMenu visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`colours · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-fabmenu--colors', { theme, mode });
        await expect(page.getByTestId('colors')).toHaveScreenshot(`colors-${theme}-${mode}.png`);
      });
    }
  }

  test('sizes', async ({ page }) => {
    await openStory(page, 'components-fabmenu--sizes');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes.png');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`alignment · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-fabmenu--alignment', { dir });
      await expect(page.getByTestId('alignment')).toHaveScreenshot(`alignment-${dir}.png`);
    });
  }
});

test.describe('FabMenu behaviour', () => {
  test('opens from the button upwards and shrinks a large FAB to the close button', async ({
    page,
  }) => {
    await openStory(page, 'components-fabmenu--playground', {}, { size: 'large', items: '3' });
    const button = page.getByRole('button', { name: 'Create' });
    expect(await width(button)).toBe(96);
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    // The stagger shows the bottom item first; the top item is the last to appear.
    const items = page.locator('[data-fab-menu-item]');
    await expect(items.nth(2)).toHaveAttribute('data-visible', 'true');
    await expect(items.nth(0)).toHaveAttribute('data-visible', 'true');
    await expect.poll(() => width(button)).toBe(56);
    // Each item settles at its content's width.
    for (const name of ['Edit', 'Send', 'Star']) {
      const item = page.getByRole('button', { name });
      const content = item.locator(':scope > span');
      await expect.poll(async () => (await width(item)) === (await width(content))).toBe(true);
    }

    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: Send');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    await expect.poll(() => width(button)).toBe(96);
    await expect(page.getByRole('button', { name: 'Send' })).toBeHidden();
  });

  test('keyboard: Tab and arrows reach the items, Escape closes', async ({ page }) => {
    await openStory(page, 'components-fabmenu--playground', {}, { items: '3' });
    const button = page.getByRole('button', { name: 'Create' });
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Send' })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(button).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('an outside press closes it', async ({ page }) => {
    await openStory(page, 'components-fabmenu--playground');
    const button = page.getByRole('button', { name: 'Create' });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('last').click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('FabMenu layout safety', () => {
  layoutSafetySuite('components-fabmenu--layout-override', {
    height: 56,
    width: 56,
    radius: '0px',
    interactive: false,
    // The root only positions; its button keeps the state layer, press and focus ring.
    async check(page, target) {
      const button = target.getByRole('button', { name: 'Create' });
      expect(await button.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
        'linear-gradient',
      );
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(target.locator('[data-fab-menu-item]').first()).toHaveAttribute(
        'data-visible',
        'true',
      );
      await page.keyboard.press('Escape');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(button).toHaveAttribute('data-focus-visible', 'true');
      expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    },
  });
});
