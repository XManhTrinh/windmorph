import { expect, test } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

test.describe('Card visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-card--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const mode of MODES) {
    test(`interactive · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-card--interactive', { mode });
      await expect(page.getByTestId('interactive')).toHaveScreenshot(`interactive-${mode}.png`);
    });
  }
});

test.describe('Card interaction', () => {
  test('pressable cards fill the width, raise on hover and show a focus ring', async ({ page }) => {
    await openStory(page, 'components-card--interactive');
    const card = page.getByRole('button', { name: 'Pressable elevated' });
    const parentWidth = await card.evaluate(
      (el) => el.parentElement!.getBoundingClientRect().width,
    );
    expect((await card.boundingBox())!.width).toBe(parentWidth);

    const shadowAtRest = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    await card.hover();
    await expect(card).toHaveAttribute('data-hovered', 'true');
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow))
      .not.toBe(shadowAtRest);
    await shotWithMargin(page, card, 'state-hover.png');

    await page.mouse.move(0, 0);
    await card.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(card).toHaveAttribute('data-focus-visible', 'true');
    await page.keyboard.press('Enter');
    await expect(card).toContainText('Pressed 1');
  });

  test('outlined cards keep their elevation on hover', async ({ page }) => {
    await openStory(page, 'components-card--interactive');
    const card = page.getByRole('button', { name: 'Pressable outlined' });
    const rest = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    await card.hover();
    await expect(card).toHaveAttribute('data-hovered', 'true');
    await page.waitForTimeout(300);
    expect(await card.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(rest);
  });

  test('media is clipped to the rounded corners', async ({ page }) => {
    await openStory(page, 'components-card--playground');
    const card = page.locator('#storybook-root').locator('div.rounded-corner-medium').first();
    const style = await card.evaluate((el) => {
      const s = getComputedStyle(el);
      return { overflow: s.overflow, radius: s.borderTopLeftRadius };
    });
    expect(style).toEqual({ overflow: 'hidden', radius: '12px' });
  });
});

test.describe('Card layout safety', () => {
  layoutSafetySuite('components-card--layout-override', { height: 96, radius: '12px' });
});
