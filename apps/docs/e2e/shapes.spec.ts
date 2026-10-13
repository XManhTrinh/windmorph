import { expect, test, type Page } from '@playwright/test';
import { MODES } from './shots';
import { openStory } from './story';

const pathD = (page: Page, testId: string) =>
  page.getByTestId(testId).locator('path').getAttribute('d');

/** The static morph frame for the Animated story's shapes. */
async function staticFrame(page: Page, progress: number) {
  await openStory(
    page,
    'foundations-shapes--morph',
    {},
    {
      from: 'Circle',
      to: 'SoftBurst',
      progress: String(progress),
    },
  );
  return pathD(page, 'morph');
}

test.describe('Shapes visual regression', () => {
  for (const mode of MODES) {
    test(`gallery · ${mode}`, async ({ page }) => {
      await openStory(page, 'foundations-shapes--gallery', { mode });
      await expect(page.getByTestId('gallery')).toHaveScreenshot(`gallery-${mode}.png`);
    });
  }

  test('morph frames', async ({ page }) => {
    await openStory(page, 'foundations-shapes--morph-frames');
    await expect(page.getByTestId('frames')).toHaveScreenshot('morph-frames.png');
  });

  for (const progress of [-0.2, 0.5, 1.2]) {
    test(`morph at ${progress}`, async ({ page }) => {
      await openStory(page, 'foundations-shapes--morph', {}, { progress: String(progress) });
      await expect(page.getByTestId('morph')).toHaveScreenshot(`morph-${progress}.png`);
    });
  }
});

test.describe('useM3Morph', () => {
  test('springs to the end shape and back', async ({ page }) => {
    const start = await staticFrame(page, 0);
    const end = await staticFrame(page, 1);

    await openStory(page, 'foundations-shapes--animated');
    await expect.poll(() => pathD(page, 'animated')).toBe(start);

    await page.getByRole('button', { name: 'Morph' }).click();
    // In flight the path is neither shape; it settles exactly on the end shape.
    await expect.poll(() => pathD(page, 'animated')).not.toBe(start);
    await expect.poll(() => pathD(page, 'animated'), { timeout: 5000 }).toBe(end);

    await page.getByRole('button', { name: 'Morph' }).click();
    await expect.poll(() => pathD(page, 'animated'), { timeout: 5000 }).toBe(start);
  });

  test('reduced motion snaps to the end shape', async ({ page }) => {
    const end = await staticFrame(page, 1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'foundations-shapes--animated');
    await page.getByRole('button', { name: 'Morph' }).click();
    const next = await page.evaluate(async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      return document.querySelector('[data-testid="animated"] path')!.getAttribute('d');
    });
    expect(next).toBe(end);
  });
});
