import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const pathD = (indicator: Locator) => indicator.locator('path').getAttribute('d');
const rotation = (indicator: Locator) => indicator.locator('g').getAttribute('transform');

test.describe('LoadingIndicator visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`determinate · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-loadingindicator--determinate', { theme, mode });
        await expect(page.getByTestId('determinate')).toHaveScreenshot(
          `determinate-${theme}-${mode}.png`,
        );
      });
    }
  }

  test('sizes', async ({ page }) => {
    await openStory(page, 'components-loadingindicator--sizes');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes.png');
  });

  // A paused fake clock makes the animation frames deterministic: only runFor advances
  // time, so page-load time never leaks into the animation.
  for (const ms of [0, 200, 1000]) {
    test(`indeterminate at ${ms}ms`, async ({ page }) => {
      await page.clock.install({ time: 0 });
      await page.clock.pauseAt(1000);
      await openStory(page, 'components-loadingindicator--indeterminate');
      await page.clock.runFor(ms);
      await expect(page.getByTestId('indeterminate')).toHaveScreenshot(`indeterminate-${ms}ms.png`);
    });
  }
});

test.describe('LoadingIndicator behaviour', () => {
  test('indeterminate morphs and rotates', async ({ page }) => {
    await openStory(page, 'components-loadingindicator--playground');
    const indicator = page.getByRole('progressbar', { name: 'Loading' });
    await expect(indicator).not.toHaveAttribute('aria-valuenow');
    const d = await pathD(indicator);
    const transform = await rotation(indicator);
    await expect.poll(() => pathD(indicator)).not.toBe(d);
    await expect.poll(() => rotation(indicator)).not.toBe(transform);
  });

  test('reduced motion rotates without morphing', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-loadingindicator--playground');
    const indicator = page.getByRole('progressbar');
    const d = await pathD(indicator);
    const transform = await rotation(indicator);
    await expect.poll(() => rotation(indicator)).not.toBe(transform);
    expect(await pathD(indicator)).toBe(d);
  });

  test('determinate exposes its value', async ({ page }) => {
    await openStory(page, 'components-loadingindicator--playground', {}, { value: '0.3' });
    const indicator = page.getByRole('progressbar');
    await expect(indicator).toHaveAttribute('aria-valuenow', '0.3');
    await expect(indicator).toHaveAttribute('aria-valuetext', '30%');
    // Determinate frames only change with the value.
    const d = await pathD(indicator);
    await page.waitForTimeout(300);
    expect(await pathD(indicator)).toBe(d);
  });
});

test.describe('LoadingIndicator layout safety', () => {
  layoutSafetySuite('components-loadingindicator--layout-override', {
    height: 48,
    width: 48,
    radius: '9999px',
    interactive: false,
    // The drawing fills the box (its viewBox keeps the shape square and centred).
    async check(_page, target) {
      const sizes = await target.evaluate((el) => {
        const svg = el.querySelector('svg')!;
        return [el.clientWidth, el.clientHeight, svg.clientWidth, svg.clientHeight];
      });
      expect(sizes.slice(2)).toEqual(sizes.slice(0, 2));
    },
  });
});
