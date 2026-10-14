import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite, OVERRIDES } from './layout-safety';
import {
  expectAnchored,
  expectKeyboardFocusRing,
  expectStateLayer,
  panelLayout,
  POSITIONING_OVERRIDES,
  settle,
} from './overlay-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

test.describe('Tooltip visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`plain · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-tooltip--open', { theme, mode });
        await expect(page.getByRole('tooltip')).toHaveCount(3);
        // Wait for the entry reveal before the screenshot.
        await page.evaluate(() =>
          Promise.allSettled(document.getAnimations().map((animation) => animation.finished)),
        );
        // The padded container holds both tooltips; the screenshot includes the overlays.
        await expect(page.getByTestId('open')).toHaveScreenshot(`open-${theme}-${mode}.png`);
      });
    }
  }

  test('rich with caret', async ({ page }) => {
    await openStory(page, 'components-tooltip--rich', {}, { caret: true, placement: 'bottom' });
    await page.getByRole('button', { name: 'What are grouped tabs?' }).click();
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    await expect(dialog).toBeVisible();
    await page.mouse.move(0, 0);
    // Measure once the entry reveal has finished.
    await page.evaluate(() =>
      Promise.allSettled(document.getAnimations().map((animation) => animation.finished)),
    );
    const box = (await dialog.boundingBox())!;
    await expect(page).toHaveScreenshot('rich-caret.png', {
      clip: {
        x: Math.round(box.x) - 24,
        y: Math.round(box.y) - 72,
        width: Math.round(box.width) + 48,
        height: Math.round(box.height) + 96,
      },
    });
  });
});

test.describe('Tooltip behaviour', () => {
  test('a plain tooltip shows on hover 4px above its anchor and hides on leave', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--plain');
    const trigger = page.getByRole('button', { name: 'Edit' });
    // React Aria counts hovers once a pointer move has set the interaction modality, as any
    // real approach to the button does.
    await page.mouse.move(5, 5);
    await trigger.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Edit message');
    await expect(trigger).toHaveAttribute('aria-describedby', (await tooltip.getAttribute('id'))!);
    const anchor = (await trigger.boundingBox())!;
    await expect
      .poll(async () => {
        const tip = (await tooltip.boundingBox())!;
        return Math.round(anchor.y - (tip.y + tip.height));
      })
      .toBe(4);
    // Hoverable: moving onto the tooltip keeps it open (WCAG 1.4.13).
    await tooltip.hover();
    await expect(tooltip).toBeVisible();
    // It stays 1.5s after the pointer leaves, then goes.
    await page.mouse.move(0, 0);
    await page.waitForTimeout(1000);
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveCount(0, { timeout: 3000 });
  });

  test('it expands from the anchor side along one axis, without scaling', async ({ page }) => {
    await openStory(page, 'components-tooltip--plain');
    await page.mouse.move(5, 5);
    await page.getByRole('button', { name: 'Edit' }).hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toBeVisible();
    expect(await tooltip.evaluate((el) => getComputedStyle(el).scale)).toBe('none');
    await expect
      .poll(() => tooltip.evaluate((el) => getComputedStyle(el).clipPath))
      .toBe('inset(-16px)');
  });

  test('a touch long press shows it', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true });
    const page = await context.newPage();
    await openStory(page, 'components-tooltip--plain');
    const box = (await page.getByRole('button', { name: 'Edit' }).boundingBox())!;
    const client = await context.newCDPSession(page);
    const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] });
    await expect(page.getByRole('tooltip')).toHaveText('Edit message');
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByRole('tooltip')).toHaveCount(0, { timeout: 3000 });
    await context.close();
  });

  test('a transient rich tooltip shows on hover, below and to the end of its anchor', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--rich-transient');
    const trigger = page.getByRole('button', { name: 'Grouped tabs' });
    await page.mouse.move(5, 5);
    await trigger.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toContainText('Tabs from the same site');
    const anchor = (await trigger.boundingBox())!;
    const tip = (await tooltip.boundingBox())!;
    expect(Math.round(tip.y - (anchor.y + anchor.height))).toBe(4);
    expect(Math.round(tip.x)).toBe(Math.round(anchor.x));
  });

  test('keyboard focus shows it and Escape hides it', async ({ page }) => {
    await openStory(page, 'components-tooltip--plain');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tooltip')).toHaveText('Add to favourites');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('a menu button keeps its tooltip, and opening the menu hides it', async ({ page }) => {
    await openStory(page, 'components-tooltip--on-overlay-triggers');
    const more = page.getByRole('button', { name: 'More' });
    await page.mouse.move(5, 5);
    await more.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('More options');
    await expect(more).toHaveAttribute('aria-describedby', (await tooltip.getAttribute('id'))!);
    await more.click();
    await expect(page.getByRole('menu', { name: 'More' })).toBeVisible();
    await expect(tooltip).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);

    // From the keyboard: focus shows it, Enter / ArrowDown open the menu and hide it.
    await page.mouse.move(0, 0);
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.keyboard.press('Tab');
    await expect(more).toBeFocused();
    await expect(tooltip).toHaveText('More options');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await expect(tooltip).toHaveCount(0);
    // Escape closes the menu; back on the button, the tooltip behaves as usual.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(more).toBeFocused();
    await expect(tooltip).toHaveText('More options');
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu', { name: 'More' })).toBeVisible();
  });

  test('a dialog button keeps its tooltip', async ({ page }) => {
    await openStory(page, 'components-tooltip--on-overlay-triggers');
    const remove = page.getByRole('button', { name: 'Delete' });
    await page.mouse.move(5, 5);
    await remove.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Delete message');
    await remove.click();
    await expect(page.getByRole('alertdialog', { name: 'Delete message?' })).toBeVisible();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('a rich tooltip opens on press and its action is reachable', async ({ page }) => {
    await openStory(page, 'components-tooltip--rich');
    const trigger = page.getByRole('button', { name: 'What are grouped tabs?' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Learn more' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('a persistent rich tooltip keeps focus on its trigger and sits next in the Tab order', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--rich-keyboard');
    const trigger = page.getByRole('button', { name: 'What are grouped tabs?' });
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    const learnMore = dialog.getByRole('link', { name: 'Learn more' });
    const gotIt = dialog.getByRole('button', { name: 'Got it' });
    const before = page.getByRole('button', { name: 'Before' });
    const after = page.getByRole('button', { name: 'After' });

    // Opening from the keyboard or a press leaves focus on the trigger.
    await before.focus();
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(dialog).not.toHaveAttribute('aria-modal');
    await expect(trigger).toHaveAttribute('aria-controls', (await dialog.getAttribute('id'))!);

    // Tab: trigger → link → button; Shift+Tab back to the trigger and before it.
    await page.keyboard.press('Tab');
    await expect(learnMore).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(gotIt).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(learnMore).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(trigger).toBeFocused();
    await expect(dialog).toBeVisible();

    // Escape from inside closes it and returns focus to the trigger; from the trigger too.
    await page.keyboard.press('Tab');
    await expect(learnMore).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();

    // No trap: Tab past its last control goes on to the page (and closes it, as focus moved
    // to another element).
    await trigger.click();
    await expect(dialog).toBeVisible();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(gotIt).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(after).toBeFocused();
    await expect(dialog).toHaveCount(0);
  });

  test('Shift+Tab from what follows an open persistent rich tooltip enters it from its end', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--rich-keyboard');
    const trigger = page.getByRole('button', { name: 'What are grouped tabs?' });
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    await trigger.click();
    await expect(dialog).toBeVisible();
    // Focus After without a press (a press would be an interaction outside, closing it).
    await page.getByRole('button', { name: 'After' }).evaluate((el) => (el as HTMLElement).focus());
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('button', { name: 'Got it' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('link', { name: 'Learn more' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: 'Before' })).toBeFocused();
  });

  /**
   * Records the clip-path of the first element matching `selector` that's inserted, from its
   * insertion for the next `count` frames.
   */
  async function recordEntry(page: Page, selector: string, count = 8) {
    await page.evaluate(
      ([selector, count]) => {
        const frames: string[] = [];
        (window as unknown as { entryFrames: string[] }).entryFrames = frames;
        const observer = new MutationObserver(() => {
          const element = document.querySelector(selector);
          if (!element) return;
          observer.disconnect();
          const record = () => {
            frames.push(getComputedStyle(element).clipPath);
            if (frames.length < count) requestAnimationFrame(record);
          };
          record();
        });
        observer.observe(document.body, { childList: true, subtree: true });
      },
      [selector, count] as const,
    );
    return async () => {
      await expect
        .poll(() =>
          page.evaluate(() => (window as unknown as { entryFrames: string[] }).entryFrames.length),
        )
        .toBe(count);
      return page.evaluate(() => (window as unknown as { entryFrames: string[] }).entryFrames);
    };
  }

  test('a plain tooltip is revealed from the anchor side on entry, not only faded', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--plain');
    await page.mouse.move(5, 5);
    const frames = await recordEntry(page, '[role="tooltip"]');
    await page.getByRole('button', { name: 'Edit' }).hover();
    const clips = await frames();
    // Above the anchor, the clip starts at the bottom edge (`inset(100% …)`) and opens upwards.
    expect(clips[0]).toMatch(/^inset\((100|9\d(\.\d+)?)%/);
    expect(clips.some((clip) => clip !== clips[0])).toBe(true);
    await expect
      .poll(() => page.getByRole('tooltip').evaluate((el) => getComputedStyle(el).clipPath))
      .toBe('inset(-16px)');
  });

  test('a persistent rich tooltip in RTL is revealed downwards on entry', async ({ page }) => {
    await openStory(
      page,
      'components-tooltip--rich',
      { dir: 'rtl' },
      { placement: 'bottom start' },
    );
    const frames = await recordEntry(page, '[role="dialog"]');
    await page.getByRole('button', { name: 'What are grouped tabs?' }).click();
    const clips = await frames();
    // Below the anchor, the clip starts at the top edge and opens downwards.
    expect(clips[0]).toMatch(/^inset\(-16px -16px (100|9\d(\.\d+)?)%/);
    expect(clips.some((clip) => clip !== clips[0])).toBe(true);
  });

  test('a persistent rich tooltip closes on a press on empty space or on another element', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--rich');
    const trigger = page.getByRole('button', { name: 'What are grouped tabs?' });
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    await trigger.click();
    await expect(dialog).toBeVisible();
    // Moving away keeps it open (it's persistent)…
    await page.mouse.move(600, 500);
    await page.waitForTimeout(1800);
    await expect(dialog).toBeVisible();
    // …a press inside it keeps it open…
    await dialog.getByText('Tabs from the same site').click();
    await expect(dialog).toBeVisible();
    // …and a press on empty space closes it.
    await page.mouse.click(600, 500);
    await expect(dialog).toHaveCount(0);
    // The trigger toggles it.
    await trigger.click();
    await expect(dialog).toBeVisible();
    await trigger.click();
    await expect(dialog).toHaveCount(0);
  });

  test('a persistent rich tooltip closes on a press on another button', async ({ page }) => {
    await openStory(page, 'components-tooltip--at-the-edge');
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    await page.getByRole('button', { name: 'Tabs' }).click();
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('at the screen edge tooltips keep their natural width and move inside the margin', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await openStory(page, 'components-tooltip--at-the-edge');
    await page.getByRole('button', { name: 'Tabs' }).click();
    const rich = page.getByRole('dialog', { name: 'Grouped tabs' });
    await expect(rich).toBeVisible();
    const richBox = (await rich.boundingBox())!;
    // The full 320px, ending 8px from the edge, rather than squeezed against it.
    expect(Math.round(richBox.width)).toBe(320);
    expect(Math.round(richBox.x + richBox.width)).toBe(360 - 8);
    await page.keyboard.press('Escape');
    await expect(rich).toHaveCount(0);

    const search = page.getByRole('button', { name: 'Search' });
    await search.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    const plain = page.getByRole('tooltip');
    await expect(plain).toHaveText('Search messages in all folders');
    const plainBox = (await plain.boundingBox())!;
    // One line (24px tall), shifted to keep 8px from the edge.
    expect(Math.round(plainBox.height)).toBe(24);
    expect(Math.round(plainBox.x + plainBox.width)).toBeLessThanOrEqual(360 - 8);
  });

  test('icon buttons in a top app bar show their tooltips below', async ({ page }) => {
    await openStory(page, 'components-tooltip--in-app-bar');
    const favourite = page.getByRole('button', { name: 'Favourite' });
    await page.mouse.move(5, 5);
    await favourite.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Favourite');
    const anchor = (await favourite.boundingBox())!;
    const tip = (await tooltip.boundingBox())!;
    // Room above (the bar sits 64px down), yet it opens 4px below.
    expect(Math.round(tip.y - (anchor.y + anchor.height))).toBe(4);
  });
});

test.describe('Tooltip layout safety', () => {
  /** The shown plain tooltip: 24px tall, 4px corners, in the window and 4px from its anchor. */
  async function expectPlain(page: Page, override: string, anchored: boolean) {
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Edit message');
    await settle(page);
    const panel = await panelLayout(tooltip);
    expect(panel).toMatchObject({ height: 24, radius: '4px', inWindow: true, onTop: true });
    if (override !== 'fullWidth') {
      expect(panel.width).toBeGreaterThanOrEqual(40);
      expect(panel.width).toBeLessThanOrEqual(200);
    }
    if (anchored) await expectAnchored(tooltip, page.getByTestId('target'), 4);
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
  }

  /**
   * Opens the persistent rich tooltip with a press: 320px wide (its text is longer), 12px
   * corners, in the window and 4px from its anchor; focus stays on the trigger, Tab enters
   * it, and Escape closes it and returns focus to the trigger.
   */
  async function expectRich(page: Page, target: Locator, override: string, anchored: boolean) {
    await target.click();
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    await expect(dialog).toBeVisible();
    await expect(target).toBeFocused();
    await settle(page);
    const panel = await panelLayout(dialog);
    expect(panel).toMatchObject({ radius: '12px', inWindow: true, onTop: true });
    if (override !== 'fullWidth') expect(panel.width).toBe(320);
    expect(panel.height).toBeGreaterThanOrEqual(48);
    expect(panel.height).toBeLessThanOrEqual(200);
    if (anchored) await expectAnchored(dialog, target, 4);
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Learn more' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(target).toBeFocused();
  }

  // The plain tooltip's trigger keeps its size, corners, state layer, presses and focus
  // ring, and keyboard focus still shows the tooltip against it.
  layoutSafetySuite('components-tooltip--layout-override', {
    height: 40,
    width: 40,
    radius: '20px',
    interactive: false,
    async check(page, target) {
      await expectStateLayer(target);
      await expectKeyboardFocusRing(page, target);
      await expectPlain(page, 'none', true);
      await target.click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
    },
  });

  for (const override of OVERRIDES) {
    // A layout class on the plain tooltip (`className`, on its outermost element): the
    // surface keeps its size and corners.
    test(`plain panel · ${override}`, async ({ page }) => {
      await openStory(
        page,
        'components-tooltip--layout-override',
        {},
        { override, part: 'panel', variant: 'plain' },
      );
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('target')).toBeFocused();
      await expectPlain(page, override, !POSITIONING_OVERRIDES.includes(override));
    });

    // A layout class on the rich tooltip (`className`, on its outermost element).
    test(`rich panel · ${override}`, async ({ page }) => {
      await openStory(
        page,
        'components-tooltip--layout-override',
        {},
        { override, part: 'panel', variant: 'rich' },
      );
      const target = page.getByTestId('target');
      await expectRich(page, target, override, !POSITIONING_OVERRIDES.includes(override));
    });

    // A layout class on the rich tooltip's trigger.
    test(`rich trigger · ${override}`, async ({ page }) => {
      await openStory(
        page,
        'components-tooltip--layout-override',
        {},
        { override, part: 'trigger', variant: 'rich' },
      );
      const target = page.getByTestId('target');
      const layout = await target.evaluate((el) => ({
        height: (el as HTMLElement).offsetHeight,
        radius: getComputedStyle(el).borderTopLeftRadius,
      }));
      expect(layout).toEqual({ height: 40, radius: '20px' });
      await expectStateLayer(target);
      await expectKeyboardFocusRing(page, target);
      await expectRich(page, target, override, true);
    });
  }
});
