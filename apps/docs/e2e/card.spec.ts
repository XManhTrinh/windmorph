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
    test(`dragged · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-card--dragged', { mode });
      await expect(page.getByTestId('dragged')).toHaveScreenshot(`dragged-${mode}.png`);
    });
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

  test('outlined cards rise on hover and get an on-surface border when focused', async ({
    page,
  }) => {
    await openStory(page, 'components-card--interactive');
    const card = page.getByRole('button', { name: 'Pressable outlined' });
    const rest = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    const border = await card.evaluate((el) => getComputedStyle(el).borderTopColor);
    await card.hover();
    await expect(card).toHaveAttribute('data-hovered', 'true');
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(rest);

    await page.mouse.move(0, 0);
    await card.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(card).toHaveAttribute('data-focus-visible', 'true');
    await expect
      .poll(() => card.evaluate((el) => getComputedStyle(el).borderTopColor))
      .not.toBe(border);
  });

  test('a pressed card drops back to its resting elevation', async ({ page }) => {
    await openStory(page, 'components-card--interactive');
    const card = page.getByRole('button', { name: 'Pressable filled' });
    const rest = await card.evaluate((el) => getComputedStyle(el).boxShadow);
    await card.hover();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(rest);
    await page.mouse.down();
    await expect(card).toHaveAttribute('data-pressed', 'true');
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(rest);
    await page.mouse.up();
  });

  for (const mode of MODES) {
    test(`a disabled elevated card is surface at 38% over its container · ${mode}`, async ({
      page,
    }) => {
      await openStory(page, 'components-card--interactive', { mode });
      const card = page.getByText('Disabled elevated').locator('..');
      await expect(card).toHaveAttribute('data-disabled', 'true');
      const { actual, surface, container } = await card.evaluate((el) => {
        // Every colour as 0–255 sRGB channels, whatever syntax the browser serialises.
        const channels = (color: string) => {
          const numbers = color.match(/[\d.]+/g)!.map(Number);
          return color.startsWith('color(') ? numbers.slice(0, 3).map((n) => n * 255) : numbers;
        };
        const role = (name: string) => {
          const probe = document.createElement('span');
          probe.style.color = `var(--md-sys-color-${name})`;
          el.append(probe);
          const value = getComputedStyle(probe).color;
          probe.remove();
          return channels(value);
        };
        return {
          actual: channels(getComputedStyle(el).backgroundColor),
          surface: role('surface'),
          container: role('surface-container-low'),
        };
      });
      for (const [index, value] of actual.slice(0, 3).entries()) {
        const mixed = surface[index]! * 0.38 + container[index]! * 0.62;
        expect(Math.abs(value - mixed)).toBeLessThanOrEqual(1);
      }
      // Not plain surface (unless the two roles are the same colour in this theme).
      expect(surface.join()).not.toBe(container.join());
    });
  }

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
