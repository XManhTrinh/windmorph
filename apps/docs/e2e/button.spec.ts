import { expect, test, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

test.describe('Button visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-button--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const contrast of ['medium', 'high'] as const) {
    for (const mode of MODES) {
      test(`variants · baseline · ${mode} · ${contrast} contrast`, async ({ page }) => {
        await openStory(page, 'components-button--variants', { mode, contrast });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-baseline-${mode}-${contrast}.png`,
        );
      });
    }
  }

  test('sizes and shapes', async ({ page }) => {
    await openStory(page, 'components-button--sizes-and-shapes');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes-and-shapes.png');
  });

  test('sizes and shapes · rtl', async ({ page }) => {
    await openStory(page, 'components-button--sizes-and-shapes', { dir: 'rtl' });
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes-and-shapes-rtl.png');
  });
});

test.describe('Button interaction states', () => {
  test('hover, focus and press', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'md' });
    const button = page.getByRole('button', { name: 'Button' });

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
    await expect(button).toHaveAttribute('data-pressed', 'true');
    // Pressed corners morph from full to medium (12px) on the fast spatial spring.
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('12px');
    await page.mouse.up();
    await expect(button).not.toHaveAttribute('data-pressed');
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('28px');
  });

  test('the press morph bounces on the fast spatial spring, but not on a rapid re-press', async ({
    page,
  }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'md' });
    const button = page.getByRole('button', { name: 'Button' });
    /** The smallest and largest corner radius over the next `ms`, sampled every frame. */
    const radiusRange = (ms: number) =>
      button.evaluate(async (el, duration) => {
        let min = Infinity;
        let max = -Infinity;
        const start = performance.now();
        while (performance.now() - start < duration) {
          await new Promise(requestAnimationFrame);
          const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius);
          min = Math.min(min, radius);
          max = Math.max(max, radius);
        }
        return { min, max };
      }, ms);
    const radius = () =>
      button.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius));
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    await page.mouse.down();
    // 28px → 12px overshoots below 12px before settling (expressive scheme).
    expect((await radiusRange(450)).min).toBeLessThan(11.5);
    await page.mouse.up();
    await page.waitForTimeout(60);
    const midRelease = await radius();
    expect(midRelease).toBeGreaterThan(12.5);
    expect(midRelease).toBeLessThan(27.5);
    await page.mouse.down();
    await expect(button).toHaveAttribute('data-rapid-press', '');
    // A press that overlaps the release morph picks up where it is, on the non-bouncing
    // effects spring.
    const range = await radiusRange(450);
    expect(range.min).toBeGreaterThanOrEqual(11.9);
    expect(range.max).toBeLessThanOrEqual(midRelease + 2);
    await page.mouse.up();
  });

  test('toggle selection swaps the shape', async ({ page }) => {
    await openStory(page, 'components-button--toggle');
    const toggle = page.getByRole('button', { name: 'Star' });
    await toggle.click();
    const starred = page.getByRole('button', { name: 'Starred' });
    await expect(starred).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(0, 0);
    // Round md toggle becomes square (large, 16px) when selected.
    await expect
      .poll(() => starred.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('16px');
  });

  test('XS buttons keep a 48px touch target without changing layout', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'xs' });
    const button = page.getByRole('button', { name: 'Button' });
    const box = (await button.boundingBox())!;
    expect(box.height).toBe(32);
    // A point 7px above the visual edge still lands on the button.
    const hit = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('button') !== null,
      { x: box.x + box.width / 2, y: box.y - 7 },
    );
    expect(hit).toBe(true);
  });
});

test.describe('Button spec fixes (2026-10-13)', () => {
  const shadow = (el: Element) => getComputedStyle(el).boxShadow;

  test('a pressed button takes the pressed elevation, not the hover one', async ({ page }) => {
    await openStory(page, 'components-button--variants');
    const labels = page.getByRole('button', { name: 'Label', exact: true });
    // Elevated, filled, tonal: rest shadow (elevated level 1) is the pressed shadow.
    for (const index of [0, 1, 2]) {
      const button = labels.nth(index);
      const rest = await button.evaluate(shadow);
      const box = (await button.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await expect(button).toHaveAttribute('data-hovered', 'true');
      await expect.poll(() => button.evaluate(shadow)).not.toBe(rest);
      await page.mouse.down();
      await expect(button).toHaveAttribute('data-pressed', 'true');
      await expect.poll(() => button.evaluate(shadow)).toBe(rest);
      await page.mouse.up();
      await page.mouse.move(0, 0);
    }
  });

  test('an outlined button is the same size as a filled one, its outline inside the padding', async ({
    page,
  }) => {
    for (const [size, border, space] of [
      ['xs', 1, 16],
      ['sm', 1, 16],
      ['md', 1, 24],
      ['lg', 2, 48],
      ['xl', 3, 64],
    ] as const) {
      const measure = async (variant: string) => {
        await openStory(page, 'components-button--playground', {}, { size, variant });
        return page.getByRole('button', { name: 'Button' }).evaluate((el) => {
          const label = el.querySelector('span')!.getBoundingClientRect();
          const box = el.getBoundingClientRect();
          return {
            width: box.width,
            inset: label.left - box.left,
            border: parseFloat(getComputedStyle(el).borderLeftWidth),
          };
        });
      };
      const filled = await measure('filled');
      const outlined = await measure('outlined');
      expect(outlined.border).toBe(border);
      expect(outlined.width).toBe(filled.width);
      expect(outlined.inset).toBe(space);
      expect(filled.inset).toBe(space);
    }
  });

  test('a toggle swaps in its selected leading icon', async ({ page }) => {
    await openStory(page, 'components-button--toggle');
    const star = page.getByRole('button', { name: 'Star' });
    const path = () => star.locator('svg path').getAttribute('d');
    const unselected = await path();
    await star.click();
    await expect(page.getByRole('button', { name: 'Starred' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      await page.getByRole('button', { name: 'Starred' }).locator('svg path').getAttribute('d'),
    ).not.toBe(unselected);
  });
});

test.describe('Button ripple', () => {
  /** Samples the ripple's radius and opacity every frame for `ms`. */
  const sample = (page: Page, ms: number) =>
    page
      .getByRole('button')
      .first()
      .evaluate(async (el, duration) => {
        const out: { t: number; radius: number; opacity: number }[] = [];
        const start = performance.now();
        while (performance.now() - start < duration) {
          await new Promise(requestAnimationFrame);
          const s = getComputedStyle(el);
          out.push({
            t: performance.now() - start,
            radius: parseFloat(s.getPropertyValue('--m3-ripple-radius')),
            opacity: parseFloat(s.getPropertyValue('--m3-ripple-opacity')),
          });
        }
        return out;
      }, ms);

  test('a quick click still grows the ripple to the edges, then fades it', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'md' });
    const button = page.getByRole('button').first();
    const box = (await button.boundingBox())!;
    const end = Math.ceil(Math.hypot(box.width, box.height) / 2 + 10);
    await page.mouse.move(box.x + 10, box.y + box.height / 2);
    await page.mouse.down();
    const frames = sample(page, 450);
    await page.mouse.up();
    const result = await frames;
    // Released at once, yet the radius reaches its end (half the diagonal + 10px)…
    expect(Math.max(...result.map((f) => f.radius))).toBeGreaterThanOrEqual(end - 1);
    // …while still visible, and only afterwards fades out.
    const full = result.find((f) => f.radius >= end - 1)!;
    expect(full.opacity).toBeGreaterThan(0.05);
    expect(result.at(-1)!.opacity).toBe(0);
  });
});

test.describe('Button ripple origin', () => {
  /** Where the ripple's centre is on the first frame after a quick press at `x`. */
  async function firstCentre(page: Page, x: number) {
    const button = page.getByRole('button').first();
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + x, box.y + box.height / 2);
    await page.mouse.down();
    const centre = button.evaluate(async (el) => {
      await new Promise(requestAnimationFrame);
      return parseFloat(getComputedStyle(el).getPropertyValue('--m3-ripple-x'));
    });
    await page.mouse.up();
    return { centre: await centre, width: box.width };
  }

  test('each press starts at its own point, not the previous one', async ({ page }) => {
    await openStory(page, 'components-button--playground', {}, { size: 'lg' });
    const { width } = await firstCentre(page, 4);
    // Right edge first: starts there, not at the centre.
    const right = await firstCentre(page, width - 4);
    expect(right.centre).toBeGreaterThan(width * 0.8);
    await page.waitForTimeout(500);
    // Then the left edge: starts there, not where the last ripple was.
    const left = await firstCentre(page, 4);
    expect(left.centre).toBeLessThan(width * 0.2);
    // Pressing again during the previous ripple's fade-out still starts fresh.
    await page.waitForTimeout(260);
    const again = await firstCentre(page, width - 4);
    expect(again.centre).toBeGreaterThan(width * 0.8);
  });
});

test.describe('Button layout safety', () => {
  layoutSafetySuite('components-button--layout-override', { height: 40, radius: '20px' });
});
