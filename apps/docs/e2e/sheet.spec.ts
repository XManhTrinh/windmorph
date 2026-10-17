import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite, OVERRIDES } from './layout-safety';
import { MODES } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
      bottom: Math.round(r.bottom),
      right: Math.round(r.right),
    };
  });
/**
 * Samples the panel's leading edge (its top, or the edge facing the page for a side sheet)
 * every frame from the moment `close` runs until the panel unmounts.
 */
async function exitFrames(page: Page, edge: 'top' | 'left' | 'right', close: () => Promise<void>) {
  await page.evaluate((edge) => {
    const frames: number[] = [];
    (window as unknown as { exitFrames: number[] }).exitFrames = frames;
    const sample = () => {
      const panel = document.querySelector('[role="dialog"]');
      if (!panel) return;
      frames.push(panel.getBoundingClientRect()[edge]);
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }, edge);
  await close();
  await expect(page.getByRole('dialog')).toBeHidden();
  return page.evaluate(() => (window as unknown as { exitFrames: number[] }).exitFrames);
}

/** Once a frame leaves the window, no later frame comes back into it. */
function neverReturns(frames: number[], outside: (value: number) => boolean) {
  const left = frames.findIndex(outside);
  expect(left).toBeGreaterThan(0);
  expect(frames.slice(left).filter((value) => !outside(value))).toEqual([]);
}

const settle = (page: Page) =>
  page.evaluate(() =>
    Promise.allSettled(document.getAnimations().map((a) => a.finished)).then(() => undefined),
  );

test.describe('Bottom sheet', () => {
  for (const mode of MODES) {
    test(`short sheet · ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width: 412, height: 800 });
      await openStory(page, 'components-sheet--bottom', { mode });
      await page.getByRole('button', { name: 'Open sheet' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await settle(page);
      await expect(page).toHaveScreenshot(`bottom-${mode}.png`);
    });
  }

  test('a short sheet opens fully against the bottom edge', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    const box = await rect(sheet);
    expect(box.bottom).toBe(800);
    expect(box.width).toBe(412);
    // Handle area 48px + 4 items × 56px + 24px padding.
    expect(box.height).toBe(48 + 4 * 56 + 24);
    expect(await sheet.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('28px');
  });

  test('a tall sheet opens to half the window and expands from the handle', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom-tall');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    expect((await rect(sheet)).y).toBe(400);
    await page.getByRole('button', { name: 'Expand sheet' }).click();
    await settle(page);
    // Fully open, it stops 72px below the top of a compact window (m3.material.io).
    expect((await rect(sheet)).y).toBe(72);
    // Filling the window, it shows a close button.
    await expect(sheet.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    // One Escape closes it from full height (a close request, WAI-ARIA APG modal dialog); focus
    // returns to the trigger.
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open sheet' })).toBeFocused();
  });

  test('dragging the handle down closes it; a short drag springs back', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    const top = (await rect(sheet)).y;
    const handle = await rect(page.getByRole('button', { name: 'Close sheet' }));
    const x = handle.x + handle.width / 2;
    const y = handle.y + handle.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(x, y + i * 3);
    await page.waitForTimeout(150);
    await page.mouse.up();
    await settle(page);
    expect((await rect(sheet)).y).toBe(top);
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) await page.mouse.move(x, y + i * 15);
    await page.mouse.up();
    await expect(sheet).toBeHidden();
  });

  test('above 640px it keeps 56px top and side margins', async ({ page }) => {
    await page.setViewportSize({ width: 700, height: 800 });
    await openStory(page, 'components-sheet--bottom-tall');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    await page.getByRole('button', { name: 'Expand sheet' }).click();
    await settle(page);
    expect(await rect(sheet)).toMatchObject({ y: 56, x: 56, width: 588 });
  });

  test('a standard sheet peeks over the page, which stays usable', async ({ page }) => {
    await page.setViewportSize({ width: 460, height: 700 });
    await openStory(page, 'components-sheet--bottom-standard');
    const layout = page.getByTestId('layout');
    const sheet = page.getByRole('dialog', { name: 'Now playing' });
    await settle(page);
    const frame = await rect(layout);
    expect((await rect(sheet)).y).toBe(frame.bottom - 1 - 56);
    await expect(layout).toHaveScreenshot('bottom-standard.png');
    await page.getByRole('button', { name: 'Pressed 0' }).click();
    await expect(page.getByRole('button', { name: 'Pressed 1' })).toBeVisible();
    await page.getByRole('button', { name: 'Expand sheet' }).click();
    await settle(page);
    expect((await rect(sheet)).bottom).toBe(frame.bottom - 1);
    await expect(sheet).toHaveAttribute('data-detent', 'expanded');
    await page.getByRole('button', { name: 'Collapse sheet' }).click();
    await expect(sheet).toHaveAttribute('data-detent', 'collapsed');
  });

  test('the exit leaves the window for good, never springing back into view', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    await settle(page);
    const frames = await exitFrames(page, 'top', () => page.keyboard.press('Escape'));
    neverReturns(frames, (top) => top >= 800);
  });

  test('pressing the scrim closes it', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(200, 50);
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Standard bottom sheet detents, frame by frame (2026-10-15)', () => {
  test.use({ viewport: { width: 460, height: 700 } });

  interface Frame {
    /** The panel's top, px. */
    top: number;
    detent: string | null;
    dragging: boolean;
  }

  /** Samples the sheet's panel on every animation frame (skipping frames without it). */
  async function recordFrames(page: Page) {
    await page.evaluate(() => {
      const state = { frames: [] as Frame[], running: true };
      const sample = () => {
        const panel = document.querySelector('[data-testid="sheet"]');
        if (panel)
          state.frames.push({
            top: panel.getBoundingClientRect().top,
            detent: panel.getAttribute('data-detent'),
            dragging: panel.hasAttribute('data-dragging'),
          });
        if (state.running) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
      (window as unknown as { detentFrames: typeof state }).detentFrames = state;
    });
    return {
      stop: () =>
        page.evaluate(() => {
          const state = (
            window as unknown as { detentFrames: { frames: Frame[]; running: boolean } }
          ).detentFrames;
          state.running = false;
          return state.frames;
        }),
    };
  }

  /** Where the sheet rests expanded and collapsed, inside the story's 1px bordered region. */
  async function stops(page: Page) {
    const bottom =
      (await page.getByTestId('layout').evaluate((el) => el.getBoundingClientRect().bottom)) - 1;
    const height = await page
      .getByTestId('sheet')
      .evaluate((el) => el.getBoundingClientRect().height);
    return { expanded: bottom - height, collapsed: bottom - 56, bottom };
  }

  /**
   * A move from `from` to `to` on a spring: it starts at `from`, passes through at least three
   * frames on the way, overshoots by at most `overshoot` of the distance (plus 1px), and
   * settles at `to`.
   */
  function checkMove(frames: Frame[], from: number, to: number, overshoot: number) {
    const tops = frames.map((frame) => frame.top);
    const where = tops.map((top) => top.toFixed(1)).join(' ');
    const distance = Math.abs(to - from);
    const between = tops.filter(
      (top) => Math.min(from, to) + 1 < top && top < Math.max(from, to) - 1,
    );
    expect(between.length, where).toBeGreaterThanOrEqual(3);
    const beyond = to > from ? Math.max(...tops) - to : to - Math.min(...tops);
    expect(beyond, where).toBeLessThanOrEqual(distance * overshoot + 1);
    expect(Math.abs(tops.at(-1)! - to), where).toBeLessThanOrEqual(1);
    return beyond;
  }

  const open = async (page: Page, args: Record<string, string | boolean> = {}) => {
    await openStory(page, 'components-sheet--bottom-standard-detents', {}, args);
    await page.getByRole('button', { name: 'Show directions' }).click();
    await settle(page);
  };

  test('opens expanded: it slides up to its full height and never rests at the peek', async ({
    page,
  }) => {
    await openStory(page, 'components-sheet--bottom-standard-detents');
    const recorder = await recordFrames(page);
    await page.getByRole('button', { name: 'Show directions' }).click();
    await page.waitForTimeout(900);
    const frames = await recorder.stop();
    const { expanded, collapsed, bottom } = await stops(page);
    expect(frames.every((frame) => frame.detent === 'expanded')).toBe(true);
    // It enters from below the region, straight past the peek, on the default spatial spring
    // (its expressive overshoot is about 1.5%).
    expect(frames[0]!.top).toBeGreaterThan(collapsed);
    checkMove(frames, bottom, expanded, 0.02);
    const tops = frames.map((frame) => frame.top);
    const lowest = tops.indexOf(Math.min(...tops));
    for (let i = 1; i <= lowest; i++) expect(tops[i]!).toBeLessThanOrEqual(tops[i - 1]! + 0.5);
  });

  test('its handle collapses it to the peek, and it reopens expanded', async ({ page }) => {
    await open(page);
    const { expanded, collapsed } = await stops(page);
    const recorder = await recordFrames(page);
    await page.getByRole('button', { name: 'Collapse sheet' }).click();
    await page.waitForTimeout(900);
    const frames = await recorder.stop();
    expect(frames.at(-1)!.detent).toBe('collapsed');
    // Down to a lower detent on the fast effects spring (2026-10-15, Compose's
    // `partialExpand()`): it never passes the peek.
    expect(checkMove(frames, expanded, collapsed, 0)).toBeLessThanOrEqual(0.5);
    await expect(page.getByTestId('detent')).toHaveText('Reported: collapsed');
    // `defaultDetent` applies each time the sheet opens.
    await page.getByRole('button', { name: 'Hide directions' }).click();
    await expect(page.getByTestId('sheet')).toBeHidden();
    await page.getByRole('button', { name: 'Show directions' }).click();
    await settle(page);
    await expect(page.getByTestId('sheet')).toHaveAttribute('data-detent', 'expanded');
    expect((await stops(page)).expanded).toBeCloseTo(
      await page.getByTestId('sheet').evaluate((el) => el.getBoundingClientRect().top),
      0,
    );
  });

  test('dragging the handle moves it with the pointer and settles on the next detent', async ({
    page,
  }) => {
    await open(page, { defaultDetent: 'collapsed' });
    const { expanded, collapsed } = await stops(page);
    await expect(page.getByTestId('sheet')).toHaveAttribute('data-detent', 'collapsed');
    const handle = page.getByRole('button', { name: 'Expand sheet' });
    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let step = 1; step <= 10; step++) {
      await page.mouse.move(x, y - step * 15);
      await page.waitForTimeout(20);
    }
    // While dragging, the sheet follows the pointer with no transition.
    const dragged = await page.getByTestId('sheet').evaluate((el) => ({
      top: el.getBoundingClientRect().top,
      dragging: el.hasAttribute('data-dragging'),
    }));
    expect(dragged.dragging).toBe(true);
    expect(Math.abs(dragged.top - (collapsed - 150))).toBeLessThanOrEqual(2);
    const recorder = await recordFrames(page);
    await page.mouse.up();
    await page.waitForTimeout(900);
    const frames = await recorder.stop();
    expect(frames.at(-1)!.detent).toBe('expanded');
    checkMove(frames, collapsed - 150, expanded, 0.02);
    await expect(page.getByTestId('detent')).toHaveText('Reported: expanded');

    // A short drag down springs back; a long one collapses it.
    const handle2 = page.getByRole('button', { name: 'Collapse sheet' });
    const box2 = (await handle2.boundingBox())!;
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await page.mouse.down();
    for (let step = 1; step <= 4; step++) {
      await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2 + step * 10);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(150);
    await page.mouse.up();
    await settle(page);
    await expect(page.getByTestId('sheet')).toHaveAttribute('data-detent', 'expanded');
    await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
    await page.mouse.down();
    for (let step = 1; step <= 10; step++) {
      await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2 + step * 20);
      await page.waitForTimeout(20);
    }
    await page.mouse.up();
    await settle(page);
    await expect(page.getByTestId('sheet')).toHaveAttribute('data-detent', 'collapsed');
    await expect(page.getByTestId('detent')).toHaveText('Reported: collapsed');
  });

  // Compose's settle starts its spring with the release velocity (2026-10-17): it used to
  // start from rest, so a flung sheet stalled for a few frames as it was let go.
  test('a released drag settles at the speed it was let go with, without moving the page', async ({
    page,
  }) => {
    await open(page, { defaultDetent: 'collapsed' });
    const handle = page.getByRole('button', { name: 'Expand sheet' });
    const box = (await handle.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.mouse.move(x, y);
    await page.mouse.down();
    const recorder = await recordFrames(page);
    for (let step = 1; step <= 8; step++) {
      await page.mouse.move(x, y - step * 15);
      await page.waitForTimeout(16);
    }
    // The pointer's speed over its last moves, in px per ms, from the frames the drag drew.
    const drag = (await recorder.stop()).filter((frame) => frame.dragging);
    expect(drag.length).toBeGreaterThan(4);
    const span = drag.slice(-4);
    const dragSpeed = (span[0]!.top - span.at(-1)!.top) / ((span.length - 1) * 16.7);
    // Let go, then pause the settle and read how far it moves in its first 4ms.
    await page.mouse.up();
    const motionSpeed = await page.evaluate(async () => {
      const motion = document.querySelector<HTMLElement>('[data-testid="sheet"]')!.parentElement!;
      void getComputedStyle(motion).translate;
      const transition = motion
        .getAnimations()
        .find(
          (animation) =>
            animation instanceof CSSTransition && animation.transitionProperty === 'translate',
        );
      if (!transition) return null;
      transition.pause();
      const top = (time: number) => {
        transition.currentTime = time;
        return motion.getBoundingClientRect().top;
      };
      const start = top(0);
      const after = top(4);
      transition.play();
      return {
        speed: (start - after) / 4,
        settling: motion.hasAttribute('data-settling'),
      };
    });
    expect(motionSpeed).not.toBeNull();
    expect(motionSpeed!.settling).toBe(true);
    expect(motionSpeed!.speed, `drag ${dragSpeed.toFixed(2)}px/ms`).toBeGreaterThan(
      dragSpeed * 0.6,
    );
    await settle(page);
    await expect(page.getByTestId('sheet')).toHaveAttribute('data-detent', 'expanded');
    expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  });

  test('the keyboard moves it between detents: Enter and Space on the handle', async ({ page }) => {
    await open(page, { defaultDetent: 'collapsed' });
    const { expanded, collapsed } = await stops(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Expand sheet' })).toBeFocused();
    let recorder = await recordFrames(page);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(900);
    checkMove(await recorder.stop(), collapsed, expanded, 0.02);
    await expect(page.getByRole('button', { name: 'Collapse sheet' })).toBeFocused();
    recorder = await recordFrames(page);
    await page.keyboard.press('Space');
    await page.waitForTimeout(900);
    checkMove(await recorder.stop(), expanded, collapsed, 0.02);
    await expect(page.getByTestId('detent')).toHaveText('Reported: collapsed');
    // Escape on a collapsed sheet leaves it there.
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('sheet')).toHaveAttribute('data-detent', 'collapsed');
  });

  test('controlled: the page raises and lowers it, and the handle reports to the page', async ({
    page,
  }) => {
    await open(page, { defaultDetent: 'collapsed', controlled: true });
    const { expanded, collapsed } = await stops(page);
    const recorder = await recordFrames(page);
    await page.getByRole('button', { name: 'Raise' }).click();
    await page.waitForTimeout(900);
    checkMove(await recorder.stop(), collapsed, expanded, 0.02);
    // The page set it, so nothing is reported.
    await expect(page.getByTestId('detent')).toHaveText('Reported: none');
    await page.getByRole('button', { name: 'Collapse sheet' }).click();
    await expect(page.getByTestId('detent')).toHaveText('Reported: collapsed');
    await expect(page.getByTestId('sheet')).toHaveAttribute('data-detent', 'collapsed');
    await expect(page.getByRole('button', { name: 'Raise' })).toBeVisible();
  });

  test('under reduced motion it jumps between detents', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await open(page);
    const { expanded, collapsed } = await stops(page);
    const recorder = await recordFrames(page);
    await page.getByRole('button', { name: 'Collapse sheet' }).click();
    await page.waitForTimeout(900);
    // Settling on a detent is spatial motion, so it's instant: no frame between the two.
    const tops = (await recorder.stop()).map((frame) => frame.top);
    const where = tops.map((top) => top.toFixed(1)).join(' ');
    expect(
      tops.filter((top) => expanded + 1 < top && top < collapsed - 1),
      where,
    ).toEqual([]);
    expect(Math.abs(tops.at(-1)! - collapsed), where).toBeLessThanOrEqual(1);
  });
});

/** A one-finger touch drag through the browser's own gesture handling (scrolling included). */
async function touchDrag(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
  steps = 12,
) {
  const cdp = await page.context().newCDPSession(page);
  const point = (t: number) => ({
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point(0)] });
  for (let step = 1; step <= steps; step++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [point(step / steps)],
    });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}

test.describe('Bottom sheet drags from its content (touch)', () => {
  test.use({ hasTouch: true, viewport: { width: 412, height: 800 } });

  const open = async (page: Page) => {
    await openStory(page, 'components-sheet--bottom-scrolling');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    const content = page.getByTestId('filters').locator('..');
    return { sheet, content };
  };
  const scrollTop = (content: Locator) => content.evaluate((el) => el.scrollTop);

  test('a drag down with the content at its top closes the sheet', async ({ page }) => {
    const { sheet, content } = await open(page);
    expect((await rect(sheet)).y).toBe(400);
    expect(await scrollTop(content)).toBe(0);
    await touchDrag(page, { x: 200, y: 600 }, { x: 200, y: 790 });
    await expect(sheet).toBeHidden();
  });

  test('a drag down while the content is scrolled scrolls it back', async ({ page }) => {
    const { sheet, content } = await open(page);
    await content.evaluate((el) => el.scrollTo({ top: 300 }));
    await touchDrag(page, { x: 200, y: 500 }, { x: 200, y: 650 });
    await settle(page);
    expect(await scrollTop(content)).toBeLessThan(300);
    expect((await rect(sheet)).y).toBe(400);
    await expect(sheet).toBeVisible();
  });

  test('a drag up on a half-open sheet raises it before the content scrolls', async ({ page }) => {
    const { sheet, content } = await open(page);
    await touchDrag(page, { x: 200, y: 700 }, { x: 200, y: 550 });
    await settle(page);
    // Compose's nested scroll: the sheet takes the upward move first.
    expect(await scrollTop(content)).toBe(0);
    expect((await rect(sheet)).y).toBe(72);
    // Fully raised, a drag up scrolls the content.
    await touchDrag(page, { x: 200, y: 700 }, { x: 200, y: 500 });
    await settle(page);
    expect(await scrollTop(content)).toBeGreaterThan(0);
    expect((await rect(sheet)).y).toBe(72);
  });

  test('a long drag up raises the sheet, then scrolls the content with the rest', async ({
    page,
  }) => {
    const { sheet, content } = await open(page);
    await touchDrag(page, { x: 200, y: 780 }, { x: 200, y: 180 });
    await settle(page);
    expect((await rect(sheet)).y).toBe(72);
    expect(await scrollTop(content)).toBeGreaterThan(100);
  });

  test('a sideways drag scrolls a horizontal scroller inside', async ({ page }) => {
    const { sheet } = await open(page);
    const filters = page.getByTestId('filters');
    const row = await rect(filters);
    const y = row.y + row.height / 2;
    await touchDrag(page, { x: 350, y }, { x: 100, y: y + 20 });
    await settle(page);
    expect(await filters.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    expect((await rect(sheet)).y).toBe(400);
  });
});

test.describe('Side sheet', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`modal sheet slides in at the end edge · ${dir}`, async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 600 });
      await openStory(page, 'components-sheet--side', { dir });
      await page.getByRole('button', { name: 'Open filters' }).click();
      const sheet = page.getByRole('dialog', { name: 'Filters' });
      await settle(page);
      const box = await rect(sheet);
      expect(box).toMatchObject({ width: 256, height: 600, y: 0 });
      expect(dir === 'ltr' ? box.right : box.x).toBe(dir === 'ltr' ? 800 : 0);
      await expect(page).toHaveScreenshot(`side-${dir}.png`);
      await sheet.getByRole('button', { name: 'Close' }).click();
      await expect(sheet).toBeHidden();
    });
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`the exit leaves the window for good · ${dir}`, async ({ page }) => {
      await page.setViewportSize({ width: 800, height: 600 });
      await openStory(page, 'components-sheet--side', { dir });
      await page.getByRole('button', { name: 'Open filters' }).click();
      await settle(page);
      const frames = await exitFrames(page, dir === 'ltr' ? 'left' : 'right', () =>
        page.getByRole('button', { name: 'Close' }).click(),
      );
      neverReturns(frames, (edge) => (dir === 'ltr' ? edge >= 800 : edge <= 0));
    });
  }

  test('content never scrolls horizontally', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await openStory(page, 'components-sheet--side', {}, { wide: true });
    await page.getByRole('button', { name: 'Open filters' }).click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await settle(page);
    const content = page.getByTestId('wide').locator('..');
    expect(await rect(sheet)).toMatchObject({ width: 256 });
    expect(await content.evaluate((el) => getComputedStyle(el).overflowX)).toBe('hidden');
    await page.mouse.move(700, 100);
    await page.mouse.wheel(200, 0);
    expect(await content.evaluate((el) => el.scrollLeft)).toBe(0);
  });

  test('a wider sheet stops at 400px', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await openStory(page, 'components-sheet--side', {}, { widePanel: true });
    await page.getByRole('button', { name: 'Open filters' }).click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await settle(page);
    expect(await rect(sheet)).toMatchObject({ width: 400, right: 800 });
    // In a narrow window it still fits the window.
    await page.setViewportSize({ width: 360, height: 600 });
    expect((await rect(sheet)).width).toBe(360);
  });

  test('a back button insets the header to 16px', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await openStory(page, 'components-sheet--side', {}, { back: true });
    await page.getByRole('button', { name: 'Open filters' }).click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await settle(page);
    const back = await rect(sheet.getByRole('button', { name: 'Back' }));
    const box = await rect(sheet);
    expect(back.x - box.x).toBe(16);
    const actions = await rect(sheet.getByRole('button', { name: 'Apply' }));
    expect(actions.x - box.x).toBe(24);
    expect(box.bottom - actions.bottom).toBe(24);
  });

  test('detached sheet floats 16px from the edges', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    await openStory(page, 'components-sheet--side', {}, { detached: true });
    await page.getByRole('button', { name: 'Open filters' }).click();
    const sheet = page.getByRole('dialog');
    await settle(page);
    expect(await rect(sheet)).toMatchObject({ y: 16, right: 784, height: 568 });
  });

  test('standard sheet opens and closes its width in the layout', async ({ page }) => {
    await openStory(page, 'components-sheet--side-standard');
    const sheet = page.getByTestId('sheet');
    expect((await rect(sheet)).width).toBe(256);
    await expect(page.getByTestId('layout')).toHaveScreenshot('side-standard.png');
    await page.getByRole('button', { name: 'Hide details' }).click();
    await expect.poll(async () => (await rect(sheet)).width).toBe(0);
    await page.getByRole('button', { name: 'Show details' }).click();
    await expect.poll(async () => (await rect(sheet)).width).toBe(256);
  });

  test.describe('layout safety', () => {
    layoutSafetySuite('components-sheet--layout-override', {
      height: 300,
      width: 256,
      radius: '0px',
      interactive: false,
      async check(page, target) {
        await target.getByRole('button', { name: 'Action' }).click();
        await expect(page.getByTestId('count')).toHaveText('Pressed 1');
      },
    });
  });
});

test.describe('BottomSheet layout safety', () => {
  /**
   * Overrides that place the sheet's outermost element themselves (it owns placement): the
   * sheet then peeks from the bottom of that element, wherever the consumer put it, rather
   * than from the bottom of the region.
   */
  const PLACING = ['fixed', 'sticky', 'static'];

  for (const override of OVERRIDES) {
    for (const transformedAncestor of [false, true]) {
      const name = `${override}${transformedAncestor ? ' · transformed ancestor' : ''}`;
      test(name, async ({ page }) => {
        await openStory(
          page,
          'components-sheet--bottom-layout-override',
          {},
          { override, transformedAncestor },
        );
        const sheet = page.getByTestId('target');
        await settle(page);
        // The panel still fills the library's layer that moves it, isn't stretched past its
        // content, keeps its corners, and has no positioned internals.
        const layout = await sheet.evaluate((el) => {
          const panel = el as HTMLElement;
          const wrapper = panel.parentElement!;
          const content = panel.lastElementChild as HTMLElement;
          return {
            fillsWrapper:
              panel.offsetWidth === wrapper.offsetWidth &&
              panel.offsetHeight === wrapper.offsetHeight,
            notStretched:
              content.offsetHeight === (content.firstElementChild as HTMLElement).offsetHeight,
            radius: getComputedStyle(panel).borderTopLeftRadius,
            positionedDescendants: [...panel.querySelectorAll('*')].filter((child) => {
              const style = getComputedStyle(child);
              return (
                child.closest('[data-touch-target]') === null &&
                style.clipPath !== 'inset(50%)' &&
                ['absolute', 'fixed'].includes(style.position)
              );
            }).length,
          };
        });
        expect(layout).toEqual({
          fillsWrapper: true,
          notStretched: true,
          radius: '28px',
          positionedDescendants: 0,
        });
        // Collapsed to its 56px peek at the bottom of the region (or of the outermost element
        // where the override places it), with the handle on top. A transform rotates the
        // boxes, so the edges are checked without one.
        const wrapper = sheet.locator('..');
        const bottomEdge = async () =>
          (
            await rect(
              PLACING.includes(override) ? wrapper.locator('..') : page.getByTestId('layout'),
            )
          ).bottom;
        const rotated = override === 'transform';
        if (!rotated) expect((await rect(wrapper)).y).toBe((await bottomEdge()) - 56);
        const handle = page.getByRole('button', { name: 'Expand sheet' });
        expect(
          await handle.evaluate((el) => {
            const box = el.getBoundingClientRect();
            const hit = document.elementFromPoint(
              box.left + box.width / 2,
              box.top + box.height / 2,
            );
            return hit !== null && el.contains(hit);
          }),
        ).toBe(true);
        // The handle still expands it to the bottom of the region.
        await handle.click();
        await expect(sheet).toHaveAttribute('data-detent', 'expanded');
        await settle(page);
        if (!rotated) expect((await rect(wrapper)).bottom).toBe(await bottomEdge());
      });
    }
  }
});

test.describe('Sheets keep focus on the page after their own buttons', () => {
  const active = (page: Page) =>
    page.evaluate(() => {
      const element = document.activeElement;
      return element === document.body ? 'body' : (element?.getAttribute('aria-label') ?? '');
    });

  test('the standard bottom sheet’s collapse button hands focus to the handle', async ({
    page,
  }) => {
    // Short enough that the expanded sheet fills the window and shows its collapse button.
    await page.setViewportSize({ width: 412, height: 420 });
    await openStory(page, 'components-sheet--bottom-standard-detents');
    await page.getByRole('button', { name: 'Show directions' }).click();
    await settle(page);
    const collapse = page.locator('button[aria-label="Collapse sheet"]');
    await collapse.click();
    await expect(page.locator('[data-tokens~="md-comp-sheet-bottom-docked"]')).toHaveAttribute(
      'data-detent',
      'collapsed',
    );
    await expect.poll(() => active(page)).toBe('Expand sheet');

    await page.keyboard.press('Enter');
    await settle(page);
    await collapse.focus();
    await page.keyboard.press('Enter');
    await expect.poll(() => active(page)).toBe('Expand sheet');
  });

  test('the standard side sheet’s close button returns focus to the page’s control', async ({
    page,
  }) => {
    await openStory(page, 'components-sheet--side-standard');
    const hide = page.getByRole('button', { name: 'Hide details' });
    await hide.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Close' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Show details' })).toBeFocused();

    await page.getByRole('button', { name: 'Show details' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect.poll(() => active(page)).not.toBe('body');
  });
});

test.describe('Standard side sheet width motion', () => {
  test('the panel stays on the layout’s end edge while it opens and closes', async ({ page }) => {
    for (const dir of ['ltr', 'rtl'] as const) {
      await openStory(page, 'components-sheet--side-standard', { dir });
      await page.evaluate((dir) => {
        const layout = document.querySelector('[data-testid="layout"]')!;
        const panel = document.querySelector('[data-testid="sheet"] [data-slot="panel"]')!;
        const gaps: number[] = [];
        (window as unknown as { gaps: number[] }).gaps = gaps;
        const sample = () => {
          const l = layout.getBoundingClientRect();
          const p = panel.getBoundingClientRect();
          // The panel's end edge against the layout's inner end edge (1px border).
          gaps.push(dir === 'rtl' ? p.left - (l.left + 1) : l.right - 1 - p.right);
          requestAnimationFrame(sample);
        };
        requestAnimationFrame(sample);
      }, dir);
      await page.getByRole('button', { name: 'Hide details' }).click();
      await page.waitForTimeout(700);
      await page.getByRole('button', { name: 'Show details' }).click();
      await page.waitForTimeout(700);
      const gaps = await page.evaluate(() => (window as unknown as { gaps: number[] }).gaps);
      expect(gaps.length).toBeGreaterThan(20);
      expect(Math.max(...gaps.map(Math.abs)), dir).toBeLessThanOrEqual(0.5);
    }
  });

  // The spring overshot the measured 256px to 259.8px, opening a strip between the content and
  // the panel's divider (2026-10-17).
  test('its width never passes the measured width as it opens', async ({ page }) => {
    await openStory(page, 'components-sheet--side-standard');
    await page.getByRole('button', { name: 'Hide details' }).click();
    const sheet = page.getByTestId('sheet');
    await expect.poll(async () => (await rect(sheet)).width).toBe(0);
    await page.evaluate(() => {
      const sheet = document.querySelector('[data-testid="sheet"]')!;
      const widths: number[] = [];
      (window as unknown as { widths: number[] }).widths = widths;
      const sample = () => {
        widths.push(sheet.getBoundingClientRect().width);
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.getByRole('button', { name: 'Show details' }).click();
    await page.waitForTimeout(700);
    const widths = await page.evaluate(() => (window as unknown as { widths: number[] }).widths);
    expect(widths.filter((width) => width > 0 && width < 256).length).toBeGreaterThan(3);
    expect(Math.max(...widths), widths.join(' ')).toBeLessThanOrEqual(256);
  });
});

test.describe('Sheets never show a gap at their edge when the spring overshoots', () => {
  /**
   * Samples, every frame while `act` runs, how far the panel's anchored edge stands off the
   * window's edge (positive once it lifts off), and how far its bleed (`::after`, in the panel's colour) reaches past it.
   */
  async function gaps(page: Page, edge: 'bottom' | 'right', act: () => Promise<void>) {
    await page.evaluate((edge) => {
      const frames: { gap: number; bleed: number; same: boolean }[] = [];
      (window as unknown as { frames: typeof frames }).frames = frames;
      const sample = () => {
        const panel = document.querySelector<HTMLElement>('[role="dialog"]');
        if (panel) {
          const r = panel.getBoundingClientRect();
          const after = getComputedStyle(panel, '::after');
          frames.push({
            gap: edge === 'bottom' ? innerHeight - r.bottom : innerWidth - r.right,
            bleed: Number.parseFloat(edge === 'bottom' ? after.height : after.width) || 0,
            same: after.backgroundColor === getComputedStyle(panel).backgroundColor,
          });
        }
        if (frames.length < 120) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    }, edge);
    await act();
    await page.waitForTimeout(900);
    return page.evaluate(
      () =>
        (window as unknown as { frames: { gap: number; bleed: number; same: boolean }[] }).frames,
    );
  }

  test('a bottom sheet opening', async ({ page }) => {
    await openStory(page, 'components-sheet--bottom');
    const frames = await gaps(page, 'bottom', () =>
      page.getByRole('button', { name: 'Open sheet' }).click(),
    );
    // The overshoot really lifts the panel off the edge…
    expect(Math.max(...frames.map((f) => f.gap))).toBeGreaterThan(0.5);
    // …and the bleed always covers the gap.
    for (const frame of frames.filter((f) => f.gap > 0)) {
      expect(frame.bleed).toBeGreaterThanOrEqual(frame.gap);
      expect(frame.same).toBe(true);
    }
  });

  test('a modal side sheet opening', async ({ page }) => {
    await openStory(page, 'components-sheet--side');
    const frames = await gaps(page, 'right', () =>
      page.getByRole('button', { name: 'Open filters' }).click(),
    );
    for (const frame of frames.filter((f) => f.gap > 0)) {
      expect(frame.bleed).toBeGreaterThanOrEqual(frame.gap);
      expect(frame.same).toBe(true);
    }
  });
});

test.describe('Moving down to a lower detent never overshoots it', () => {
  /** Records the panel's top on every frame while `act` runs. */
  async function tops(page: Page, act: () => Promise<void>) {
    await page.evaluate(() => {
      const frames: number[] = [];
      (window as unknown as { tops: number[] }).tops = frames;
      const sample = () => {
        const panel = document.querySelector('[data-tokens~="md-comp-sheet-bottom-docked"]');
        if (panel) frames.push(panel.getBoundingClientRect().top);
        if (frames.length < 90) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await act();
    await page.waitForTimeout(900);
    return page.evaluate(() => (window as unknown as { tops: number[] }).tops);
  }

  test('Escape closing a fully open modal sheet in one move down', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-sheet--bottom-tall');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    await settle(page);
    await page.getByRole('button', { name: 'Expand sheet' }).click();
    await settle(page);
    const frames = await tops(page, () => page.keyboard.press('Escape'));
    // It leaves downwards without stopping at half: every frame is at or below the last.
    for (let i = 1; i < frames.length; i++)
      expect(frames[i]!).toBeGreaterThanOrEqual(frames[i - 1]! - 0.5);
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('the standard sheet’s handle collapsing it to the peek', async ({ page }) => {
    await openStory(page, 'components-sheet--bottom-standard-detents');
    await page.getByRole('button', { name: 'Show directions' }).click();
    await settle(page);
    const frames = await tops(page, () =>
      page.getByRole('button', { name: 'Collapse sheet' }).click(),
    );
    const rest = frames.at(-1)!;
    expect(rest).toBeGreaterThan(frames[0]!);
    expect(Math.max(...frames)).toBeLessThanOrEqual(rest + 0.5);
  });
});
