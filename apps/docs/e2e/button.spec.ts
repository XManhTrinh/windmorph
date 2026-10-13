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
    // Pressed corners morph from full to medium (12px) on the effects spring.
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('12px');
    await page.mouse.up();
    await expect(button).not.toHaveAttribute('data-pressed');
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('28px');
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
