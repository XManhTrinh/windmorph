import { expect, test, type CDPSession, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES } from './shots';
import { openStory, type StoryGlobals } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom };
  });
const settle = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        // Motion's spring runs on animation frames, not the Web Animations API.
        let last = '';
        let still = 0;
        const tick = () => {
          const box = document.querySelector('[data-indicator]');
          const now = box ? (box as HTMLElement).style.transform : 'none';
          still = now === last ? still + 1 : 0;
          last = now;
          if (still > 10) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );

/** A one-finger swipe from `(x, y)` to `y + dy`, through real touch input. */
async function swipe(
  cdp: CDPSession,
  x: number,
  y: number,
  stops: number[],
  { release = true } = {},
) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (const dy of stops) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y + dy }],
    });
  }
  if (release) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/** Evenly spaced stops from 0 to `to`, so the gesture moves like a finger. */
const steps = (to: number, count = 10) =>
  Array.from({ length: count }, (_, index) => ((index + 1) * to) / count);

test.use({ hasTouch: true, viewport: { width: 412, height: 800 } });

async function openFeed(page: Page, globals: StoryGlobals = {}) {
  await openStory(page, 'components-pulltorefresh--feed', globals);
  const area = page.getByTestId('area');
  const box = await rect(area);
  const cdp = await page.context().newCDPSession(page);
  return { area, box, cdp, x: box.x + box.width / 2, y: box.y + 40 };
}

test.describe('PullToRefresh', () => {
  test('a pull below the threshold shows the indicator at half the pull, then cancels', async ({
    page,
  }) => {
    const { box, cdp, x, y } = await openFeed(page);
    await swipe(cdp, x, y, steps(100), { release: false });
    const indicator = page.getByRole('progressbar', { name: 'Pull to refresh' });
    await expect(indicator).toBeVisible();
    const circle = await rect(page.locator('[data-indicator]'));
    // A 48px circle, centred, its bottom 50px (half the 100px pull) below the area's top.
    expect(circle.width).toBe(48);
    expect(circle.height).toBe(48);
    expect(Math.round(circle.x + 24)).toBe(Math.round(box.x + box.width / 2));
    expect(Math.round(circle.bottom - box.y)).toBe(50);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(page.getByTestId('count')).toHaveText('0');
  });

  test('a pull past the threshold refreshes and the indicator stays until it ends', async ({
    page,
  }) => {
    const { box, cdp, x, y } = await openFeed(page);
    await swipe(cdp, x, y, steps(200));
    await expect(page.getByTestId('count')).toHaveText('1');
    await expect(page.getByRole('progressbar', { name: 'Refreshing' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Refreshing');
    await settle(page);
    // It rests at the 80px threshold.
    expect(Math.round((await rect(page.locator('[data-indicator]'))).bottom - box.y)).toBe(80);
    await page.getByRole('button', { name: 'Finish refresh' }).click();
    await expect(page.getByRole('status')).toHaveText('Refreshed');
    await expect(page.getByRole('progressbar')).toHaveCount(0);
  });

  test('pulling back below the threshold cancels', async ({ page }) => {
    const { cdp, x, y } = await openFeed(page);
    await swipe(cdp, x, y, [...steps(220), 180, 140, 100]);
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(page.getByTestId('count')).toHaveText('0');
  });

  test('scrolling is untouched when the content is not at its top', async ({ page }) => {
    const { area, cdp, x } = await openFeed(page);
    // Swipe up: the list scrolls natively.
    await swipe(cdp, x, 600, steps(-300));
    await expect.poll(() => area.evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
    const scrolled = await area.evaluate((el) => el.scrollTop);
    // Swipe down: it scrolls back rather than pulling.
    await swipe(cdp, x, 200, steps(120));
    await expect.poll(() => area.evaluate((el) => el.scrollTop)).toBeLessThan(scrolled);
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect(page.getByTestId('count')).toHaveText('0');
  });

  test('a mouse drag pulls too', async ({ page }) => {
    const { x, y } = await openFeed(page);
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x, y + 220, { steps: 12 });
    await page.mouse.up();
    await expect(page.getByTestId('count')).toHaveText('1');
    await expect(page.getByRole('progressbar', { name: 'Refreshing' })).toBeVisible();
  });

  test('the refresh button brings the same indicator in', async ({ page }) => {
    await openFeed(page);
    await page.getByRole('button', { name: 'Refresh', exact: true }).click();
    await expect(page.getByRole('progressbar', { name: 'Refreshing' })).toBeVisible();
    await expect(page.getByRole('status')).toHaveText('Refreshing');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`the indicator is centred · ${dir}`, async ({ page }) => {
      const { box, cdp, x, y } = await openFeed(page, { dir });
      await swipe(cdp, x, y, steps(160), { release: false });
      const circle = await rect(page.locator('[data-indicator]'));
      expect(Math.round(circle.x + 24)).toBe(Math.round(box.x + box.width / 2));
      expect(Math.round(circle.bottom - box.y)).toBe(80);
    });
  }

  for (const mode of MODES) {
    test(`at the threshold · ${mode}`, async ({ page }) => {
      const { box, cdp, x, y } = await openFeed(page, { mode });
      await swipe(cdp, x, y, steps(160), { release: false });
      await expect(page).toHaveScreenshot(`threshold-${mode}.png`, {
        clip: { x: box.x, y: box.y, width: box.width, height: 120 },
      });
    });
  }
});

test.describe('PullToRefresh layout safety', () => {
  layoutSafetySuite('components-pulltorefresh--layout-override', {
    height: 240,
    width: 200,
    radius: '0px',
    interactive: false,
    // A mouse pull still refreshes, with the indicator centred across the area.
    async check(page, target) {
      const box = (await target.boundingBox())!;
      const x = box.x + box.width / 2;
      const y = box.y + 30;
      await page.mouse.move(x, y);
      await page.mouse.down();
      await page.mouse.move(x, y + 220, { steps: 12 });
      await page.mouse.up();
      await expect(page.getByTestId('refreshes')).toHaveText('1');
    },
  });
});

test.describe('PullToRefresh content layout', () => {
  // Where each layout puts the first item (relative to the root) and the second one (relative
  // to the first): 48px items with a 16px gap in a 320 × 240 root. Flex, block and
  // `space-y-*` roots are exact. On a grid root the indicator's layer is a grid item in a row
  // of its own, so exactly one row gap (16px) opens above the content and nothing else moves
  // (documented); the grid on an element inside the root is exact.
  const expected = {
    block: { first: [0, 0], second: [0, 64] },
    flexColumn: { first: [0, 0], second: [0, 64] },
    flexColumnReverse: { first: [0, 192], second: [0, -64] },
    flexRow: { first: [0, 0], second: ['after', 0] },
    grid: { first: [0, 16], second: [0, 64] },
    gridColumns: { first: [0, 16], second: [168, 0] },
    gridInner: { first: [0, 0], second: [0, 64] },
  } as const;
  for (const [layout, { first, second }] of Object.entries(expected)) {
    const grid = layout === 'grid' || layout === 'gridColumns';
    test(`a gap on a ${layout} ${grid ? 'root opens one row gap above the content' : "layout doesn't move the content"}`, async ({
      page,
    }) => {
      await openStory(page, 'components-pulltorefresh--content-layout', {}, { layout });
      const root = await rect(page.getByTestId('target'));
      const items = page.getByTestId('item');
      const a = await rect(items.nth(0));
      const b = await rect(items.nth(1));
      expect([Math.round(a.x - root.x), Math.round(a.y - root.y)]).toEqual(first);
      // In a flex row the second item starts one gap after the first one's width.
      const left = second[0] === 'after' ? Math.round(a.width) + 16 : second[0];
      expect([Math.round(b.x - a.x), Math.round(b.y - a.y)]).toEqual([left, second[1]]);
      if (layout.startsWith('grid')) {
        // Every item keeps its cell: the layer spans the columns in a row of its own.
        const widths = await items.evaluateAll((els) =>
          els.map((el) => Math.round(el.getBoundingClientRect().width)),
        );
        expect(new Set(widths).size).toBe(1);
      }
    });
  }
});
