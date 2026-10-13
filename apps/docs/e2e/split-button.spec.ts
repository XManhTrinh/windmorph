import { expect, test } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

test.describe('SplitButton visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants and sizes · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-splitbutton--variants-and-sizes', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  test('disabled', async ({ page }) => {
    await openStory(page, 'components-splitbutton--disabled');
    await expect(page.getByTestId('disabled')).toHaveScreenshot('disabled.png');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    for (const variant of ['filled', 'outlined'] as const) {
      test(`open · ${variant} · ${dir}`, async ({ page }) => {
        await openStory(page, 'components-splitbutton--playground', { dir }, { variant });
        await page.getByRole('button', { name: 'More send options' }).click();
        await expect(page.getByRole('menu')).toBeVisible();
        await page.mouse.move(0, 0);
        await shotWithMargin(page, page.getByTestId('split'), `open-${variant}-${dir}.png`);
      });
    }
  }
});

test.describe('SplitButton behaviour', () => {
  test('the leading button acts, the trailing one opens the menu', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: send');
    await expect(page.getByRole('menu')).toHaveCount(0);

    const trigger = page.getByRole('button', { name: 'More send options' });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('data-open', 'true');
    // Round while open: both start corners match the end ones.
    await expect
      .poll(() =>
        trigger.evaluate((el) => {
          const s = getComputedStyle(el);
          return s.borderStartStartRadius === s.borderStartEndRadius;
        }),
      )
      .toBe(true);
    await page.getByRole('menuitem', { name: 'Send later' }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: later');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('keyboard opens and closes the menu', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const trigger = page.getByRole('button', { name: 'More send options' });
    await expect(trigger).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Send later' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe('SplitButton layout safety', () => {
  layoutSafetySuite('components-splitbutton--layout-override', {
    height: 40,
    radius: '0px',
    interactive: false,
    // The wrapper only positions; its halves keep the state layer, press and focus ring.
    async check(page, target) {
      const send = target.getByRole('button', { name: 'Send', exact: true });
      expect(await send.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
        'linear-gradient',
      );
      await send.click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(send).toHaveAttribute('data-focus-visible', 'true');
      expect(await send.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    },
  });
});
