import { expect, test, type Page } from '@playwright/test';

/**
 * `/server-components` imports every value export of `@windmorph/react`, `/primitives` and
 * `/next` into a React Server Component, renders the components from it and calls the
 * functions on the server (see `app/server-components/page.tsx`).
 */
const PATH = '/server-components';

/** Console errors and warnings, page errors included. */
function collectConsoleProblems(page: Page) {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return problems;
}

test.describe('Server components', () => {
  test('every export has a check and none fails on the server', async ({ page }) => {
    const response = await page.goto(PATH);
    expect(response?.status()).toBe(200);
    const unchecked = page.getByTestId('unchecked');
    await expect(unchecked).toHaveCount(3);
    for (const text of await unchecked.allTextContents()) expect(text).toBe('');
    await expect(page.locator('[data-export]').first()).toBeVisible();
    expect(await page.locator('[data-export]').count()).toBeGreaterThan(240);
    await expect(page.locator('[data-status="error"]')).toHaveCount(0);
    await expect(page.locator('[data-missing-example]')).toHaveCount(0);
  });

  test('functions, classes and constants are server values, not client references', async ({
    page,
  }) => {
    await page.goto(PATH);
    const clientValues = await page
      .locator('[data-kind="value"][data-reference="client"]')
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-export')));
    expect(clientValues).toEqual([]);
  });

  test('hydrates without errors or warnings', async ({ page }) => {
    const problems = collectConsoleProblems(page);
    await page.goto(PATH);
    await page.waitForLoadState('networkidle');
    // Hydrated: a server-rendered client component responds to input.
    const example = page.locator('[data-export="Switch"]');
    const wifi = example.getByRole('switch', { name: 'Wi-Fi' });
    await example.getByText('Wi-Fi').click();
    await expect(wifi).toBeChecked();
    expect(problems).toEqual([]);
  });

  test('a ListSection made on the server renders as a section of a static list', async ({
    page,
  }) => {
    await page.goto(PATH);
    const section = page
      .locator('[data-export="ListSection"]')
      .getByRole('list', { name: 'Network' });
    await expect(section.getByRole('listitem')).toHaveText('Wi-Fi');
  });
});
