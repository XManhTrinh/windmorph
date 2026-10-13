import { expect, test, type Locator } from '@playwright/test';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

const box = async (locator: Locator) => (await locator.boundingBox())!;
const OVERRIDES = [
  'none',
  'fixed',
  'absolute',
  'sticky',
  'static',
  'overflowHidden',
  'fullWidth',
  'transform',
];

test.describe('Radio', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`states · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-radio--states', { theme, mode });
        await expect(page.getByTestId('states')).toHaveScreenshot(`radio-${theme}-${mode}.png`);
      });
    }
  }

  test('the dot grows to 10px in a 20px ring; arrows move the selection', async ({ page }) => {
    await openStory(page, 'components-radio--playground');
    const standard = page.getByRole('radio', { name: 'Standard' });
    const ring = standard.locator('xpath=ancestor::label[1]').locator('.rounded-full.border-2');
    expect((await box(ring)).width).toBe(20);
    await expect.poll(async () => (await box(ring.locator('span'))).width).toBeCloseTo(10, 0);

    await standard.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: 'Express' })).toBeChecked();
    await expect.poll(async () => (await box(ring.locator('span'))).width).toBeCloseTo(0, 0);
  });

  test('a selected radio in a disabled group uses the disabled colour', async ({ page }) => {
    await openStory(page, 'components-radio--states');
    const radio = page.getByRole('radio', { name: 'Option A' }).nth(1);
    const ring = radio.locator('xpath=ancestor::label[1]').locator('.rounded-full.border-2');
    const [ringColor, labelColor] = await Promise.all([
      ring.evaluate((el) => getComputedStyle(el).borderTopColor),
      radio.locator('xpath=ancestor::label[1]').evaluate((el) => getComputedStyle(el).color),
    ]);
    // Both are on-surface at 38%.
    expect(ringColor).toBe(labelColor);
  });

  test('hover and focus', async ({ page }) => {
    await openStory(page, 'components-radio--playground');
    const control = page
      .getByRole('radio', { name: 'Express' })
      .locator('xpath=ancestor::span[1]/..');
    await control.hover();
    await expect(control).toHaveAttribute('data-hovered', 'true');
    await shotWithMargin(page, control, 'radio-hover.png');
  });

  for (const override of OVERRIDES) {
    for (const dir of ['ltr', 'rtl'] as const) {
      test(`layout safety · ${override} · ${dir}`, async ({ page }) => {
        await openStory(page, 'components-radio--layout-override', { dir }, { override });
        const control = page.getByTestId('target').locator('.state-layer');
        expect(await control.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(40);
        await page.getByText('Layout').click();
        await expect(page.getByRole('radio')).toBeChecked();
      });
    }
  }
});

test.describe('Switch', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`states · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-switch--states', { theme, mode });
        await expect(page.getByTestId('states')).toHaveScreenshot(`switch-${theme}-${mode}.png`);
      });
    }
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`thumb geometry follows Compose · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-switch--playground', { dir });
      const input = page.getByRole('switch', { name: 'Wi-Fi' });
      const label = input.locator('xpath=ancestor::label[1]');
      const track = label.locator('.w-\\[52px\\]');
      const thumb = track.locator('> span.absolute').last();
      const t = await box(track);
      const centre = async () => {
        const b = await box(thumb);
        const fromStart =
          dir === 'ltr' ? b.x + b.width / 2 - t.x : t.x + t.width - (b.x + b.width / 2);
        return { size: Math.round(b.width), fromStart: Math.round(fromStart) };
      };
      expect(t.width).toBe(52);
      expect(t.height).toBe(32);
      expect(await centre()).toEqual({ size: 16, fromStart: 16 });

      await label.click();
      await expect(input).toBeChecked();
      await expect.poll(centre).toEqual({ size: 24, fromStart: 36 });

      const b = await box(thumb);
      await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await page.mouse.down();
      await expect.poll(async () => (await centre()).size).toBe(28);
      await page.mouse.up();
      await expect.poll(centre).toEqual({ size: 16, fromStart: 16 });
    });
  }

  test('focus ring surrounds the track', async ({ page }) => {
    await openStory(page, 'components-switch--playground');
    await page.keyboard.press('Tab');
    const track = page.locator('.w-\\[52px\\]');
    await expect(track).toHaveAttribute('data-focus-visible', 'true');
    expect(await track.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    await shotWithMargin(page, track, 'switch-focus.png');
  });

  for (const override of OVERRIDES) {
    for (const dir of ['ltr', 'rtl'] as const) {
      test(`layout safety · ${override} · ${dir}`, async ({ page }) => {
        await openStory(page, 'components-switch--layout-override', { dir }, { override });
        const track = page.getByTestId('target').locator('.w-\\[52px\\]');
        expect(await track.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(52);
        await page.getByText('Layout').click();
        await expect(page.getByRole('switch')).toBeChecked();
      });
    }
  }
});
