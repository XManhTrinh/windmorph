import AxeBuilder from '@axe-core/playwright';
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

  // 2026-11-11: with nothing focused the scroll keys go to the window, which has nothing to
  // scroll in the frame, so the page didn't move until a click in the pane or a Tab to it.
  for (const variation of ['app', 'full', 'pinned']) {
    test(`${variation}: with nothing focused, the scroll keys scroll the pane`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1100, height: 640 });
      await page.goto(`/blocks-preview/app-frame-${variation}`);
      const pane = page.locator('main');
      const scroll = () => pane.evaluate((el) => el.scrollTop);
      const end = await pane.evaluate((el) => el.scrollHeight - el.clientHeight);
      expect(end).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
      // Chromium on Linux animates a keyboard scroll and ignores a scroll key pressed in the
      // animation's last frames (on a plain page with no script too), so each press waits for
      // `scrollend`, not only for the position.
      const pressAndSettle = async (key: string) => {
        await pane.evaluate((el) => {
          delete el.dataset.scrollEnded;
          el.addEventListener('scrollend', () => (el.dataset.scrollEnded = ''), { once: true });
        });
        await page.keyboard.press(key);
        await expect(pane).toHaveAttribute('data-scroll-ended', '');
      };
      await pressAndSettle('End');
      await expect.poll(scroll).toBe(end);
      await pressAndSettle('Home');
      await expect.poll(scroll).toBe(0);
    });

    test(`${variation}: the pane is a tab stop only while it holds nothing that takes focus`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1100, height: 640 });
      await page.goto(`/blocks-preview/app-frame-${variation}`);
      const pane = page.locator('main');
      const tabbable =
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const holdsFocusable = await pane.evaluate(
        (el, selector) => el.querySelector(selector) !== null,
        tabbable,
      );
      await expect(pane).toHaveAttribute('tabindex', holdsFocusable ? '-1' : '0');
      // A link arriving later (a new page in the pane) takes the stop away.
      await pane.evaluate((el) => {
        const link = document.createElement('a');
        link.href = '#later';
        link.textContent = 'Later';
        el.append(link);
      });
      await expect(pane).toHaveAttribute('tabindex', '-1');
      // Either way a keyboard user can reach and scroll it (WCAG 2.1.1).
      await page.goto(`/blocks-preview/app-frame-${variation}`);
      const results = await new AxeBuilder({ page }).include('main').analyze();
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
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

  // The pinned block passes its page as `pageKey`: a new page starts at its top, where the pane
  // (the same element for every page) would otherwise stay where the last page left it.
  test('pinned: a new page starts at its top', async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 640 });
    await page.goto('/blocks-preview/app-frame-pinned');
    const pane = page.locator('main');
    const top = () => pane.evaluate((el) => Math.round(el.scrollTop));
    await pane.evaluate((el) => el.scrollTo(0, 300));
    expect(await top()).toBe(300);
    await page.getByRole('link', { name: 'Overview', exact: true }).click();
    await expect(pane.getByRole('heading', { name: 'Overview' })).toBeVisible();
    // The new page is long enough to have stayed at 300.
    expect(await pane.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeGreaterThan(300);
    await expect.poll(top).toBe(0);
  });

  test('the page previews each variation and offers its code', async ({ page }) => {
    await page.goto('/blocks/app-frame');
    await expect(page.locator('iframe')).toHaveCount(4);
    const frame = page.locator('iframe').first();
    const box = (await frame.boundingBox())!;
    expect(box.width).toBeGreaterThan(500);
  });
});
