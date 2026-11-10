import { expect, test, type Page } from '@playwright/test';

const metrics = (page: Page) =>
  page.evaluate(() => {
    const main = document.querySelector('main')!;
    const root = document.documentElement;
    return {
      pageScroll: root.scrollHeight - root.clientHeight,
      sideways: root.scrollWidth - root.clientWidth,
      paneScroll: main.scrollHeight - main.clientHeight,
      bottom: innerHeight - main.getBoundingClientRect().bottom,
      radius: getComputedStyle(main).borderTopLeftRadius,
    };
  });

test.describe('The app frame block', () => {
  test('a preview hands the wheel to the page once its own scrolling ends', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 640 });
    await page.goto('/blocks/app-frame');
    const preview = page.locator('iframe').first();
    await preview.scrollIntoViewIfNeeded();
    await expect(preview.contentFrame().locator('body')).toBeVisible();
    const box = (await preview.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, Math.min(box.y + box.height / 2, 600));
    await page.mouse.wheel(0, 6000);
    await page.waitForTimeout(300);
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 300);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
  });

  for (const variation of ['app', 'full']) {
    test(`${variation}: the pane scrolls by itself, with the gap below it`, async ({ page }) => {
      await page.setViewportSize({ width: 1100, height: 640 });
      await page.goto(`/blocks-preview/app-frame-${variation}`);
      const found = await metrics(page);
      expect(found.pageScroll).toBe(0);
      expect(found.sideways).toBe(0);
      expect(found.paneScroll).toBeGreaterThan(0);
      expect(found.bottom).toBe(16);
      expect(found.radius).toBe('16px');
    });

    test(`${variation}: flat on a phone, with the rail as a drawer`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 640 });
      await page.goto(`/blocks-preview/app-frame-${variation}`);
      expect((await metrics(page)).radius).toBe('0px');
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    });
  }

  test('full: an item opens the sheet and the pane narrows', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 640 });
    await page.goto('/blocks-preview/app-frame-full');
    const pane = page.locator('main');
    const before = (await pane.boundingBox())!.width;
    await page.getByRole('button', { name: 'Notes' }).click();
    await expect.poll(async () => (await pane.boundingBox())!.width).toBeLessThan(before - 300);
  });

  test('pinned: the second nav sits beside the page, and goes when a page has none', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 640 });
    await page.goto('/blocks-preview/app-frame-pinned');
    const pane = page.locator('main');
    await expect(pane.getByRole('heading', { name: 'Team' })).toBeVisible();
    await expect.poll(async () => (await pane.boundingBox())!.x).toBe(376);
    await page.getByRole('link', { name: 'Overview', exact: true }).click();
    await expect(pane.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect.poll(async () => (await pane.boundingBox())!.x).toBe(96);
    const found = await metrics(page);
    expect(found.pageScroll).toBe(0);
    expect(found.sideways).toBe(0);
  });

  test('the page previews each variation and offers its code', async ({ page }) => {
    await page.goto('/blocks/app-frame');
    await expect(page.locator('iframe')).toHaveCount(4);
    const frame = page.locator('iframe').first();
    const box = (await frame.boundingBox())!;
    expect(box.width).toBeGreaterThan(500);
  });
});
