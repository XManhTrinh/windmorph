import { expect, test, type Locator } from '@playwright/test';
import { gotoReady } from './navigate';

/**
 * The navigation rail component (the "Expandable rail" example), not the site's own rail.
 * As in M3's rail motion, every icon (the menu button, the FAB and each destination) stays
 * on the line through the middle of the collapsed rail while the rail expands and
 * collapses; only the labels and the rail's edge move.
 */

/**
 * Toggles the rail and records every icon's centre, relative to the rail's start edge, on
 * each animation frame until the motion has settled.
 */
async function iconCentresWhileToggling(rail: Locator, toggleName: string) {
  return rail.evaluate(async (nav, name) => {
    const centres = () =>
      [...nav.querySelectorAll('svg')].map((icon) => {
        const box = icon.getBoundingClientRect();
        return box.left + box.width / 2 - nav.getBoundingClientRect().left;
      });
    const toggle = [...nav.querySelectorAll('button')].find(
      (button) => button.getAttribute('aria-label') === name,
    );
    if (!toggle) throw new Error(`No ${name} button`);
    toggle.click();
    const frames: number[][] = [];
    const end = performance.now() + 1000;
    while (performance.now() < end) {
      await new Promise(requestAnimationFrame);
      frames.push(centres());
    }
    return frames;
  }, toggleName);
}

function expectAllOnLine(frames: number[][], line: number) {
  expect(frames.length).toBeGreaterThan(10);
  for (const frame of frames) {
    expect(frame.length).toBe(6); // menu, FAB and four destinations
    for (const centre of frame) expect(Math.abs(centre - line)).toBeLessThanOrEqual(1);
  }
}

test.describe('Navigation rail icons stay on one line', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/navigation-rail');
  });

  test('through the middle of the 96px collapsed rail, expanding and collapsing', async ({
    page,
  }) => {
    const rail = page.getByRole('navigation', { name: 'Mail' });
    await expect(rail).toBeVisible();
    expectAllOnLine(await iconCentresWhileToggling(rail, 'Expand navigation'), 48);
    expectAllOnLine(await iconCentresWhileToggling(rail, 'Collapse navigation'), 48);
  });

  test('through the middle of an 80px collapsed rail', async ({ page }) => {
    const rail = page.getByRole('navigation', { name: 'Mail' });
    await rail.evaluate((nav) => nav.style.setProperty('--m3-rail-collapsed-width', '80px'));
    await expect.poll(async () => (await rail.boundingBox())?.width).toBe(80);
    expectAllOnLine(await iconCentresWhileToggling(rail, 'Expand navigation'), 40);
    expectAllOnLine(await iconCentresWhileToggling(rail, 'Collapse navigation'), 40);
  });
});

test.describe('Expanded navigation rail', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/navigation-rail');
    await page
      .getByRole('navigation', { name: 'Mail' })
      .getByRole('button', { name: 'Expand navigation' })
      .click();
  });

  test('its FAB extends to show its label, and folds back when the rail collapses', async ({
    page,
  }) => {
    const rail = page.getByRole('navigation', { name: 'Mail' });
    const fab = rail.getByRole('button', { name: 'Compose' });
    await expect(fab).toHaveAttribute('data-expanded', 'true');
    await expect.poll(async () => (await fab.boundingBox())?.width).toBeGreaterThan(100);
    await expect(fab.getByText('Compose')).toBeVisible();
    await rail.getByRole('button', { name: 'Collapse navigation' }).click();
    await expect(fab).toHaveAttribute('data-expanded', 'false');
    await expect.poll(async () => (await fab.boundingBox())?.width).toBe(56);
  });

  test("the new pill expands in place from its icon's centre (M3 rail selection)", async ({
    page,
  }) => {
    const rail = page.getByRole('navigation', { name: 'Mail' });
    // Let the rail finish expanding first.
    await expect.poll(async () => (await rail.boundingBox())?.width).toBeGreaterThanOrEqual(220);
    const run = await rail.evaluate(async (nav) => {
      const item = (name: string) =>
        [...nav.querySelectorAll('button')].find((button) => button.textContent === name)!;
      const pill = (name: string) =>
        item(name).querySelector<HTMLElement>('[class*="bg-secondary-container"]')!;
      item('Sent').click();
      const frames: { top: number; clip: string }[] = [];
      const end = performance.now() + 800;
      while (performance.now() < end) {
        await new Promise(requestAnimationFrame);
        frames.push({
          top: pill('Sent').getBoundingClientRect().top,
          clip: getComputedStyle(pill('Sent')).clipPath,
        });
      }
      return frames;
    });
    const rest = run.at(-1)!;
    // The pill never travels: it stays on its own row.
    for (const frame of run) expect(Math.abs(frame.top - rest.top)).toBeLessThanOrEqual(1);
    // It starts clipped towards the icon's centre line (16px padding + half the 24px icon)
    // and opens to the whole pill.
    expect(run[0]!.clip).not.toBe(rest.clip);
    expect(rest.clip).toMatch(/^inset\(0px round/);
    // Only one pill shows once settled: Home's has gone.
    await expect
      .poll(() =>
        rail
          .getByRole('button', { name: 'Home' })
          .locator('[class*="bg-secondary-container"]')
          .evaluate((el) => getComputedStyle(el).opacity),
      )
      .toBe('0');
  });

  test('the pill hugs its icon and label, while the whole row is the target', async ({ page }) => {
    const rail = page.getByRole('navigation', { name: 'Mail' });
    await expect.poll(async () => (await rail.boundingBox())?.width).toBeGreaterThanOrEqual(220);
    const home = rail.getByRole('button', { name: 'Home' });
    const sizes = await home.evaluate((row) => {
      const pill = row.querySelector('[class*="bg-secondary-container"]')!;
      const content = pill.parentElement!.lastElementChild!;
      return {
        row: row.getBoundingClientRect().width,
        pill: pill.getBoundingClientRect().width,
        content: content.getBoundingClientRect().width,
      };
    });
    // 16px · icon · 8px · label · 16px, well short of the row.
    expect(Math.abs(sizes.pill - sizes.content)).toBeLessThanOrEqual(1);
    expect(sizes.pill).toBeLessThan(sizes.row - 60);
    // A click beside the pill, in the row's empty end, still chooses the item.
    const search = rail.getByRole('button', { name: 'Search' });
    const box = (await search.boundingBox())!;
    await search.click({ position: { x: box.width - 12, y: box.height / 2 } });
    await expect(search).toHaveAttribute('aria-current', 'page');
  });
});
