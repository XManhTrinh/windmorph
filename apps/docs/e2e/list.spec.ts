import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { samplePaintedFrames } from './painted-frames';
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

  for (const mode of MODES) {
    test(`sections · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-list--sections', { mode });
      await expect(page.getByTestId('sections')).toHaveScreenshot(`sections-${mode}.png`);
    });
  }

  test('sections · standard', async ({ page }) => {
    await openStory(page, 'components-list--sections', {}, { variant: 'standard' });
    await expect(page.getByTestId('sections')).toHaveScreenshot('sections-standard.png');
  });

  test('sections · selection · rtl', async ({ page }) => {
    await openStory(page, 'components-list--sections', { dir: 'rtl' }, { kind: 'selection' });
    await expect(page.getByTestId('sections')).toHaveScreenshot('sections-selection-rtl.png');
  });

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

  test('sections: subheaders line up with the headlines, corners and keys follow sections', async ({
    page,
  }) => {
    await openStory(page, 'components-list--sections');
    const grid = page.getByRole('grid', { name: 'Settings' });
    const network = grid.getByRole('rowgroup', { name: 'Network' });
    await expect(grid.getByRole('rowgroup', { name: 'Display' })).toBeVisible();
    const subheader = await rect(network.getByRole('rowheader'));
    const wifi = network.getByRole('row', { name: /Wi‑Fi/ });
    const item = await rect(wifi);
    expect(subheader.height).toBe(48);
    const subheaderText = await network.getByRole('rowheader').evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return Math.round(range.getBoundingClientRect().x);
    });
    expect(subheaderText - item.x).toBe(16);
    expect(item.y).toBe(subheader.y + subheader.height);
    // Each section is its own segmented group: 16px outer corners at both of its ends.
    const brightness = grid.getByRole('row', { name: /Brightness/ });
    expect(await radius(brightness)).toEqual(['16px', '4px']);
    expect(await radius(grid.getByRole('row', { name: /Bluetooth/ }))).toEqual(['4px', '16px']);
    // ↓ from the last item of a section reaches the first of the next.
    await page.keyboard.press('Tab');
    await expect(wifi).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(brightness).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('action')).toHaveText('brightness');

    await openStory(page, 'components-list--sections', {}, { kind: 'selection' });
    const listbox = page.getByRole('listbox', { name: 'Settings' });
    await expect(listbox.getByRole('group', { name: 'Display' }).getByRole('option')).toHaveCount(
      2,
    );
    await page.keyboard.press('Tab');
    await page.keyboard.press('ArrowUp');
    await expect(listbox.getByRole('option', { name: /Font size/ })).toBeFocused();
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

/**
 * Samples, on every frame for 700ms, the height and opacity of the tree row wrapper that
 * holds `text` (absent frames are left out), while `act` runs.
 */
/** The height of a tree row's reveal: the row, and in a segmented list the 2px gap above it. */
function revealHeight(page: Page, text: string) {
  return page.evaluate(
    (text) =>
      [...document.querySelectorAll('[role="treegrid"] > div')]
        .find((el) => el.textContent?.includes(text))!
        .getBoundingClientRect().height,
    text,
  );
}

async function sampleRow(page: Page, text: string, act: () => Promise<void>) {
  const samples = page.evaluate(async (text) => {
    const out: { height: number; opacity: number }[] = [];
    const start = performance.now();
    while (performance.now() - start < 700) {
      const row = [...document.querySelectorAll('[role="treegrid"] > div')].find((el) =>
        el.textContent?.includes(text),
      );
      if (row) {
        out.push({
          height: row.getBoundingClientRect().height,
          opacity: Number(getComputedStyle(row).opacity),
        });
      }
      await new Promise(requestAnimationFrame);
    }
    return out;
  }, text);
  await act();
  return samples;
}

test.describe('List spec measurements', () => {
  test('an item without leading or trailing content keeps no 12px gap for them', async ({
    page,
  }) => {
    await openStory(page, 'components-list--static', {}, { variant: 'standard' });
    const list = page.getByRole('list', { name: 'Contacts' });
    const textOnly = list.getByRole('listitem').filter({ hasText: 'Text only' });
    const item = await rect(textOnly);
    const text = await rect(textOnly.getByText('Text only'));
    // The label spans the item less its 16px padding at each side.
    expect(text.x - item.x).toBe(16);
    expect(text.width).toBe(item.width - 32);
    // No trailing content: the text runs to the end padding.
    const three = list.getByRole('listitem').filter({ hasText: 'Three lines' });
    const threeText = await rect(three.getByText('Three lines'));
    expect(threeText.x + threeText.width).toBe((await rect(three)).x + item.width - 16);
    // With both, the 12px gaps are there.
    const one = list.getByRole('listitem').filter({ hasText: 'One line' });
    const icon = await rect(one.locator('svg').first());
    const oneText = await rect(one.getByText('One line'));
    expect(oneText.x - (icon.x + icon.width)).toBe(12);
  });

  test('nested items open and close their height on a spring, fading', async ({ page }) => {
    await openStory(page, 'components-list--expandable');
    const photos = page.getByRole('row', { name: /Photos/ });
    await expect(page.getByRole('row', { name: 'Trips' })).toBeVisible();
    const full = await revealHeight(page, 'Trips');
    await photos.focus();
    const closing = await sampleRow(page, 'Trips', () => page.keyboard.press('ArrowLeft'));
    // Kept while it closes: heights between full and nothing, then gone.
    expect(closing.some((frame) => frame.height > 1 && frame.height < full - 1)).toBe(true);
    expect(closing.some((frame) => frame.opacity > 0 && frame.opacity < 1)).toBe(true);
    await expect(page.getByText('Trips')).toHaveCount(0);

    const opening = await sampleRow(page, 'Trips', () => page.keyboard.press('ArrowRight'));
    expect(opening.some((frame) => frame.height > 1 && frame.height < full - 1)).toBe(true);
    expect(opening.at(-1)).toEqual({ height: full, opacity: 1 });
    await expect(page.getByRole('row', { name: 'Trips' })).toBeVisible();
  });

  test('under reduced motion nested items only fade', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-list--expandable');
    const photos = page.getByRole('row', { name: /Photos/ });
    await expect(page.getByRole('row', { name: 'Trips' })).toBeVisible();
    const full = await revealHeight(page, 'Trips');
    await photos.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByText('Trips')).toHaveCount(0);
    const opening = await sampleRow(page, 'Trips', () => page.keyboard.press('ArrowRight'));
    expect(opening.every((frame) => frame.height === full)).toBe(true);
    expect(opening.some((frame) => frame.opacity > 0 && frame.opacity < 1)).toBe(true);
  });

  // A switch under reduced motion (2026-10-17): the folding rows go at once and the opening ones
  // appear at full height and fade in, so what's below moves once (here not at all: both items
  // hold two rows). Before, the folding rows held their height while they faded.
  test('under reduced motion a switch folds at once and fades the opening rows in', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-list--one-open-at-a-time');
    await expect(page.getByRole('row', { name: 'Trips' })).toBeVisible();
    await page.getByRole('row', { name: /Documents/ }).focus();
    const frames = await page.evaluate(async () => {
      const row = (text: string) =>
        [...document.querySelectorAll<HTMLElement>('[role="treegrid"] > div')].find((el) =>
          el.textContent?.includes(text),
        );
      const out: { music: number; trips: boolean; taxes: number | null }[] = [];
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }),
      );
      for (let i = 0; i < 24; i++) {
        await new Promise(requestAnimationFrame);
        const taxes = row('Taxes');
        out.push({
          music: row('Music')!.getBoundingClientRect().top,
          trips: Boolean(row('Trips')),
          taxes: taxes ? Number(getComputedStyle(taxes).opacity) : null,
        });
      }
      return out;
    });
    const trace = frames.map((f) => `${f.music}/${f.trips ? 'T' : '-'}/${f.taxes}`).join(' ');
    expect(new Set(frames.map((frame) => frame.music)).size, trace).toBe(1);
    expect(
      frames.every((frame) => !frame.trips),
      trace,
    ).toBe(true);
    expect(
      frames.some((frame) => frame.taxes !== null && frame.taxes < 1),
      trace,
    ).toBe(true);
    expect(frames.at(-1)!.taxes, trace).toBe(1);
  });

  // A segmented tree's 2px gaps fold with their rows (2026-10-17): a switch between items of
  // two rows each holds the total height, so Music never moves, also on the frame the folded
  // rows leave the page. Before, their gaps stayed until then and Music jumped 4px (on a
  // scrolled page, the browser's scroll anchoring scrolled the page 4px instead).
  test('a switch in a segmented tree holds what follows still, as the folded rows leave too', async ({
    page,
  }) => {
    await openStory(page, 'components-list--one-open-at-a-time');
    await expect(page.getByRole('row', { name: 'Trips' })).toBeVisible();
    const frames = await page.evaluate(async () => {
      const row = (text: string) =>
        [...document.querySelectorAll<HTMLElement>('[role="treegrid"] > div')].find((el) =>
          el.textContent?.includes(text),
        );
      const out: { music: number; trips: boolean }[] = [];
      row('Documents')!.querySelector<HTMLElement>('[role="row"]')!.click();
      // Sampled by time, until the folded rows are gone and one more frame after.
      const start = performance.now();
      while (performance.now() - start < 2000) {
        await new Promise(requestAnimationFrame);
        const trips = Boolean(row('Trips'));
        out.push({ music: row('Music')!.getBoundingClientRect().top, trips });
        if (!trips && out.length > 1 && !out.at(-2)!.trips) break;
      }
      return out;
    });
    const trace = frames.map((f) => `${f.music}/${f.trips ? 'T' : '-'}`).join(' ');
    expect(frames.at(-1)!.trips, trace).toBe(false);
    expect(new Set(frames.map((frame) => Math.round(frame.music))).size, trace).toBe(1);
  });

  test('arrow keys move between the links of a list of links', async ({ page }) => {
    await openStory(page, 'components-list--links');
    const profile = page.getByRole('link', { name: 'Profile' });
    const notifications = page.getByRole('link', { name: 'Notifications' });
    await profile.focus();
    await page.keyboard.press('ArrowDown');
    await expect(notifications).toBeFocused();
    // About is disabled (no link), so ↓ wraps to the first link.
    await page.keyboard.press('ArrowDown');
    await expect(profile).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(notifications).toBeFocused();
    await page.keyboard.press('Home');
    await expect(profile).toBeFocused();
    await page.keyboard.press('End');
    await expect(notifications).toBeFocused();
    // The page doesn't scroll on the way.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });
});

// A press that opens an item while the open item above it folds keeps the pressed row where it
// was on screen, on every frame (2026-10-17): the page scrolls by the folded height. Before,
// the folded rows' scroll anchor held them still and the pressed row slid up by their height,
// off the window when they were partly above it.
test.describe('List: the pressed row stays put as the rows above fold', () => {
  for (const [label, options] of [
    ['touch phone', { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }],
    ['desktop', { viewport: { width: 1280, height: 800 } }],
    [
      'touch phone, reduced motion',
      {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        reducedMotion: 'reduce',
      },
    ],
  ] as const) {
    test.describe(label, () => {
      test.use(options);

      for (const [where, at] of [
        ['the folding rows partly above the window', 20],
        ['the whole open item on screen', 300],
      ] as const) {
        test(`with ${where}`, async ({ page }) => {
          await openStory(page, 'components-list--one-open-at-a-time');
          await expect(page.getByRole('row', { name: 'Trips' })).toBeVisible();
          // A tall page, scrolled so Documents' row is `at`px from the window's top.
          const shown = await page.evaluate(async (at) => {
            const root = document.getElementById('storybook-root')!;
            const spacer = (height: number) => {
              const element = document.createElement('div');
              element.style.height = `${height}px`;
              return element;
            };
            root.before(spacer(1500));
            root.after(spacer(2500));
            const row = [...document.querySelectorAll('[role="row"]')].find((el) =>
              el.textContent?.includes('Documents'),
            )!;
            window.scrollTo(0, window.scrollY + row.getBoundingClientRect().top - at);
            await new Promise((resolve) => setTimeout(resolve, 100));
            const rect = row.getBoundingClientRect();
            return { x: rect.left + 120, y: rect.top + rect.height / 2, top: rect.top };
          }, at);
          expect(shown.top).toBeCloseTo(at, 0);
          // Sampled as painted, by time, from before the press until the folded rows are gone.
          const samples = await samplePaintedFrames<{
            top: number;
            scroll: number;
            trips: boolean;
          }>(
            page,
            `(() => {
              const find = (text) => [...document.querySelectorAll('[role="treegrid"] [role="row"]')]
                .find((el) => el.textContent.includes(text));
              return {
                top: find('Documents').getBoundingClientRect().top,
                scroll: window.scrollY,
                trips: Boolean(find('Trips')),
              };
            })()`,
            () =>
              options.hasTouch
                ? page.touchscreen.tap(shown.x, shown.y)
                : page.mouse.click(shown.x, shown.y),
          );
          const trace = samples
            .map((f) => `${Math.round(f.top)}@${Math.round(f.scroll)}${f.trips ? 'T' : ''}`)
            .join(' ');
          await expect(page.getByRole('row', { name: /Documents/ })).toHaveAttribute(
            'aria-expanded',
            'true',
          );
          // The switch happened (Photos' rows are gone, the page scrolled back by their height)…
          expect(samples.at(-1)!.trips, trace).toBe(false);
          expect(samples[0]!.scroll - samples.at(-1)!.scroll, trace).toBeGreaterThan(100);
          // …and Documents never moved on screen.
          for (const frame of samples)
            expect(Math.abs(frame.top - shown.top), trace).toBeLessThan(1);
        });
      }
    });
  }
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
