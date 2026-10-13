import { expect, test } from '@playwright/test';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

test.describe('Select visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-select--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const contrast of ['medium', 'high'] as const) {
    test(`variants · contrast ${contrast}`, async ({ page }) => {
      await openStory(page, 'components-select--variants', { contrast });
      await expect(page.getByTestId('variants')).toHaveScreenshot(
        `variants-contrast-${contrast}.png`,
      );
    });
  }

  for (const mode of MODES) {
    test(`open menu · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-select--open', { mode });
      await expect(page.getByRole('listbox')).toBeVisible();
      await expect(page).toHaveScreenshot(`open-${mode}.png`);
    });
  }

  test('sections', async ({ page }) => {
    await openStory(page, 'components-select--sections');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page).toHaveScreenshot('sections.png');
  });

  test('multiple', async ({ page }) => {
    await openStory(page, 'components-select--multiple');
    await expect(page.getByTestId('multiple')).toHaveScreenshot('multiple.png');
  });

  test('presentation auto · phone bottom sheet', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, 'components-select--sheet');
    await page.getByRole('button', { name: /Sort by/ }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot('sheet.png');
  });

  test('variants · right-to-left', async ({ page }) => {
    await openStory(page, 'components-select--variants', { dir: 'rtl' });
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-rtl.png');
  });

  test('open menu · right-to-left', async ({ page }) => {
    await openStory(page, 'components-select--open', { dir: 'rtl' });
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page).toHaveScreenshot('open-rtl.png');
  });

  test('variants · forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openStory(page, 'components-select--variants');
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-forced-colors.png');
  });
});

test.describe('Select behaviour', () => {
  test('a press anywhere on the field opens the menu, under the field and as wide', async ({
    page,
  }) => {
    await openStory(page, 'components-select--interactive');
    const field = page.getByRole('button', { name: /Sort by/ });
    // The field's label sits outside the button, so press the container's edge.
    const container = page.getByTestId('interactive').locator('[data-field-state]').first();
    const box = (await container.boundingBox())!;
    await page.mouse.click(box.x + box.width - 12, box.y + box.height / 2);
    const list = page.getByRole('listbox');
    await expect(list).toBeVisible();
    await expect(field).toHaveAttribute('aria-expanded', 'true');
    // The menu's panel (around the list's 4px padding), once its open motion has settled.
    const panel = list.locator('..');
    await expect
      .poll(async () => (await panel.boundingBox())!.width)
      .toBeGreaterThanOrEqual(box.width - 1);
    expect((await panel.boundingBox())!.y).toBeGreaterThan(box.y + box.height - 1);
  });

  // M3 motion: the menu expands from the field's edge (a clip) as it fades in, as Menu does;
  // no scale.
  test('the menu opens with a reveal from the field, not a scale', async ({ page }) => {
    await openStory(page, 'components-select--interactive');
    await page.getByRole('button', { name: /Sort by/ }).focus();
    // Record the panel's clip and scale every frame while it opens.
    await page.evaluate(() => {
      const frames: { clip: string; scale: string }[] = [];
      (window as unknown as { frames_: typeof frames }).frames_ = frames;
      const start = performance.now();
      const tick = () => {
        const motion = document.querySelector('[role="listbox"]')?.closest('[data-placement]');
        if (motion) {
          const style = getComputedStyle(motion);
          frames.push({ clip: style.clipPath, scale: style.scale });
        }
        if (performance.now() - start < 1500) requestAnimationFrame(tick);
      };
      tick();
    });
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { frames_: unknown[] }).frames_.length))
      .toBeGreaterThan(20);
    const frames = await page.evaluate(
      () => (window as unknown as { frames_: { clip: string; scale: string }[] }).frames_,
    );
    expect(frames.every((frame) => frame.scale === 'none')).toBe(true);
    // It opens from a clip at the field's edge to its full size.
    expect(frames.some((frame) => frame.clip !== 'inset(-24px)')).toBe(true);
    expect(frames.at(-1)!.clip).toBe('inset(-24px)');
  });

  test('keyboard: open, move, choose, and focus returns to the field', async ({ page }) => {
    await openStory(page, 'components-select--interactive');
    const field = page.getByRole('button', { name: /Sort by/ });
    await field.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('low');
    await expect(field).toBeFocused();
    // Typeahead on the closed field.
    await page.keyboard.type('nea');
    await expect(page.getByTestId('value')).toHaveText('near');
  });

  test('a placeholder waits for the label to float', async ({ page }) => {
    await openStory(page, 'components-select--variants');
    const field = page.getByRole('button', { name: /Sort by/ }).nth(1);
    const placeholder = field.getByText('Choose an order');
    await expect(placeholder).toHaveCSS('opacity', '0');
    await field.focus();
    await expect(placeholder).toHaveCSS('opacity', '1');
  });

  test('the keyboard reaches a disabled option, which stays unchosen', async ({ page }) => {
    await openStory(page, 'components-select--open');
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('End');
    const near = page.getByRole('option', { name: 'Nearest to you' });
    await expect(near).toBeFocused();
    await expect(near).toHaveAttribute('aria-disabled', 'true');
    await page.keyboard.press('Enter');
    await expect(near).toHaveAttribute('aria-selected', 'false');
    await expect(page.getByRole('option', { name: /low to high/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  test('one press outside closes the menu and leaves the field', async ({ page }) => {
    await openStory(page, 'components-select--interactive');
    const field = page.getByRole('button', { name: /Sort by/ });
    const root = page.getByTestId('interactive').locator('[data-field-state]').first();
    await field.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.mouse.click(700, 500);
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(field).not.toBeFocused();
    await expect(root).not.toHaveAttribute('data-focused');
    // Escape still hands focus back, and so does pressing the field to close it.
    await field.click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(field).toBeFocused();
    await field.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    // While open, the field is inert behind the menu, so press where it is.
    const box = (await root.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + 28);
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(field).toBeFocused();
  });

  test('Escape closes without changing the value', async ({ page }) => {
    await openStory(page, 'components-select--interactive');
    await page.getByRole('button', { name: /Sort by/ }).click();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('newest');
  });

  test('multiple keeps the menu open and stops at maxSelections', async ({ page }) => {
    await openStory(page, 'components-select--multiple');
    await page.getByRole('button', { name: /Cuisines/ }).click();
    await page.getByRole('option', { name: 'Grilled noodles' }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByTestId('value')).toHaveText('pho, banh-mi, cafe, bun');
    await expect(page.getByRole('option', { name: 'Dessert' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  test('presentation auto opens a menu on larger windows', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 700 });
    await openStory(page, 'components-select--sheet');
    await page.getByRole('button', { name: /Sort by/ }).click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test.describe('Select searchable', () => {
  for (const mode of MODES) {
    test(`menu with a search · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-select--searchable', { mode });
      await page.getByRole('button', { name: /Country of residence/ }).click();
      await expect(page.getByRole('searchbox', { name: 'Search' })).toBeFocused();
      await page.keyboard.type('an');
      await expect(page.getByRole('option', { name: 'France' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Australia' })).toHaveCount(0);
      await expect(page).toHaveScreenshot(`searchable-menu-${mode}.png`);
    });
  }

  test('no results', async ({ page }) => {
    await openStory(page, 'components-select--searchable');
    await page.getByRole('button', { name: /Country of residence/ }).click();
    await page.keyboard.type('zz');
    await expect(page.getByRole('dialog').getByRole('status')).toHaveText('No results');
    await expect(page).toHaveScreenshot('searchable-no-results.png');
  });

  test('phone sheet shows the list first; a tap on the search focuses it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openStory(page, 'components-select--searchable');
    await page.getByRole('button', { name: /Country of residence/ }).click();
    const search = page.getByRole('searchbox', { name: 'Search' });
    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(search).not.toBeFocused();
    await page.waitForTimeout(600);
    await expect(page).toHaveScreenshot('searchable-sheet.png');
    await search.click();
    await expect(search).toBeFocused();
    await page.keyboard.type('thai');
    await page.getByRole('option', { name: 'Thailand' }).click();
    await expect(page.getByTestId('value')).toHaveText('TH');
  });

  test('keyboard: type, move, choose; focus returns to the field', async ({ page }) => {
    await openStory(page, 'components-select--searchable');
    const field = page.getByRole('button', { name: /Country of residence/ });
    await field.focus();
    await page.keyboard.press('Enter');
    const search = page.getByRole('searchbox', { name: 'Search' });
    await expect(search).toBeFocused();
    await page.keyboard.type('united');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect(search).toBeFocused();
    await expect(page.getByRole('option', { name: 'United States' })).toHaveAttribute(
      'data-focus-visible',
      'true',
    );
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(page.getByTestId('value')).toHaveText('US');
    await expect(field).toBeFocused();
  });

  test('Escape clears the search, then closes', async ({ page }) => {
    await openStory(page, 'components-select--searchable');
    await page.getByRole('button', { name: /Country of residence/ }).click();
    const search = page.getByRole('searchbox', { name: 'Search' });
    await page.keyboard.type('fra');
    await page.keyboard.press('Escape');
    await expect(search).toHaveValue('');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('Select layout safety', () => {
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
    for (const transformedAncestor of [false, true]) {
      for (const dir of ['ltr', 'rtl'] as const) {
        test(`${override}${transformedAncestor ? ' · transformed ancestor' : ''} · ${dir}`, async ({
          page,
        }) => {
          await openStory(
            page,
            'components-select--layout-override',
            { dir },
            { override, transformedAncestor },
          );
          const field = page.getByTestId('target');
          const container = field.locator('div').first();
          expect(await container.evaluate((el) => (el as HTMLElement).offsetHeight)).toBe(56);
          await page.getByRole('button', { name: /Sort by/ }).click();
          await expect(page.getByRole('listbox')).toBeVisible();
          await page.getByRole('option', { name: 'Nearest to you' }).click();
          await expect(page.getByRole('button', { name: /Sort by/ })).toContainText(
            'Nearest to you',
          );
        });
      }
    }
  }
});
