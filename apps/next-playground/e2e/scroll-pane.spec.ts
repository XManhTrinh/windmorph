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
});
