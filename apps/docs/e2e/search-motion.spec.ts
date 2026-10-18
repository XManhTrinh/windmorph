import { expect, test, type Page } from '@playwright/test';
import { insetEdges, sampleMotion, type Frame, type PartFrame } from './motion-frames';
import { openStory, type StoryGlobals } from './story';

/*
 * The search views' motion, frame by frame (2ms frames docked, 4ms full screen, so a spring's fastest stretch moves
 * well under 2px a frame and anything bigger is a jump). The reference is Compose's
 * `SearchBar.kt`: the expanded field is laid out from the collapsed bar's bounds by the search
 * bar state's progress, floored at 0 for the docked view (`coerceAtLeast(0f)`) and clamped to
 * 0..1 for the full-screen view (`coerceIn`), so collapsing never shrinks it past the bar.
 *
 * - opening, the field starts exactly on the bar (a resized 48px bar too) and grows to the
 *   56px focused field, 12px wider on each side, without a jump;
 * - typing, the results area's height follows the results on a spring, growing and
 *   shrinking without a jump;
 * - closing, the field shrinks back without ever going past the bar's bounds and ends on them,
 *   so removing the view changes nothing on screen.
 */

const FIELD = '[role="dialog"] [data-tokens~="md-comp-search-bar"]';
const DROPDOWN = '[role="dialog"] [data-view="docked"]';
const EXPANDED_INPUT = '[role="dialog"] input';
const STEP = 2;
const MAX_JUMP = 2;

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const box = (part: PartFrame): Box => ({
  left: part.left,
  top: part.top,
  width: part.width,
  height: part.height,
});

const barBox = (page: Page, testId: string) =>
  page.getByTestId(testId).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  });

/** The largest change of any edge or size of `part` between two consecutive frames. */
function largestJump(frames: Frame[], part: string, from?: Box): number {
  const boxes = frames.flatMap((frame) => (frame.parts[part] ? [box(frame.parts[part])] : []));
  if (from) boxes.unshift(from);
  let largest = 0;
  for (let i = 1; i < boxes.length; i++) {
    const [a, b] = [boxes[i - 1]!, boxes[i]!];
    largest = Math.max(
      largest,
      Math.abs(a.left - b.left),
      Math.abs(a.top - b.top),
      Math.abs(a.width - b.width),
      Math.abs(a.height - b.height),
    );
  }
  return largest;
}

function expectBox(actual: Box, expected: Box, tolerance = 0.5) {
  for (const key of ['left', 'top', 'width', 'height'] as const) {
    expect(
      Math.abs(actual[key] - expected[key]),
      `${key}: ${actual[key]} vs ${expected[key]}`,
    ).toBeLessThanOrEqual(tolerance);
  }
}

/**
 * Every edge of `part` moves from where it starts towards `target` without passing it (within
 * half a pixel): closing never overshoots the bar's bounds.
 */
function expectNoOvershoot(frames: Frame[], part: string, target: Box) {
  const edges = (b: Box) => [b.left, b.top, b.left + b.width, b.top + b.height];
  const present = frames.flatMap((frame) => (frame.parts[part] ? [frame] : []));
  const start = edges(box(present[0]!.parts[part]!));
  const end = edges(target);
  for (const frame of present) {
    edges(box(frame.parts[part]!)).forEach((edge, i) => {
      const [low, high] = [Math.min(start[i]!, end[i]!), Math.max(start[i]!, end[i]!)];
      expect(edge, `t=${frame.t}ms, edge ${i}`).toBeGreaterThanOrEqual(low - 0.5);
      expect(edge, `t=${frame.t}ms, edge ${i}`).toBeLessThanOrEqual(high + 0.5);
    });
  }
}

const last = (frames: Frame[], part: string) =>
  frames.findLast((frame) => frame.parts[part] != null)!.parts[part]!;

async function waitForSettled(page: Page) {
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((animation) => animation.finished)),
  );
}

async function openDocked(page: Page, testId: string, bar: Box) {
  const frames = await sampleMotion(page, {
    act: { click: `[data-testid="${testId}"] [role="combobox"]` },
    started: '[role="dialog"]',
    parts: { field: FIELD, dropdown: DROPDOWN },
    duration: 700,
    step: STEP,
  });
  // The field starts on the bar exactly, and grows without a jump.
  expectBox(box(frames[0]!.parts.field!), bar);
  expect(largestJump(frames, 'field', bar)).toBeLessThanOrEqual(MAX_JUMP);
  // It ends as the 56px focused field, 12px wider on each side, centred on the bar.
  expectBox(box(last(frames, 'field')), {
    left: bar.left - 12,
    top: bar.top + (bar.height - 56) / 2,
    width: bar.width + 24,
    height: 56,
  });
  return frames;
}

async function closeDocked(page: Page, bar: Box) {
  const frames = await sampleMotion(page, {
    act: { key: 'Escape' },
    started: '[data-exiting]',
    parts: { field: FIELD },
    duration: 700,
    step: STEP,
  });
  expect(largestJump(frames, 'field')).toBeLessThanOrEqual(MAX_JUMP);
  // Never narrower or shorter than the bar, and it ends on the bar exactly.
  expectNoOvershoot(frames, 'field', bar);
  expectBox(box(last(frames, 'field')), bar);
  await expect(page.getByRole('dialog')).toBeHidden();
}

/** Types `value` into the expanded input and samples the dropdown's height change. */
async function typeAndSample(page: Page, value: string, count: number) {
  await waitForSettled(page);
  const before = await page.locator(DROPDOWN).evaluate((el) => el.getBoundingClientRect().height);
  const frames = await sampleMotion(page, {
    act: { input: EXPANDED_INPUT, value },
    started: `[data-count="${count}"]`,
    transition: 'height',
    parts: { dropdown: DROPDOWN },
    duration: 600,
    step: STEP,
  });
  const heights = frames.map((frame) => frame.parts.dropdown!.height);
  expect(Math.abs(heights[0]! - before)).toBeLessThanOrEqual(MAX_JUMP);
  expect(largestJump(frames, 'dropdown')).toBeLessThanOrEqual(MAX_JUMP);
  // The settled height fits the content (within the dropdown's bounds).
  const settled = await page.locator(DROPDOWN).evaluate((el) => ({
    height: el.getBoundingClientRect().height,
    content: el.firstElementChild!.getBoundingClientRect().height,
  }));
  expect(Math.abs(heights.at(-1)! - settled.height)).toBeLessThanOrEqual(0.5);
  return { before, after: settled.height, content: settled.content };
}

for (const dir of ['ltr', 'rtl'] as const) {
  for (const height of [56, 48]) {
    test.describe(`Docked search motion · ${height}px bar · ${dir}`, () => {
      const globals: StoryGlobals = { dir };

      test('opens, follows the results and closes without a jump', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await openStory(page, 'components-search--playground', globals, { view: 'docked' });
        const search = page.getByTestId('search');
        await search.evaluate((el, h) => (el.style.height = `${h}px`), height);
        const bar = await barBox(page, 'search');
        expect(bar.height).toBe(height);

        await openDocked(page, 'search', bar);
        await expect(page.getByRole('dialog').getByRole('searchbox')).toBeFocused();

        // Four suggestions (240px) → none: the dropdown shrinks to its 182px minimum.
        const none = await typeAndSample(page, 'zzz', 0);
        expect(none.before).toBe(240);
        expect(none.after).toBe(182);
        // Cleared: it grows back to fit the four suggestions.
        const all = await typeAndSample(page, '', 4);
        expect(all.after).toBe(240);
        // One suggestion: back down to the minimum.
        expect((await typeAndSample(page, 'fl', 1)).after).toBe(182);

        await waitForSettled(page);
        await closeDocked(page, bar);
      });
    });
  }
}

test.describe('Search app bar motion', () => {
  test('the docked view opens from and closes onto the bar in the app bar', async ({ page }) => {
    await openStory(page, 'components-search--app-bar', {}, { wide: true });
    const bar = await barBox(page, 'app-bar-search');
    await openDocked(page, 'app-bar-search', bar);
    await waitForSettled(page);
    await closeDocked(page, bar);
  });
});

for (const dir of ['ltr', 'rtl'] as const) {
  for (const height of [56, 48]) {
    test(`full-screen search motion · ${height}px bar · ${dir}`, async ({ page }) => {
      await page.setViewportSize({ width: 412, height: 640 });
      await openStory(page, 'components-search--playground', { dir }, { view: 'full-screen' });
      await page.getByTestId('search').evaluate((el, h) => (el.style.height = `${h}px`), height);
      const bar = await barBox(page, 'search');
      const parts = { field: FIELD, view: '[role="dialog"]' };

      const open = await sampleMotion(page, {
        act: { click: '[data-testid="search"] [role="combobox"]' },
        started: '[role="dialog"]',
        parts,
        duration: 800,
        step: 2 * STEP,
      });
      expectBox(box(open[0]!.parts.field!), bar);
      expect(largestJump(open, 'field', bar)).toBeLessThanOrEqual(MAX_JUMP);
      expectBox(box(last(open, 'field')), { left: 16, top: 8, width: 380, height: 56 });
      // The surface's clip starts on the bar and opens to the window without a jump, never
      // past it (Compose clamps the progress).
      const clips = open.map((frame) => {
        const view = frame.parts.view!;
        return insetEdges(view.clipPath, view.width, view.height);
      });
      const barInsets = [bar.top, 412 - bar.left - bar.width, 640 - bar.top - bar.height, bar.left];
      clips[0]!.forEach((edge, i) =>
        expect(Math.abs(edge - barInsets[i]!)).toBeLessThanOrEqual(0.5),
      );
      // An edge travels up to ~580px here, so a frame's step is bounded by a share of its
      // travel (the slow spatial spring's fastest 4ms moves about 2.4% of it); a jump moves
      // all of it at once.
      for (let i = 1; i < clips.length; i++) {
        clips[i]!.forEach((edge, side) => {
          expect(edge).toBeGreaterThanOrEqual(-0.01);
          const bound = Math.max(MAX_JUMP, 0.04 * barInsets[side]!);
          expect(Math.abs(edge - clips[i - 1]![side]!)).toBeLessThanOrEqual(bound);
        });
      }
      expect(clips.at(-1)).toEqual([0, 0, 0, 0]);

      await waitForSettled(page);
      const close = await sampleMotion(page, {
        act: { key: 'Escape' },
        started: '[data-exiting]',
        parts,
        duration: 800,
        step: 2 * STEP,
      });
      expect(largestJump(close, 'field')).toBeLessThanOrEqual(MAX_JUMP);
      expectNoOvershoot(close, 'field', bar);
      expectBox(box(last(close, 'field')), bar);
      // The clip never closes past the bar's bounds and ends on them.
      for (const frame of close) {
        const view = frame.parts.view!;
        insetEdges(view.clipPath, view.width, view.height).forEach((edge, i) =>
          expect(edge).toBeLessThanOrEqual(barInsets[i]! + 0.5),
        );
      }
      const end = last(close, 'view');
      insetEdges(end.clipPath, end.width, end.height).forEach((edge, i) =>
        expect(Math.abs(edge - barInsets[i]!)).toBeLessThanOrEqual(0.5),
      );
      await expect(page.getByRole('dialog')).toBeHidden();
    });
  }
}

test.describe('Search motion under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the docked field changes size at once and the results resize at once', async ({ page }) => {
    await openStory(page, 'components-search--playground', {}, { view: 'docked' });
    await page.getByTestId('search').evaluate((el) => (el.style.height = '48px'));
    const bar = await barBox(page, 'search');
    const open = await sampleMotion(page, {
      act: { click: '[data-testid="search"] [role="combobox"]' },
      started: '[role="dialog"]',
      parts: { field: FIELD, dropdown: DROPDOWN },
      duration: 300,
      step: 16,
    });
    const focused = { left: bar.left - 12, top: bar.top - 4, width: bar.width + 24, height: 56 };
    for (const frame of open) expectBox(box(frame.parts.field!), focused);
    // The dropdown only fades.
    for (const frame of open) expect(frame.parts.dropdown!.translate).toMatch(/^(none|0px)$/);

    await waitForSettled(page);
    await page.getByRole('dialog').getByRole('searchbox').fill('zzz');
    expect(
      await page.locator(DROPDOWN).evaluate((el) => ({
        height: el.getBoundingClientRect().height,
        transitions: el.getAnimations().length,
      })),
    ).toEqual({ height: 182, transitions: 0 });

    const close = await sampleMotion(page, {
      act: { key: 'Escape' },
      started: '[data-exiting]',
      parts: { field: FIELD },
      duration: 300,
      step: 16,
    });
    for (const frame of close) if (frame.parts.field) expectBox(box(frame.parts.field), focused);
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
