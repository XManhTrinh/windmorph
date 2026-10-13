import { expect, test, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

// A paused fake clock freezes the wave and the indeterminate lines at a known frame.
async function frozen(page: Page, ms: number) {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  return async (story: string, globals = {}) => {
    await openStory(page, story, globals);
    await page.clock.runFor(ms);
  };
}

test.describe('Progress visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`linear · ${theme} · ${mode}`, async ({ page }) => {
        const open = await frozen(page, 600);
        await open('components-progress--linear', { theme, mode });
        await expect(page.getByTestId('linear')).toHaveScreenshot(`linear-${theme}-${mode}.png`);
      });
    }
  }

  test('circular', async ({ page }) => {
    const open = await frozen(page, 600);
    await open('components-progress--circular');
    await expect(page.getByTestId('circular')).toHaveScreenshot('circular.png');
  });

  for (const ms of [300, 900]) {
    test(`indeterminate at ${ms}ms`, async ({ page }) => {
      const open = await frozen(page, ms);
      await open('components-progress--indeterminate');
      await expect(page.getByTestId('indeterminate')).toHaveScreenshot(`indeterminate-${ms}ms.png`);
    });
  }

  test('linear · rtl', async ({ page }) => {
    const open = await frozen(page, 600);
    await open('components-progress--linear', { dir: 'rtl' });
    await expect(page.getByTestId('linear')).toHaveScreenshot('linear-rtl.png');
  });
});

test.describe('Progress behaviour', () => {
  test('the wave travels while the arc stays', async ({ page }) => {
    await openStory(page, 'components-progress--playground', {}, { wavy: true, value: '0.5' });
    const active = page.getByRole('progressbar', { name: 'Linear' }).locator('path').nth(1);
    const first = await active.getAttribute('d');
    await expect.poll(() => active.getAttribute('d')).not.toBe(first);
    const box = (await active.boundingBox())!;
    const bar = (await page.getByRole('progressbar', { name: 'Linear' }).boundingBox())!;
    expect(Math.abs(box.x + box.width - (bar.x + bar.width / 2))).toBeLessThan(3);
  });

  test('reduced motion stops the wave', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-progress--playground', {}, { wavy: true, value: '0.5' });
    const active = page.getByRole('progressbar', { name: 'Linear' }).locator('path').nth(1);
    const first = await active.getAttribute('d');
    await page.waitForTimeout(300);
    expect(await active.getAttribute('d')).toBe(first);
  });
});

test.describe('Progress layout safety', () => {
  layoutSafetySuite('components-progress--layout-override', {
    height: 4,
    width: 240,
    radius: '0px',
    interactive: false,
    async check(_page, target) {
      const sizes = await target.evaluate((el) => {
        const svg = el.querySelector('svg')!;
        return [el.clientWidth, svg.clientWidth];
      });
      expect(sizes[1]).toBe(sizes[0]);
    },
  });
});
