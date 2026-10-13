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

  test('icon only', async ({ page }) => {
    await openStory(page, 'components-splitbutton--icon-only');
    await expect(page.getByTestId('icon-only')).toHaveScreenshot('icon-only.png');
  });

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

test.describe('SplitButton spec geometry', () => {
  test('the menu opens 4px below, aligned with the trailing button end edge', async ({ page }) => {
    for (const dir of ['ltr', 'rtl'] as const) {
      await openStory(page, 'components-splitbutton--playground', { dir });
      const trigger = page.getByRole('button', { name: 'More send options' });
      await trigger.click();
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
      await page.waitForTimeout(500);
      const button = (await trigger.boundingBox())!;
      // The menu list extends 8px past its groups (room for their shadows): inset it.
      const list = (await menu.boundingBox())!;
      const surface = {
        top: list.y + 8,
        left: list.x + 8,
        right: list.x + list.width - 8,
      };
      expect(Math.round(surface.top - (button.y + button.height))).toBe(4);
      if (dir === 'ltr')
        expect(Math.abs(surface.right - (button.x + button.width))).toBeLessThan(1);
      else expect(Math.abs(surface.left - button.x)).toBeLessThan(1);
      await page.keyboard.press('Escape');
    }
  });

  test('inner corners change on hover and keyboard focus', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground');
    const send = page.getByRole('button', { name: 'Send', exact: true });
    const trigger = page.getByRole('button', { name: 'More send options' });
    const endRadius = () => send.evaluate((el) => getComputedStyle(el).borderTopRightRadius);
    expect(await endRadius()).toBe('4px');
    await send.hover();
    await expect.poll(endRadius).toBe('12px');
    await page.mouse.move(0, 0);
    await expect.poll(endRadius).toBe('4px');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect
      .poll(() => trigger.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('12px');
  });

  test('small halves have 48px touch targets', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground', {}, { size: 'xs' });
    for (const name of ['Send', 'More send options']) {
      const button = page.getByRole('button', { name, exact: true });
      const target = button.locator('[data-touch-target]');
      const box = (await target.boundingBox())!;
      expect(box.height).toBe(48);
      expect(box.width).toBeGreaterThanOrEqual(48);
    }
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
