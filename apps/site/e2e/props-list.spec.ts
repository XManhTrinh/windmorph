import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './navigate';

/** The props lists on a component's API tab: layout at each width, disclosures, anchors, axe. */

const list = (page: Page, name: string) => page.getByRole('region', { name, exact: true });

test.describe('Props list', () => {
  for (const width of [390, 840, 1440]) {
    test(`fits a ${width}px window, its descriptions at the list's full width`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoReady(page, '/components/button-group/api');
      const props = list(page, 'ButtonGroup props');
      await expect(props).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);
      const listBox = (await props.boundingBox())!;
      const description = (await props
        .locator('#prop-ButtonGroup-variant [data-prop-description]')
        .boundingBox())!;
      // Descriptions get the room the old table's fourth column never had.
      expect(description.width / listBox.width).toBeGreaterThanOrEqual(0.95);
      // The header line keeps name, type and default together where the list has room (a
      // 42rem list); a narrower one puts the type and default on a line of their own.
      const header = props.locator('#prop-ButtonGroup-variant > div').first();
      const middle = async (text: string) => {
        const box = (await header.getByText(text, { exact: true }).boundingBox())!;
        return box.y + box.height / 2;
      };
      const [name, value] = [await middle('variant'), await middle('"connected"')];
      if (width === 1440) expect(listBox.width).toBeGreaterThanOrEqual(672);
      if (listBox.width >= 672) expect(Math.abs(value - name)).toBeLessThan(4);
      else expect(value).toBeGreaterThan(name + 16);
    });
  }

  test('a long type and a long union fit a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/components/phone-field/api');
    const country = page.locator('#prop-PhoneField-country');
    const more = country.getByRole('button', { name: /^Show all \d+$/ });
    await more.click();
    await expect(country.getByRole('button', { name: 'Show fewer' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(country.getByText('"ZW"', { exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThanOrEqual(0);
  });

  test("an object prop's keys unfold from the keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/dialog/api');
    const classNames = page.locator('#prop-Dialog-classNames');
    const toggle = classNames.getByRole('button', { name: /^\d+ keys$/ });
    const keys = page.locator(`[id="${await toggle.getAttribute('aria-controls')}"]`);
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(keys).toBeHidden();
    // Tab reaches the button from the prop's anchor link before it.
    await classNames.getByRole('link', { name: 'Link to classNames' }).focus();
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(keys.getByText('classNames.panel', { exact: true })).toBeVisible();
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(keys).toBeHidden();
  });

  test('a link to a key opens its parent and scrolls the key into view', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/components/sheets/api#prop-BottomSheet-labels.close');
    const key = page.locator('[id="prop-BottomSheet-labels.close"]');
    await expect(key).toBeVisible();
    await expect(key).toBeInViewport();
    await expect(
      page.locator('#prop-BottomSheet-labels').getByRole('button', { name: /^\d+ keys$/ }),
    ).toHaveAttribute('aria-expanded', 'true');
    // Below the sticky top bar, not under it.
    expect((await key.boundingBox())!.y).toBeGreaterThanOrEqual(64);
  });

  test("a prop's anchor links to it and copies its address", async ({ page, context, baseURL }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await page.setViewportSize({ width: 1280, height: 900 });
    await gotoReady(page, '/components/button-group/api');
    const shape = page.locator('#prop-ButtonGroup-shape');
    const link = shape.getByRole('link', { name: 'Link to shape' });
    await expect(link).toHaveCSS('opacity', '0');
    // It shows while the pointer is over the prop's header line.
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
    test(`passes axe in ${mode} mode, keys unfolded and a prop targeted`, async ({
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
      const results = await new AxeBuilder({ page }).include('[data-props-list]').analyze();
      expect(results.violations.map((violation) => violation.id)).toEqual([]);
    });
  }
});
