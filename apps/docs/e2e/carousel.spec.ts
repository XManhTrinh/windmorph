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

  for (const story of ['uncontained', 'hero', 'vertical', 'multi-aspect', 'full-screen'] as const) {
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
  test('a 360px multi-browse carousel starts 16px in, shrinking 186 · 118 · 40 to fit', async ({
    page,
  }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const [a, b, c] = await visible(page, 3);
    // Compose's content padding: each item gives up a third of the 16px leading padding.
    expect(a!.x).toBe(16);
    expect(a!.size).toBe(181);
    expect(b!.size).toBe(113);
    expect(c!.size).toBe(35);
    expect(c!.x + c!.size).toBe(360);
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
    // The arrangement ends 16px before the end edge (the trailing padding).
    expect(all[9]!.x + all[9]!.size).toBe(344);
    expect(all[9]!.size).toBe(181);
    expect(all[8]!.size).toBe(113);
    expect(all[7]!.size).toBe(35);
  });

  test('items take focus (not the container); arrows move it and scroll to the item', async ({
    page,
  }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const scroller = page.getByTestId('carousel').locator('> div');
    expect(await scroller.getAttribute('tabindex')).toBeNull();
    await page.keyboard.press('Tab');
    const slide = (n: number) => page.getByRole('group', { name: `${n} of 10` });
    await expect(slide(1)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(slide(2)).toBeFocused();
    await expect.poll(() => scroller.evaluate((el) => Math.round(el.scrollLeft))).toBe(194);
    await frame(page);
    const items = await visible(page, 3);
    expect(items[1]).toEqual({ x: 0, size: 186 });
  });

  test('multi-browse flings across several items before snapping', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse');
    const stop = await page
      .getByTestId('slide-0')
      .evaluate((el) => getComputedStyle(el.parentElement!.parentElement!).scrollSnapStop);
    expect(stop).toBe('normal');
  });

  test('pressing an item activates it, with a state layer and tighter corners', async ({
    page,
  }) => {
    await openStory(page, 'components-carousel--actionable');
    const slide = page.getByRole('group', { name: '1 of 10' });
    const mask = page.getByTestId('slide-0').locator('..');
    await slide.hover();
    await expect(mask.locator('> span')).toHaveAttribute('data-hovered', 'true');
    await page.mouse.down();
    await expect
      .poll(() => mask.evaluate((el) => getComputedStyle(el).clipPath))
      .toContain('round 20px');
    await page.mouse.up();
    await expect(page.getByTestId('last-action')).toHaveText('Opened album 1');
    await slide.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Show all' })).toBeFocused();
  });

  test('reduced motion keeps every item large and unmasked', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-carousel--multi-browse');
    const sizes = await page.getByTestId('carousel').evaluate((root) =>
      Array.from(root.querySelectorAll('[role="group"]'), (group) => {
        const mask = group.firstElementChild as HTMLElement;
        return [Math.round(group.getBoundingClientRect().width), mask.style.clipPath];
      }),
    );
    expect(sizes.slice(0, 3)).toEqual([
      [186, ''],
      [186, ''],
      [186, ''],
    ]);
    await expect(page.getByTestId('frame')).toHaveScreenshot('multi-browse-reduced-motion.png');
  });

  test('multi-aspect items keep their widths between 9:16 and 16:9', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-aspect');
    const widths = await page
      .getByTestId('carousel')
      .evaluate((root) =>
        Array.from(root.querySelectorAll('[role="group"]'), (group) =>
          Math.round(group.getBoundingClientRect().width),
        ),
      );
    // 205px tall (221 less 8px padding each side): 16:9, 9:16, 1:1, 3:1 capped at 16:9, 4:5.
    expect(widths.slice(0, 5)).toEqual([364, 115, 205, 364, 164]);
  });

  test('full-screen items fill the carousel one at a time', async ({ page }) => {
    await openStory(page, 'components-carousel--full-screen');
    const box = await page.getByTestId('slide-0').boundingBox();
    expect(box).toMatchObject({ width: 270, height: 480 });
    const stop = await page
      .getByTestId('slide-0')
      .evaluate((el) => getComputedStyle(el.parentElement!.parentElement!).scrollSnapStop);
    expect(stop).toBe('always');
  });

  test('RTL starts at the right edge', async ({ page }) => {
    await openStory(page, 'components-carousel--multi-browse', { dir: 'rtl' });
    const [a, b] = await visible(page, 2);
    expect(a!.x + a!.size).toBe(344);
    expect(b!.size).toBe(113);
  });

  test('vertical carousels scroll on y with the same keylines', async ({ page }) => {
    await openStory(page, 'components-carousel--vertical');
    const box = await page.getByTestId('slide-0').evaluate((el) => {
      const mask = el.parentElement!;
      return { height: Math.round(mask.getBoundingClientRect().height) };
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
