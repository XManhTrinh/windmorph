import { expect, test, type Locator } from '@playwright/test';
import { pauseClock } from './clock';
import { iconTransitionSuite } from './icon-faces';
import { layoutSafetySuite } from './layout-safety';
import { indicatorContrasts, layoutBoxes, pendingCheck, waitForIndicators } from './pending';
import { MODES, THEMES, shotWithMargin } from './shots';
import { overshoots, probeNextMorph } from './morph-probe';
import { underForcedColors } from './forced-colors';
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

  // Re-audit 2026-10-15: the morph ran on the fast spatial spring and overshot (20 → 6.9 →
  // 8px); Compose's IconButton uses DefaultEffects "to prevent any bounce", toggles too.
  test('the press and selection morphs never bounce', async ({ page }) => {
    await openStory(page, 'components-iconbutton--toggle');
    const toggle = page.getByRole('button', { name: 'Favourite' });
    const box = (await toggle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    const press = await probeNextMorph(toggle, 'press');
    await page.mouse.down();
    const pressCurve = await press();
    expect(pressCurve.from).toBeGreaterThan(pressCurve.to);
    expect(overshoots(pressCurve), JSON.stringify(pressCurve)).toBe(false);
    // Let the press morph settle, so the release starts from the pressed corners.
    await expect
      .poll(() => toggle.evaluate((el) => parseFloat(getComputedStyle(el).borderTopLeftRadius)))
      .toBe(pressCurve.to);
    const release = await probeNextMorph(toggle, 'release');
    await page.mouse.up();
    // Released selected: pressed corners → the selected square.
    const releaseCurve = await release();
    expect(releaseCurve.to).toBeGreaterThan(releaseCurve.from);
    expect(overshoots(releaseCurve), JSON.stringify(releaseCurve)).toBe(false);
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

test.describe('IconButton layout safety · pending', () => {
  layoutSafetySuite('components-iconbutton--layout-override', {
    height: 40,
    width: 40,
    radius: '20px',
    args: { pending: true },
    interactive: false,
    check: pendingCheck,
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

  test('a selected, disabled outlined toggle is on-surface at 10%, as on Button', async ({
    page,
  }) => {
    await openStory(page, 'components-iconbutton--disabled');
    const row = page.getByTestId('disabled').locator('> div').nth(2);
    const expected = await row.evaluate((el) => {
      const probe = document.createElement('div');
      probe.className = 'bg-on-surface/10';
      el.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    await expect(row.getByRole('button', { name: 'Starred', exact: true })).toHaveCSS(
      'background-color',
      expected,
    );
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

// Re-audit 2026-10-15: under forced colours filled and tonal icon buttons had no boundary
// and a selected toggle looked like an unselected one.
test.describe('IconButton forced colours', () => {
  test('filled and tonal keep a boundary; a selected toggle stands out', async ({ page }) => {
    await openStory(page, 'components-iconbutton--variants');
    const rows = page.getByTestId('variants').locator(':scope > div');
    const { before, after } = await underForcedColors(page, rows.getByRole('button'));
    const variants = ['filled', 'tonal', 'outlined', 'standard'];
    // Each row: Search, Star (unselected toggle), Starred (selected toggle), disabled Search.
    expect(after).toHaveLength(variants.length * 4);
    variants.forEach((variant, row) => {
      const [plain, unselected, selected] = after.slice(row * 4, row * 4 + 3);
      if (variant !== 'standard') {
        expect(plain!.borderStyle, variant).toBe('solid');
        expect(plain!.borderWidth, variant).toBeGreaterThanOrEqual(1);
      }
      expect(selected!.background, variant).not.toBe(unselected!.background);
    });
    after.forEach((look, index) => expect(look.width).toBe(before[index]!.width));
  });
});

// IconButton pending (docs/plans/button-pending.md, 2026-10-17).
test.describe('IconButton pending', () => {
  test('every size, width and density keeps its size and place', async ({ page }) => {
    await openStory(page, 'components-iconbutton--pending', {}, { pending: false });
    const before = await layoutBoxes(page.getByTestId('density'));
    await openStory(page, 'components-iconbutton--pending', {}, { pending: true });
    await waitForIndicators(page.getByTestId('density'));
    expect(await layoutBoxes(page.getByTestId('density'))).toEqual(before);
  });

  test('names itself with the suffix while its tooltip shows only the label', async ({ page }) => {
    await openStory(page, 'components-iconbutton--pending');
    const button = page.getByTestId('pending-0-xs-narrow');
    await expect(button).toHaveAccessibleName('Refresh, Loading');
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await expect(page.getByRole('tooltip')).toHaveText('Refresh');
  });

  for (const theme of THEMES) {
    test(`the indicator is at least 3:1 against every variant · ${theme}`, async ({ page }) => {
      for (const mode of MODES) {
        for (const contrast of ['standard', 'medium', 'high'] as const) {
          await openStory(page, 'components-iconbutton--pending', { theme, mode, contrast });
          const ratios = await indicatorContrasts(page.getByTestId('density'));
          for (const [id, ratio] of Object.entries(ratios)) {
            expect(ratio, `${id} · ${mode} · ${contrast}`).toBeGreaterThanOrEqual(3);
          }
        }
      }
    });
  }

  for (const mode of MODES) {
    test(`screenshot · ${mode}`, async ({ page }) => {
      await pauseClock(page);
      await openStory(page, 'components-iconbutton--pending', { mode });
      const root = page.getByTestId('density');
      await expect(root.locator('[data-slot="pending-indicator"] svg')).toHaveCount(
        await root.locator('[data-pending]').count(),
      );
      await expect(root).toHaveScreenshot(`pending-${mode}.png`);
    });
  }
});
