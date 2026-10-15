import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test, type Locator, type Page } from '@playwright/test';
import type { BentoManifest } from '../lib/bento-media';

/**
 * The home page bento: live from the medium window class up, its recorded video on phones
 * (`components/home/bento-video.tsx`). The video tests need the recording in the build
 * (`record:bento`, then build again), which CI always makes; a local build without it is
 * checked for the fallback, the live bento on phones.
 */

const MANIFEST = fileURLToPath(new URL('../public/media/bento/bento.json', import.meta.url));
const recorded = existsSync(MANIFEST);
const manifest = recorded ? (JSON.parse(readFileSync(MANIFEST, 'utf8')) as BentoManifest) : null;

const PHONE = { width: 390, height: 844 };

/** Phone widths the video is checked at: the smallest common one, a typical one, a large one. */
const PHONE_WIDTHS = [320, 390, 430];

/** The live bento, by its "Reply" button group (the bento is hidden from assistive technology). */
const liveBento = (page: Page) => page.locator('[aria-label="Reply"]');

/**
 * How long a video may take to start playing: the first play fetches and decodes it, which
 * took over 5 seconds on a loaded CI runner.
 */
const PLAY_TIMEOUT = 15_000;

/** The bento video's pause / play button. */
const playButton = (page: Page) => page.locator('[data-bento-video] button');

/**
 * The button's colours, and the colour roles they should match, resolved on the page: each
 * role is painted on a probe inside the bento so it's computed the way the browser paints it.
 */
const buttonColors = (page: Page) =>
  playButton(page).evaluate((button) => {
    const probe = (value: string) => {
      const element = document.createElement('span');
      element.style.color = value;
      button.parentElement?.append(element);
      const color = getComputedStyle(element).color;
      element.remove();
      return color;
    };
    const style = getComputedStyle(button);
    return {
      background: style.backgroundColor,
      color: style.color,
      inverseSurface80: probe(
        'color-mix(in srgb, var(--md-sys-color-inverse-surface) 80%, transparent)',
      ),
      inverseOnSurface: probe('var(--md-sys-color-inverse-on-surface)'),
      primary: probe('var(--md-sys-color-primary)'),
      onPrimary: probe('var(--md-sys-color-on-primary)'),
    };
  });

/** Whether the video is playing, with time moving on. */
const isPlaying = (video: Locator) =>
  video.evaluate(
    (element: HTMLVideoElement) =>
      new Promise<boolean>((resolve) => {
        const start = element.currentTime;
        setTimeout(() => resolve(!element.paused && element.currentTime > start), 300);
      }),
  );

test('CI records the bento video before testing it', () => {
  test.skip(!process.env.CI, 'Local builds may have no recording.');
  expect(recorded, 'run record:bento and build again before the e2e suite').toBe(true);
});

test.describe('without a recording', () => {
  test.skip(recorded, 'This build has the recording.');

  test('phones show the live bento', async ({ page }) => {
    await page.setViewportSize(PHONE);
    await page.goto('/');
    await expect(liveBento(page)).toHaveCount(1);
    await expect(page.locator('video')).toHaveCount(0);
  });
});

for (const width of PHONE_WIDTHS) {
  test.describe(`phone (${width}px)`, () => {
    test.skip(!recorded, 'Needs record:bento before the build.');
    test.use({ viewport: { width, height: 844 } });

    test("the button sits over the card's end corner without widening the page", async ({
      page,
    }) => {
      await page.goto('/');
      const card = page.locator('[data-bento-video] > div').first();
      await card.scrollIntoViewIfNeeded();
      const cardBox = await card.boundingBox();
      const buttonBox = await playButton(page).boundingBox();
      if (!cardBox || !buttonBox) throw new Error('No bento video');
      // 56px, its centre 12px in from the card's bottom and end edges.
      expect(buttonBox.width).toBe(56);
      expect(buttonBox.height).toBe(56);
      expect(buttonBox.x + 28).toBeCloseTo(cardBox.x + cardBox.width - 12, 0);
      expect(buttonBox.y + 28).toBeCloseTo(cardBox.y + cardBox.height - 12, 0);
      // The overhang stays inside the window: no sideways scrolling.
      expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    });

    test('in right-to-left, the button sits over the bottom-left corner', async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem('windmorph-site-dir', 'rtl'));
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
      const card = page.locator('[data-bento-video] > div').first();
      await card.scrollIntoViewIfNeeded();
      const cardBox = await card.boundingBox();
      const buttonBox = await playButton(page).boundingBox();
      if (!cardBox || !buttonBox) throw new Error('No bento video');
      expect(buttonBox.x + 28).toBeCloseTo(cardBox.x + 12, 0);
      expect(buttonBox.x).toBeGreaterThanOrEqual(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    });

    test('pause is a translucent inverse surface; play is filled with primary', async ({
      page,
    }) => {
      await page.goto('/');
      const video = page.locator('[data-bento-video] video');
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => isPlaying(video), { timeout: PLAY_TIMEOUT }).toBe(true);
      await expect(playButton(page)).toHaveAccessibleName('Pause animation');
      const playing = await buttonColors(page);
      expect(playing.background).toBe(playing.inverseSurface80);
      expect(playing.color).toBe(playing.inverseOnSurface);

      await playButton(page).click();
      await expect(playButton(page)).toHaveAccessibleName('Play animation');
      // Past the state layer's press fade.
      await page.mouse.move(0, 0);
      await expect
        .poll(async () => {
          const paused = await buttonColors(page);
          return paused.background === paused.primary && paused.color === paused.onPrimary;
        })
        .toBe(true);
    });

    test('shows the video, which plays in view and pauses out of it', async ({ page }) => {
      await page.goto('/');
      const video = page.locator('[data-bento-video] video');
      await expect(video).toHaveCount(1);
      // Once hydrated, the live bento (and its loop) is gone.
      await expect(liveBento(page)).toHaveCount(0);
      await expect(video).toHaveAttribute('preload', 'none');
      await expect(video).toHaveAttribute('aria-hidden', 'true');
      // Nothing loads before it's in view.
      expect(await video.evaluate((element: HTMLVideoElement) => element.currentSrc)).toBe('');

      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => isPlaying(video), { timeout: PLAY_TIMEOUT }).toBe(true);
      expect(await video.evaluate((element: HTMLVideoElement) => element.currentSrc)).toMatch(
        /\/media\/bento\/bento-light\.(mp4|webm)$/,
      );

      await page.evaluate(() => window.scrollTo(0, 0));
      await expect
        .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
        .toBe(true);
    });

    test('the button pauses and plays it', async ({ page }) => {
      await page.goto('/');
      const video = page.locator('[data-bento-video] video');
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => isPlaying(video), { timeout: PLAY_TIMEOUT }).toBe(true);

      await page.getByRole('button', { name: 'Pause animation' }).click();
      await expect
        .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
        .toBe(true);
      await page.getByRole('button', { name: 'Play animation' }).click();
      await expect.poll(() => isPlaying(video), { timeout: PLAY_TIMEOUT }).toBe(true);
    });

    test('follows the colour mode', async ({ page }) => {
      await page.goto('/');
      const video = page.locator('[data-bento-video] video');
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => isPlaying(video), { timeout: PLAY_TIMEOUT }).toBe(true);
      await page.emulateMedia({ colorScheme: 'dark' });
      await expect
        .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentSrc))
        .toMatch(/\/media\/bento\/bento-dark\.(mp4|webm)$/);
      await expect(video).toHaveAttribute('poster', '/media/bento/bento-dark.jpg');
      await expect.poll(() => isPlaying(video), { timeout: PLAY_TIMEOUT }).toBe(true);
    });

    test('with reduced motion, waits on its poster for play', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      const video = page.locator('[data-bento-video] video');
      await video.scrollIntoViewIfNeeded();
      const play = page.getByRole('button', { name: 'Play animation' });
      await expect(play).toBeVisible();
      await expect(video).toHaveAttribute('poster', '/media/bento/bento-light.jpg');
      expect(await video.evaluate((element: HTMLVideoElement) => element.currentSrc)).toBe('');

      await play.click();
      await expect.poll(() => isPlaying(video), { timeout: PLAY_TIMEOUT }).toBe(true);
    });

    test('turns into the live bento on a wider window', async ({ page }) => {
      await page.goto('/');
      await expect(liveBento(page)).toHaveCount(0);
      await page.setViewportSize({ width: 840, height: 900 });
      await expect(liveBento(page)).toHaveCount(1);
      await expect(page.locator('video')).toHaveCount(0);
    });

    for (const mode of ['light', 'dark'] as const) {
      test(`passes axe in ${mode} mode`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
        await page.goto('/');
        const bento = page.locator('[data-bento-video]');
        await bento.scrollIntoViewIfNeeded();
        await expect(page.getByRole('button', { name: 'Play animation' })).toBeVisible();
        const results = await new AxeBuilder({ page }).include('[data-bento-video]').analyze();
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
      });

      test(`passes axe in ${mode} mode while playing`, async ({ page }) => {
        await page.emulateMedia({ colorScheme: mode });
        await page.goto('/');
        const video = page.locator('[data-bento-video] video');
        await video.scrollIntoViewIfNeeded();
        await expect.poll(() => isPlaying(video), { timeout: PLAY_TIMEOUT }).toBe(true);
        const results = await new AxeBuilder({ page }).include('[data-bento-video]').analyze();
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
      });
    }
  });
}

for (const width of [840, 1440]) {
  test(`${width}px shows the live bento and no video`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(liveBento(page)).toBeVisible();
    await expect(page.locator('video')).toHaveCount(0);
  });
}

test('the recording is the bento card at a 1440px window', async ({ page }) => {
  test.skip(!manifest, 'Needs record:bento.');
  await page.setViewportSize({ width: 1440, height: 860 });
  await page.goto('/');
  const box = await liveBento(page).evaluate((group) => {
    const rect = group.parentElement?.closest('.grid')?.getBoundingClientRect();
    return rect ? { width: Math.round(rect.width), height: Math.round(rect.height) } : null;
  });
  expect(box).toEqual({ width: manifest?.width, height: manifest?.height });

  for (const mode of ['light', 'dark']) {
    const sizes = await page.evaluate(
      async ({ mode: name, formats }) => {
        const poster = new Image();
        poster.src = `/media/bento/bento-${name}.jpg`;
        await poster.decode();
        const videos = await Promise.all(
          formats
            .filter((format) => document.createElement('video').canPlayType(`video/${format}`))
            .map(
              (format) =>
                new Promise<{ width: number; height: number; duration: number }>(
                  (resolve, reject) => {
                    const video = document.createElement('video');
                    video.preload = 'metadata';
                    video.onloadedmetadata = () =>
                      resolve({
                        width: video.videoWidth,
                        height: video.videoHeight,
                        duration: video.duration,
                      });
                    video.onerror = () => reject(new Error(`bento-${name}.${format} won't load`));
                    video.src = `/media/bento/bento-${name}.${format}`;
                  },
                ),
            ),
        );
        return { poster: { width: poster.naturalWidth, height: poster.naturalHeight }, videos };
      },
      { mode, formats: manifest?.formats ?? [] },
    );
    expect(sizes.poster).toEqual({ width: manifest?.width, height: manifest?.height });
    expect(sizes.videos.length).toBeGreaterThan(0);
    for (const video of sizes.videos) {
      expect({ width: video.width, height: video.height }).toEqual(sizes.poster);
      // One loop: 18 seconds, give or take a frame.
      expect(Math.abs(video.duration * 1000 - (manifest?.loopMs ?? 0))).toBeLessThan(100);
    }
  }
});
