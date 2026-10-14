import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './story';

export interface FaceSample {
  face: string;
  opacity: number;
  /** The computed `rotate`, in degrees (0 for `none`). */
  rotate: number;
  visibility: string;
}

/**
 * Freezes the icon faces' transitions inside `button` as soon as they start, so a test can
 * sample them at fixed times however slowly the page runs. Call it before the change.
 */
export async function freezeFaces(button: Locator) {
  await button.locator('[data-icon-face]').evaluateAll((faces) => {
    for (const face of faces) {
      face.addEventListener('transitionrun', () => {
        for (const animation of face.getAnimations()) animation.pause();
      });
    }
  });
}

/** Waits for each face to have `count` frozen transitions, and returns their properties. */
export async function frozenTransitions(button: Locator, count: number) {
  const faces = button.locator('[data-icon-face]');
  const properties = () =>
    faces.evaluateAll((elements) =>
      elements.map((face) =>
        face
          .getAnimations()
          .filter((animation) => animation.playState === 'paused')
          .map((animation) => (animation as CSSTransition).transitionProperty)
          .sort(),
      ),
    );
  await expect
    .poll(async () => (await properties()).map((list) => list.length))
    .toEqual([count, count]);
  return properties();
}

/** Seeks every frozen face transition to `ms` after its start and reads the faces' styles. */
export function sampleFaces(button: Locator, ms: number): Promise<FaceSample[]> {
  return button.locator('[data-icon-face]').evaluateAll(
    (faces, time) =>
      faces.map((face) => {
        for (const animation of face.getAnimations()) animation.currentTime = time;
        const style = getComputedStyle(face);
        return {
          face: face.getAttribute('data-icon-face') ?? '',
          opacity: Number(style.opacity),
          rotate: style.rotate === 'none' ? 0 : parseFloat(style.rotate),
          visibility: style.visibility,
        };
      }),
    ms,
  );
}

/** A CSS duration custom property on the faces, in milliseconds. */
export function durationMs(button: Locator, property: string) {
  return button
    .locator('[data-icon-face]')
    .first()
    .evaluate((face, name) => {
      const value = getComputedStyle(face).getPropertyValue(name).trim();
      return value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000;
    }, property);
}

const SPATIAL_FAST = '--md-sys-motion-spring-spatial-fast-duration';
const EFFECTS_FAST = '--md-sys-motion-spring-effects-fast-duration';
const between = (value: number, low: number, high: number) => value > low && value < high;

/**
 * Checks a two-icon button's `iconTransition` in a story that takes it as an arg: `swap`
 * hands over at the midpoint of the fast spatial spring; `rotate` turns (mirrored in RTL)
 * and crossfades the faces; reduced motion keeps only the crossfade. `getButton` returns
 * the button, and pressing it moves to the alternate icon.
 */
export function iconTransitionSuite(storyId: string, getButton: (page: Page) => Locator) {
  test('swap hands the icon over halfway through the spring', async ({ page }) => {
    await openStory(page, storyId, {}, { iconTransition: 'swap' });
    const button = getButton(page);
    await freezeFaces(button);
    await button.click();
    expect(await frozenTransitions(button, 1)).toEqual([['visibility'], ['visibility']]);
    const half = (await durationMs(button, SPATIAL_FAST)) / 2;
    const visibility = async (ms: number) =>
      (await sampleFaces(button, ms)).map(({ visibility: value }) => value);
    expect(await visibility(half - 10)).toEqual(['visible', 'hidden']);
    expect(await visibility(half + 10)).toEqual(['hidden', 'visible']);
    // Nothing turns or fades.
    for (const face of await sampleFaces(button, half)) {
      expect(face).toMatchObject({ opacity: 1, rotate: 0 });
    }
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`rotate turns and crossfades the icons · ${dir}`, async ({ page }) => {
      await openStory(page, storyId, { dir }, { iconTransition: 'rotate' });
      const button = getButton(page);
      await freezeFaces(button);
      await button.click();
      expect(await frozenTransitions(button, 2)).toEqual([
        ['opacity', 'rotate'],
        ['opacity', 'rotate'],
      ]);
      // Counter-clockwise in LTR (as Google's Expressive showcase), clockwise in RTL.
      const turn = dir === 'ltr' ? -1 : 1;
      const [outgoing, incoming] = await sampleFaces(button, 0);
      expect(outgoing).toMatchObject({ face: 'primary', opacity: 1, rotate: 0 });
      expect(incoming).toMatchObject({ face: 'alternate', opacity: 0, rotate: -90 * turn });

      // Midway through the fast effects spring, both faces are turning and fading.
      const mid = (await durationMs(button, EFFECTS_FAST)) / 2;
      const [leaving, arriving] = await sampleFaces(button, mid);
      expect(between(leaving!.rotate * turn, 0, 90)).toBe(true);
      expect(between(arriving!.rotate * turn, -90, 0)).toBe(true);
      expect(between(leaving!.opacity, 0, 1)).toBe(true);
      expect(between(arriving!.opacity, 0, 1)).toBe(true);

      const end = await durationMs(button, SPATIAL_FAST);
      const [gone, shown] = await sampleFaces(button, end);
      expect(gone).toMatchObject({ opacity: 0, rotate: 90 * turn, visibility: 'visible' });
      expect(shown).toMatchObject({ opacity: 1, rotate: 0 });
    });
  }

  test('rotate under reduced motion only crossfades', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, storyId, {}, { iconTransition: 'rotate' });
    const button = getButton(page);
    await freezeFaces(button);
    await button.click();
    expect(await frozenTransitions(button, 1)).toEqual([['opacity'], ['opacity']]);
    const mid = (await durationMs(button, EFFECTS_FAST)) / 2;
    const [leaving, arriving] = await sampleFaces(button, mid);
    expect(leaving!.rotate).toBe(0);
    expect(arriving!.rotate).toBe(0);
    expect(between(leaving!.opacity, 0, 1)).toBe(true);
    expect(between(arriving!.opacity, 0, 1)).toBe(true);
  });
}
