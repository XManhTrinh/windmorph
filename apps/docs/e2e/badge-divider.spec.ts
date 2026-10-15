import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height, right: r.right, bottom: r.bottom };
  });

test.describe('Badge', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`badges · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-badge--badges', { theme, mode });
        await expect(page.getByTestId('badges')).toHaveScreenshot(`badges-${theme}-${mode}.png`);
      });
    }
  }

  test('badges · rtl', async ({ page }) => {
    await openStory(page, 'components-badge--badges', { dir: 'rtl' });
    await expect(page.getByTestId('badges')).toHaveScreenshot('badges-rtl.png');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`places badges like Compose's BadgedBox · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-badge--badges', { dir });
      const smallIcon = await rect(page.getByTestId('small-icon'));
      const small = await rect(page.getByTestId('small').locator('[data-size="small"]'));
      expect(small).toMatchObject({ width: 6, height: 6, y: smallIcon.y });
      if (dir === 'ltr') expect(small.x).toBe(smallIcon.right - 6);
      else expect(small.right).toBe(smallIcon.x + 6);

      const largeIcon = await rect(page.getByTestId('large-icon'));
      const large = await rect(page.getByTestId('large').locator('[data-size="large"]'));
      expect(large.height).toBe(16);
      expect(large.bottom).toBe(largeIcon.y + 14);
      if (dir === 'ltr') expect(large.x).toBe(largeIcon.right - 12);
      else expect(large.right).toBe(largeIcon.x + 12);
      // The badge doesn't change the anchor's size.
      expect(await rect(page.getByTestId('large'))).toMatchObject({ width: 24, height: 24 });
    });
  }

  test('caps counts, truncates at 34px and is announced', async ({ page }) => {
    await openStory(page, 'components-badge--badges');
    const badges = page.getByTestId('badges');
    await expect(badges.getByText('999+', { exact: true }).first()).toBeVisible();
    await expect(badges.getByText('99+', { exact: true })).toBeVisible();
    const longer = await rect(badges.getByText('Longer').locator('..'));
    expect(longer.width).toBe(34);
    // Four characters, "+" included, always show in full.
    const capped = badges.getByText('999+', { exact: true }).first();
    expect(await capped.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    await expect(page.getByTestId('small')).toContainText('New notification');
    await expect(page.getByRole('button', { name: 'Messages, 12 unread' })).toBeVisible();
  });

  test("a navigation item's badge describes it, and a dot reads New notification", async ({
    page,
  }) => {
    await openStory(page, 'components-badge--badges');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('button', { name: 'Home' })).toHaveAccessibleDescription('3');
    await expect(nav.getByRole('button', { name: 'Search' })).toHaveAccessibleDescription(
      'New notification',
    );
    await expect(nav.getByRole('button', { name: 'Starred' })).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  test('a capped count reads "999+" in right-to-left layouts', async ({ page }) => {
    await openStory(page, 'components-badge--badges', { dir: 'rtl' });
    const label = page.getByTestId('badges').getByText('999+', { exact: true }).first();
    const plus = await label.evaluate((el) => {
      const range = document.createRange();
      const text = el.firstChild!;
      range.setStart(text, 3);
      range.setEnd(text, 4);
      const digits = document.createRange();
      digits.setStart(text, 0);
      digits.setEnd(text, 1);
      return range.getBoundingClientRect().x > digits.getBoundingClientRect().x;
    });
    expect(plus).toBe(true);
  });

  test.describe('layout safety', () => {
    layoutSafetySuite('components-badge--layout-override', {
      height: 24,
      width: 24,
      radius: '0px',
      interactive: false,
    });
  });
});

test.describe('Divider', () => {
  for (const mode of MODES) {
    test(`dividers · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-divider--dividers', { mode });
      await expect(page.getByTestId('dividers')).toHaveScreenshot(`dividers-${mode}.png`);
    });
  }

  test('a labeled divider puts its text 4px below the line', async ({ page }) => {
    await openStory(page, 'components-divider--dividers');
    const root = page.getByTestId('labeled');
    const line = await rect(root.locator('[data-tokens="md-comp-divider"]'));
    const text = await rect(root.getByText('Inset supporting text'));
    expect(text.y - line.bottom).toBe(4);
    expect((await rect(root)).bottom - text.bottom).toBe(8);
    // The line runs to the end; the text keeps 8px clear of it.
    expect((await rect(root)).right - line.right).toBe(0);
    const label = root.getByText('Inset supporting text');
    expect(await label.evaluate((el) => getComputedStyle(el).paddingInlineEnd)).toBe('8px');
  });

  test.describe('layout safety', () => {
    // Full width follows the containing block, which `fixed` / `absolute` change.
    layoutSafetySuite('components-divider--layout-override', {
      height: 1,
      radius: '0px',
      interactive: false,
    });
  });
});
