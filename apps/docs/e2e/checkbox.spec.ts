import { expect, test, type Locator, type Page } from '@playwright/test';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

const dashOffset = (path: Locator) =>
  path.evaluate((el) => Number.parseFloat(getComputedStyle(el).strokeDashoffset));
const borderColor = (box: Locator) => box.evaluate((el) => getComputedStyle(el).borderTopColor);
/** A colour role resolved inside the story's theme scope, in the `rgb()` form computed styles use. */
const role = (page: Page, name: string) =>
  page
    .locator('#storybook-root > *')
    .first()
    .evaluate((root, name) => {
      const probe = document.createElement('div');
      probe.style.color = `var(--md-sys-color-${name})`;
      root.append(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    }, name);
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

test.describe('Checkbox visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`states · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-checkbox--states', { theme, mode });
        await expect(page.getByTestId('states')).toHaveScreenshot(`states-${theme}-${mode}.png`);
      });
    }
  }
});

test.describe('Checkbox interaction', () => {
  test('the check draws in on checking and snaps away after unchecking', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const checkbox = page.getByRole('checkbox', { name: 'Label' });
    const check = page.locator('svg path').first();
    expect(await dashOffset(check)).toBe(1);

    await page.getByText('Label').click();
    await expect(checkbox).toBeChecked();
    await expect.poll(() => dashOffset(check)).toBeCloseTo(0, 1);

    await page.getByText('Label').click();
    await expect(checkbox).not.toBeChecked();
    await expect.poll(() => dashOffset(check), { timeout: 1000 }).toBe(1);
  });

  test('box geometry: 18px box, 2px outline, 40px state layer', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const box = page.locator('[aria-hidden="true"].rounded-\\[2px\\]');
    const control = page.locator('.state-layer');
    expect((await box.boundingBox())!.width).toBe(18);
    expect(await box.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe('2px');
    expect((await control.boundingBox())!.width).toBe(40);
  });

  test('hover shows the state layer and keyboard focus the ring', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const control = page.locator('.state-layer');
    await control.hover();
    await expect(control).toHaveAttribute('data-hovered', 'true');
    await shotWithMargin(page, control, 'state-hover.png');
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await expect(control).toHaveAttribute('data-focus-visible', 'true');
    await shotWithMargin(page, control, 'state-focus.png');
  });

  for (const mode of MODES) {
    test(`the unselected outline turns on-surface on hover, focus and press · ${mode}`, async ({
      page,
    }) => {
      await openStory(page, 'components-checkbox--playground', { mode });
      const control = page.locator('.state-layer');
      const box = control.locator('[aria-hidden="true"].rounded-\\[2px\\]');
      const [rest, active] = [
        await role(page, 'on-surface-variant'),
        await role(page, 'on-surface'),
      ];
      await expect.poll(() => borderColor(box)).toBe(rest);
      await control.hover();
      await expect.poll(() => borderColor(box)).toBe(active);
      await page.mouse.down();
      await expect(control).toHaveAttribute('data-pressed', 'true');
      await expect.poll(() => borderColor(box)).toBe(active);
      // Released away from the control, the press is cancelled and the box stays unchecked.
      await page.mouse.move(0, 0);
      await page.mouse.up();
      await expect(page.getByRole('checkbox')).not.toBeChecked();
      await page.keyboard.press('Tab');
      await expect(control).toHaveAttribute('data-focus-visible', 'true');
      await expect(control).not.toHaveAttribute('data-hovered', 'true');
      await expect.poll(() => borderColor(box)).toBe(active);
    });

    test(`a checked or indeterminate box has no outline, invalid included · ${mode}`, async ({
      page,
    }) => {
      await openStory(page, 'components-checkbox--states', { mode });
      const boxes = page.getByTestId('states').locator('[aria-hidden="true"].rounded-\\[2px\\]');
      // Columns: enabled, invalid, disabled; rows: unchecked, checked, indeterminate.
      for (const index of [1, 2, 4, 5, 7, 8]) {
        await expect.poll(() => borderColor(boxes.nth(index))).toBe(TRANSPARENT);
      }
      const error = await role(page, 'error');
      await expect.poll(() => borderColor(boxes.nth(3))).toBe(error);
      for (const index of [4, 5]) {
        expect(await boxes.nth(index).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
          error,
        );
      }
      // Pressing an invalid box keeps its error outline, and a checked one stays outline-free.
      const controls = page.getByTestId('states').locator('.state-layer');
      await controls.nth(3).hover();
      await page.mouse.down();
      await expect.poll(() => borderColor(boxes.nth(3))).toBe(error);
      await page.mouse.up();
      await controls.nth(4).hover();
      await page.mouse.down();
      await expect.poll(() => borderColor(boxes.nth(4))).toBe(TRANSPARENT);
      await page.mouse.up();
    });
  }

  test('the 48px touch target extends past the 40px state layer', async ({ page }) => {
    await openStory(page, 'components-checkbox--playground');
    const control = (await page.locator('.state-layer').boundingBox())!;
    await page.mouse.click(control.x + control.width / 2, control.y - 3);
    await expect(page.getByRole('checkbox')).toBeChecked();
  });

  test('select all becomes indeterminate and checks every child', async ({ page }) => {
    await openStory(page, 'components-checkbox--select-all');
    const all = page.getByRole('checkbox', { name: 'All fruit' });
    expect(await all.evaluate((el) => (el as HTMLInputElement).indeterminate)).toBe(true);
    await page.getByText('All fruit').click();
    for (const name of ['Apples', 'Pears', 'Plums']) {
      await expect(page.getByRole('checkbox', { name })).toBeChecked();
    }
    expect(await all.evaluate((el) => (el as HTMLInputElement).indeterminate)).toBe(false);
  });
});

test.describe('Checkbox layout safety', () => {
  const overrides = [
    'none',
    'fixed',
    'absolute',
    'sticky',
    'static',
    'overflowHidden',
    'fullWidth',
    'transform',
  ];
  for (const override of overrides) {
    for (const dir of ['ltr', 'rtl'] as const) {
      test(`${override} · ${dir}`, async ({ page }) => {
        await openStory(page, 'components-checkbox--layout-override', { dir }, { override });
        const control = page.getByTestId('target').locator('.state-layer');
        expect(await control.evaluate((el) => (el as HTMLElement).offsetWidth)).toBe(40);
        await page.getByText('Layout').click();
        await expect(page.getByRole('checkbox')).toBeChecked();
      });
    }
  }
});
