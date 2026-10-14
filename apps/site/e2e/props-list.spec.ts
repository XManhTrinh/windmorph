import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { gotoReady } from './navigate';

/**
 * The props on a component's API tab: one row structure at every width, groups and folds,
 * the filter, the outline, anchors and axe.
 */

const list = (page: Page, name: string) => page.getByRole('region', { name, exact: true });

/**
 * Checks a prop's first line reads left to right with nothing pushed away: each part starts
 * right after the one before it on the same line, or at the start of the next line.
 */
async function expectFirstLineFlows(header: Locator) {
  const boxes = await header.evaluate((element) => {
    const parts = [...element.children].filter(
      (child) => child.textContent?.trim() && !child.classList.contains('sr-only'),
    );
    return {
      left: element.getBoundingClientRect().left,
      parts: parts.map((part) => {
        const rects = [...part.getClientRects()];
        const first = rects[0]!;
        const last = rects[rects.length - 1]!;
        return { left: first.left, top: first.top, right: last.right, bottom: last.bottom };
      }),
    };
  });
  expect(boxes.parts.length).toBeGreaterThanOrEqual(2);
  for (let index = 1; index < boxes.parts.length; index++) {
    const before = boxes.parts[index - 1]!;
    const part = boxes.parts[index]!;
    const sameLine = part.top < before.bottom - 4;
    if (sameLine) expect(part.left - before.right).toBeLessThan(24);
    else expect(part.left - boxes.left).toBeLessThan(4);
  }
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
      for (const name of ['open', 'defaultOpen', 'role', 'dismissable', 'fullScreen']) {
        await expectFirstLineFlows(props.locator(`#prop-Dialog-${name} > [data-prop-header]`));
      }
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
    await expect(props.getByRole('heading', { level: 4 })).toHaveText([
      'Props',
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
    // A match in the folded Styling group opens it, down to the matching key.
    await expect(page.locator('[id="prop-Dialog-classNames.scrim"]')).toBeVisible();
    await expect(page.locator('#prop-Dialog-open')).toBeHidden();
    // A component with no match is left out, heading and all.
    await expect(page.getByRole('heading', { level: 3, name: /^DialogTrigger/ })).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(field).toHaveValue('');
    await expect(field).toBeFocused();
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
      await page.getByRole('textbox', { name: 'Filter props' }).fill('icon');
      await expect(page.getByRole('status').filter({ hasText: /match/ })).toBeVisible();
      expect((await scan().analyze()).violations.map((violation) => violation.id)).toEqual([]);
    });
  }
});
