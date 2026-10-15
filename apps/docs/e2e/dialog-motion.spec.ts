import { expect, test, type Page } from '@playwright/test';
import { insetEdges, sampleMotion, type Frame, type PartFrame } from './motion-frames';
import { openStory, type StoryGlobals } from './story';

/*
 * The dialog's enter and exit motion, frame by frame (16ms frames). The reference is the M3
 * dialog motion as Material Web encodes it (`dialog/internal/animations.ts`), mapped onto the
 * M3 Expressive springs:
 *
 * - entering, the dialog slides 50px away from the edge it sits against, its container grows
 *   from that edge from 0, the container fades in first, the headline and content fade in
 *   after 50ms (20% of their 250ms) and the actions after 150ms (50% of their 300ms), and the
 *   scrim fades in;
 * - leaving, the parts fade out at once, the dialog slides back 50px while its container
 *   shrinks to 35%, the container fades after 100ms, and the scrim fades out by 150ms.
 *
 * Reduced motion keeps only the fades of the dialog and the scrim, and the full-screen dialog
 * keeps its own slide up and fade.
 */

const SCRIM = '[aria-hidden="true"][class*="bg-scrim"]';

interface Target {
  /** The story that opens the dialog from its first button. */
  story: string;
  role: 'alertdialog' | 'dialog';
  /** The parts that fade in with the headline and content. */
  early: Record<string, string>;
  /** The parts that fade in with the actions. */
  late: Record<string, string>;
  globals?: StoryGlobals;
  viewport?: { width: number; height: number };
}

const basicParts = (role: string) => ({
  early: {
    title: `[role=${role}] > [data-slot=title]`,
    content: `[role=${role}] > [data-slot=content]`,
  },
  late: { actions: `[role=${role}] > [data-slot=actions]` },
});

function selectors(target: Target) {
  return {
    motion: `div:has(> [role=${target.role}])`,
    panel: `[role=${target.role}]`,
    scrim: SCRIM,
    ...target.early,
    ...target.late,
  };
}

/** Opens the story and, if its dialog starts open, closes it first. */
async function prepare(page: Page, target: Target) {
  await page.setViewportSize(target.viewport ?? { width: 1024, height: 760 });
  await openStory(page, target.story, target.globals);
  const dialog = page.locator(`[role=${target.role}]`);
  if (await dialog.count()) {
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
}

const openFrames = (page: Page, target: Target, duration = 480) =>
  sampleMotion(page, {
    act: { click: '#storybook-root button' },
    started: `[role=${target.role}]`,
    parts: selectors(target),
    duration,
  });

/** Waits for focus to be inside the dialog, where Escape closes it. */
const focusInside = (page: Page, role: Target['role']) =>
  expect
    .poll(() =>
      page.evaluate(
        (selector) => document.querySelector(selector)?.contains(document.activeElement) ?? false,
        `[role=${role}]`,
      ),
    )
    .toBe(true);

const closeFrames = async (page: Page, target: Target, duration = 400) => {
  await focusInside(page, target.role);
  return sampleMotion(page, {
    act: { key: 'Escape' },
    started: '[data-exiting]',
    parts: selectors(target),
    duration,
  });
};

/** A computed `translate` as [x, y] in px. */
function translate(part: PartFrame): [number, number] {
  if (part.translate === 'none') return [0, 0];
  const [x = 0, y = 0] = part.translate.split(' ').map((value) => parseFloat(value));
  return [x, y];
}

const at = (frames: Frame[], t: number) => frames.find((frame) => frame.t === t)!.parts;
const part = (parts: Frame['parts'], name: string) => parts[name]!;

/** How far the slide has still to go, as a share of `slide` (1 at the start, 0 at rest). */
function slideLeft(motion: PartFrame, slide: [number, number]) {
  const [x, y] = translate(motion);
  const length = Math.hypot(...slide);
  return (x * slide[0] + y * slide[1]) / (length * length);
}

/** How much of the panel the container's clip shows along the axis it grows on. */
function shown(motion: PartFrame, axis: 'x' | 'y') {
  const [top, right, bottom, left] = insetEdges(motion.clipPath, motion.width, motion.height);
  return axis === 'y'
    ? (motion.height - top! - bottom!) / motion.height
    : (motion.width - left! - right!) / motion.width;
}

function expectEnter(frames: Frame[], target: Target, slide: [number, number], axis: 'x' | 'y') {
  const early = Object.keys(target.early);
  const late = Object.keys(target.late);
  const start = frames[0]!.parts;
  // It starts 50px toward its edge, collapsed to nothing, and transparent.
  expect(translate(part(start, 'motion'))).toEqual(slide);
  expect(shown(part(start, 'motion'), axis)).toBe(0);
  expect(part(start, 'motion').opacity).toBe(0);
  expect(part(start, 'scrim').opacity).toBe(0);
  for (const name of [...early, ...late]) expect(part(start, name).opacity).toBe(0);

  let left = 1;
  let grown = 0;
  let scrim = 0;
  for (const { t, parts } of frames) {
    const motion = part(parts, 'motion');
    // The slide only moves toward rest (a spring may overshoot it by a pixel or two).
    const remaining = slideLeft(motion, slide);
    if (remaining > 0) expect(remaining).toBeLessThanOrEqual(left + 1e-6);
    expect(remaining * Math.hypot(...slide)).toBeGreaterThanOrEqual(-2);
    left = remaining;
    // The container only grows until it covers the panel.
    const extent = shown(motion, axis);
    if (grown < 1) expect(extent).toBeGreaterThanOrEqual(grown - 1e-6);
    grown = extent;
    // The scrim only darkens.
    expect(part(parts, 'scrim').opacity).toBeGreaterThanOrEqual(scrim - 1e-6);
    scrim = part(parts, 'scrim').opacity;
    // The headline and content wait 50ms, the actions 150ms; the container shows first.
    for (const name of early) {
      if (t <= 48) expect(part(parts, name).opacity, `${name} at ${t}ms`).toBe(0);
      if (part(parts, name).opacity > 0) expect(motion.opacity).toBeGreaterThan(0.8);
    }
    for (const name of late) {
      if (t <= 144) expect(part(parts, name).opacity, `${name} at ${t}ms`).toBe(0);
      for (const other of early) {
        expect(part(parts, name).opacity).toBeLessThanOrEqual(part(parts, other).opacity + 1e-6);
      }
    }
  }
  for (const name of early) expect(part(at(frames, 64), name).opacity).toBeGreaterThan(0);
  for (const name of late) expect(part(at(frames, 160), name).opacity).toBeGreaterThan(0);
  // The scrim follows the container on a slower spring.
  expect(part(at(frames, 32), 'scrim').opacity).toBeLessThan(
    part(at(frames, 32), 'motion').opacity,
  );

  // At rest: unmoved, unclipped (the clip rests 32px outside the panel) and opaque.
  const end = frames.at(-1)!.parts;
  expect(part(end, 'motion')).toMatchObject({
    translate: 'none',
    clipPath: 'inset(-32px round 60px)',
    opacity: 1,
  });
  expect(part(end, 'scrim').opacity).toBe(1);
  for (const name of [...early, ...late]) expect(part(end, name).opacity).toBe(1);
}

function expectExit(frames: Frame[], target: Target, slide: [number, number], axis: 'x' | 'y') {
  const names = [...Object.keys(target.early), ...Object.keys(target.late)];
  for (const { t, parts } of frames) {
    const motion = part(parts, 'motion');
    // The parts fade out first, all together, while the container waits 100ms.
    if (t <= 96) expect(motion.opacity, `container at ${t}ms`).toBe(1);
    if (t === 96) for (const name of names) expect(part(parts, name).opacity).toBeLessThan(0.05);
    // It moves back toward its edge and shrinks to 35% on a critically damped spring, as the
    // reference's emphasized-accelerate curve does: never past 50px (within half a pixel) and
    // never below 35%.
    expect(slideLeft(motion, slide) * Math.hypot(...slide)).toBeLessThanOrEqual(50.5);
    expect(slideLeft(motion, slide)).toBeGreaterThanOrEqual(0);
    expect(shown(motion, axis)).toBeGreaterThanOrEqual(0.35 - 1e-3);
  }
  expect(slideLeft(part(at(frames, 96), 'motion'), slide)).toBeGreaterThan(0.9);
  expect(part(at(frames, 112), 'motion').opacity).toBeLessThan(1);
  expect(part(at(frames, 240), 'motion').opacity).toBeLessThan(0.02);
  // The scrim is gone in 150ms.
  expect(part(at(frames, 160), 'scrim').opacity).toBeLessThan(0.02);
  const end = part(frames.at(-1)!.parts, 'motion');
  expect(shown(end, axis)).toBeCloseTo(0.35, 1);
  expect(slideLeft(end, slide)).toBeCloseTo(1, 1);
}

const PLACEMENTS: {
  name: string;
  target: Target;
  slide: [number, number];
  axis: 'x' | 'y';
}[] = [
  {
    name: 'center',
    target: {
      story: 'components-dialog--basic',
      role: 'alertdialog',
      ...basicParts('alertdialog'),
    },
    slide: [0, -50],
    axis: 'y',
  },
  {
    name: 'top',
    target: {
      story: 'components-dialog--placement-top',
      role: 'alertdialog',
      ...basicParts('alertdialog'),
    },
    slide: [0, -50],
    axis: 'y',
  },
  {
    name: 'bottom',
    target: {
      story: 'components-dialog--placement-bottom',
      role: 'alertdialog',
      ...basicParts('alertdialog'),
    },
    slide: [0, 50],
    axis: 'y',
  },
  {
    name: 'start',
    target: {
      story: 'components-dialog--placement-start',
      role: 'alertdialog',
      ...basicParts('alertdialog'),
    },
    slide: [-50, 0],
    axis: 'x',
  },
  {
    name: 'start · rtl',
    target: {
      story: 'components-dialog--placement-start',
      role: 'alertdialog',
      globals: { dir: 'rtl' },
      ...basicParts('alertdialog'),
    },
    slide: [50, 0],
    axis: 'x',
  },
  {
    name: 'end',
    target: {
      story: 'components-dialog--placement-end',
      role: 'alertdialog',
      ...basicParts('alertdialog'),
    },
    slide: [50, 0],
    axis: 'x',
  },
  {
    name: 'end · rtl',
    target: {
      story: 'components-dialog--placement-end',
      role: 'alertdialog',
      globals: { dir: 'rtl' },
      ...basicParts('alertdialog'),
    },
    slide: [-50, 0],
    axis: 'x',
  },
];

test.describe('Dialog motion, frame by frame', () => {
  for (const { name, target, slide, axis } of PLACEMENTS) {
    test(`basic · ${name}: enters and leaves from its edge`, async ({ page }) => {
      await prepare(page, target);
      expectEnter(await openFrames(page, target), target, slide, axis);
      await page.waitForTimeout(100);
      expectExit(await closeFrames(page, target), target, slide, axis);
      await expect(page.locator(`[role=${target.role}]`)).toHaveCount(0);
    });
  }

  test('the container grows from 0 and never shows a part outside it', async ({ page }) => {
    const target = PLACEMENTS[0]!.target;
    await prepare(page, target);
    const frames = await openFrames(page, target);
    // The container clips its parts, so the spec's 0 start is kept: at the first frame a
    // part shows, the part of it the container covers is all that's painted, and the
    // headline is already (almost) all under it.
    const firstShown = frames.find(({ parts }) => part(parts, 'title').opacity > 0)!.parts;
    const motion = part(firstShown, 'motion');
    const title = part(firstShown, 'title');
    const [top, , bottom] = insetEdges(motion.clipPath, motion.width, motion.height);
    const clipBottom = motion.top + motion.height - bottom!;
    expect(motion.top + top!).toBeLessThanOrEqual(title.top);
    expect((clipBottom - title.top) / title.height).toBeGreaterThan(0.9);
  });

  test('custom children: every child fades with the content, data-slot="actions" last', async ({
    page,
  }) => {
    const target: Target = {
      story: 'components-dialog--custom-children',
      role: 'alertdialog',
      early: {
        headline: '[role=alertdialog] > h2',
        text: '[role=alertdialog] > p',
      },
      late: { buttons: '[role=alertdialog] > [data-slot=actions]' },
    };
    await prepare(page, target);
    expectEnter(await openFrames(page, target), target, [0, -50], 'y');
    await page.waitForTimeout(100);
    expectExit(await closeFrames(page, target), target, [0, -50], 'y');
  });

  test('with an icon: the icon fades in with the headline', async ({ page }) => {
    const target: Target = {
      story: 'components-dialog--with-icon',
      role: 'alertdialog',
      early: {
        icon: '[role=alertdialog] > [data-slot=icon]',
        ...basicParts('alertdialog').early,
      },
      late: basicParts('alertdialog').late,
    };
    await prepare(page, target);
    expectEnter(await openFrames(page, target), target, [0, -50], 'y');
  });

  test('date picker dialog: the picker, then its actions', async ({ page }) => {
    const target: Target = {
      story: 'components-pickers--date-dialog',
      role: 'dialog',
      early: { picker: '[role=dialog] > :not([data-slot])' },
      late: { actions: '[role=dialog] > [data-slot=actions]' },
    };
    await prepare(page, target);
    expectEnter(await openFrames(page, target), target, [0, -50], 'y');
    await page.waitForTimeout(100);
    expectExit(await closeFrames(page, target), target, [0, -50], 'y');
  });

  test('time picker dialog: the title and dial, then its actions', async ({ page }) => {
    const target: Target = {
      story: 'components-pickers--time-dialog',
      role: 'dialog',
      early: {
        title: '[role=dialog] > h2',
        picker: '[role=dialog] > div:not([data-slot])',
      },
      late: { actions: '[role=dialog] > [data-slot=actions]' },
    };
    await prepare(page, target);
    expectEnter(await openFrames(page, target), target, [0, -50], 'y');
    await page.waitForTimeout(100);
    expectExit(await closeFrames(page, target), target, [0, -50], 'y');
  });

  test('full screen: slides up 48px and fades in whole, and back down', async ({ page }) => {
    const target: Target = {
      story: 'components-dialog--full-screen-compact',
      role: 'dialog',
      early: {
        header: '[role=dialog] > :first-child',
        content: '[role=dialog] > [data-slot=content]',
      },
      late: {},
      viewport: { width: 390, height: 760 },
    };
    await prepare(page, target);
    const enter = await openFrames(page, target, 640);
    expect(translate(part(enter[0]!.parts, 'motion'))).toEqual([0, 48]);
    let previous = 48;
    for (const { parts } of enter) {
      const motion = part(parts, 'motion');
      expect(motion.clipPath).toBe('none');
      // Only toward rest (the spring may overshoot it by a pixel or two).
      const [, y] = translate(motion);
      if (y > 0) expect(y).toBeLessThanOrEqual(previous + 1e-6);
      expect(y).toBeGreaterThanOrEqual(-2);
      previous = y;
      // No stagger: the parts fade with the dialog.
      expect(part(parts, 'header').opacity).toBe(1);
      expect(part(parts, 'content').opacity).toBe(1);
    }
    // The slow springs: still moving after 160ms, at rest by the end.
    expect(translate(part(at(enter, 160), 'motion'))[1]).toBeGreaterThan(5);
    expect(part(enter.at(-1)!.parts, 'motion')).toMatchObject({ translate: 'none', opacity: 1 });

    await page.waitForTimeout(100);
    const exit = await closeFrames(page, target, 320);
    // Leaving on the fast springs, with no wait: it fades from the first frame.
    expect(part(at(exit, 32), 'motion').opacity).toBeLessThan(0.6);
    expect(translate(part(at(exit, 96), 'motion'))[1]).toBeGreaterThan(40);
    for (const { parts } of exit) {
      expect(translate(part(parts, 'motion'))[1]).toBeLessThanOrEqual(48.5);
    }
    expect(part(at(exit, 128), 'motion').opacity).toBeLessThan(0.02);
    for (const { parts } of exit) expect(part(parts, 'content').opacity).toBe(1);
  });
});

test.describe('Dialog motion under reduced motion', () => {
  const target = PLACEMENTS[0]!.target;

  test('only the dialog and the scrim fade, entering and leaving', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await prepare(page, target);
    const enter = await openFrames(page, target);
    const exit = await (async () => {
      await page.waitForTimeout(100);
      return closeFrames(page, target);
    })();
    for (const frames of [enter, exit]) {
      for (const { parts } of frames) {
        const motion = part(parts, 'motion');
        expect(motion.translate).toBe('none');
        expect(motion.clipPath).toBe('inset(-32px round 60px)');
        for (const name of ['title', 'content', 'actions']) {
          expect(part(parts, name).opacity).toBe(1);
        }
      }
    }
    expect(part(enter[0]!.parts, 'motion').opacity).toBe(0);
    expect(part(at(enter, 64), 'motion').opacity).toBeGreaterThan(0);
    expect(part(enter.at(-1)!.parts, 'motion').opacity).toBe(1);
    // Leaving, the fade starts at once (no parts to wait for).
    expect(part(at(exit, 48), 'motion').opacity).toBeLessThan(0.5);
    expect(part(at(exit, 160), 'scrim').opacity).toBeLessThan(0.02);
  });
});

test.describe('Dialog quick and motion callbacks', () => {
  test('quick: opens at rest on its first frame and leaves at once', async ({ page }) => {
    const target: Target = {
      story: 'components-dialog--quick',
      role: 'alertdialog',
      ...basicParts('alertdialog'),
    };
    await prepare(page, target);
    const [first] = await openFrames(page, target, 0);
    expect(part(first!.parts, 'motion')).toMatchObject({
      translate: 'none',
      clipPath: 'inset(-32px round 60px)',
      opacity: 1,
    });
    expect(part(first!.parts, 'scrim').opacity).toBe(1);
    for (const name of ['title', 'content', 'actions']) {
      expect(part(first!.parts, name).opacity).toBe(1);
    }
    await focusInside(page, 'alertdialog');
    const gone = await page.evaluate(async () => {
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
      return document.querySelector('[role=alertdialog]') === null;
    });
    expect(gone).toBe(true);
  });

  test('onOpened and onClosed fire when the motion has finished', async ({ page }) => {
    await openStory(page, 'components-dialog--motion-callbacks');
    const status = page.getByTestId('status');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(status).toHaveText('Opened');
    const dialog = page.getByRole('alertdialog');
    // Every transition of the enter motion has ended by then.
    const settled = await dialog.evaluate((panel) => {
      const motion = panel.parentElement!;
      const actions = panel.querySelector('[data-slot=actions]')!;
      return {
        running: [motion, panel, ...panel.children].some((element) =>
          element.getAnimations().some((animation) => animation.playState === 'running'),
        ),
        translate: getComputedStyle(motion).translate,
        actions: getComputedStyle(actions).opacity,
      };
    });
    expect(settled).toEqual({ running: false, translate: 'none', actions: '1' });

    await page.keyboard.press('Escape');
    await expect(status).toHaveText('Closed');
    await expect(dialog).toHaveCount(0);
  });
});
