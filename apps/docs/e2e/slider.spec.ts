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

test.describe('Slider geometry and interaction', () => {
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
