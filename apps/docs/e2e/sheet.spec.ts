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
    // Escape returns it to half, then closes it; focus returns to the trigger.
    await page.keyboard.press('Escape');
    await settle(page);
    expect((await rect(sheet)).y).toBe(400);
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

  test('a drag up scrolls the content, even at its top', async ({ page }) => {
    const { sheet, content } = await open(page);
    await touchDrag(page, { x: 200, y: 700 }, { x: 200, y: 550 });
    await settle(page);
    expect(await scrollTop(content)).toBeGreaterThan(0);
    expect((await rect(sheet)).y).toBe(400);
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
        // The panel still fills the library's wrapper that places and moves it, keeps its
        // corners, and has no positioned internals.
        const layout = await sheet.evaluate((el) => {
          const panel = el as HTMLElement;
          const wrapper = panel.parentElement!;
          return {
            fillsWrapper:
              panel.offsetWidth === wrapper.offsetWidth &&
              panel.offsetHeight === wrapper.offsetHeight,
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
        expect(layout).toEqual({ fillsWrapper: true, radius: '28px', positionedDescendants: 0 });
        // Collapsed to its 56px peek at the bottom of the region, with the handle on top.
        const frame = await rect(page.getByTestId('layout'));
        const wrapper = sheet.locator('..');
        expect((await rect(wrapper)).y).toBe(frame.bottom - 56);
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
        expect((await rect(wrapper)).bottom).toBe(frame.bottom);
      });
    }
  }
});
