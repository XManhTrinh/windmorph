import { expect, test } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

test.describe('IconButton visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-iconbutton--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const mode of MODES) {
    test(`variants · baseline · ${mode} · high contrast`, async ({ page }) => {
      await openStory(page, 'components-iconbutton--variants', { mode, contrast: 'high' });
      await expect(page.getByTestId('variants')).toHaveScreenshot(
        `variants-baseline-${mode}-high.png`,
      );
    });
  }

  test('sizes and widths', async ({ page }) => {
    await openStory(page, 'components-iconbutton--sizes-and-widths');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes-and-widths.png');
  });
});

test.describe('IconButton interaction states', () => {
  test('hover, focus and press morph', async ({ page }) => {
    await openStory(
      page,
      'components-iconbutton--playground',
      {},
      { variant: 'filled', size: 'md' },
    );
    const button = page.getByRole('button', { name: 'Search' });

    await button.hover();
    await expect(button).toHaveAttribute('data-hovered', 'true');
    await shotWithMargin(page, button, 'state-hover.png');

    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await expect(button).toHaveAttribute('data-focus-visible', 'true');
    await shotWithMargin(page, button, 'state-focus.png');

    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('12px');
    await page.mouse.up();
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('28px');
  });

  test('toggle swaps icon and shape', async ({ page }) => {
    await openStory(page, 'components-iconbutton--toggle');
    const toggle = page.getByRole('button', { name: 'Favourite' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(0, 0);
    await expect
      .poll(() => toggle.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('16px');
    await shotWithMargin(page, toggle, 'toggle-selected.png');
  });

  test('standard icon buttons inherit the surrounding text colour', async ({ page }) => {
    await openStory(page, 'components-iconbutton--variants');
    const row = page.getByTestId('variants');
    const standard = row.getByRole('button', { name: 'Search' }).first();
    const [rowColor, buttonColor] = await Promise.all([
      row.evaluate((el) => getComputedStyle(el).color),
      standard.evaluate((el) => getComputedStyle(el).color),
    ]);
    expect(buttonColor).toBe(rowColor);
  });
});

test.describe('IconButton layout safety', () => {
  layoutSafetySuite('components-iconbutton--layout-override', {
    height: 40,
    width: 40,
    radius: '20px',
  });
});
