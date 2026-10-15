import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './story';

/*
 * Components that grow or shrink in place as part of their own motion are never the
 * browser's scroll anchor (`overflow-anchor: none`, 2026-10-15). Chosen as one, a component
 * whose top edge moves (a FAB menu opening upward from its FAB) makes the browser scroll
 * the page by the same amount: on a phone the home page jumped 244px on every open and close.
 * Each story places the component on a tall page, pinned to the bottom of a short box, and
 * the test scrolls until its top edge is above the window, then records `scrollY` on every
 * frame while it opens and closes.
 */
test.use({ viewport: { width: 330, height: 620 }, isMobile: true, hasTouch: true });

/** Starts recording `window.scrollY` on every frame. */
async function recordScroll(page: Page) {
  await page.evaluate(() => {
    const state = { values: [] as number[], running: true };
    (window as unknown as { scrollRecord: typeof state }).scrollRecord = state;
    const tick = () => {
      state.values.push(window.scrollY);
      if (state.running) requestAnimationFrame(tick);
    };
    tick();
  });
  return () =>
    page.evaluate(() => {
      const state = (window as unknown as { scrollRecord: { values: number[]; running: boolean } })
        .scrollRecord;
      state.running = false;
      return state.values;
    });
}

/** Scrolls the page so `element`'s top is `offset` px from the top of the window. */
async function scrollTopTo(page: Page, element: Locator, offset: number) {
  await element.evaluate(
    (el, by) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - by),
    offset,
  );
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(resolve)));
}

async function expectStill(page: Page, act: () => Promise<void>) {
  const before = await page.evaluate(() => window.scrollY);
  expect(before).toBeGreaterThan(0);
  const stop = await recordScroll(page);
  await act();
  await page.waitForTimeout(1200);
  const values = await stop();
  expect(new Set(values), values.join(' ')).toEqual(new Set([before]));
}

test('a FAB menu opening above the window never scrolls the page', async ({ page }) => {
  await openStory(page, 'components-fabmenu--scroll-anchoring');
  const menu = page.getByTestId('menu');
  expect(await menu.evaluate((el) => getComputedStyle(el).overflowAnchor)).toBe('none');
  const fab = page.getByRole('button', { name: 'Create' });
  // The FAB 70px from the top: the open menu reaches far above the window.
  await scrollTopTo(page, fab, 70);
  await expectStill(page, async () => {
    await fab.tap();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
  });
  expect((await menu.boundingBox())!.y).toBeLessThan(0);
  await expectStill(page, async () => {
    await fab.tap();
    await expect(page.getByRole('button', { name: 'Edit' })).toBeHidden();
  });
});

test('a vertical floating toolbar collapsing and expanding never scrolls the page', async ({
  page,
}) => {
  await openStory(page, 'components-toolbar--scroll-anchoring');
  const toolbar = page.getByTestId('toolbar');
  expect(await toolbar.evaluate((el) => getComputedStyle(el).overflowAnchor)).toBe('none');
  await scrollTopTo(page, toolbar, -24);
  const toggle = page.getByTestId('toggle');
  await expectStill(page, () => toggle.tap());
  await expectStill(page, () => toggle.tap());
});

test("an extended FAB's label collapsing and expanding never scrolls the page", async ({
  page,
}) => {
  await openStory(page, 'components-fab--scroll-anchoring');
  const fab = page.getByTestId('fab');
  expect(await fab.evaluate((el) => getComputedStyle(el).overflowAnchor)).toBe('none');
  await scrollTopTo(page, fab, -16);
  const toggle = page.getByTestId('toggle');
  await expectStill(page, () => toggle.tap());
  await expectStill(page, () => toggle.tap());
});
