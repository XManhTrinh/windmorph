import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { gotoReady } from './navigate';

/**
 * The props on a component's API tab: one row structure at every width, groups and folds,
 * the filter, the outline, anchors and axe.
 */

const list = (page: Page, name: string) => page.getByRole('region', { name, exact: true });

/**
 * Checks a prop's first lines read left to right with nothing pushed away. In a wide list the
 * name, type, Required and default run as one line of text; in a narrow one the type starts
 * a line of its own under the name, with the default right after it.
 */
async function expectRowStructure(header: Locator, wide: boolean) {
  const box = await header.evaluate((element) => {
    const rect = (part: Element | undefined) => {
      if (!part) return null;
      const rects = [...part.getClientRects()];
      const first = rects[0]!;
      const last = rects[rects.length - 1]!;
      return { left: first.left, top: first.top, right: last.right, bottom: last.bottom };
    };
    const children = [...element.children];
    return {
      left: element.getBoundingClientRect().left,
      name: rect(element.querySelector('[data-prop-name]')!)!,
      type: rect(children[1])!,
      fallback: rect(children.find((child) => child.textContent?.trim().startsWith('='))),
    };
  });
  const nextTo = (
    part: { left: number; top: number },
    before: { right: number; bottom: number },
  ) => (part.top < before.bottom - 4 ? part.left - before.right < 24 : part.left - box.left < 4);
  if (wide) {
    expect(box.type.top).toBeLessThan(box.name.bottom - 4);
    expect(box.type.left - box.name.right).toBeLessThan(24);
  } else {
    expect(box.type.top).toBeGreaterThanOrEqual(box.name.bottom - 4);
    expect(box.type.left - box.left).toBeLessThan(4);
  }
  if (box.fallback) expect(nextTo(box.fallback, box.type)).toBe(true);
}

test.describe('Props list', () => {
  for (const width of [390, 840, 1440]) {
    test(`keeps one row structure at ${width}px, descriptions at full width`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoReady(page, '/components/dialog/api');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);
      const props = list(page, 'Dialog props');
      const listBox = (await props.boundingBox())!;
      const description = (await props
        .locator('#prop-Dialog-role [data-prop-description]')
        .boundingBox())!;
      expect(description.width / listBox.width).toBeGreaterThanOrEqual(0.95);
      const wide = listBox.width >= 672;
      if (width === 1440) expect(wide).toBe(true);
      if (width === 390) expect(wide).toBe(false);
      // Every row, keys included, has the same structure.
      for (const header of await props
        .locator('li[data-prop]:visible > [data-prop-header]')
        .all()) {
        await expectRowStructure(header, wide);
      }
      // The classNames keys document the slots; no separate slots line repeats them.
      await expect(page.getByText(/classNames slots:/)).toHaveCount(0);
    });
  }

  test('a long union folds its members and fits a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/components/phone-field/api');
    const country = page.locator('#prop-PhoneField-country');
    await country.getByRole('button', { name: /^Show all \d+$/ }).click();
    await expect(country.getByRole('button', { name: 'Show fewer' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(country.getByText('"ZW"', { exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(0);
  });

  test('groups props under subheads, with Styling folded', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/dialog/api');
    const props = list(page, 'Dialog props');
    // The main group sits under the component's heading without a subhead of its own.
    await expect(props.getByRole('heading', { level: 4 })).toHaveText([
      'Events',
      /^Styling \(\d+\)$/,
    ]);
    const styling = props.getByRole('button', { name: /^Styling/ });
    await expect(styling).toHaveAttribute('aria-expanded', 'false');
    await expect(props.locator('#prop-Dialog-classNames')).toBeHidden();
    await styling.click();
    await expect(props.locator('#prop-Dialog-classNames')).toBeVisible();
  });

  test("an object prop's keys unfold from the keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/sheets/api');
    const labels = page.locator('#prop-BottomSheet-labels');
    const toggle = labels.getByRole('button', { name: /^\d+ keys?$/ });
    const keys = page.locator(`[id="${await toggle.getAttribute('aria-controls')}"]`);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(keys).toBeHidden();
    await labels.getByRole('link', { name: 'Link to labels' }).focus();
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(keys.getByText('labels.close', { exact: true })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(keys).toBeHidden();
  });

  test('a link to a folded key opens its group and its prop, and scrolls to it', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/components/sheets/api#prop-BottomSheet-classNames.handle');
    const key = page.locator('[id="prop-BottomSheet-classNames.handle"]');
    await expect(key).toBeVisible();
    await expect(key).toBeInViewport();
    // Below the sticky top bar, not under it.
    expect((await key.boundingBox())!.y).toBeGreaterThanOrEqual(64);
  });

  test('the filter narrows every list, announces the count, and clears', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/dialog/api');
    const field = page.getByRole('textbox', { name: 'Filter props' });
    const status = page.getByRole('status').filter({ hasText: /match/ });
    await field.focus();
    await page.keyboard.type('scrim');
    await expect(status).toHaveText(/^\d+ props? match(es)?$/);
    // The matches are highlighted, visually only, down into the folded key that matched.
    const highlighted = () =>
      page.evaluate(() =>
        [...(CSS.highlights.get('props-filter') ?? [])].map((range) =>
          (range as Range).toString().toLowerCase(),
        ),
      );
    expect(await highlighted()).toContain('scrim');
    expect(
      await page.evaluate(() =>
        [...(CSS.highlights.get('props-filter') ?? [])].some((range) =>
          (range as Range).startContainer.parentElement?.closest(
            '[id="prop-Dialog-classNames.scrim"]',
          ),
        ),
      ),
    ).toBe(true);
    // A match in the folded Styling group opens it, down to the matching key.
    await expect(page.locator('[id="prop-Dialog-classNames.scrim"]')).toBeVisible();
    await expect(page.locator('#prop-Dialog-open')).toBeHidden();
    // A component with no match is left out, heading and all.
    await expect(page.getByRole('heading', { level: 3, name: /^DialogTrigger/ })).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(field).toHaveValue('');
    await expect(field).toBeFocused();
    expect(await page.evaluate(() => CSS.highlights.has('props-filter'))).toBe(false);
    await expect(page.locator('#prop-Dialog-open')).toBeVisible();

    await page.keyboard.type('zzz nothing');
    await expect(page.getByRole('status').filter({ hasText: 'No props match' })).toBeVisible();
    await expect(page.getByText('No props match “zzz nothing”')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filter' }).first().click();
    await expect(field).toHaveValue('');
  });

  test('lists each component in the page outline', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page, '/components/dialog/api');
    const outline = page.getByRole('navigation', { name: 'On this page' });
    await expect(outline.getByRole('link', { name: 'DialogContent', exact: true })).toBeVisible();
    await outline.getByRole('link', { name: 'DialogHeader', exact: true }).click();
    await expect(page).toHaveURL(/#props-DialogHeader$/);
    await expect(page.getByRole('heading', { level: 3, name: /^DialogHeader/ })).toBeInViewport();
  });

  test("a prop's anchor links to it and copies its address", async ({ page, context, baseURL }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/button-group/api');
    const shape = page.locator('#prop-ButtonGroup-shape');
    const link = shape.getByRole('link', { name: 'Link to shape' });
    await expect(link).toHaveCSS('opacity', '0');
    // It shows while the pointer is over the prop's first line.
    await shape.getByText('shape', { exact: true }).hover();
    await expect(link).toHaveCSS('opacity', '1');
    await link.click();
    await expect(page).toHaveURL(/#prop-ButtonGroup-shape$/);
    await expect(page.getByText('Link copied', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
      /\/components\/button-group\/api#prop-ButtonGroup-shape$/,
    );
  });

  for (const mode of ['light', 'dark'] as const) {
    test(`passes axe in ${mode} mode, filtered, with Styling and keys open`, async ({
      page,
      baseURL,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page
        .context()
        .addCookies([
          { name: 'windmorph-theme', value: encodeURIComponent(`mode=${mode}`), url: baseURL! },
        ]);
      await page.setViewportSize({ width: 1280, height: 900 });
      await gotoReady(page, '/components/text-field/api#prop-TextField-labels.characterCount');
      await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
      await expect(page.locator('[id="prop-TextField-labels.characterCount"]')).toBeVisible();
      await page.getByRole('button', { name: /^Styling/ }).click();
      const scan = () => new AxeBuilder({ page }).include('section:has(> h2#props)');
      expect((await scan().analyze()).violations.map((violation) => violation.id)).toEqual([]);
      // Again with the matches highlighted.
      await page.getByRole('textbox', { name: 'Filter props' }).fill('icon');
      await expect(page.getByRole('status').filter({ hasText: /match/ })).toBeVisible();
      expect((await scan().analyze()).violations.map((violation) => violation.id)).toEqual([]);
    });
  }
});
