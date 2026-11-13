import { expect, test } from '@playwright/test';

/**
 * `/scroll-pane/[page]`: a pane that scrolls by itself on the App Router, with
 * `useScrollRestoration` and `useScrollKeys` (see `app/scroll-pane/scroll-pane.tsx`). The
 * window never scrolls there, so the browser restores nothing by itself.
 */
test.describe('A pane that scrolls by itself', () => {
  test('its position comes back on back, forward and reload, and a new page starts at its top', async ({
    page,
  }) => {
    await page.goto('/scroll-pane/one');
    const pane = page.getByTestId('pane');
    const top = () => pane.evaluate((el) => Math.round(el.scrollTop));

    // Down page one, to a link, and follow it.
    const link = pane.getByRole('link', { name: 'To page two from paragraph 36' });
    await link.scrollIntoViewIfNeeded();
    const leftOne = await top();
    expect(leftOne).toBeGreaterThan(300);
    await link.click();
    await expect(pane.getByRole('heading', { name: 'Page two' })).toBeVisible();
    await expect.poll(top).toBe(0);

    await pane.evaluate((el) => el.scrollTo(0, 700));
    await page.goBack();
    await expect(pane.getByRole('heading', { name: 'Page one' })).toBeAttached();
    await expect.poll(top).toBe(leftOne);

    await page.goForward();
    await expect(pane.getByRole('heading', { name: 'Page two' })).toBeAttached();
    await expect.poll(top).toBe(700);

    // The restored position is held while content arrives, until the person scrolls: a wheel
    // lets go at once, where a script's scroll would be put back.
    await pane.hover();
    await page.mouse.wheel(0, 200);
    await expect.poll(top).toBe(900);
    await page.reload();
    await expect.poll(top).toBe(900);
    await pane.hover();
    await page.mouse.wheel(0, 200);
    await expect.poll(top).toBe(1100);
  });

  test('the scroll keys reach it while nothing has focus', async ({ page }) => {
    await page.goto('/scroll-pane/one');
    const pane = page.getByTestId('pane');
    const end = await pane.evaluate((el) => el.scrollHeight - el.clientHeight);
    await page.keyboard.press('End');
    await expect.poll(() => pane.evaluate((el) => el.scrollTop)).toBe(end);
    // Its pages hold links, so it isn't a tab stop of its own.
    await expect(pane).toHaveAttribute('tabindex', '-1');
  });

  test('the hooks follow the pane when a page is laid out without it', async ({ page }) => {
    await page.goto('/scroll-pane/one');
    const pane = page.getByTestId('pane');
    const top = () => pane.evaluate((el) => Math.round(el.scrollTop));

    // To the page laid out without the pane, and back by a link: the pane is a new element.
    await pane.getByRole('link', { name: 'To the plain page from paragraph 39' }).click();
    await expect(page.getByRole('heading', { name: 'Page plain' })).toBeVisible();
    await expect(pane).toHaveCount(0);
    await page.getByRole('link', { name: 'To page one from paragraph 6' }).click();
    await expect(pane.getByRole('heading', { name: 'Page one' })).toBeVisible();
    await expect.poll(top).toBe(0);

    // The scroll keys reach the new pane with nothing focused.
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await page.keyboard.press('PageDown');
    await expect.poll(top).toBeGreaterThan(300);
    // The key's scroll is animated: read the position once it has come to rest.
    let scrolled = -1;
    await expect
      .poll(async () => {
        const now = await top();
        const atRest = now === scrolled;
        scrolled = now;
        return atRest;
      })
      .toBe(true);

    // Back to the page without the pane, then back to page one: its position comes back.
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Page plain' })).toBeVisible();
    await page.goBack();
    await expect(pane.getByRole('heading', { name: 'Page one' })).toBeAttached();
    await expect.poll(top).toBe(scrolled);
  });

  test('the scroll keys start once the pane arrives after a page without it', async ({ page }) => {
    await page.goto('/scroll-pane/plain');
    await page.getByRole('link', { name: 'To page one from paragraph 6' }).click();
    const pane = page.getByTestId('pane');
    await expect(pane.getByRole('heading', { name: 'Page one' })).toBeVisible();
    const end = await pane.evaluate((el) => el.scrollHeight - el.clientHeight);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await page.keyboard.press('End');
    await expect.poll(() => pane.evaluate((el) => el.scrollTop)).toBe(end);
  });

  test('the scroll keys stay with another scroller the person pressed in', async ({ page }) => {
    await page.goto('/scroll-pane/one');
    const pane = page.getByTestId('pane');
    const side = page.getByTestId('side');
    // A press on text in the side panel, which can't take focus: the browser sends the keys
    // there, and the pane doesn't take them.
    await side.getByText('Side note 3', { exact: true }).click();
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
    await page.keyboard.press('PageDown');
    await expect.poll(() => side.evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
    expect(await pane.evaluate((el) => el.scrollTop)).toBe(0);
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });
});
