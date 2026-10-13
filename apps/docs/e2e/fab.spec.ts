import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

const size = (locator: Locator) =>
  locator.evaluate((el) => {
    const rect = (el as HTMLElement).getBoundingClientRect();
    return { width: Math.round(rect.width * 10) / 10, height: rect.height };
  });

test.describe('FAB visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`colours and sizes · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-fab--colors-and-sizes', { theme, mode });
        await expect(page.getByTestId('fabs')).toHaveScreenshot(`fabs-${theme}-${mode}.png`);
      });
    }
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`extended · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-fab--extended', { dir });
      await expect(page.getByTestId('extended')).toHaveScreenshot(`extended-${dir}.png`);
    });
  }
});

test.describe('FAB interaction', () => {
  test('hover raises the elevation and focus shows the ring', async ({ page }) => {
    await openStory(page, 'components-fab--playground', {}, { size: 'medium' });
    const fab = page.getByRole('button', { name: 'Compose' });
    await fab.hover();
    await expect(fab).toHaveAttribute('data-hovered', 'true');
    await shotWithMargin(page, fab, 'state-hover.png', 16);
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await expect(fab).toHaveAttribute('data-focus-visible', 'true');
    await shotWithMargin(page, fab, 'state-focus.png', 16);
  });

  for (const [fabSize, height] of [
    ['sm', 56],
    ['md', 80],
    ['lg', 96],
  ] as const) {
    test(`extended ${fabSize} collapses to a square and expands back`, async ({ page }) => {
      await openStory(page, 'components-fab--extended-collapse', {}, { size: fabSize });
      const fab = page.getByTestId('extended-fab');
      const expanded = await size(fab);
      expect(expanded.height).toBe(height);
      expect(expanded.width).toBeGreaterThan(height + 40);

      await page.getByRole('button', { name: 'Collapse' }).click();
      await expect(fab).toHaveAttribute('data-expanded', 'false');
      await expect.poll(() => size(fab)).toEqual({ width: height, height });
      // The label still names the FAB.
      await expect(page.getByRole('button', { name: 'Compose' })).toBeVisible();

      await page.getByRole('button', { name: 'Expand' }).click();
      await expect.poll(async () => (await size(fab)).width).toBe(expanded.width);
    });
  }
});

test.describe('FAB layout safety', () => {
  layoutSafetySuite('components-fab--layout-override', { height: 56, width: 56, radius: '16px' });
});
