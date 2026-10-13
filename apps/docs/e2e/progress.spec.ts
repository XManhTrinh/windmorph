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

  test('thickness', async ({ page }) => {
    const open = await frozen(page, 600);
    await open('components-progress--thickness');
    await expect(page.getByTestId('thickness')).toHaveScreenshot('thickness.png');
  });

  test('circular · rtl is not mirrored', async ({ page }) => {
    const open = await frozen(page, 600);
    await open('components-progress--circular', { dir: 'rtl' });
    // The row runs right to left, but each arc still runs clockwise from 12 o'clock.
    await expect(page.getByTestId('circular')).toHaveScreenshot('circular-rtl.png');
  });

  test('linear · rtl', async ({ page }) => {
    const open = await frozen(page, 600);
    await open('components-progress--linear', { dir: 'rtl' });
    await expect(page.getByTestId('linear')).toHaveScreenshot('linear-rtl.png');
  });
});

test.describe('Progress behaviour', () => {
  test('circular size: 24 to 240px, clamped, with 4px strokes at every size', async ({ page }) => {
    await openStory(page, 'components-progress--sizes');
    const cases: [string, number][] = [
      ['Size 24', 24],
      ['Size 40', 40],
      ['Size 96', 96],
      ['Size 240', 240],
      ['Size 400', 240],
      ['Size 12', 24],
    ];
    for (const [name, expected] of cases) {
      const ring = page.getByRole('progressbar', { name, exact: true });
      const box = (await ring.boundingBox())!;
      expect([Math.round(box.width), Math.round(box.height)]).toEqual([expected, expected]);
      // The rendered stroke: its width in the SVG's units times the SVG's scale.
      const strokes = await ring.locator('path').evaluateAll((paths) =>
        paths.map((path) => {
          const element = path as SVGPathElement;
          return (
            Number(getComputedStyle(element).strokeWidth.replace('px', '')) *
            element.getScreenCTM()!.a
          );
        }),
      );
      for (const stroke of strokes) expect(stroke).toBeCloseTo(4, 1);
    }
  });

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

test.describe('Progress handoff', () => {
  test('an indeterminate indicator eases into its value', async ({ page }) => {
    await openStory(page, 'components-progress--handoff');
    const linear = page.getByRole('progressbar', { name: 'Handoff linear' });
    await expect(linear).not.toHaveAttribute('aria-valuenow');
    await page.getByRole('button', { name: 'Toggle' }).click();
    await expect(linear).toHaveAttribute('aria-valuenow', '0.7');
    const circular = page.getByRole('progressbar', { name: 'Handoff circular' });
    // The ring settles at 12 o'clock with a 70% arc.
    await expect
      .poll(() => circular.locator('g').first().getAttribute('transform'))
      .toMatch(/^rotate\((0|360) /);
    await expect(circular.locator('path').nth(1)).toHaveAttribute('stroke-dasharray', '0.7 1');
  });
});

test.describe('Progress value changes', () => {
  /** The drawn width of the linear indicator's active line. */
  const activeWidth = (page: Page) =>
    page
      .getByRole('progressbar', { name: 'Changing linear' })
      .evaluate((el) => (el.querySelectorAll('path')[1] as SVGPathElement).getBBox().width);

  test('a new value eases along the track instead of jumping', async ({ page }) => {
    await openStory(page, 'components-progress--value-change');
    await expect.poll(() => activeWidth(page)).toBeGreaterThan(0);
    const from = await activeWidth(page);
    await page.getByRole('button', { name: 'Change' }).click();
    await expect(page.getByRole('progressbar', { name: 'Changing linear' })).toHaveAttribute(
      'aria-valuenow',
      '0.8',
    );
    // Shortly after the change the line is between the old and the new width ...
    await page.waitForTimeout(80);
    const during = await activeWidth(page);
    // ... and it settles at the new value.
    await expect.poll(() => activeWidth(page), { timeout: 3000 }).toBeGreaterThan(from * 3.5);
    const settled = await activeWidth(page);
    expect(during).toBeGreaterThan(from);
    expect(during).toBeLessThan(settled);
  });

  test('reduced motion jumps to the new value', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-progress--value-change');
    await expect.poll(() => activeWidth(page)).toBeGreaterThan(0);
    const from = await activeWidth(page);
    await page.getByRole('button', { name: 'Change' }).click();
    await page.waitForTimeout(50);
    expect(await activeWidth(page)).toBeGreaterThan(from * 3.5);
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
