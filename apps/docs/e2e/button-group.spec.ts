import { expect, test, type Locator, type Page } from '@playwright/test';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const width = (locator: Locator) =>
  locator.evaluate((el) => (el as HTMLElement).getBoundingClientRect().width);

const radii = (locator: Locator) =>
  locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      topLeft: s.borderTopLeftRadius,
      topRight: s.borderTopRightRadius,
      bottomLeft: s.borderBottomLeftRadius,
      bottomRight: s.borderBottomRightRadius,
    };
  });

async function settle(page: Page) {
  // Longest spring in play is the fast spatial one (< 400ms).
  await page.waitForTimeout(500);
}

test.describe('ButtonGroup visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'composites-buttongroup--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  test('sizes', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--sizes');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes.png');
  });

  test('sizes · rtl', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--sizes', { dir: 'rtl' });
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes-rtl.png');
  });
});

test.describe('ButtonGroup press expansion', () => {
  for (const [label, name] of [
    ['middle', 'Share'],
    ['end', 'Create'],
  ] as const) {
    test(`a pressed ${label} button grows, its neighbours shrink and the group keeps its width`, async ({
      page,
    }) => {
      await openStory(page, 'composites-buttongroup--standard');
      const group = page.getByRole('toolbar', { name: 'Actions' });
      const pressed = group.getByRole('button', { name });
      const groupWidth = await width(group);
      const restWidth = await width(pressed);

      const box = (await pressed.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await settle(page);
      const grown = await width(pressed);
      expect(grown).toBeGreaterThan(restWidth + 4);
      expect(grown).toBeLessThanOrEqual(restWidth * 1.15 + 1);
      expect(Math.abs((await width(group)) - groupWidth)).toBeLessThanOrEqual(1);

      await page.mouse.up();
      await settle(page);
      expect(Math.abs((await width(pressed)) - restWidth)).toBeLessThanOrEqual(0.5);
      expect(await pressed.evaluate((el) => (el as HTMLElement).style.flex)).toBe('');
    });
  }
});

test.describe('ButtonGroup standard', () => {
  test('spaces its buttons by size: 18, 12, then 8px', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--sizes');
    const gaps = await Promise.all(
      ['xs', 'sm', 'md', 'lg', 'xl'].map((size) =>
        page
          .getByRole('toolbar', { name: `Standard ${size}` })
          .evaluate((el) => getComputedStyle(el).columnGap),
      ),
    );
    expect(gaps).toEqual(['18px', '12px', '8px', '8px', '8px']);
  });

  test('arrow keys move between buttons without a selection mode', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--standard');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Create' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('button', { name: 'Share' })).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('button', { name: 'Create' })).toBeFocused();
  });
});

test.describe('ButtonGroup connected', () => {
  test('a pressed button changes shape only: no button changes width', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    const radios = page.getByRole('radio');
    const before = await Promise.all((await radios.all()).map(width));
    const day = page.getByRole('radio', { name: 'Day' });
    const box = (await day.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await settle(page);
    expect((await radii(day)).topRight).toBe('4px');
    expect(await Promise.all((await radios.all()).map(width))).toEqual(before);
    await page.mouse.up();
  });

  test('spans its container, and XS / S icon buttons stay 48px wide', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    expect(await width(page.getByRole('radiogroup'))).toBe(480);
    await openStory(page, 'composites-buttongroup--connected-multiple-selection');
    for (const button of await page.getByTestId('format').getByRole('button').all()) {
      expect(await width(button)).toBeGreaterThanOrEqual(48);
    }
  });

  test('inner corners grow with size, and square groups square the outer corners', async ({
    page,
  }) => {
    await openStory(page, 'composites-buttongroup--sizes');
    const inner = { xs: '4px', sm: '8px', md: '8px', lg: '16px', xl: '20px' };
    for (const [size, corner] of Object.entries(inner)) {
      const round = page.getByRole('toolbar', { name: `Connected round ${size}` });
      const square = page.getByRole('toolbar', { name: `Connected square ${size}` });
      const roundFirst = await radii(round.getByRole('button').first());
      expect(roundFirst.topRight).toBe(corner);
      expect(roundFirst.topLeft).not.toBe(corner);
      expect(await radii(square.getByRole('button').first())).toEqual({
        topLeft: corner,
        topRight: corner,
        bottomLeft: corner,
        bottomRight: corner,
      });
    }
  });

  test('inner corners are small, outer corners full, and selected buttons become full', async ({
    page,
  }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    const day = page.getByRole('radio', { name: 'Day' });
    const week = page.getByRole('radio', { name: 'Week' });
    const year = page.getByRole('radio', { name: 'Year' });

    expect(await radii(day)).toEqual({
      topLeft: '20px',
      bottomLeft: '20px',
      topRight: '8px',
      bottomRight: '8px',
    });
    expect(await radii(year)).toMatchObject({ topLeft: '8px', topRight: '20px' });
    // "Week" is selected: all corners full.
    expect(await radii(week)).toEqual({
      topLeft: '20px',
      topRight: '20px',
      bottomLeft: '20px',
      bottomRight: '20px',
    });

    await day.click();
    await page.mouse.move(0, 0);
    await settle(page);
    await expect(day).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByTestId('selection')).toHaveText('day');
    expect((await radii(day)).topRight).toBe('20px');
    expect((await radii(week)).topRight).toBe('8px');
  });

  test('outer corners follow the reading direction in RTL', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection', { dir: 'rtl' });
    const day = page.getByRole('radio', { name: 'Day' });
    expect(await radii(day)).toMatchObject({ topRight: '20px', topLeft: '8px' });
  });

  test('arrow keys move between options and the selection is announced', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    // React Aria keeps every option tabbable and adds arrow-key movement.
    await page.keyboard.press('Tab');
    await expect(page.getByRole('radio', { name: 'Day' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Month' })).toBeFocused();
    await page.keyboard.press('Space');
    await expect(page.getByTestId('selection')).toHaveText('month');
    await expect(page.getByRole('radiogroup', { name: 'Calendar view' })).toBeVisible();
  });

  test('multiple selection with icon buttons', async ({ page }) => {
    await openStory(page, 'composites-buttongroup--connected-multiple-selection');
    const italic = page.getByRole('button', { name: 'Italic' });
    await italic.click();
    await expect(italic).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.mouse.move(0, 0);
    await settle(page);
    await expect(page.getByTestId('format')).toHaveScreenshot('connected-multiple.png');
  });
});

test.describe('ButtonGroup layout safety', () => {
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
    for (const connected of [false, true]) {
      for (const dir of ['ltr', 'rtl'] as const) {
        test(`${override} · ${connected ? 'connected' : 'standard'} · ${dir}`, async ({ page }) => {
          await openStory(
            page,
            'composites-buttongroup--layout-override',
            { dir },
            { override, connected, transformedAncestor: override === 'transform' },
          );
          const group = page.getByTestId('target');
          const buttons = group.getByRole('button');
          await expect(buttons).toHaveCount(3);
          for (const button of await buttons.all()) {
            expect(await button.evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(40);
          }
          const gap = await group.evaluate((el) => getComputedStyle(el).columnGap);
          expect(gap).toBe(connected ? '2px' : '12px');
          await buttons.first().click();
          await expect(page.getByTestId('count')).toHaveText('Pressed 1');
        });
      }
    }
  }
});
