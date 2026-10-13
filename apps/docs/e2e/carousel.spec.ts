import { expect, test, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

/** Visible extents of the slides (their masks' clip boxes), relative to the carousel. */
async function visible(page: Page, count: number) {
  return page.getByTestId('carousel').evaluate((root, n) => {
    const origin = root.getBoundingClientRect();
    const out: { x: number; size: number }[] = [];
    for (let i = 0; i < n; i++) {
      const mask = root.querySelector(`[data-testid="slide-${i}"]`)!.parentElement!;
      const box = mask.getBoundingClientRect();
      const inset = /inset\(0px ([\d.]+)px/.exec(getComputedStyle(mask).clipPath);
      const cut = inset ? Number(inset[1]) : 0;
      out.push({ x: Math.round(box.x - origin.x + cut), size: Math.round(box.width - 2 * cut) });
    }
    return out;
  }, count);
}

const frame = (page: Page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

test.describe('Carousel visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`multi-browse · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-carousel--multi-browse', { theme, mode });
        await expect(page.getByTestId('frame')).toHaveScreenshot(
          `multi-browse-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const story of ['uncontained', 'hero', 'vertical'] as const) {
    test(story, async ({ page }) => {
      await openStory(page, `components-carousel--${story}`);
      await expect(page.getByTestId('frame')).toHaveScreenshot(`${story}.png`);
    });
  }

  test('multi-browse · rtl', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse', { dir: 'rtl' });
    await expect(page.getByTestId('frame')).toHaveScreenshot('multi-browse-rtl.png');
  });
});

test.describe('Carousel keylines', () => {
  test('a 360px multi-browse carousel shows 186 · 118 · 40 with 8px gaps', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const [a, b, c] = await visible(page, 3);
    expect(a).toEqual({ x: 0, size: 186 });
    expect(b).toEqual({ x: 194, size: 118 });
    expect(c).toEqual({ x: 320, size: 40 });
    const corner = await page
      .getByTestId('slide-0')
      .evaluate((el) => getComputedStyle(el.parentElement!).clipPath);
    expect(corner).toContain('round 28px');
  });

  test('scrolling to the end mirrors the arrangement against the end edge', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const scroller = page.getByTestId('carousel').locator('> div');
    await scroller.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: 'instant' }));
    await frame(page);
    const all = await visible(page, 10);
    expect(all[9]).toEqual({ x: 174, size: 186 });
    expect(all[8]!.size).toBe(118);
    expect(all[7]!.size).toBe(40);
  });

  test('arrow keys advance one item at a time (snapping)', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const scroller = page.getByTestId('carousel').locator('> div');
    await scroller.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => scroller.evaluate((el) => Math.round(el.scrollLeft))).toBe(194);
    await frame(page);
    const items = await visible(page, 3);
    expect(items[1]).toEqual({ x: 0, size: 186 });
  });

  test('RTL starts at the right edge', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse', { dir: 'rtl' });
    const [a, b] = await visible(page, 2);
    expect(a!.x + a!.size).toBe(360);
    expect(b!.size).toBe(118);
  });

  test('vertical carousels scroll on y with the same keylines', async ({ page }) => {
    await openStory(page, 'components-carousel--vertical');
    const box = await page.getByTestId('slide-0').evaluate((el) => {
      const mask = el.parentElement!;
      return { height: mask.getBoundingClientRect().height };
    });
    expect(box.height).toBe(240);
    // The second item is masked top and bottom, not at the sides.
    const clip = await page
      .getByTestId('slide-1')
      .evaluate((el) => getComputedStyle(el.parentElement!).clipPath);
    expect(clip).toMatch(/^inset\([1-9][\d.]*px 0px/);
  });
});

test.describe('Carousel layout safety', () => {
  layoutSafetySuite('components-carousel--layout-override', {
    height: 200,
    width: 360,
    radius: '0px',
    interactive: false,
  });
});
