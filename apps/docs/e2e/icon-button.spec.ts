import { expect, test, type Locator } from '@playwright/test';
import { iconTransitionSuite } from './icon-faces';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

test.describe('IconButton visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-iconbutton--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const mode of MODES) {
    test(`variants · baseline · ${mode} · high contrast`, async ({ page }) => {
      await openStory(page, 'components-iconbutton--variants', { mode, contrast: 'high' });
      await expect(page.getByTestId('variants')).toHaveScreenshot(
        `variants-baseline-${mode}-high.png`,
      );
    });
  }

  test('sizes and widths', async ({ page }) => {
    await openStory(page, 'components-iconbutton--sizes-and-widths');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes-and-widths.png');
  });
});

test.describe('IconButton interaction states', () => {
  test('hover, focus and press morph', async ({ page }) => {
    await openStory(
      page,
      'components-iconbutton--playground',
      {},
      { variant: 'filled', size: 'md', tooltip: false },
    );
    const button = page.getByRole('button', { name: 'Search' });

    await button.hover();
    await expect(button).toHaveAttribute('data-hovered', 'true');
    await shotWithMargin(page, button, 'state-hover.png');

    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await expect(button).toHaveAttribute('data-focus-visible', 'true');
    await shotWithMargin(page, button, 'state-focus.png');

    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('12px');
    await page.mouse.up();
    await expect
      .poll(() => button.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('28px');
  });

  test('toggle swaps icon and shape', async ({ page }) => {
    await openStory(page, 'components-iconbutton--toggle');
    const toggle = page.getByRole('button', { name: 'Favourite' });
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.mouse.move(0, 0);
    await expect
      .poll(() => toggle.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('16px');
    await shotWithMargin(page, toggle, 'toggle-selected.png');
  });

  test('shows its label as a tooltip on hover and keyboard focus', async ({ page }) => {
    await openStory(page, 'components-iconbutton--playground', {}, { size: 'md' });
    const button = page.getByRole('button', { name: 'Search' });
    // React Aria shows tooltips for pointer hover once it has seen the pointer move.
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await expect(page.getByRole('tooltip')).toHaveText('Search');
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tooltip')).toHaveText('Search');
  });

  test('standard and outlined icons are on-surface-variant, not the surrounding colour', async ({
    page,
  }) => {
    await openStory(page, 'components-iconbutton--variants');
    const variants = page.getByTestId('variants');
    const color = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).color);
    for (const [index, name] of [
      [2, 'outlined'],
      [3, 'standard'],
    ] as const) {
      const row = variants.locator('> div').nth(index);
      // The row label is text-on-surface-variant; the story's own text is on-surface.
      const label = row.getByText(name, { exact: true });
      const button = row.getByRole('button', { name: 'Search' }).first();
      expect(await color(button)).toBe(await color(label));
      expect(await color(button)).not.toBe(await color(variants));
    }
  });

  test('a container recolours standard and outlined icons through the token', async ({ page }) => {
    await openStory(page, 'components-iconbutton--content-color');
    const box = page.getByTestId('content-color');
    const color = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).color);
    const containerColor = await color(box);
    expect(await color(box.getByRole('button', { name: 'Search' }))).toBe(containerColor);
    expect(await color(box.getByRole('button', { name: 'Star' }))).toBe(containerColor);
  });
});

test.describe('IconButton layout safety', () => {
  layoutSafetySuite('components-iconbutton--layout-override', {
    height: 40,
    width: 40,
    radius: '20px',
  });
});

test.describe('IconButton disabled outlines (2026-10-13)', () => {
  test('a disabled outline dims to 10%, and a selected toggle has none', async ({ page }) => {
    await openStory(page, 'components-iconbutton--disabled');
    const row = page.getByTestId('disabled').locator('> div').nth(2);
    const border = (name: string) =>
      row
        .getByRole('button', { name, exact: true })
        .evaluate((el) => getComputedStyle(el).borderTopColor);
    // outline-variant at 10% alpha, for a plain button and an unselected toggle.
    for (const name of ['Search', 'Star']) {
      expect(await border(name)).toMatch(/(, 0\.1\)|\/ 0\.1\))$/);
    }
    expect(await border('Starred')).toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('IconButton tooltip announcement (2026-10-13)', () => {
  test('the tooltip shows but does not describe the button it names', async ({ page }) => {
    await openStory(page, 'components-iconbutton--playground', {}, { size: 'md' });
    const button = page.getByRole('button', { name: 'Search' });
    const box = (await button.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await expect(page.getByRole('tooltip')).toHaveText('Search');
    await expect(button).not.toHaveAttribute('aria-describedby');
  });
});

test.describe('IconButton icon transition', () => {
  iconTransitionSuite(
    'components-iconbutton--icon-transitions',
    (page) => page.getByTestId('toggle'),
    {
      swap: false,
    },
  );
});
