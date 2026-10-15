import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { gotoReady } from './navigate';

/**
 * The component Playground: controls in sections beside a sticky preview (a modal bottom
 * sheet on phones), each with its prop's info; a snippet whose changed lines are marked, with
 * named icons, a copy button and a shareable URL; and the site's light / dark button.
 */

function playground(page: Page, name = 'Button'): Locator {
  return page.getByRole('region', { name: `${name} playground` });
}

/** The panel's controls beside the preview (the phone's sheet holds the same ones). */
function panel(page: Page, name = 'Button'): Locator {
  return playground(page, name).getByRole('group', { name: `${name} props` });
}

/** A computed colour with no alpha, in whichever notation the browser writes it. */
const TRANSPARENT = /(?:, 0\)|\/ 0\))$/;

/** Picks an option in a control's select. */
async function choose(scope: Locator, control: string, option: string) {
  await scope.locator(`[data-control="${control}"]`).getByRole('button').last().click();
  await scope.page().getByRole('option', { name: option, exact: true }).click();
}

/** Flips a switch from the keyboard (its input is visually hidden under the thumb). */
async function flip(control: Locator) {
  await control.focus();
  await control.page().keyboard.press('Space');
}

/** Waits for everything that ends to finish animating. */
async function settle(page: Page) {
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
}

test.describe('Component Playground', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: baseURL });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page, '/components/button');
  });

  test('a control change updates the snippet, marks the line and updates the URL', async ({
    page,
  }) => {
    const code = playground(page).getByRole('region', { name: 'tsx code' });
    await expect(code).toContainText('leadingIcon={<StarOutlineIcon />}');
    // Icons are named components, imported from the reader's icon module.
    await expect(code).toContainText("import { StarOutlineIcon } from './icons';");
    await expect(code).not.toContainText('<svg');
    await expect(code).not.toContainText('variant=');
    // A load marks nothing.
    await expect(code.locator('[data-changed]')).toHaveCount(0);

    await choose(panel(page), 'variant', 'outlined');
    await expect(code).toContainText('variant="outlined"');
    await expect(code.locator('[data-changed]')).toHaveText(['  variant="outlined"']);
    await expect(page).toHaveURL(/[?&]variant=outlined(&|$)/);
    // Only what differs from the playground's starting state is in the URL.
    expect(new URL(page.url()).searchParams.has('size')).toBe(false);
  });

  test('the marker fades without moving the code', async ({ page }) => {
    const code = playground(page).getByRole('region', { name: 'tsx code' });
    const before = (await code.boundingBox())!;
    await flip(panel(page).getByRole('switch', { name: 'disabled' }));
    const line = code.locator('[data-changed]');
    await expect(line).toHaveText('  disabled');
    await expect
      .poll(() => line.evaluate((element) => element.getAnimations()[0]?.playState), {
        timeout: 5000,
      })
      .toBe('finished');
    expect(await line.evaluate((element) => getComputedStyle(element).backgroundColor)).toMatch(
      TRANSPARENT,
    );
    expect((await code.boundingBox())!.width).toBe(before.width);
  });

  test('the copy button writes the snippet to the clipboard and toasts', async ({ page }) => {
    const code = playground(page).getByRole('region', { name: 'tsx code' });
    // The shown lines, as the clipboard's (a blank line shows as an empty row).
    const lines = (text: string) => text.split('\n').filter((line) => line.trim() !== '');
    const snippet = lines(await code.innerText());
    expect(snippet.join('\n')).toContain('<Button');
    await playground(page).getByRole('button', { name: 'Copy code' }).click();
    await expect(page.getByText('Copied', { exact: true })).toBeVisible();
    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(lines(clipboard)).toEqual(snippet);
  });

  test('the controls sit in sections, Advanced folded', async ({ page }) => {
    const groups = await panel(page)
      .locator('[data-control-group]')
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-control-group')),
      );
    expect(groups).toEqual(['appearance', 'content', 'behaviour', 'advanced']);
    const dragged = panel(page).getByRole('switch', { name: 'dragged' });
    await expect(dragged).toBeHidden();
    await panel(page).getByRole('button', { name: 'Advanced (1)' }).click();
    await expect(dragged).toBeVisible();
  });

  test("a control's info shows its description and links to its API entry", async ({ page }) => {
    const about = panel(page).getByRole('button', { name: 'About variant' });
    await about.click();
    const info = page.getByRole('dialog', { name: 'variant' });
    await expect(info).toContainText('The M3 style');
    await expect(info.getByRole('link', { name: 'API reference' })).toHaveAttribute(
      'href',
      '/components/button/api#prop-Button-variant',
    );
    await page.keyboard.press('Escape');
    await expect(info).toBeHidden();
    await expect(about).toBeFocused();
  });

  test('a shared link restores its values, clamping a number into its range', async ({ page }) => {
    await gotoReady(page, '/components/button-group?variant=connected&expandedRatio=3');
    const code = playground(page, 'ButtonGroup').getByRole('region', { name: 'tsx code' });
    await expect(code).toContainText('variant="connected"');
    await expect(code).toContainText('expandedRatio={0.5}');
    await expect(code).toContainText('aria-label="View"');
  });

  test("the header's settings button opens the display settings", async ({ page }) => {
    await playground(page).getByRole('button', { name: 'Display settings' }).click();
    await expect(page.getByRole('dialog', { name: 'Display' })).toBeVisible();
  });
});

test.describe('Playground layout', () => {
  for (const width of [390, 840, 1440]) {
    test(`at ${width}px the page never scrolls sideways and no control is clipped`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoReady(page, '/components/message-field');
      const region = playground(page, 'MessageField');
      await region.scrollIntoViewIfNeeded();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
      ).toBeLessThanOrEqual(0);
      const controls = panel(page, 'MessageField');
      if (width < 600) {
        // On a phone the controls open in a sheet instead.
        await expect(controls).toBeHidden();
        return;
      }
      // Nothing a control shows reaches past the playground's surface.
      const clipped = await controls.evaluate((group) => {
        const surface = group.parentElement!.getBoundingClientRect();
        /** What of an element shows: its box, cut by any ancestor in its row that clips. */
        const shown = (element: Element, row: Element) => {
          const box = element.getBoundingClientRect();
          let { left, right } = box;
          for (
            let parent = element.parentElement;
            parent && parent !== row;
            parent = parent.parentElement
          ) {
            if (getComputedStyle(parent).overflowX === 'visible') continue;
            const clip = parent.getBoundingClientRect();
            left = Math.max(left, clip.left);
            right = Math.min(right, clip.right);
          }
          return { left, right, width: Math.min(box.width, right - left) };
        };
        return [...group.querySelectorAll<HTMLElement>('[data-control]')]
          .filter((row) =>
            [...row.querySelectorAll('*')].some((child) => {
              const box = shown(child, row);
              return (
                box.width > 1 &&
                getComputedStyle(child).opacity !== '0' &&
                (box.right > surface.right + 0.5 || box.left < surface.left - 0.5)
              );
            }),
          )
          .map((row) => row.dataset.control);
      });
      expect(clipped).toEqual([]);
    });
  }

  test('on a large window the controls take about 40% and the preview stays in view', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page, '/components/message-field');
    const region = playground(page, 'MessageField');
    const controls = panel(page, 'MessageField');
    const card = region.locator('[data-playground-stage]').locator('..');
    const share = (await controls.boundingBox())!.width / (await card.boundingBox())!.width;
    expect(share).toBeGreaterThan(0.4);
    expect(share).toBeLessThan(0.5);
    // The panel grows with its controls, with no scroll of its own.
    expect(await controls.evaluate((element) => getComputedStyle(element).overflowY)).toBe(
      'visible',
    );
    // Halfway down the controls the preview is still on screen, under the top bar.
    await controls.getByRole('switch', { name: 'emptyAction' }).scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 300);
    await expect
      .poll(() => controls.evaluate((element) => element.getBoundingClientRect().top))
      .toBeLessThan(-300);
    const preview = (await region.locator('[data-playground-preview]').boundingBox())!;
    expect(preview.y).toBeGreaterThanOrEqual(64);
    expect(preview.y + preview.height).toBeLessThanOrEqual(900);
  });
});

/** Each section's controls' left edges, rounded to a pixel. */
async function controlStarts(scope: Locator): Promise<Record<string, number[]>> {
  return scope.evaluate((root) =>
    Object.fromEntries(
      [...root.querySelectorAll<HTMLElement>('[data-control-group]')].map((group) => [
        group.dataset.controlGroup!,
        [...group.querySelectorAll('[data-control-input]')]
          .filter((cell) => cell.getBoundingClientRect().width > 0)
          .map((cell) => Math.round(cell.firstElementChild!.getBoundingClientRect().left)),
      ]),
    ),
  );
}

/** Every control in a section starts on the same line (±1px). */
function expectAligned(starts: Record<string, number[]>) {
  for (const [group, lefts] of Object.entries(starts)) {
    if (lefts.length === 0) continue;
    expect(
      Math.max(...lefts) - Math.min(...lefts),
      `${group}: ${lefts.join(', ')}`,
    ).toBeLessThanOrEqual(1);
  }
}

test.describe('Playground control alignment', () => {
  for (const width of [840, 1440]) {
    test(`at ${width}px every control in a section starts on one line`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await gotoReady(page, '/components/button-group');
      const controls = panel(page, 'ButtonGroup');
      await controls.scrollIntoViewIfNeeded();
      expectAligned(await controlStarts(controls));
      await gotoReady(page, '/components/message-field');
      const fields = panel(page, 'MessageField');
      await fields.getByRole('button', { name: /^Advanced/ }).click();
      expectAligned(await controlStarts(fields));
    });
  }

  test('in the phone sheet every control in a section starts on one line', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoReady(page, '/components/message-field');
    await playground(page, 'MessageField').getByRole('button', { name: 'Edit props' }).click();
    const sheet = page.getByRole('dialog', { name: 'MessageField props' });
    await expect(sheet).toBeVisible();
    await settle(page);
    expectAligned(await controlStarts(sheet));
  });
});

test.describe('Playground on a phone', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('"Edit props" opens a standard sheet: no scrim, the preview live above it', async ({
    page,
  }) => {
    await gotoReady(page, '/components/button-group');
    const region = playground(page, 'ButtonGroup');
    // No sheet waits at the bottom of the page.
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const edit = region.getByRole('button', { name: 'Edit props' });
    await edit.click();
    const sheet = page.getByRole('dialog', { name: 'ButtonGroup props' });
    await expect(sheet).toBeVisible();
    await expect(edit).toHaveAttribute('aria-expanded', 'true');
    // Non-modal: no scrim, and focus has moved into the sheet.
    await expect(sheet).not.toHaveAttribute('aria-modal', 'true');
    expect(await page.evaluate(() => document.querySelector('[aria-modal="true"]'))).toBeNull();
    expect(await sheet.evaluate((element) => element.contains(document.activeElement))).toBe(true);
    await settle(page);

    // The preview sits above the sheet, uncovered, and changes as the controls do.
    const preview = region.locator('[data-playground-preview]');
    const view = region.getByRole('radiogroup', { name: 'View' });
    const box = (await view.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual((await sheet.boundingBox())!.y);
    expect(
      await preview.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + 8);
        return element.contains(hit);
      }),
    ).toBe(true);
    // The page behind stays usable while the sheet is open.
    await view.getByRole('radio', { name: 'Month' }).click();
    await expect(view.getByRole('radio', { name: 'Month' })).toBeChecked();
    await expect(sheet).toBeVisible();

    await choose(sheet, 'size', 'md');
    await expect(view.getByRole('radio', { name: 'Day' })).toHaveAttribute('data-size', 'md');
    await expect(page).toHaveURL(/[?&]size=md(&|$)/);

    // Escape (from inside the sheet) closes it, and focus goes back to the button.
    await sheet.getByRole('button', { name: 'Reset' }).focus();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(edit).toBeFocused();
    await expect(edit).toHaveAttribute('aria-expanded', 'false');

    // The close button does the same.
    await edit.click();
    await sheet.getByRole('button', { name: 'Close props' }).click();
    await expect(sheet).toBeHidden();
    await expect(edit).toBeFocused();
  });

  test('long code scrolls sideways with a fade, and folds behind "Show all"', async ({ page }) => {
    await gotoReady(page, '/components/dialog');
    const region = playground(page, 'Dialog');
    const code = region.getByRole('region', { name: 'tsx code' });
    await code.scrollIntoViewIfNeeded();
    // A named, focusable region, so the keyboard can scroll it.
    await code.focus();
    await expect(code).toBeFocused();
    expect(await code.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    const fade = region.locator('[data-fade]');
    await expect(fade).toHaveCount(1);
    await code.evaluate((element) => element.scrollTo({ left: element.scrollWidth }));
    await expect(fade).toHaveCount(0);

    const showAll = region.getByRole('button', { name: /^Show all \d+ lines$/ });
    await expect(showAll).toHaveAttribute('aria-expanded', 'false');
    const folded = (await code.boundingBox())!.height;
    await showAll.click();
    await expect(region.getByRole('button', { name: 'Show less' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect((await code.boundingBox())!.height).toBeGreaterThan(folded);
  });
});

test.describe('Playground component switch', () => {
  test('switches progress to circular, with its own controls and snippet', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page, '/components/progress');
    const region = playground(page, 'LinearProgressIndicator');
    const controls = panel(page, 'LinearProgressIndicator');
    const code = region.getByRole('region', { name: 'tsx code' });
    await expect(code).toContainText('<LinearProgressIndicator');
    await expect(controls.locator('[data-control="size"]')).toHaveCount(0);

    await choose(controls, 'indicator', 'circular');
    await expect(code).toContainText('<CircularProgressIndicator');
    // The circular indicator's size gets a slider; the linear-only stop indicator goes.
    await controls.locator('[data-control="size"]').getByRole('slider').focus();
    await page.keyboard.press('ArrowRight');
    await expect(code).toContainText(/size=\{\d+\}/);
    await expect(controls.getByRole('switch', { name: 'stopIndicator' })).toHaveCount(0);
    await expect(page).toHaveURL(/[?&]indicator=circular(&|$)/);
  });
});

test.describe('Light / dark button', () => {
  test('switches the mode, keeps it on reload and matches the display settings', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page, '/components/button');
    const html = page.locator('html');
    await page.getByRole('button', { name: 'Switch to dark mode' }).click();
    await expect(html).toHaveAttribute('data-mode', 'dark');
    await page.reload();
    await expect(html).toHaveAttribute('data-mode', 'dark');
    const toLight = page.getByRole('button', { name: 'Switch to light mode' });
    await expect(toLight).toBeVisible();

    const settings = page.getByRole('dialog', { name: 'Display' });
    await playground(page).getByRole('button', { name: 'Display settings' }).click();
    await expect(settings.getByRole('radio', { name: 'Dark' })).toBeChecked();
    await settings.getByRole('button', { name: 'Close display settings' }).click();
    await expect(settings).toBeHidden();

    await toLight.click();
    await expect(html).toHaveAttribute('data-mode', 'light');
    await playground(page).getByRole('button', { name: 'Display settings' }).click();
    await expect(settings.getByRole('radio', { name: 'Light' })).toBeChecked();
  });
});

test.describe('Playground accessibility', () => {
  for (const mode of ['light', 'dark'] as const) {
    for (const width of [390, 1440]) {
      test(`axe finds nothing in the playground, ${mode}, ${width}px`, async ({
        page,
        baseURL,
      }) => {
        // The theme's cookie sets the mode before the first paint.
        await page
          .context()
          .addCookies([
            { name: 'windmorph-theme', value: encodeURIComponent(`mode=${mode}`), url: baseURL },
          ]);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.setViewportSize({ width, height: 900 });
        await gotoReady(page, '/components/button');
        await expect(page.locator('html')).toHaveAttribute('data-mode', mode);
        if (width < 600) {
          await playground(page).getByRole('button', { name: 'Edit props' }).click();
          await expect(page.getByRole('dialog', { name: 'Button props' })).toBeVisible();
        } else {
          await panel(page).getByRole('button', { name: 'Advanced (1)' }).click();
        }
        await settle(page);
        const results = await new AxeBuilder({ page })
          .include('section[aria-label="Button playground"]')
          .include('[role="dialog"]')
          .analyze();
        expect(results.violations.map((violation) => violation.id)).toEqual([]);
      });
    }
  }

  test('under reduced motion a changed line keeps a still marker', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoReady(page, '/components/button');
    await flip(panel(page).getByRole('switch', { name: 'disabled' }));
    const line = playground(page).locator('[data-changed]');
    await expect(line).toHaveText('  disabled');
    await page.waitForTimeout(2500);
    expect(await line.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
    expect(await line.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toMatch(
      TRANSPARENT,
    );
  });
});
