import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const width = (locator: Locator) =>
  locator.evaluate((el) => Math.round(el.getBoundingClientRect().width));

test.describe('Navigation visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`rails · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-navigation--rail-states', { theme, mode });
        await expect(page.getByTestId('rails')).toHaveScreenshot(`rails-${theme}-${mode}.png`);
      });
    }
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`bars · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-navigation--bar', { dir });
      await expect(page.getByTestId('bars')).toHaveScreenshot(`bars-${dir}.png`);
    });
  }
});

test.describe('NavigationRail behaviour', () => {
  test('springs open to fit its widest item and back', async ({ page }) => {
    await openStory(page, 'components-navigation--rail');
    const rail = page.getByTestId('rail');
    expect(await width(rail)).toBe(96);
    await page.getByRole('button', { name: 'Expand navigation' }).click();
    await expect(rail).toHaveAttribute('data-expanded', 'true');
    // "Sent mail" is the widest label: its width + 104px of chrome, at least 220px.
    const label = await width(page.getByText('Sent mail'));
    await expect.poll(() => width(rail)).toBe(Math.max(220, Math.round(label + 104)));
    await page.getByRole('button', { name: 'Starred' }).click();
    await expect(page.getByRole('button', { name: 'Starred' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page.getByRole('button', { name: 'Collapse navigation' }).click();
    await expect.poll(() => width(rail)).toBe(96);
  });

  test('the modal rail opens over the page and closes on Escape or navigation', async ({
    page,
  }) => {
    await openStory(page, 'components-navigation--modal-rail');
    await page.getByRole('button', { name: 'Expand navigation' }).click();
    const sheet = page.getByRole('dialog', { name: 'Main' });
    await expect(sheet).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot('modal-rail.png');
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);

    await page.getByRole('button', { name: 'Expand navigation' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('page')).toContainText('Current: search');
  });

  test('items are keyboard reachable with a pill focus ring', async ({ page }) => {
    await openStory(page, 'components-navigation--rail-states');
    const home = page.getByRole('navigation', { name: 'Collapsed' }).getByRole('button', {
      name: 'Home',
    });
    await home.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(home).toHaveAttribute('data-focus-visible', 'true');
    const pill = home.locator(':scope > span').first();
    expect(await pill.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  });
});

test.describe('NavigationBar layout safety', () => {
  layoutSafetySuite('components-navigation--layout-override', {
    height: 64,
    width: 360,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      const search = target.getByRole('button', { name: 'Search' });
      await search.click();
      await expect(page.getByTestId('count')).toHaveText('Current search');
      await expect(search).toHaveAttribute('aria-current', 'page');
    },
  });
});
