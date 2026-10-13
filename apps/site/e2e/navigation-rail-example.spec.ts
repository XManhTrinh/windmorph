import { expect, test, type Locator } from '@playwright/test';

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
    await page.goto('/components/navigation-rail');
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
    await page.goto('/components/navigation-rail');
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

  test('the pill slides from the previous destination to the new one', async ({ page }) => {
    const rail = page.getByRole('navigation', { name: 'Mail' });
    // Let the rail finish expanding first.
    await expect.poll(async () => (await rail.boundingBox())?.width).toBeGreaterThanOrEqual(220);
    const tops = await rail.evaluate(async (nav) => {
      const item = (name: string) =>
        [...nav.querySelectorAll('button')].find((button) => button.textContent === name)!;
      const pillTop = (name: string) =>
        item(name).querySelector('[class*="bg-secondary-container"]')!.getBoundingClientRect().top;
      const from = pillTop('Home');
      item('Sent').click();
      const frames: number[] = [];
      const end = performance.now() + 800;
      while (performance.now() < end) {
        await new Promise(requestAnimationFrame);
        frames.push(pillTop('Sent'));
      }
      // Where Sent's pill rests, measured with nothing moving.
      return { from, frames, to: frames.at(-1)! };
    });
    const distance = tops.to - tops.from;
    expect(distance).toBeGreaterThan(100); // Home and Sent are three items apart
    // It starts near Home, passes through the middle, and settles on Sent.
    expect(Math.abs(tops.frames[0]! - tops.from)).toBeLessThan(distance / 3);
    expect(
      tops.frames.some((top) => Math.abs(top - (tops.from + distance / 2)) < distance / 4),
    ).toBe(true);
    expect(Math.abs(tops.frames.at(-1)! - tops.to)).toBeLessThanOrEqual(1);
    // Only one pill shows: Home's is gone.
    const homePill = rail
      .getByRole('button', { name: 'Home' })
      .locator('[class*="bg-secondary-container"]');
    await expect(homePill).toHaveCSS('opacity', '0');
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

  test('the pill changes width as it slides between labels of different lengths', async ({
    page,
  }) => {
    const rail = page.getByRole('navigation', { name: 'Mail' });
    await expect.poll(async () => (await rail.boundingBox())?.width).toBeGreaterThanOrEqual(220);
    const widths = await rail.evaluate(async (nav) => {
      const item = (name: string) =>
        [...nav.querySelectorAll('button')].find((button) => button.textContent === name)!;
      const pillWidth = (name: string) =>
        item(name).querySelector('[class*="bg-secondary-container"]')!.getBoundingClientRect()
          .width;
      const from = pillWidth('Home');
      item('Starred').click();
      const frames: number[] = [];
      const end = performance.now() + 800;
      while (performance.now() < end) {
        await new Promise(requestAnimationFrame);
        frames.push(pillWidth('Starred'));
      }
      const pill = item('Starred').querySelector<HTMLElement>('[class*="bg-secondary-container"]')!;
      return { from, frames, inlineWidth: pill.style.width };
    });
    const to = widths.frames.at(-1)!;
    expect(to - widths.from).toBeGreaterThan(4); // "Starred" is longer than "Home"
    expect(Math.abs(widths.frames[0]! - widths.from)).toBeLessThan((to - widths.from) / 2);
    // Settled, it sizes itself to its content again.
    expect(widths.inlineWidth).toBe('');
  });
});
