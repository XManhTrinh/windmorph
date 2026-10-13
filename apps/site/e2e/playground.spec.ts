import { expect, test } from '@playwright/test';

/**
 * The component Playground island: changing a control updates both the live preview's code
 * snippet and the shareable URL state, and the site-owned copy button writes the snippet to
 * the clipboard and raises an in-island "Copied to clipboard" toast.
 *
 * The copy path uses `navigator.clipboard.writeText`, so the test grants the browser's
 * clipboard permission and then reads the clipboard back to assert the copied text.
 */
test.describe('Component Playground', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
      origin: baseURL,
    });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/components/button');
  });

  test('a control change updates the code snippet and the shareable URL', async ({ page }) => {
    const playground = page.getByRole('region', { name: 'Button playground' });
    await expect(playground).toBeVisible();

    // At the defaults (filled/sm) every value is a default, so the snippet is the bare element
    // (the emitter pretty-prints children onto their own line).
    const code = playground.getByRole('region', { name: 'tsx code' });
    await expect(code).toContainText('<Button>');
    await expect(code).toContainText('Label');
    await expect(code).not.toContainText('variant=');

    // Switch the variant to a non-default value. The single-selection segmented control
    // hydrates its options as radios; "outlined" is unique to the variant control.
    await playground.getByRole('radio', { name: 'outlined', exact: true }).click();

    // The emitted snippet now carries the non-default prop …
    await expect(code).toContainText('variant="outlined"');
    // … and the choice is reflected in the shareable URL (discrete query key).
    await expect(page).toHaveURL(/[?&]variant=outlined(&|$)/);
  });

  test('the copy button writes the snippet to the clipboard and toasts', async ({ page }) => {
    const playground = page.getByRole('region', { name: 'Button playground' });
    const code = playground.getByRole('region', { name: 'tsx code' });
    const snippet = (await code.textContent())?.trim() ?? '';
    expect(snippet).toContain('<Button');

    await playground.getByRole('button', { name: 'Copy code' }).click();

    // The in-island snackbar confirms the copy.
    await expect(page.getByText('Copied to clipboard')).toBeVisible();

    // The clipboard holds exactly the shown snippet.
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.trim()).toBe(snippet);
  });
});
