import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
  });

const segments = (page: Page, slider: Locator) =>
  slider.locator('[data-tone]').evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return {
        tone: el.getAttribute('data-tone'),
        x: r.x,
        right: r.right,
        width: r.width,
        height: r.height,
      };
    }),
  );

test.describe('Slider visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`sizes · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-slider--sizes', { theme, mode });
        await expect(page.getByTestId('sizes')).toHaveScreenshot(`sizes-${theme}-${mode}.png`);
      });
    }
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`variants · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-slider--variants', { dir });
      await expect(page.getByTestId('variants')).toHaveScreenshot(`variants-${dir}.png`);
    });
  }

  test('vertical', async ({ page }) => {
    await openStory(page, 'components-slider--vertical');
    await expect(page.getByTestId('vertical')).toHaveScreenshot('vertical.png');
  });
});

/**
 * Paints `layers` (CSS colours, bottom first) over the scope's `surface` and returns the
 * resulting sRGB pixel, so translucent and `color-mix` colours compare as they look.
 */
const paint = (scope: Locator, layers: string[]) =>
  scope.evaluate((root, layers) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d')!;
    const surface = document.createElement('div');
    surface.className = 'bg-surface';
    root.append(surface);
    for (const color of [getComputedStyle(surface).backgroundColor, ...layers]) {
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
    }
    surface.remove();
    return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
  }, layers);
/** A class's computed background inside the scope (for semantic colour roles). */
const roleBackground = (scope: Locator, className: string) =>
  scope.evaluate((root, className) => {
    const probe = document.createElement('div');
    probe.className = className;
    root.append(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }, className);
const background = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).backgroundColor);
const contrast = (a: number[], b: number[]) => {
  const luminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map((v) => {
      const c = v / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

test.describe('Slider stop indicators (m3.material.io tokens)', () => {
  for (const mode of MODES) {
    test(`colours and contrast · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-slider--variants', { mode });
      const scope = page.getByTestId('variants');
      const discrete = page.getByRole('group', { name: 'Discrete', exact: true });
      const activeTick = discrete.locator('[data-active]').first();
      const inactiveTick = discrete
        .locator('span[aria-hidden]:not([data-active]).size-\\[4px\\]')
        .last();
      const [onPrimary, onSecondaryContainer] = [
        await roleBackground(scope, 'bg-on-primary'),
        await roleBackground(scope, 'bg-on-secondary-container'),
      ];
      expect(await background(activeTick)).toBe(onPrimary);
      expect(await background(inactiveTick)).toBe(onSecondaryContainer);

      // The end stop sits on the inactive track.
      const continuous = page.getByRole('group', { name: 'Centred', exact: true });
      const endStop = continuous.locator('[data-tone="inactive"] > span').last();
      expect(await background(endStop)).toBe(onSecondaryContainer);

      // Enabled dots keep 3:1 against their track (WCAG 1.4.11).
      const active = await roleBackground(scope, 'bg-primary');
      const inactive = await roleBackground(scope, 'bg-secondary-container');
      expect(
        contrast(await paint(scope, [active, onPrimary]), await paint(scope, [active])),
      ).toBeGreaterThanOrEqual(3);
      expect(
        contrast(
          await paint(scope, [inactive, onSecondaryContainer]),
          await paint(scope, [inactive]),
        ),
      ).toBeGreaterThanOrEqual(3);

      // Disabled: inverse-on-surface on the active track, on-surface 38% on the inactive one.
      const disabled = page.getByRole('group', { name: 'Disabled', exact: true });
      expect(await background(disabled.locator('[data-tone="inactive"] > span').last())).toBe(
        await roleBackground(scope, 'bg-on-surface/38'),
      );
    });
  }
});

test.describe('Slider geometry and interaction', () => {
  test('a disabled handle takes its colours from a dark theme scope', async ({ page }) => {
    await openStory(page, 'components-slider--variants', { mode: 'dark' });
    const handle = page
      .getByRole('group', { name: 'Disabled', exact: true })
      .locator('[data-thumb] > span')
      .first();
    // on-surface 38% over surface, resolved inside the story's scope, not at the root.
    const expected = await page.getByTestId('variants').evaluate((root) => {
      const probe = document.createElement('div');
      probe.style.backgroundColor =
        'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, var(--md-sys-color-surface))';
      root.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    const atRoot = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.backgroundColor =
        'color-mix(in srgb, var(--md-sys-color-on-surface) 38%, var(--md-sys-color-surface))';
      document.body.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    expect(expected).not.toBe(atRoot);
    expect(await handle.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(expected);
  });

  test('track, gap and handle follow Compose', async ({ page }) => {
    await openStory(page, 'components-slider--playground', {}, { showValueLabel: false });
    const slider = page.getByTestId('slider');
    const box = await rect(slider);
    expect(box.height).toBe(44);
    const [active, inactive] = await segments(page, slider);
    const handle = await rect(slider.locator('[data-thumb] > span').first());
    expect(handle).toMatchObject({ width: 4, height: 44 });
    expect(active!.height).toBe(16);
    // 6px gaps either side of the 4px handle.
    expect(handle.x - active!.right).toBeCloseTo(6, 0);
    expect(inactive!.x - handle.right).toBeCloseTo(6, 0);
    // The track spans the width less the handle's half at each end; 40% of it is active.
    const track = box.width - 4;
    expect(handle.x + 2 - (box.x + 2)).toBeCloseTo(track * 0.4, 0);
  });

  test('pressing the track moves the thumb; dragging and keys adjust it', async ({ page }) => {
    await openStory(page, 'components-slider--playground');
    const slider = page.getByTestId('slider');
    const box = await rect(slider);
    await page.mouse.click(box.x + 2 + (box.width - 4) * 0.75, box.y + box.height / 2);
    await expect(page.getByTestId('value')).toHaveText('Value 75');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('value')).toHaveText('Value 74');
    const thumb = slider.locator('[data-thumb]');
    await expect(thumb).toHaveAttribute('data-focus-visible', 'true');
    // Keyboard focus narrows the handle to 2px and shows the value indicator.
    expect((await rect(thumb.locator('> span').first())).width).toBe(2);
    await expect(slider.getByText('74', { exact: true })).toBeVisible();
    await shotWithMargin(page, slider, 'focused.png', 64);
  });

  test('RTL mirrors the track and the arrow keys', async ({ page }) => {
    await openStory(page, 'components-slider--playground', { dir: 'rtl' });
    const slider = page.getByTestId('slider');
    const [active] = await segments(page, slider);
    const box = await rect(slider);
    // The active track starts at the right edge (2px in, for the handle's half).
    expect(Math.round(box.right - 2 - active!.right)).toBe(0);
    await slider.getByRole('slider').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByTestId('value')).toHaveText('Value 41');
  });

  test('vertical sliders run bottom to top', async ({ page }) => {
    await openStory(page, 'components-slider--vertical');
    const slider = page.getByTestId('vertical-slider');
    const box = await rect(slider);
    expect(box.width).toBe(44);
    expect(box.height).toBe(240);
    const handle = await rect(slider.locator('[data-thumb] > span').first());
    expect(handle).toMatchObject({ width: 44, height: 4 });
    // 60%: the handle sits 60% of the way up the track.
    expect(box.bottom - 2 - (handle.y + 2)).toBeCloseTo((240 - 4) * 0.6, 0);
    await slider.getByRole('slider').focus();
    await page.keyboard.press('ArrowUp');
    await expect(slider.getByRole('slider')).toHaveValue('61');
  });
});

test.describe('Slider sizes and inset icons', () => {
  test('the medium handle is 52px (M3 measurements)', async ({ page }) => {
    await openStory(page, 'components-slider--sizes');
    const thumb = page
      .locator('[data-thumb]')
      .filter({ has: page.getByRole('slider', { name: 'Volume md' }) });
    expect((await rect(thumb.locator('> span').first())).height).toBe(52);
  });

  test('the start icon moves to the inactive track at a low value', async ({ page }) => {
    await openStory(page, 'components-slider--sizes');
    const slider = page.getByTestId('moved-icon');
    const handle = await rect(slider.locator('[data-thumb] > span').first());
    const moved = await rect(slider.locator('[data-moved-icon]'));
    expect(moved.width).toBe(24);
    // 10px after the inactive track's start (the handle, then a 6px gap).
    expect(moved.x - handle.right).toBeCloseTo(16, 0);
    // The copy in the active track is hidden.
    const [active] = await segments(page, slider);
    expect(active!.width).toBeLessThan(44);
    const icons = await slider
      .locator('[data-tone="active"] > span')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
    expect(icons.every((width) => width === 0)).toBe(true);
    await shotWithMargin(page, slider, 'moved-icon.png', 8);
  });

  test('Space and an arrow step by an interval', async ({ page }) => {
    await openStory(page, 'components-slider--playground');
    await page.getByTestId('slider').getByRole('slider').focus();
    await page.keyboard.down('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.up('Space');
    await expect(page.getByTestId('value')).toHaveText('Value 50');
  });
});

test.describe('Slider layout safety', () => {
  layoutSafetySuite('components-slider--layout-override', {
    height: 44,
    width: 320,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      await target.getByRole('slider').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByTestId('count')).toHaveText('Changed 1');
    },
  });
});
