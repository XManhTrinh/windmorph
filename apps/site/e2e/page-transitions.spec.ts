import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './navigate';

/**
 * What moves when, and what stays put: only a move to another page runs the page transition
 * (M3's shared axis, Y); a playground change only rewrites the URL; a component tab change
 * moves the tab panel alone (shared axis, X); and the content column sits in the same place
 * on every guide and component page, whether or not it lists its sections.
 */

interface TransitionLog {
  /** The CSS animations each view transition ran, by name (`page-rise-in`, `tab-slide-out`). */
  transitions: string[][];
}

/**
 * Records every view transition the page starts, with the animations it runs once its
 * pseudo-elements exist. A transition whose boundaries are all "none" runs no animations.
 */
async function recordViewTransitions(page: Page) {
  await page.addInitScript(() => {
    const log: TransitionLog = { transitions: [] };
    (window as unknown as { transitionLog: TransitionLog }).transitionLog = log;
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((update: Parameters<typeof start>[0]) => {
      const transition = start(update);
      const entry: string[] = [];
      log.transitions.push(entry);
      void transition.ready.then(() => {
        for (const animation of document.getAnimations()) {
          const effect = animation.effect as KeyframeEffect | null;
          if (
            effect?.pseudoElement?.startsWith('::view-transition') &&
            animation instanceof CSSAnimation
          ) {
            entry.push(animation.animationName);
          }
        }
      });
      return transition;
    }) as typeof document.startViewTransition;
  });
}

/** Forgets the transitions so far (the page's load), so a test sees only what it caused. */
const clearTransitions = (page: Page) =>
  page.evaluate(() => {
    (window as unknown as { transitionLog: TransitionLog }).transitionLog.transitions = [];
  });

const transitionLog = (page: Page) =>
  page.evaluate(() => (window as unknown as { transitionLog: TransitionLog }).transitionLog);

/** Every animation name the page's view transitions have run so far. */
const animationsRun = async (page: Page) => (await transitionLog(page)).transitions.flat();

test.describe('Page transitions', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await recordViewTransitions(page);
  });

  test('a playground change rewrites the URL without a navigation or a transition', async ({
    page,
  }) => {
    await gotoReady(page, '/components/button');
    const playground = page.getByRole('region', { name: 'Button playground' });
    // Hydrated: the segmented controls are radios then.
    const square = playground.getByRole('radio', { name: 'square', exact: true });
    await expect(square).toBeVisible();
    // The page's own article, to tell a re-render from a remount.
    const historyLength = await page.evaluate(() => {
      (window as unknown as { article: Element | null }).article =
        document.querySelector('main article');
      return history.length;
    });
    await clearTransitions(page);

    await square.click();
    await expect(page).toHaveURL(/\/components\/button\?shape=square$/);
    await expect(playground.getByRole('region', { name: 'tsx code' })).toContainText(
      'shape="square"',
    );
    // Give a transition time to start, were one coming.
    await page.waitForTimeout(500);

    expect(await animationsRun(page)).toEqual([]);
    const state = await page.evaluate(() => ({
      navigations: performance.getEntriesByType('navigation').length,
      historyLength: history.length,
      sameArticle:
        (window as unknown as { article: Element | null }).article ===
        document.querySelector('main article'),
    }));
    // Still the first document, with no history entry added, and the page wasn't remounted.
    expect(state.navigations).toBe(1);
    expect(state.historyLength).toBe(historyLength);
    expect(state.sameArticle).toBe(true);
  });

  test('the playground restores its URL state on refresh and on back and forward', async ({
    page,
  }) => {
    await gotoReady(page, '/components/button');
    const playground = page.getByRole('region', { name: 'Button playground' });
    await playground.getByRole('radio', { name: 'square', exact: true }).click();
    await expect(page).toHaveURL(/\?shape=square$/);

    await page.reload();
    const square = () =>
      page
        .getByRole('region', { name: 'Button playground' })
        .getByRole('radio', { name: 'square', exact: true });
    await expect(square()).toBeChecked();
    await expect(page).toHaveURL(/\?shape=square$/);

    // To another page, then back and forward again.
    await page.goto('/theming');
    await page.goBack();
    await expect(page).toHaveURL(/\/components\/button\?shape=square$/);
    await expect(square()).toBeChecked();
    await page.goForward();
    await expect(page).toHaveURL(/\/theming$/);
  });

  test('a tab change keeps the header and the rail still and moves only the panel', async ({
    page,
  }) => {
    await gotoReady(page, '/components/button');
    const heading = page.getByRole('heading', { level: 1 });
    const rail = page.locator('nav[aria-label="Components and settings"]');
    const tabs = page.getByRole('tablist', { name: 'Button documentation' });
    const before = {
      heading: await heading.boundingBox(),
      rail: await rail.boundingBox(),
      tabs: await tabs.boundingBox(),
    };
    await clearTransitions(page);

    await tabs.getByRole('tab', { name: 'API' }).click();
    await expect(page).toHaveURL(/\/components\/button\/api$/);
    await expect.poll(async () => (await animationsRun(page)).length).toBeGreaterThan(0);

    // The panel slides out and in on the shared axis (X); the page itself doesn't move.
    const names = await animationsRun(page);
    expect(names).toEqual(expect.arrayContaining(['tab-slide-out', 'tab-slide-in']));
    expect(names).not.toContain('page-rise-out');
    expect(names).not.toContain('page-rise-in');
    expect(await heading.boundingBox()).toEqual(before.heading);
    expect(await rail.boundingBox()).toEqual(before.rail);
    expect(await tabs.boundingBox()).toEqual(before.tabs);
  });

  test('a tab change under reduced motion runs no animation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await gotoReady(page, '/components/button');
    await clearTransitions(page);
    await page.getByRole('tab', { name: 'API' }).click();
    await expect(page).toHaveURL(/\/components\/button\/api$/);
    await page.waitForTimeout(500);
    expect(await animationsRun(page)).toEqual([]);
  });

  test('a move to another page runs the page transition', async ({ page }) => {
    await page.goto('/theming');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await clearTransitions(page);
    await page
      .locator('nav[aria-label="Components and settings"]')
      .getByRole('link', { name: 'Home' })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expect
      .poll(() => animationsRun(page))
      .toEqual(expect.arrayContaining(['page-rise-out', 'page-rise-in']));
  });
});

test.describe('Docs layout', () => {
  test('the content column is in the same place with or without an outline', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const outline = page.getByRole('navigation', { name: 'On this page' });
    const column = page.locator('[data-docs-content]');

    // Theming lists its sections; What's new has one release (one section), so it lists none.
    await page.goto('/theming');
    await expect(outline).toBeVisible();
    const withOutline = await column.boundingBox();
    const articleWith = await page.locator('main article').first().boundingBox();

    await page.goto('/whats-new');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(outline).toHaveCount(0);
    const withoutOutline = await column.boundingBox();
    const articleWithout = await page.locator('main article').first().boundingBox();

    expect(withoutOutline!.x).toBe(withOutline!.x);
    expect(withoutOutline!.width).toBe(withOutline!.width);
    expect(articleWithout!.x).toBe(articleWith!.x);
    expect(articleWithout!.width).toBe(articleWith!.width);
  });
});
