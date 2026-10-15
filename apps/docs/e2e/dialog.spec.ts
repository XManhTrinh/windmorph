import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite, OVERRIDES } from './layout-safety';
import { expectKeyboardFocusRing, expectStateLayer, panelLayout } from './overlay-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const settle = (page: Page) => page.waitForTimeout(600);

interface DialogTransition {
  /** The transitioned property. */
  property: string;
  /** Its start and end, for a `clip-path` transition. */
  clip: string[];
  /** Whether the dialog was leaving when it started. */
  exiting: boolean;
  /** The wrapper's computed `clip-path` when it started. */
  clipPath: string;
}

/**
 * Starts recording the transitions that start on a dialog's motion wrapper (the panel's
 * parent). Call it before the action that opens or closes the dialog: each transition is
 * recorded as it starts, so it can't finish unseen on a slow machine before the test looks.
 */
async function recordDialogMotion(page: Page) {
  await page.evaluate(() => {
    const records: DialogTransition[] = [];
    (window as unknown as { dialogMotion: DialogTransition[] }).dialogMotion = records;
    document.addEventListener(
      'transitionrun',
      (event) => {
        const wrapper = event.target;
        if (
          !(wrapper instanceof HTMLElement) ||
          !wrapper.querySelector(':scope > [role="dialog"], :scope > [role="alertdialog"]')
        ) {
          return;
        }
        const transition = wrapper
          .getAnimations()
          .find(
            (animation) => (animation as CSSTransition).transitionProperty === event.propertyName,
          );
        const frames = (transition?.effect as KeyframeEffect | null)?.getKeyframes() ?? [];
        records.push({
          property: event.propertyName,
          clip:
            event.propertyName === 'clip-path'
              ? frames.map((frame) => frame.clipPath as string)
              : [],
          exiting: wrapper.hasAttribute('data-exiting'),
          clipPath: getComputedStyle(wrapper).clipPath,
        });
      },
      true,
    );
  });
  const all = () =>
    page.evaluate(() => (window as unknown as { dialogMotion: DialogTransition[] }).dialogMotion);
  return {
    all,
    /** The last `clip-path` transition's start and end (empty before one starts). */
    clip: async () =>
      (await all()).filter((record) => record.property === 'clip-path').at(-1)?.clip ?? [],
  };
}

test.describe('Dialog visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`with icon · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-dialog--with-icon', { theme, mode });
        await settle(page);
        await expect(page).toHaveScreenshot(`with-icon-${theme}-${mode}.png`);
      });
    }
  }

  for (const mode of MODES) {
    test(`full screen · phone · ${mode}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 760 });
      await openStory(page, 'components-dialog--full-screen-compact', { mode });
      await page.getByRole('button', { name: 'Edit name' }).click();
      await settle(page);
      await expect(page).toHaveScreenshot(`full-screen-phone-${mode}.png`);
    });
  }

  test('dividers', async ({ page }) => {
    await openStory(page, 'components-dialog--dividers');
    await settle(page);
    await expect(page).toHaveScreenshot('dividers.png');
  });

  test('long content · rtl', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 700 });
    await openStory(page, 'components-dialog--long-content', { dir: 'rtl' });
    await settle(page);
    // The dialog is portalled out of the RTL story root but keeps its direction.
    expect(
      await page.getByRole('alertdialog').evaluate((el) => getComputedStyle(el).direction),
    ).toBe('rtl');
    await expect(page).toHaveScreenshot('long-content-rtl.png');
  });
});

test.describe('Dialog behaviour', () => {
  test('opens to rest unclipped and unmoved, named by its title, focusing its first action', async ({
    page,
  }) => {
    await openStory(page, 'components-dialog--basic');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('alertdialog', { name: 'Discard draft?' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await settle(page);
    const motion = dialog.locator('xpath=..');
    expect(await motion.evaluate((el) => getComputedStyle(el).scale)).toBe('none');
    expect(await motion.evaluate((el) => getComputedStyle(el).clipPath)).toBe(
      'inset(-32px round 60px)',
    );
    expect(await motion.evaluate((el) => getComputedStyle(el).translate)).toBe('none');
    expect(await motion.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    const box = (await dialog.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(280);
    expect(box.width).toBeLessThanOrEqual(560);
    expect(await dialog.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('28px');
  });

  test('traps focus, closes on Escape and returns focus to the trigger', async ({ page }) => {
    await openStory(page, 'components-dialog--basic');
    const trigger = page.getByRole('button', { name: 'Open dialog' });
    await trigger.click();
    const dialog = page.getByRole('alertdialog');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('a plain dialog closes when pressing the scrim; basic (alert) dialogs do not', async ({
    page,
  }) => {
    await openStory(page, 'components-dialog--plain');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await openStory(page, 'components-dialog--alert');
    await page.getByRole('button', { name: 'Reset settings' }).click();
    await page.mouse.click(10, 10);
    await settle(page);
    await expect(page.getByRole('alertdialog', { name: 'Reset all settings?' })).toBeVisible();
  });

  test('locks page scroll while open', async ({ page }) => {
    await openStory(page, 'components-dialog--basic');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
      'hidden',
    );
  });

  test('long content scrolls inside; stacked actions put the confirm action on top', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 420, height: 700 });
    await openStory(page, 'components-dialog--long-content');
    await settle(page);
    const dialog = page.getByRole('alertdialog');
    const content = page.getByTestId('content');
    expect((await dialog.boundingBox())!.height).toBeLessThanOrEqual(700 - 48);
    expect(await content.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
    const accept = (await page.getByRole('button', { name: /Accept/ }).boundingBox())!;
    const decline = (await page.getByRole('button', { name: /Decline/ }).boundingBox())!;
    expect(accept.y).toBeLessThan(decline.y);
  });

  test('full screen on a phone: fills the window, header carries close and the action', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await openStory(page, 'components-dialog--full-screen-compact');
    const trigger = page.getByRole('button', { name: 'Edit name' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Edit name' });
    // Polled to the nearest pixel: while the enter settles, the panel can sit a fraction of a
    // pixel off (y = -0.0001 was seen under load). `+ 0` turns a rounded -0 into 0.
    await expect
      .poll(async () => {
        const box = (await dialog.boundingBox())!;
        const px = (value: number) => Math.round(value) + 0;
        return { x: px(box.x), y: px(box.y), width: px(box.width), height: px(box.height) };
      })
      .toEqual({ x: 0, y: 0, width: 390, height: 760 });
    await settle(page);
    expect(await dialog.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('0px');
    const header = dialog.getByRole('heading', { name: 'Edit name' }).locator('xpath=..');
    expect((await header.boundingBox())!.height).toBe(56);
    // The spec: content 24px from the top, and an on-surface close icon like the headline.
    const content = page.getByTestId('content');
    expect(await content.evaluate((el) => getComputedStyle(el).paddingTop)).toBe('24px');
    const headline = dialog.getByRole('heading', { name: 'Edit name' });
    expect(
      await dialog
        .getByRole('button', { name: 'Close' })
        .evaluate((el) => getComputedStyle(el).color),
    ).toBe(await headline.evaluate((el) => getComputedStyle(el).color));
    // One Save (the header's); the DialogActions row is hidden.
    await expect(dialog.getByRole('button', { name: 'Save' })).toHaveCount(1);
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toHaveCount(0);
    const close = dialog.getByRole('button', { name: 'Close' });
    const target = (await close.locator('[data-touch-target]').boundingBox())!;
    expect(target.width).toBeGreaterThanOrEqual(48);
    expect(target.height).toBeGreaterThanOrEqual(48);
    await close.click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('full screen "compact" stays a basic dialog on larger windows', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 760 });
    await openStory(page, 'components-dialog--full-screen-compact');
    await page.getByRole('button', { name: 'Edit name' }).click();
    const dialog = page.getByRole('dialog', { name: 'Edit name' });
    await settle(page);
    expect((await dialog.boundingBox())!.width).toBeLessThanOrEqual(560);
    expect(await dialog.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('28px');
    await expect(dialog.getByRole('button', { name: 'Close' })).toHaveCount(0);
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeVisible();
    // Initial focus skips the header's hidden close button.
    await expect(dialog.getByRole('textbox', { name: 'Name' })).toBeFocused();
  });

  test('a placed dialog keeps 56px from the edge of a wide window', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 760 });
    await openStory(page, 'components-dialog--placement-top');
    await settle(page);
    expect((await page.getByRole('alertdialog').boundingBox())!.y).toBe(56);
  });

  test('classNames.positioner places it anywhere, keeping the window margin', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 760 });
    await openStory(page, 'components-dialog--custom-position');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    await settle(page);
    const wide = (await page.getByRole('alertdialog').boundingBox())!;
    expect(wide.y).toBe(56);
    expect(wide.x + wide.width).toBe(1024 - 56);

    await page.setViewportSize({ width: 390, height: 760 });
    await settle(page);
    const compact = (await page.getByRole('alertdialog').boundingBox())!;
    expect(compact.y).toBe(24);
    expect(compact.x + compact.width).toBe(390 - 24);
  });

  test('full screen without a header action shows a 56px bottom action bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await openStory(page, 'components-dialog--full-screen-bottom-bar');
    await page.getByRole('button', { name: 'Filters' }).click();
    const dialog = page.getByRole('dialog', { name: 'Filters' });
    await settle(page);
    await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    const apply = (await dialog.getByRole('button', { name: 'Apply' }).boundingBox())!;
    expect(apply.y + apply.height).toBeGreaterThan(760 - 56);
    await expect(page).toHaveScreenshot('full-screen-bottom-bar.png');
  });
});

test.describe('Dialog spec details', () => {
  test('a dialog with short text is still 280px wide, within the window margins', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openStory(page, 'components-dialog--acknowledgement');
    await settle(page);
    expect((await page.getByRole('alertdialog').boundingBox())!.width).toBe(280);
    await page.setViewportSize({ width: 320, height: 640 });
    await settle(page);
    expect((await page.getByRole('alertdialog').boundingBox())!.width).toBe(320 - 48);
  });

  test('reduced motion: the panel fades out instead of vanishing', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-dialog--basic');
    await page.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('alertdialog');
    await settle(page);
    const motion = await recordDialogMotion(page);
    await page.keyboard.press('Escape');
    // The exit's fade, recorded as it starts: leaving, unclipped.
    await expect
      .poll(async () =>
        (await motion.all())
          .filter((record) => record.property === 'opacity')
          .map(({ exiting, clipPath }) => ({ exiting, clip: clipPath })),
      )
      .toContainEqual({ exiting: true, clip: 'inset(-32px round 60px)' });
    await expect(dialog).toHaveCount(0);
  });

  test('scrolling content is reachable and scrollable from the keyboard', async ({ page }) => {
    await page.setViewportSize({ width: 420, height: 700 });
    await openStory(page, 'components-dialog--long-content');
    await settle(page);
    const content = page.getByTestId('content');
    // Initial focus is on the first action; the scrolling content comes before it.
    await expect(page.getByRole('button', { name: /Decline/ })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(content).toBeFocused();
    expect(await content.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    await page.keyboard.press('PageDown');
    await expect.poll(() => content.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  });

  test('optional dividers frame the content across the panel', async ({ page }) => {
    await openStory(page, 'components-dialog--dividers');
    await settle(page);
    const dialog = page.getByRole('alertdialog');
    const content = page.getByTestId('content');
    const style = await content.evaluate((el) => {
      const s = getComputedStyle(el);
      return [s.borderTopWidth, s.borderBottomWidth, s.borderTopStyle];
    });
    expect(style).toEqual(['1px', '1px', 'solid']);
    expect((await content.boundingBox())!.width).toBe((await dialog.boundingBox())!.width);
    // The confirming action waits for a choice; the dismissive one never does.
    await expect(dialog.getByRole('button', { name: 'OK' })).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    await dialog.getByText('Luna').click();
    await expect(dialog.getByRole('button', { name: 'OK' })).toBeEnabled();
  });

  test('a FAB grows into the full-screen dialog and it shrinks back into it', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await openStory(page, 'components-dialog--container-transform');
    const fab = page.getByRole('button', { name: 'New event' });
    const box = (await fab.boundingBox())!;
    const enter = await recordDialogMotion(page);
    await fab.click();
    const dialog = page.getByRole('dialog', { name: 'New event' });
    await expect.poll(async () => (await enter.clip()).length).toBeGreaterThan(0);
    const [from, to] = await enter.clip();
    const inset = `inset(${box.y}px ${390 - box.x - box.width}px ${760 - box.y - box.height}px ${box.x}px round 16px)`;
    expect(from).toBe(inset);
    expect(to).toMatch(/^inset\(0px/);
    await settle(page);
    await page.waitForTimeout(400);
    expect((await dialog.boundingBox())!).toMatchObject({ x: 0, y: 0, width: 390, height: 760 });

    const exit = await recordDialogMotion(page);
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await exit.clip())[1]).toBe(inset);
    await expect(dialog).toHaveCount(0);
    await expect(fab).toBeFocused();
  });

  test('reduced motion: the container transform falls back to the fade', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 390, height: 760 });
    await openStory(page, 'components-dialog--container-transform');
    const motion = await recordDialogMotion(page);
    await page.getByRole('button', { name: 'New event' }).click();
    const dialog = page.getByRole('dialog', { name: 'New event' });
    await expect(dialog).toBeVisible();
    await settle(page);
    // It fades in, with no clip from the FAB.
    expect((await motion.all()).map((record) => record.property)).toContain('opacity');
    expect(await motion.clip()).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    // Not clipped back into the FAB: the clip keeps the window while it only fades.
    const exit = (await motion.all()).filter((record) => record.exiting);
    expect(exit.map((record) => record.property)).toContain('opacity');
    for (const record of exit) expect(record.clipPath).toBe('inset(0px)');
    expect(await motion.clip()).toEqual([]);
  });

  test('closing a full-screen dialog with changes asks to discard them; errors show inline', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 760 });
    await openStory(page, 'components-dialog--discard-confirmation');
    await page.getByRole('button', { name: 'New event' }).click();
    const editor = page.getByRole('dialog', { name: 'New event' });
    await editor.getByRole('button', { name: 'Save' }).click();
    await expect(editor.getByText('Enter a title')).toBeVisible();
    await editor.getByRole('textbox', { name: 'Title' }).fill('Lunch with Priya');
    await editor.getByRole('button', { name: 'Close' }).click();
    const confirm = page.getByRole('alertdialog', { name: 'Discard event?' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Keep editing' }).click();
    await expect(confirm).toHaveCount(0);
    await expect(editor).toBeVisible();
    await page.keyboard.press('Escape');
    await page
      .getByRole('alertdialog', { name: 'Discard event?' })
      .getByRole('button', { name: 'Discard' })
      .click();
    await expect(editor).toHaveCount(0);
  });
});

/** The consumer layout classes of the §10 override matrix (`apps/docs/stories/layout-overrides.ts`). */
const POSITIONER_OVERRIDES = [
  'none',
  'fixed',
  'absolute',
  'sticky',
  'static',
  'overflowHidden',
  'overflowVisible',
  'fullWidth',
  'transform',
];

/**
 * The positioner story's panel width, set by its text: Chromium on Linux lays the same
 * text out 15px narrower than on macOS.
 */
const TEXT_WIDTH = process.platform === 'linux' ? 485 : 500;

test.describe('Dialog classNames.positioner layout safety', () => {
  for (const override of POSITIONER_OVERRIDES) {
    for (const transformedAncestor of [false, true]) {
      const name = `${override}${transformedAncestor ? ' · transformed ancestor' : ''}`;
      test(name, async ({ page }) => {
        await page.setViewportSize({ width: 1024, height: 760 });
        await openStory(
          page,
          'components-dialog--positioner-override',
          {},
          { override, transformedAncestor },
        );
        const motion = await recordDialogMotion(page);
        await page.getByRole('button', { name: 'Open dialog' }).click();
        const dialog = page.getByRole('dialog', { name: 'Sync across devices?' });
        // Enter motion: the container grows downward on its library-owned wrapper.
        await expect
          .poll(async () => (await motion.clip())[0])
          .toBe('inset(0px 0px 100% round 28px)');
        await settle(page);

        const panel = await dialog.evaluate((el) => {
          const motion = getComputedStyle(el.parentElement!);
          const box = el.getBoundingClientRect();
          return {
            width: (el as HTMLElement).offsetWidth,
            radius: getComputedStyle(el).borderTopLeftRadius,
            clip: motion.clipPath,
            opacity: motion.opacity,
            inWindow:
              box.top >= 0 &&
              box.left >= 0 &&
              box.bottom <= window.innerHeight &&
              box.right <= window.innerWidth,
          };
        });
        // The consumer's class reached the positioner.
        const positioner = await dialog.evaluate((el) => {
          const style = getComputedStyle(el.parentElement!.parentElement!);
          return { position: style.position, transformed: style.rotate !== 'none' };
        });
        expect(positioner).toEqual({
          position: ['absolute', 'sticky', 'static'].includes(override) ? override : 'fixed',
          transformed: override === 'transform',
        });
        // The text sets the panel's width (between 280px and 560px) in every case.
        expect(panel).toEqual({
          width: TEXT_WIDTH,
          radius: '28px',
          clip: 'inset(-32px round 60px)',
          opacity: '1',
          inWindow: true,
        });

        // The scrim still covers the whole window.
        const scrim = await page.evaluate(() => {
          const el = document.querySelector<HTMLElement>('[aria-hidden="true"].bg-scrim\\/32')!;
          const box = el.getBoundingClientRect();
          return [box.x, box.y, box.width, box.height];
        });
        expect(scrim).toEqual([0, 0, 1024, 760]);

        // Focus starts on the first action, and the keyboard focus ring is an outline.
        await expect(dialog.getByRole('button', { name: 'Not now' })).toBeFocused();
        await page.keyboard.press('Tab');
        const sync = dialog.getByRole('button', { name: 'Sync' });
        await expect(sync).toBeFocused();
        await expect(sync).toHaveAttribute('data-focus-visible', 'true');
        expect(await sync.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');

        // Pressing inside keeps it open; pressing outside dismisses it with the exit motion.
        await dialog.getByText('Your theme and layout').click();
        await expect(dialog).toBeVisible();
        const exit = await recordDialogMotion(page);
        await page.mouse.click(8, 8);
        await expect
          .poll(async () => (await exit.all()).some((record) => record.exiting))
          .toBe(true);
        await expect(dialog).toHaveCount(0);
      });
    }
  }
});

test.describe('Dialog layout safety', () => {
  /** Opens the story's dialog from its trigger and checks the open panel. */
  async function openAndCheck(page: Page, override: string) {
    await page.getByTestId('target').click();
    const dialog = page.getByRole('dialog', { name: 'Sync across devices?' });
    // Focus starts on the first action.
    await expect(dialog.getByRole('button', { name: 'Not now' })).toBeFocused();
    await settle(page);
    const panel = await panelLayout(dialog);
    expect(panel).toMatchObject({ radius: '28px', inWindow: true, onTop: true });
    if (override !== 'fullWidth') expect(panel.width).toBe(TEXT_WIDTH);
    return dialog;
  }

  // The trigger keeps its size, corners, state layer and focus ring, and still opens the
  // dialog, which returns focus to it on Escape.
  layoutSafetySuite('components-dialog--layout-override', {
    height: 40,
    radius: '20px',
    interactive: false,
    directions: ['ltr'],
    async check(page, target) {
      await expectStateLayer(target);
      await expectKeyboardFocusRing(page, target);
      const dialog = await openAndCheck(page, 'none');
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(target).toBeFocused();
    },
  });

  // A layout class on the dialog (`className`, on its outermost element) leaves the panel
  // visible, sized and focusable.
  for (const override of OVERRIDES) {
    test(`panel · ${override}`, async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 760 });
      await openStory(page, 'components-dialog--layout-override', {}, { override, part: 'panel' });
      const dialog = await openAndCheck(page, override);
      await page.keyboard.press('Tab');
      const sync = dialog.getByRole('button', { name: 'Sync' });
      await expect(sync).toBeFocused();
      await expect(sync).toHaveAttribute('data-focus-visible', 'true');
      expect(await sync.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(page.getByTestId('target')).toBeFocused();
    });
  }
});

test.describe('Elevation in a ThemeScope', () => {
  // A scope's shadow colour reaches the elevation shadows, in place (a card) and in an
  // overlay portalled from the scope (the dialog); outside it they keep the default colour.
  test('a custom shadow colour changes the shadows inside the scope', async ({ page }) => {
    await openStory(page, 'tokens-md-sys-elevation--scoped-shadow');
    const dialog = page.getByRole('dialog', { name: 'Scoped dialog' });
    await expect(dialog).toBeVisible();
    await settle(page);
    const shadow = (locator: Locator) => locator.evaluate((el) => getComputedStyle(el).boxShadow);
    // How the browser writes the key shadow's colour: red at 30%.
    const red = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.style.color = 'color-mix(in srgb, rgb(255, 0, 0) 30%, transparent)';
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });
    const plain = await shadow(page.getByTestId('default-card'));
    const card = await shadow(page.getByTestId('scoped-card'));
    expect(plain).not.toContain(red);
    expect(card).toContain(red);
    expect(card).not.toBe(plain);
    expect(await shadow(dialog)).toContain(red);
  });
});
