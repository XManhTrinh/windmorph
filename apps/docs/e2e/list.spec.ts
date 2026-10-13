import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  });
const radius = (locator: Locator) =>
  locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return [s.borderTopLeftRadius, s.borderBottomLeftRadius];
  });

test.describe('List visual regression', () => {
  for (const mode of MODES) {
    test(`media · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-list--media', { mode });
      await expect(page.getByTestId('media')).toHaveScreenshot(`media-${mode}.png`);
    });
    test(`dividers and line limits · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-list--dividers-and-lines', { mode });
      await expect(page.getByTestId('dividers')).toHaveScreenshot(`dividers-${mode}.png`);
    });
  }

  test('media · rtl', async ({ page }) => {
    await openStory(page, 'components-list--media', { dir: 'rtl' });
    await expect(page.getByTestId('media')).toHaveScreenshot('media-rtl.png');
  });

  for (const contrast of ['medium', 'high'] as const) {
    test(`media · contrast ${contrast}`, async ({ page }) => {
      await openStory(page, 'components-list--media', { contrast });
      await expect(page.getByTestId('media')).toHaveScreenshot(`media-${contrast}.png`);
    });
  }

  test('media and dividers · forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openStory(page, 'components-list--media');
    await expect(page.getByTestId('media')).toHaveScreenshot('media-forced-colors.png');
    await openStory(page, 'components-list--dividers-and-lines');
    await expect(page.getByTestId('dividers')).toHaveScreenshot('dividers-forced-colors.png');
  });

  for (const theme of THEMES) {
    test(`media · ${theme}`, async ({ page }) => {
      await openStory(page, 'components-list--media', { theme });
      await expect(page.getByTestId('media')).toHaveScreenshot(`media-${theme}.png`);
    });
  }

  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`segmented · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-list--static', { theme, mode });
        await expect(page.getByTestId('static')).toHaveScreenshot(`segmented-${theme}-${mode}.png`);
      });
    }
  }

  test('standard', async ({ page }) => {
    await openStory(page, 'components-list--static', {}, { variant: 'standard' });
    await expect(page.getByTestId('static')).toHaveScreenshot('standard.png');
  });

  for (const mode of MODES) {
    test(`toggles · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-list--toggles', { mode });
      await expect(page.getByTestId('toggles')).toHaveScreenshot(`toggles-${mode}.png`);
    });
    test(`radio list · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-list--radio-list', { mode });
      await expect(page.getByTestId('radio-list')).toHaveScreenshot(`radio-list-${mode}.png`);
    });
  }

  for (const mode of MODES) {
    test(`links · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-list--links', { mode });
      await expect(page.getByTestId('links')).toHaveScreenshot(`links-${mode}.png`);
    });
  }

  test('toggles · rtl', async ({ page }) => {
    await openStory(page, 'components-list--toggles', { dir: 'rtl' });
    await expect(page.getByTestId('toggles')).toHaveScreenshot('toggles-rtl.png');
  });

  for (const mode of MODES) {
    test(`expandable · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-list--expandable', { mode });
      await expect(page.getByTestId('expandable')).toHaveScreenshot(`expandable-${mode}.png`);
    });
  }

  test('selection · rtl', async ({ page }) => {
    await openStory(page, 'components-list--selection', { dir: 'rtl' });
    await expect(page.getByTestId('selection')).toHaveScreenshot('selection-rtl.png');
  });
});

test.describe('List geometry and interaction', () => {
  test("media are M3's sizes, a three-line item aligns them to the top, and a broken image falls back", async ({
    page,
  }) => {
    await openStory(page, 'components-list--media');
    const media = page.getByTestId('media');
    const rows = media.getByRole('row');
    const frame = (row: Locator) => row.locator('img, svg').first().locator('..');
    expect(await rect(frame(rows.nth(0)))).toMatchObject({ width: 56, height: 56 });
    expect(await rect(frame(rows.nth(3)))).toMatchObject({ width: 100, height: 56 });
    const large = rows.nth(4);
    expect(await rect(frame(large))).toMatchObject({ width: 114, height: 64 });
    // M3 Expressive: 8dp corners on images and videos.
    expect(
      await frame(rows.nth(0)).evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
    ).toBe('8px');
    // Top-aligned: the thumbnail starts at the item's top padding.
    expect((await rect(frame(large))).y - (await rect(large)).y).toBe(10);
    // The broken image shows its fallback icon, not a broken-image glyph.
    await expect(rows.nth(2).locator('img')).toHaveCount(0);
    await expect(rows.nth(2).locator('svg')).toHaveCount(1);
    // A sized SVG image still shows (decode() confirms it isn't broken).
    await expect(rows.nth(0).locator('img')).toHaveCount(1);
  });

  test('dividers are 1px between items, inset 16px, never under the last; lines are clamped', async ({
    page,
  }) => {
    await openStory(page, 'components-list--dividers-and-lines');
    const lists = page.getByTestId('dividers').getByRole('list');
    const after = (item: Locator) =>
      item.evaluate((el) => {
        const s = getComputedStyle(el, '::after');
        return { display: s.display, height: s.height, left: s.left, right: s.right };
      });
    const full = lists.nth(0).getByRole('listitem');
    expect(await after(full.nth(0))).toMatchObject({ height: '1px', left: '0px', right: '0px' });
    expect((await after(full.nth(2))).display).toBe('none');
    const inset = lists.nth(1).getByRole('listitem');
    expect(await after(inset.nth(0))).toMatchObject({ left: '16px', right: '16px' });
    expect((await after(inset.nth(1))).display).toBe('none');

    const headline = page.getByText(/^A post with a long title/);
    const lineHeight = parseFloat(await headline.evaluate((el) => getComputedStyle(el).lineHeight));
    expect((await rect(headline)).height).toBe(2 * lineHeight);
    const supporting = page.getByText(/^Deleted 3 days ago/);
    const supportingLine = parseFloat(
      await supporting.evaluate((el) => getComputedStyle(el).lineHeight),
    );
    expect((await rect(supporting)).height).toBe(supportingLine);
    // Rounded through the list's classNames.media.
    const corner = await inset
      .nth(0)
      .locator('img')
      .locator('..')
      .evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
    expect(corner).toBe('12px');
  });

  test('items follow Compose padding, spacing and heights', async ({ page }) => {
    await openStory(page, 'components-list--static');
    const items = page.getByRole('listitem');
    const heights = await Promise.all(
      [0, 1, 2, 3].map(async (i) => (await rect(items.nth(i))).height),
    );
    expect(heights).toEqual([56, 72, 88, 56]);
    const first = await rect(items.nth(0));
    const icon = await rect(items.nth(0).locator('svg').first());
    expect(icon.x - first.x).toBe(16);
    // M3 Expressive: 20dp leading and trailing icons.
    expect(icon.width).toBe(20);
    const text = await rect(items.nth(0).getByText('One line'));
    expect(text.x - first.x).toBe(16 + 20 + 12);
    // Segmented: 2px apart, outer corners 16px, inner 4px.
    expect((await rect(items.nth(1))).y - (first.y + first.height)).toBe(2);
    expect(await radius(items.nth(0))).toEqual(['16px', '4px']);
    expect(await radius(items.nth(1))).toEqual(['4px', '4px']);
    expect(await radius(items.nth(3))).toEqual(['4px', '16px']);
  });

  test('hover, focus and press morph the corners', async ({ page }) => {
    await openStory(page, 'components-list--interactive');
    const starred = page.getByRole('row', { name: /Starred/ });
    await starred.hover();
    await expect(starred).toHaveAttribute('data-shape', 'hovered');
    await expect.poll(() => radius(starred)).toEqual(['12px', '12px']);
    await shotWithMargin(page, starred, 'state-hover.png', 4);
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown');
    await expect(starred).toBeFocused();
    await expect(starred).toHaveAttribute('data-shape', 'active');
    await expect.poll(() => radius(starred)).toEqual(['16px', '16px']);
    await shotWithMargin(page, starred, 'state-focus.png', 4);
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toHaveText('Opened starred');
  });

  test('← / → reach the trailing switch', async ({ page }) => {
    await openStory(page, 'components-list--interactive');
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('row', { name: /Sent/ })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('switch', { name: 'Notify for sent mail' })).toBeFocused();
  });

  test('selection is a list box whose options show a check', async ({ page }) => {
    await openStory(page, 'components-list--selection');
    await expect(page.getByRole('listbox', { name: 'Labels' })).toBeVisible();
    const home = page.getByRole('option', { name: /Home/ });
    const check = home.locator('[data-selection-indicator]');
    await expect.poll(() => check.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
    await home.click();
    await expect(home).toHaveAttribute('aria-selected', 'true');
    await expect.poll(() => radius(home)).toEqual(['16px', '16px']);
    await expect.poll(() => check.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });

  test('arrow keys wrap at the ends', async ({ page }) => {
    await openStory(page, 'components-list--interactive');
    await page.keyboard.press('Tab');
    const first = page.getByRole('row').first();
    await expect(first).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('row').last()).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(first).toBeFocused();
  });

  test('items with nested items expand and collapse', async ({ page }) => {
    await openStory(page, 'components-list--expandable');
    const photos = page.getByRole('row', { name: /Photos/ });
    await expect(photos).toHaveAttribute('aria-expanded', 'true');
    const trips = page.getByRole('row', { name: 'Trips' });
    // Nested items are indented 16dp per level.
    expect(await trips.evaluate((el) => getComputedStyle(el).paddingInlineStart)).toBe('32px');
    const avatar = await rect(trips.getByText('T', { exact: true }).locator('..'));
    expect(avatar).toMatchObject({ width: 40, height: 40 });
    await photos.click();
    await expect(photos).toHaveAttribute('aria-expanded', 'false');
    await expect(trips).toHaveCount(0);
    await page.keyboard.press('ArrowRight');
    await expect(photos).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(trips).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(photos).toBeFocused();
    const chevron = page.getByRole('row', { name: /Documents/ }).getByRole('button');
    await chevron.click();
    await expect(page.getByRole('row', { name: 'Taxes' })).toBeVisible();
  });

  test('link items are real anchors that morph on hover and focus', async ({ page }) => {
    await openStory(page, 'components-list--links');
    const notifications = page.getByRole('link', { name: 'Notifications' });
    await expect(notifications).toHaveAttribute('href', '#notifications');
    await expect(page.getByRole('link', { name: /Profile/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    const item = page.getByRole('listitem').filter({ has: notifications });
    // The overlay makes the whole item the link: hovering its far end still hovers it.
    const box = await item.boundingBox();
    if (!box) throw new Error('No item box');
    await page.mouse.move(box.x + box.width - 8, box.y + box.height / 2);
    await expect(item).toHaveAttribute('data-shape', 'hovered');
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(notifications).toBeFocused();
    await expect(item).toHaveAttribute('data-shape', 'active');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#notifications$/);
  });

  test('switch items toggle from anywhere on the item, and radio lists choose with ↑ / ↓', async ({
    page,
  }) => {
    await openStory(page, 'components-list--toggles');
    const search = page.getByRole('switch', { name: 'Show my profile in search engines' });
    await expect(search).toBeChecked();
    await page.getByText('Search engines can list your profile').click();
    await expect(search).not.toBeChecked();
    await page.keyboard.press('Space');
    await expect(search).toBeChecked();
    await expect(page.getByRole('switch', { name: 'Read receipts' })).toBeDisabled();

    await openStory(page, 'components-list--radio-list');
    const dark = page.getByRole('radio', { name: 'Dark' });
    await dark.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: 'Match my device' })).toBeChecked();
    const item = page.locator('label').filter({ hasText: 'Match my device' });
    await expect(item).toHaveAttribute('data-shape', 'active');
    await expect
      .poll(() => item.evaluate((el) => getComputedStyle(el).backgroundColor))
      .not.toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('List layout safety', () => {
  layoutSafetySuite('components-list--layout-override', {
    height: 114,
    width: 360,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      await target.getByRole('row', { name: 'Search' }).click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
    },
  });
});
