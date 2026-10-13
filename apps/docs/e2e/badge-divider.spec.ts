import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
  });

test.describe('Badge', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`badges · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-badge--badges', { theme, mode });
        await expect(page.getByTestId('badges')).toHaveScreenshot(`badges-${theme}-${mode}.png`);
      });
    }
  }

  test('badges · rtl', async ({ page }) => {
    await openStory(page, 'components-badge--badges', { dir: 'rtl' });
    await expect(page.getByTestId('badges')).toHaveScreenshot('badges-rtl.png');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`places badges like Compose's BadgedBox · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-badge--badges', { dir });
      const smallIcon = await rect(page.getByTestId('small-icon'));
      const small = await rect(page.getByTestId('small').locator('[data-size="small"]'));
      expect(small).toMatchObject({ width: 6, height: 6, y: smallIcon.y });
      if (dir === 'ltr') expect(small.x).toBe(smallIcon.right - 6);
      else expect(small.right).toBe(smallIcon.x + 6);

      const largeIcon = await rect(page.getByTestId('large-icon'));
      const large = await rect(page.getByTestId('large').locator('[data-size="large"]'));
      expect(large.height).toBe(16);
      expect(large.bottom).toBe(largeIcon.y + 14);
      if (dir === 'ltr') expect(large.x).toBe(largeIcon.right - 12);
      else expect(large.right).toBe(largeIcon.x + 12);
      // The badge doesn't change the anchor's size.
      expect(await rect(page.getByTestId('large'))).toMatchObject({ width: 24, height: 24 });
    });
  }

  test.describe('layout safety', () => {
    layoutSafetySuite('components-badge--layout-override', {
      height: 24,
      width: 24,
      radius: '0px',
      interactive: false,
    });
  });
});

test.describe('Divider', () => {
  for (const mode of MODES) {
    test(`dividers · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-divider--dividers', { mode });
      await expect(page.getByTestId('dividers')).toHaveScreenshot(`dividers-${mode}.png`);
    });
  }

  test.describe('layout safety', () => {
    // Full width follows the containing block, which `fixed` / `absolute` change.
    layoutSafetySuite('components-divider--layout-override', {
      height: 1,
      radius: '0px',
      interactive: false,
    });
  });
});
