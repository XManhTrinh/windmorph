import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite, OVERRIDES } from './layout-safety';
import {
  expectAnchored,
  expectKeyboardFocusRing,
  expectStateLayer,
  panelLayout,
  POSITIONING_OVERRIDES,
} from './overlay-safety';
import { insetEdges, sampleMotion } from './motion-frames';
import { samplePaintedFrames } from './painted-frames';
import { expectNoMovement, faded } from './reduced-motion';
import { MODES, THEMES } from './shots';
import { openStory, type StoryGlobals } from './story';

const box = async (locator: Locator) => (await locator.boundingBox())!;
const settle = (page: Page) => page.waitForTimeout(600);

async function openGrouped(page: Page, globals = {}, args = {}) {
  await openStory(page, 'components-menu--grouped', globals, args);
  await page.getByRole('button', { name: 'More' }).click();
  await settle(page);
  return page.getByRole('menu');
}

test.describe('Menu visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`grouped · ${theme} · ${mode}`, async ({ page }) => {
        const menu = await openGrouped(page, { theme, mode });
        await expect(menu).toHaveScreenshot(`grouped-${theme}-${mode}.png`);
      });
    }
  }

  for (const mode of MODES) {
    test(`grouped · vibrant · ${mode}`, async ({ page }) => {
      const menu = await openGrouped(page, { mode }, { variant: 'vibrant' });
      await expect(menu).toHaveScreenshot(`grouped-vibrant-${mode}.png`);
    });
  }

  test('grouped · gap', async ({ page }) => {
    const menu = await openGrouped(page, {}, { layout: 'gap' });
    await expect(menu).toHaveScreenshot('grouped-gap.png');
  });

  test('submenu open', async ({ page }) => {
    await openStory(page, 'components-menu--submenus');
    await page.getByRole('button', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'Share' }).hover();
    await expect(page.getByRole('menu', { name: 'Share' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Email' }).hover();
    await settle(page);
    await expect(page).toHaveScreenshot('submenu.png');
  });

  test('choices beside actions: the group selects, the actions only act', async ({ page }) => {
    await openStory(page, 'components-menu--choices-beside-actions');
    const trigger = page.getByRole('button', { name: 'Account' });
    await trigger.click();
    const menu = page.getByRole('menu', { name: 'Account' });
    await expect(menu.getByRole('menuitemradio')).toHaveCount(2);
    await expect(menu.getByRole('menuitem')).toHaveCount(2);
    await expect(menu.getByRole('menuitemradio', { name: 'Alex Morgan' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await settle(page);
    await expect(menu).toHaveScreenshot('choices-beside-actions.png');
    // A choice from the keyboard: the arrows cross into the group, Enter chooses and closes.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(menu).toBeHidden();
    await trigger.click();
    await expect(menu.getByRole('menuitemradio', { name: 'Morgan Studio' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // An action closes the menu and leaves the choice as it was.
    await menu.getByRole('menuitem', { name: 'Settings' }).click();
    await expect(menu).toBeHidden();
    await trigger.click();
    await expect(menu.getByRole('menuitemradio', { name: 'Morgan Studio' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('single selection', async ({ page }) => {
    await openStory(page, 'components-menu--single-selection');
    await page.getByRole('button', { name: /Sort by/ }).click();
    await settle(page);
    await expect(page.getByRole('menu')).toHaveScreenshot('single-selection.png');
  });
});

test.describe('Menu behaviour', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`opens below the trigger, aligned to its start edge · ${dir}`, async ({ page }) => {
      const menu = await openGrouped(page, { dir });
      const trigger = await box(page.getByRole('button', { name: 'More' }));
      // In the default divider layout the list is the surface.
      const m = await box(menu);
      expect(Math.round(m.y)).toBe(Math.round(trigger.y + trigger.height));
      if (dir === 'ltr') expect(Math.round(m.x)).toBe(Math.round(trigger.x));
      else expect(Math.round(m.x + m.width)).toBe(Math.round(trigger.x + trigger.width));
      expect(await menu.evaluate((el) => getComputedStyle(el).direction)).toBe(dir);
    });
  }

  test('divider layout: one 16px surface, a 1px divider with 8px around it', async ({ page }) => {
    const menu = await openGrouped(page);
    expect(await menu.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('16px');
    expect(await menu.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');
    const divider = menu.getByRole('separator');
    const d = await box(divider);
    expect(d.height).toBe(1);
    expect(Math.round(d.width)).toBe(Math.round((await box(menu)).width));
    const above = await box(page.getByRole('menuitem', { name: /Find/ }));
    expect(Math.round(d.y - (above.y + above.height))).toBe(8);
    const item = await box(page.getByRole('menuitem', { name: /Delete/ }));
    expect(item.height).toBe(44);
  });

  test('gap layout: motion settles to no transform; groups are 2px apart', async ({ page }) => {
    const menu = await openGrouped(page, {}, { layout: 'gap' });
    expect(await menu.evaluate((el) => getComputedStyle(el.parentElement!).scale)).toBe('none');
    const groups = menu.locator('> div');
    const first = await box(groups.nth(0));
    const second = await box(groups.nth(1));
    expect(Math.round(second.y - (first.y + first.height))).toBe(2);
    const item = await box(page.getByRole('menuitem', { name: /Delete/ }));
    expect(item.height).toBe(44);
    const width = (await box(menu)).width;
    expect(width).toBeGreaterThanOrEqual(112);
    expect(width).toBeLessThanOrEqual(296);
    expect(await groups.nth(0).evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe(
      '16px',
    );
  });

  test("the gap layout's scrolling list doesn't clip the groups' shadows", async ({ page }) => {
    const menu = await openGrouped(page, {}, { layout: 'gap' });
    // Every group sits at least 8px inside the list's scroll box, so its elevation-2
    // shadow (about 8px) fades out before the box edge and follows the rounded corners.
    const insets = await menu.evaluate((list) => {
      const outer = list.getBoundingClientRect();
      return [...list.children].map((group) => {
        const r = group.getBoundingClientRect();
        return Math.min(
          r.left - outer.left,
          outer.right - r.right,
          r.top - outer.top,
          outer.bottom - r.bottom,
        );
      });
    });
    expect(Math.min(...insets)).toBeGreaterThanOrEqual(8);
    expect(await menu.evaluate((el) => getComputedStyle(el).overflowY)).toBe('auto');
  });

  test('a gap menu that has to scroll switches to dividers', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 400 });
    await openStory(page, 'components-menu--scrolling');
    await page.getByRole('button', { name: 'Country' }).click();
    const menu = page.getByRole('menu');
    await expect(menu).toHaveAttribute('data-layout', 'divider');
    await expect(menu.getByRole('separator')).toHaveCount(3);
  });

  test('the trigger keeps a pressed layer while the menu is open', async ({ page }) => {
    await openStory(page, 'components-menu--grouped');
    const trigger = page.getByRole('button', { name: 'More' });
    const layer = () => trigger.evaluate((el) => getComputedStyle(el).backgroundImage);
    const closedLayer = await layer();
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(trigger).toHaveAttribute('data-menu-open', 'true');
    expect(await layer()).not.toBe(closedLayer);
  });

  test('opening with the mouse focuses the first item', async ({ page }) => {
    await openGrouped(page);
    // M3: "When a menu opens, focus should be placed on the first menu item."
    await expect(page.getByRole('menuitem').first()).toBeFocused();
    // The focus ring is for keyboard focus only.
    await expect(page.getByRole('menuitem').first()).not.toHaveAttribute('data-focus-visible');
    // The arrow keys carry on from there.
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem').nth(1)).toBeFocused();
  });

  test('runs an action and closes; Escape and outside clicks close too', async ({ page }) => {
    await openGrouped(page);
    await page.getByRole('menuitem', { name: /Delete/ }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: delete');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'More' })).toBeFocused();

    await page.getByRole('button', { name: 'More' }).click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);

    await page.getByRole('button', { name: 'More' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.mouse.click(600, 500);
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('keyboard: disabled items take focus but do nothing; Enter activates', async ({ page }) => {
    await openStory(page, 'components-menu--grouped');
    await page.getByRole('button', { name: 'More' }).focus();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitem', { name: /Delete/ })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    // M3: "Disabled menu items can receive focus but aren't selectable."
    await expect(page.getByRole('menuitem', { name: /Favourite/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page.getByTestId('last')).toHaveText('Last action: none');
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('menuitem', { name: /Find/ })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toHaveText('Last action: search');
  });

  test('a link item follows its href on a press or Enter and closes the menu', async ({ page }) => {
    await openStory(page, 'components-menu--links');
    const help = page.getByRole('button', { name: 'Help' });
    await help.click();
    const guide = page.getByRole('menuitem', { name: 'Read the guide' });
    await expect(guide).toHaveJSProperty('tagName', 'A');
    await guide.click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#guide');
    await expect(page.getByRole('menu')).toHaveCount(0);

    await help.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Keyboard shortcuts' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#shortcuts');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('Space follows a link item too, as it runs any item', async ({ page }) => {
    await openStory(page, 'components-menu--links');
    await page.getByRole('button', { name: 'Help' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menuitem', { name: 'Read the guide' })).toBeFocused();
    await page.keyboard.press('Space');
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#guide');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('a link item in the bottom sheet follows its href and closes the sheet', async ({
    page,
  }) => {
    await openStory(page, 'components-menu--links', {}, { presentation: 'sheet' });
    await page.getByRole('button', { name: 'Help' }).click();
    const guide = page.getByRole('menuitem', { name: 'Read the guide' });
    await expect(guide).toHaveJSProperty('tagName', 'A');
    await guide.click();
    await expect.poll(() => page.evaluate(() => location.hash)).toBe('#guide');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('a link item opens in a new tab on a modified click', async ({ page, context }) => {
    await openStory(page, 'components-menu--links');
    await page.getByRole('button', { name: 'Help' }).click();
    // Once the menu has opened: a press while it's still opening could miss on a loaded runner.
    await settle(page);
    // The new tab is known by the document it asks for, not by the context's `page` event:
    // twice in one CI run the tab opened and loaded the story while that event never came, and
    // the test waited for it until it timed out (2026-11-12). Following the link in this page
    // would ask for nothing, since `#guide` is in the same document, and this page is marked
    // to show it didn't load again.
    await page.evaluate(() => {
      (window as { stayed?: boolean }).stayed = true;
    });
    await Promise.all([
      context.waitForEvent(
        'request',
        (request) =>
          request.isNavigationRequest() && request.url().includes('components-menu--links'),
      ),
      page
        .getByRole('menuitem', { name: 'Read the guide' })
        .click({ modifiers: ['ControlOrMeta'] }),
    ]);
    // The menu closes, and the page itself stays where it was.
    await expect(page.getByRole('menu')).toHaveCount(0);
    expect(await page.evaluate(() => (window as { stayed?: boolean }).stayed)).toBe(true);
    expect(await page.evaluate(() => location.hash)).toBe('');
  });

  test.describe(() => {
    // The browser starts the download and Playwright cancels it, so no file is written.
    test.use({ acceptDownloads: false });

    test('a download item downloads its file and closes the menu', async ({ page }) => {
      await openStory(page, 'components-menu--links');
      await page.getByRole('button', { name: 'Help' }).click();
      await settle(page);
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('menuitem', { name: 'Download the release notes' }).click(),
      ]);
      expect(download.suggestedFilename()).toBe('release-notes.txt');
      await expect(page.getByRole('menu')).toHaveCount(0);
    });
  });

  test('Tab closes the menu and its submenus; focus is never left on the body', async ({
    page,
  }) => {
    const focusedTag = () => page.evaluate(() => document.activeElement?.tagName);
    await openGrouped(page);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect.poll(focusedTag).not.toBe('BODY');

    await openStory(page, 'components-menu--submenus');
    await page.getByRole('button', { name: 'File' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('menuitem', { name: 'Share' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'Email' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect.poll(focusedTag).not.toBe('BODY');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`submenus open beside their item and morph the corners · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-menu--submenus', { dir });
      await page.getByRole('button', { name: 'File' }).click();
      const root = page.getByRole('menu', { name: 'File' });
      const share = page.getByRole('menuitem', { name: 'Share' });
      await share.focus();
      await page.keyboard.press(dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');
      const submenu = page.getByRole('menu', { name: 'Share' });
      await expect(page.getByRole('menuitem', { name: 'Email' })).toBeFocused();
      await expect(share).toHaveAttribute('data-menu-open', 'true');
      await settle(page);
      const r = await box(root);
      const sub = await box(submenu);
      // Beside the parent menu, not over it, with its first item level with Share.
      const gap = dir === 'ltr' ? sub.x - (r.x + r.width) : r.x - (sub.x + sub.width);
      expect(gap).toBeGreaterThanOrEqual(1);
      expect(gap).toBeLessThanOrEqual(3);
      const email = await box(page.getByRole('menuitem', { name: 'Email' }));
      expect(Math.abs(email.y - (await box(share)).y)).toBeLessThanOrEqual(1);
      // The focused menu is rounder (24px), the other less round (8px).
      const radius = (menu: typeof root) =>
        menu.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
      await expect.poll(() => radius(submenu)).toBe('24px');
      await expect.poll(() => radius(root)).toBe('8px');
      await page.keyboard.press(dir === 'ltr' ? 'ArrowLeft' : 'ArrowRight');
      await expect(submenu).toHaveCount(0);
      await expect(share).toBeFocused();
      await expect.poll(() => radius(root)).toBe('16px');
    });
  }

  test('a nested submenu runs its action and closes every menu', async ({ page }) => {
    await openStory(page, 'components-menu--submenus');
    await page.getByRole('button', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'Share' }).hover();
    await page.getByRole('menuitem', { name: 'Export as' }).hover();
    await page.getByRole('menuitem', { name: 'CSV' }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: csv');
    await expect(page.getByRole('menu')).toHaveCount(0);
  });

  test('a secondary click opens a context menu at the pointer', async ({ page }) => {
    await openStory(page, 'components-menu--context-menu');
    const target = await box(page.getByTestId('target'));
    await page.mouse.click(target.x + 40, target.y + 30, { button: 'right' });
    const menu = page.getByRole('menu', { name: 'Card actions' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem').first()).toBeFocused();
    const m = await box(menu);
    expect(Math.round(m.x)).toBe(Math.round(target.x + 40));
    expect(Math.round(m.y)).toBe(Math.round(target.y + 30));
    await page.getByRole('menuitem', { name: /Delete/ }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: delete');
  });

  // 2026-11-11: the tick, icons and description of a selected item were a fixed role, so an
  // app that set the selected tokens got its label colour and a tick in the old one: 1.08:1
  // on a secondary container in dark mode.
  for (const variant of ['standard', 'vibrant'] as const) {
    test(`a selected item's tick follows the selected label's colour · ${variant}`, async ({
      page,
    }) => {
      await openStory(page, 'components-menu--single-selection', { mode: 'dark' }, { variant });
      await page.addStyleTag({
        content: `:root, [data-theme] {
          --md-comp-menus-standard-menu-item-selected-container-color: var(--md-sys-color-secondary-container);
          --md-comp-menus-standard-menu-item-selected-label-text-color: var(--md-sys-color-on-secondary-container);
        }`,
      });
      await page.getByRole('button', { name: /Sort by/ }).click();
      await settle(page);
      const name = page.getByRole('menuitemradio', { name: 'Name' });
      const label = await name.evaluate((el) => getComputedStyle(el).color);
      const tick = await name
        .locator('svg')
        .first()
        .evaluate((el) => getComputedStyle(el).color);
      expect(tick).toBe(label);
    });
  }

  test('a selected item takes the 12px selected shape and its check expands', async ({ page }) => {
    await openStory(page, 'components-menu--single-selection');
    await page.getByRole('button', { name: /Sort by/ }).click();
    await settle(page);
    const name = page.getByRole('menuitemradio', { name: 'Name' });
    const date = page.getByRole('menuitemradio', { name: 'Date modified' });
    expect(await name.evaluate((el) => getComputedStyle(el).borderBottomLeftRadius)).toBe('12px');
    const check = name.locator('svg').first();
    expect((await box(check)).width).toBe(20);
    expect(
      await date
        .locator('[aria-hidden] > span')
        .first()
        .evaluate((el) => el.getBoundingClientRect().width),
    ).toBe(0);
  });
});

test.describe('Menu reveal direction (2026-10-15)', () => {
  // Compose pivots a menu on its anchored edge. The closed clip used to be a
  // `@starting-style` resolved before React Aria set `data-placement`, so every menu grew
  // downwards from its top edge, away from a trigger below it.
  test('a menu above its trigger grows up from its bottom edge', async ({ page }) => {
    await openStory(page, 'components-menu--layout-override', {}, { override: 'fixed' });
    const frames = await sampleMotion(page, {
      act: { click: '[data-testid="target"]' },
      started: '[role="menu"]',
      parts: { reveal: '[data-placement]:has([role="menu"])' },
      duration: 200,
    });
    await expect(page.locator('[data-placement]:has([role="menu"])')).toHaveAttribute(
      'data-placement',
      'top',
    );
    const shown = frames.flatMap(({ parts }) => (parts.reveal ? [parts.reveal] : []));
    expect(shown.length).toBeGreaterThan(3);
    const sides = shown.map((part) => insetEdges(part.clipPath, part.width, part.height));
    // Closed at the top and open at the bottom (next to the trigger) from the first frame.
    expect(sides[0]![0]).toBeGreaterThan(shown[0]!.height / 2);
    for (const [, , bottom] of sides) expect(bottom).toBeLessThanOrEqual(0);
  });

  test('a submenu grows sideways from the item that opened it', async ({ page }) => {
    await openStory(page, 'components-menu--submenus');
    await page.getByRole('button', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'Share' }).focus();
    const frames = await sampleMotion(page, {
      act: { key: 'ArrowRight' },
      started: '[data-placement="right"]',
      parts: { reveal: '[data-placement="right"]' },
      duration: 200,
    });
    const shown = frames.flatMap(({ parts }) => (parts.reveal ? [parts.reveal] : []));
    expect(shown.length).toBeGreaterThan(3);
    const sides = shown.map((part) => insetEdges(part.clipPath, part.width, part.height));
    // Closed at the far side and open at the item's side from the first frame.
    expect(sides[0]![1]).toBeGreaterThan(shown[0]!.width / 2);
    for (const [top, , bottom] of sides) {
      expect(top).toBeLessThanOrEqual(0);
      expect(bottom).toBeLessThanOrEqual(0);
    }
  });
});

// A group heading starts where the items' content does, 16px inside the group's padding
// (Compose's 12px from the edge left it 8px out of line; 2026-10-15).
test('group headings line up with the items, 16px in', async ({ page }) => {
  await openGrouped(page, {}, { layout: 'gap' });
  const group = page.getByRole('group', { name: 'Edit' });
  const heading = page.locator(`[id="${await group.getAttribute('aria-labelledby')}"]`);
  const textStart = await heading.evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect().x;
  });
  // Where the first item's content starts: inside its 16px padding.
  const itemStart = await group
    .getByRole('menuitem')
    .first()
    .evaluate(
      (el) => el.getBoundingClientRect().x + parseFloat(getComputedStyle(el).paddingInlineStart),
    );
  expect(Math.round(textStart)).toBe(Math.round(itemStart));
});

// A leaving menu fades for ~150ms; an item clicked meanwhile used to run its action.
test('a closing menu lets a click through instead of running an item', async ({ page }) => {
  await openGrouped(page);
  const item = await box(page.getByRole('menuitem').first());
  await page.keyboard.press('Escape');
  await page.mouse.click(item.x + item.width / 2, item.y + item.height / 2);
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByTestId('last')).toHaveText('Last action: none');
});

// Forced colours drop the fill and the shadow; the surface keeps a system-colour edge.
test('a menu keeps a visible edge in forced colours', async ({ page }) => {
  await page.emulateMedia({ forcedColors: 'active' });
  const menu = await openGrouped(page);
  const edge = await menu.evaluate((el) => {
    const style = getComputedStyle(el);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(edge).toEqual({ style: 'solid', width: '1px' });
});

test.describe('Menu under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the menu only fades: its clip stays open', async ({ page }) => {
    await openStory(page, 'components-menu--grouped');
    await page.getByRole('button', { name: 'More' }).click();
    const reveal = page.getByRole('menu').locator('..');
    // Read at once, while the fade is still running.
    expect(await reveal.evaluate((el) => getComputedStyle(el).clipPath)).toBe('inset(-24px)');
    // And on every frame while it fades out, from the element itself: read after Escape, the
    // menu could already be gone on a busy machine.
    await reveal.evaluate((el) => {
      const clips: string[] = [];
      (window as unknown as { exitClips: string[] }).exitClips = clips;
      const sample = () => {
        if (!el.isConnected) return;
        clips.push(getComputedStyle(el).clipPath);
        requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    const clips = await page.evaluate(
      () => (window as unknown as { exitClips: string[] }).exitClips,
    );
    expect(clips.length).toBeGreaterThan(0);
    expect(new Set(clips)).toEqual(new Set(['inset(-24px)']));
  });
});

test.describe('Menu presentation and instant', () => {
  test('presentation="auto" opens a bottom sheet on a phone, with the menu keyboard', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-menu--grouped', {}, { presentation: 'auto' });
    await page.getByRole('button', { name: 'More' }).click();
    const sheet = page.getByRole('dialog', { name: 'More' });
    await expect(sheet).toBeVisible();
    const menu = sheet.getByRole('menu');
    await expect(menu.getByRole('menuitem').first()).toBeFocused();
    await settle(page);
    // It spans the sheet (8px in from each side) and sits at the bottom of the window.
    const s = await box(sheet);
    const m = await box(menu);
    expect(Math.round(s.y + s.height)).toBe(800);
    expect(Math.round(m.width)).toBe(Math.round(s.width) - 16);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toHaveText('Last action: edit');
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('button', { name: 'More' })).toBeFocused();
  });

  test("a submenu in a sheet takes the menu's place, with a way back", async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-menu--submenus', {}, { presentation: 'sheet' });
    await page.getByRole('button', { name: 'File' }).click();
    const sheet = page.getByRole('dialog', { name: 'File' });
    const root = sheet.getByRole('menu', { name: 'File' });
    await expect(root.getByRole('menuitem').first()).toBeFocused();
    await settle(page);

    // A click on an item replaces the menu, so the pointer rests on whatever item of the
    // submenu lands under it, which may take focus on hover. Each click therefore moves the
    // pointer off the sheet, checks focus went into the submenu, and takes it to the first
    // item with the keyboard.
    async function clickIntoSubmenu(item: Locator, submenu: Locator) {
      await item.click();
      await expect(submenu.locator('[role="menuitem"]:focus')).toHaveCount(1);
      await page.mouse.move(0, 0);
      await page.keyboard.press('Home');
    }

    const share = sheet.getByRole('menu', { name: 'Share' });
    await clickIntoSubmenu(root.getByRole('menuitem', { name: 'Share' }), share);
    await expect(share.getByRole('menuitem', { name: 'Email' })).toBeFocused();
    // The menu that opened it is hidden; the submenu spans the sheet below a 48px back
    // button and its item's label, all inside the window.
    await expect(root).toBeHidden();
    const back = sheet.getByRole('button', { name: 'Back' });
    const s = await box(sheet);
    const m = await box(share);
    const b = await box(back);
    expect([Math.round(b.width), Math.round(b.height)]).toEqual([48, 48]);
    expect(Math.round(m.width)).toBe(Math.round(s.width) - 16);
    expect(m.y).toBeGreaterThanOrEqual(b.y + b.height);
    expect(m.y + m.height).toBeLessThanOrEqual(800);
    // The label beside the back button (the hidden menu keeps its own "Share" item).
    await expect(
      sheet.locator('[data-submenu-panel]').getByText('Share', { exact: true }),
    ).toBeVisible();

    // A nested submenu replaces it in turn; back goes up one level at a time. Back is
    // pressed from the keyboard: the sheet's height changes with the level, so a pointer
    // left on it would rest on an item of the level it returns to.
    const exportAs = sheet.getByRole('menu', { name: 'Export as' });
    await clickIntoSubmenu(share.getByRole('menuitem', { name: 'Export as' }), exportAs);
    await expect(exportAs.getByRole('menuitem', { name: 'PDF' })).toBeFocused();
    await expect(share).toBeHidden();
    await expect(root).toBeHidden();
    await sheet.getByRole('button', { name: 'Back' }).press('Enter');
    await expect(exportAs).toHaveCount(0);
    await expect(share).toBeVisible();
    await expect(share.getByRole('menuitem', { name: 'Export as' })).toBeFocused();

    // ← goes back with the keyboard, to the item that opened it.
    await page.keyboard.press('ArrowLeft');
    await expect(share).toHaveCount(0);
    await expect(root).toBeVisible();
    await expect(root.getByRole('menuitem', { name: 'Share' })).toBeFocused();

    // → opens it again, and an action closes the sheet.
    await page.keyboard.press('ArrowRight');
    await expect(share.getByRole('menuitem', { name: 'Email' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toHaveText('Last action: email');
    await expect(sheet).toBeHidden();
    await expect(page.getByRole('button', { name: 'File' })).toBeFocused();
  });

  test('hovering a submenu item in a sheet does not open it', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 800 });
    await openStory(page, 'components-menu--submenus', {}, { presentation: 'sheet' });
    await page.getByRole('button', { name: 'File' }).click();
    const sheet = page.getByRole('dialog', { name: 'File' });
    await settle(page);
    await sheet.getByRole('menuitem', { name: 'Share' }).hover();
    await page.waitForTimeout(400);
    await expect(sheet.getByRole('menu', { name: 'Share' })).toHaveCount(0);
  });

  test('presentation="auto" stays a popover on a wide window', async ({ page }) => {
    const menu = await openGrouped(page, {}, { presentation: 'auto' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('an instant menu appears and leaves with no motion', async ({ page }) => {
    await openStory(page, 'components-menu--grouped', {}, { instant: true });
    await page.getByRole('button', { name: 'More' }).click();
    const reveal = page.getByRole('menu').locator('..');
    // Fully shown at once: no fade or clip in progress.
    expect(
      await reveal.evaluate((el) => {
        const computed = getComputedStyle(el);
        return [computed.opacity, computed.clipPath, computed.transitionProperty];
      }),
    ).toEqual(['1', 'inset(-24px)', 'none']);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0, { timeout: 100 });
  });
});

test.describe('Menu layout safety', () => {
  /**
   * Opens the story's menu from its trigger, checks it (anchored to the trigger unless the
   * override positions the menu itself), picks Delete from the keyboard and checks focus
   * returns to the trigger.
   */
  async function openCheckAndPick(
    page: Page,
    override: string,
    anchored: boolean,
    part: 'trigger' | 'panel' = 'trigger',
  ) {
    const target = page.getByTestId('target');
    await target.click();
    const menu = page.getByRole('menu');
    await expect(menu.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await settle(page);
    const panel = await panelLayout(menu);
    expect(panel).toMatchObject({ radius: '16px', inWindow: true, onTop: true });
    // A width class on the placed box (`fullWidth`) leaves the menu its own width too.
    expect(panel.width).toBeGreaterThanOrEqual(112);
    expect(panel.width).toBeLessThanOrEqual(280);
    // Layout height: a rotate transform enlarges the on-screen box.
    expect(
      await menu
        .getByRole('menuitem', { name: 'Delete' })
        .evaluate((el) => (el as HTMLElement).offsetHeight),
    ).toBe(44);
    if (anchored) await expectAnchored(menu, target, 0);
    if (anchored && part === 'panel') {
      // Opened below its start corner: the menu's start edge meets the trigger's (a full-width
      // box once held it 12px from the window's edge instead, 2026-10-17).
      const [m, t] = await Promise.all([menu.boundingBox(), target.boundingBox()]);
      expect(Math.abs(m!.x - t!.x)).toBeLessThanOrEqual(1);
    }
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('count')).toHaveText('Last action: delete');
    await expect(menu).toHaveCount(0);
    await expect(target).toBeFocused();
  }

  // The trigger keeps its size, corners, state layer and focus ring, and the menu opens
  // against it wherever the trigger is placed.
  layoutSafetySuite('components-menu--layout-override', {
    height: 40,
    width: 40,
    radius: '20px',
    interactive: false,
    async check(page, target) {
      await expectStateLayer(target);
      await expectKeyboardFocusRing(page, target);
      await openCheckAndPick(page, 'none', true);
    },
  });

  // A layout class on the menu (`className`, on its outermost element, the box React Aria
  // places) leaves it visible, sized and keyboard-usable.
  for (const override of OVERRIDES) {
    test(`panel · ${override}`, async ({ page }) => {
      await openStory(page, 'components-menu--layout-override', {}, { override, part: 'panel' });
      await openCheckAndPick(page, override, !POSITIONING_OVERRIDES.includes(override), 'panel');
    });
  }
});

/*
 * Submenus in place and a menu inside an element (`submenuPresentation="replace"`,
 * `submenuTransition`, `afterSelect`, `portalContainer`; docs/plans/menu-in-place-and-container.md):
 * a video player's settings menu, opened from its settings button inside the player.
 */
const PLAYER = 'components-menu--player-settings';

async function openPlayer(page: Page, globals: StoryGlobals = {}, args = {}) {
  await openStory(page, PLAYER, globals, args);
  await page.getByRole('button', { name: 'Settings' }).click();
  await settle(page);
  return page.getByTestId('player');
}

/** The surface the pages share, its pages' natural height, and the placement, on one frame. */
const SURFACE = `(() => {
  const surface = document.querySelector('[data-level]');
  if (!surface) return null;
  const r = surface.getBoundingClientRect();
  return {
    top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height,
    pages: surface.firstElementChild.getBoundingClientRect().height,
    placement: surface.closest('[data-placement]').dataset.placement,
    pane: document.querySelector('[data-testid="pane"]').scrollTop,
  };
})()`;

interface SurfaceFrame {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height: number;
  pages: number;
  placement: string;
  pane: number;
}

const forward = (dir: 'ltr' | 'rtl') => (dir === 'ltr' ? 'ArrowRight' : 'ArrowLeft');

test.describe('Menu in place: visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`player settings · ${theme} · ${mode}`, async ({ page }) => {
        const player = await openPlayer(page, { theme, mode });
        await expect(player).toHaveScreenshot(`player-settings-${theme}-${mode}.png`);
        await page.getByRole('menuitem', { name: /^Quality/ }).click();
        await page.mouse.move(0, 0);
        await settle(page);
        await expect(player).toHaveScreenshot(`player-settings-quality-${theme}-${mode}.png`);
      });
    }
  }

  test('player settings · vibrant · right to left', async ({ page }) => {
    const player = await openPlayer(page, { dir: 'rtl' }, { variant: 'vibrant' });
    await expect(player).toHaveScreenshot('player-settings-vibrant-rtl.png');
    await page.getByRole('menuitem', { name: /^Quality/ }).click();
    await page.mouse.move(0, 0);
    await settle(page);
    await expect(player).toHaveScreenshot('player-settings-quality-vibrant-rtl.png');
  });

  test('player settings · forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    const player = await openPlayer(page);
    await page.getByRole('menuitem', { name: /^Quality/ }).click();
    await page.mouse.move(0, 0);
    await settle(page);
    // The surface keeps a system-colour edge.
    const edge = await page
      .locator('[data-level]')
      .evaluate((el) => [getComputedStyle(el).outlineStyle, getComputedStyle(el).outlineWidth]);
    expect(edge).toEqual(['solid', '1px']);
    await expect(player).toHaveScreenshot('player-settings-quality-forced-colors.png');
  });
});

test.describe('Menu in place: behaviour', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    for (const corner of ['bottom', 'top'] as const) {
      test(`the surface follows each page's height on every painted frame, its corner held · ${dir} · ${corner}`, async ({
        page,
      }) => {
        await openPlayer(page, { dir }, { corner });
        // The corner nearest the trigger: above it, the bottom; below it, the top; and the end edge.
        const held = (f: SurfaceFrame) => [
          corner === 'bottom' ? f.bottom : f.top,
          dir === 'ltr' ? f.right : f.left,
        ];
        const check = (frames: (SurfaceFrame | null)[], grows: boolean) => {
          const shown = frames.filter((f): f is SurfaceFrame => f !== null);
          const [first, last] = [shown[0]!, shown.at(-1)!];
          expect(Math.abs(last.height - last.pages)).toBeLessThanOrEqual(0.5);
          expect(grows ? last.height > first.height : last.height < first.height).toBe(true);
          for (const [i, f] of shown.entries()) {
            const [main, end] = held(f);
            const [main0, end0] = held(first);
            expect(Math.abs(main! - main0!), `frame ${i}: the held edge`).toBeLessThanOrEqual(0.5);
            expect(Math.abs(end! - end0!), `frame ${i}: the end edge`).toBeLessThanOrEqual(1);
            expect(f.placement, `frame ${i} never flips`).toBe(first.placement);
            expect(f.pane, `frame ${i}: the pane stays`).toBe(0);
            // Shrinking eases on the effects spring: never below the page it shows.
            if (!grows) expect(f.height).toBeGreaterThanOrEqual(last.pages - 0.5);
            const before = shown[i - 1];
            if (before) {
              if (grows) expect(f.height).toBeGreaterThanOrEqual(before.height - 0.5);
              else expect(f.height).toBeLessThanOrEqual(before.height + 0.5);
            }
          }
          // It moved, rather than jumping in one frame.
          expect(
            shown.some(
              (f) =>
                f.height > Math.min(first.height, last.height) + 1 &&
                f.height < Math.max(first.height, last.height) - 1,
            ),
          ).toBe(true);
        };
        // The first page (249px) to Quality (276px), which grows.
        await page.getByRole('menuitem', { name: /^Quality/ }).focus();
        check(
          await samplePaintedFrames(page, SURFACE, () => page.keyboard.press(forward(dir)), 700),
          true,
        );
        await page.keyboard.press('Escape');
        await settle(page);
        // Subtitles (265px) to Font size (188px), which shrinks.
        await page.getByRole('menuitem', { name: /^Subtitles/ }).focus();
        await page.keyboard.press(forward(dir));
        await settle(page);
        await page.keyboard.press('End');
        check(
          await samplePaintedFrames(page, SURFACE, () => page.keyboard.press('Enter'), 700),
          false,
        );
      });
    }

    test(`slide: a page comes in 30px from the end edge going forward, the start edge going back · ${dir}`, async ({
      page,
    }) => {
      await openPlayer(page, { dir }, { submenuTransition: 'slide' });
      const frame = `(() => {
        const page = document.querySelector('[data-submenu-panel]');
        const first = document.querySelector('[role="menu"]');
        const x = (el) => (el ? (parseFloat(getComputedStyle(el).translate) || 0) : null);
        return {
          page: page ? x(page) : null,
          first: getComputedStyle(first).display === 'none' ? null : x(first),
        };
      })()`;
      type Frame = { page: number | null; first: number | null };
      const end = dir === 'ltr' ? 1 : -1;
      await page.getByRole('menuitem', { name: /^Quality/ }).focus();
      const forwardFrames = await samplePaintedFrames<Frame>(
        page,
        frame,
        () => page.keyboard.press(forward(dir)),
        700,
      );
      const coming = forwardFrames.filter((f) => f.page !== null);
      // From the end edge, settling where it belongs; the first page gone from the first frame.
      expect(coming[0]!.page! * end).toBeGreaterThan(20);
      expect(coming.at(-1)!.page).toBe(0);
      for (const f of coming) expect(f.first).toBeNull();
      const backFrames = await samplePaintedFrames<Frame>(
        page,
        frame,
        () => page.keyboard.press('Escape'),
        700,
      );
      const back = backFrames.filter((f) => f.page === null && f.first !== null);
      expect(back[0]!.first! * end).toBeLessThan(-20);
      expect(back.at(-1)!.first).toBe(0);
    });
  }

  test('afterSelect="back": a choice goes back to the page that shows it, focus on its item', async ({
    page,
  }) => {
    await openPlayer(page);
    const quality = page.getByRole('menuitem', { name: /^Quality/ });
    await expect(quality).toContainText('Auto');
    await quality.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitemradio', { name: 'Auto' })).toBeFocused();
    // Space chooses and stays.
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Space');
    await expect(page.getByRole('menuitemradio', { name: '1080p' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-submenu-panel]')).toHaveCount(0);
    await expect(quality).toBeFocused();
    await expect(quality).toContainText('720p');
    // The menu stays open, and Escape closes it from the first page.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Settings' })).toBeFocused();
  });

  test('in right to left, Arrow Left opens a page and Arrow Right goes back to its item', async ({
    page,
  }) => {
    await openPlayer(page, { dir: 'rtl' });
    const subtitles = page.getByRole('menuitem', { name: /^Subtitles/ });
    await subtitles.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('menuitemradio', { name: 'Off' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('[data-submenu-panel]')).toHaveCount(0);
    await expect(subtitles).toBeFocused();
  });

  test('a menu in the element stays inside it, containerPadding from its edges, and flips within it', async ({
    page,
  }) => {
    const inside = async () => {
      const [s, p] = await Promise.all([
        page.locator('[data-level]').boundingBox(),
        page.getByTestId('player').boundingBox(),
      ]);
      expect(s!.x).toBeGreaterThanOrEqual(p!.x + 12 - 0.5);
      expect(s!.x + s!.width).toBeLessThanOrEqual(p!.x + p!.width - 12 + 0.5);
      expect(s!.y).toBeGreaterThanOrEqual(p!.y + 12 - 0.5);
      expect(s!.y + s!.height).toBeLessThanOrEqual(p!.y + p!.height - 12 + 0.5);
    };
    // Asked to open below a trigger at the player's bottom: no room in the player, so above.
    await openPlayer(page, {}, { flip: true });
    await expect(page.locator('[data-placement]:has([data-level])')).toHaveAttribute(
      'data-placement',
      'top',
    );
    await inside();
    await page.getByRole('menuitem', { name: /^Quality/ }).click();
    await settle(page);
    await inside();
    // In body, the window has room below: it stays there.
    await openPlayer(page, {}, { flip: true, inPlayer: false });
    await expect(page.locator('[data-placement]:has([data-level])')).toHaveAttribute(
      'data-placement',
      'bottom',
    );
    // Right to left too: it opens from the trigger's end edge, inside the player.
    await openPlayer(page, { dir: 'rtl' });
    await inside();
    const [s, t] = await Promise.all([
      page.locator('[data-level]').boundingBox(),
      page.getByRole('button', { name: 'Settings', includeHidden: true }).boundingBox(),
    ]);
    expect(Math.abs(s!.x - t!.x)).toBeLessThanOrEqual(1);
  });

  test('when a pane scrolls the element, the menu keeps its place in it on every frame', async ({
    page,
  }) => {
    await openPlayer(page);
    const offset = `(() => {
      const s = document.querySelector('[data-level]').getBoundingClientRect();
      const p = document.querySelector('[data-testid="player"]').getBoundingClientRect();
      return [s.top - p.top, s.left - p.left, p.top];
    })()`;
    const pane = page.getByTestId('pane');
    const frames = await samplePaintedFrames<number[]>(
      page,
      offset,
      async () => {
        for (let i = 0; i < 6; i++) {
          await pane.evaluate((el) => (el.scrollTop += 20));
          await page.waitForTimeout(32);
        }
      },
      400,
    );
    // The pane scrolled the player, and the menu with it.
    expect(frames.at(-1)![2]).toBeLessThan(frames[0]![2]! - 60);
    for (const [top, left] of frames) {
      expect(Math.abs(top! - frames[0]![0]!)).toBeLessThanOrEqual(0.5);
      expect(Math.abs(left! - frames[0]![1]!)).toBeLessThanOrEqual(0.5);
    }
  });

  test('a wheel outside the menu scrolls a pane around the element, and the menu stays with it', async ({
    page,
  }) => {
    // Recorded (2026-11-18): the menu's underlay is inside the element, so a wheel over it
    // scrolls through the element to the pane; the menu, placed in the element, goes along.
    const player = await openPlayer(page);
    const before =
      (await page.locator('[data-level]').boundingBox())!.y - (await player.boundingBox())!.y;
    await page.mouse.move(150, 300);
    await page.mouse.wheel(0, 120);
    await expect
      .poll(() => page.getByTestId('pane').evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
    await settle(page);
    await expect(page.getByRole('menu', { name: 'Settings' })).toBeVisible();
    const after =
      (await page.locator('[data-level]').boundingBox())!.y - (await player.boundingBox())!.y;
    expect(Math.abs(after - before)).toBeLessThanOrEqual(0.5);
  });

  test('Home and End move focus without scrolling a pane around the element', async ({ page }) => {
    await openPlayer(page, {}, { corner: 'top' });
    await page.keyboard.press('End');
    await expect(page.getByRole('menuitemcheckbox', { name: 'Loop' })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(page.getByRole('menuitem', { name: /^Quality/ })).toBeFocused();
    await page.waitForTimeout(300);
    expect(await page.getByTestId('pane').evaluate((el) => el.scrollTop)).toBe(0);
  });

  test('a container resized without the window places the menu back on its trigger', async ({
    page,
  }) => {
    await openPlayer(page);
    await page.getByTestId('player').evaluate((el) => {
      (el as HTMLElement).style.width = '480px';
    });
    await expect
      .poll(async () => {
        const [s, t] = await Promise.all([
          page.locator('[data-level]').boundingBox(),
          page.getByRole('button', { name: 'Settings', includeHidden: true }).boundingBox(),
        ]);
        return Math.round(s!.x + s!.width - (t!.x + t!.width));
      })
      .toBe(0);
  });

  test('full screen: a menu opened before stays in sight, placed on its trigger, and after', async ({
    page,
  }) => {
    await openPlayer(page);
    // Playwright's evaluate counts as a user gesture, so headless Chromium grants it.
    await page.evaluate(() =>
      document.querySelector('[data-testid="player"]')!.requestFullscreen(),
    );
    await expect
      .poll(() => page.evaluate(() => document.fullscreenElement?.getAttribute('data-testid')))
      .toBe('player');
    const atTrigger = async () => {
      await expect
        .poll(async () => {
          const [s, t] = await Promise.all([
            page.locator('[data-level]').boundingBox(),
            page.getByRole('button', { name: 'Settings', includeHidden: true }).boundingBox(),
          ]);
          return [
            Math.round(s!.x + s!.width - (t!.x + t!.width)),
            Math.round(t!.y - 8 - (s!.y + s!.height)),
          ];
        })
        .toEqual([0, 0]);
    };
    await atTrigger();
    const box = (await page.locator('[data-level]').boundingBox())!;
    expect(
      await page.evaluate(
        ([x, y]) => document.elementFromPoint(x!, y!)?.closest('[role="menu"]') != null,
        [box.x + box.width / 2, box.y + 24],
      ),
    ).toBe(true);
    await page.evaluate(() => document.exitFullscreen());
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
    await atTrigger();
  });

  test('a trigger outside the element: the menu opens kept within its width', async ({ page }) => {
    const player = await openPlayer(page, {}, { triggerOutside: true });
    const [s, p] = await Promise.all([
      page.locator('[data-level]').boundingBox(),
      player.boundingBox(),
    ]);
    expect(s!.x + s!.width).toBeLessThanOrEqual(p!.x + p!.width - 12 + 0.5);
    await page.getByRole('menuitem', { name: /^Quality/ }).click();
    await expect(page.getByRole('menuitemradio', { name: 'Auto' })).toBeFocused();
  });

  // Consumer classes on the element the menu opens in (architecture §10).
  for (const override of ['static', 'overflowHidden', 'transform', 'translate', 'containPaint']) {
    test(`the element with a consumer class · ${override}`, async ({ page }) => {
      const player = await openPlayer(page, {}, { override });
      const trigger = page.getByRole('button', { name: 'Settings', includeHidden: true });
      const [s, t, p] = await Promise.all([
        page.locator('[data-level]').boundingBox(),
        trigger.boundingBox(),
        player.boundingBox(),
      ]);
      // Above its trigger, 8px off, its end edge on the trigger's, inside the player.
      expect(Math.abs(t!.y - 8 - (s!.y + s!.height))).toBeLessThanOrEqual(1);
      expect(Math.abs(t!.x + t!.width - (s!.x + s!.width))).toBeLessThanOrEqual(1);
      expect(s!.y).toBeGreaterThanOrEqual(p!.y);
      expect(
        await page.evaluate(
          ([x, y]) => document.elementFromPoint(x!, y!)?.closest('[role="menu"]') != null,
          [s!.x + s!.width / 2, s!.y + 24],
        ),
      ).toBe(true);
      // And it works from the keyboard, page and back.
      await page.getByRole('menuitem', { name: /^Quality/ }).focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.getByRole('menuitemradio', { name: 'Auto' })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('menuitem', { name: /^Quality/ })).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
    });
  }
});

test.describe('Menu in place: loaded on demand', () => {
  const CHUNK = /\/menu-in-place-[\w-]+\.js/;

  test('a menu with submenus beside it, in body, never loads the in-place code', async ({
    page,
  }) => {
    const loads: string[] = [];
    page.on('request', (request) => {
      if (CHUNK.test(request.url())) loads.push(request.url());
    });
    await openStory(page, 'components-menu--submenus');
    await page.getByRole('button', { name: 'File' }).hover();
    await page.getByRole('button', { name: 'File' }).click();
    await page.getByRole('menuitem', { name: 'Share' }).hover();
    await expect(page.getByRole('menu', { name: 'Share' })).toBeVisible();
    // Past the browser's idle period, when a menu that may need it preloads it.
    await page.waitForTimeout(1500);
    expect(loads).toEqual([]);
    // A menu with pages in place preloads it once the page is idle.
    await openStory(page, PLAYER);
    await expect.poll(() => loads.length).toBeGreaterThan(0);
  });

  test('opened before its code is in, it waits on its trigger, then opens placed and focused', async ({
    page,
  }) => {
    let release = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route(CHUNK, async (route) => {
      await held;
      await route.continue();
    });
    await openStory(page, PLAYER);
    await page.getByRole('button', { name: 'Settings' }).click();
    await page.waitForTimeout(300);
    // Nothing shows meanwhile, and focus stays on the open trigger, never on the page.
    await expect(page.locator('[data-level]')).toHaveCount(0);
    expect(
      await page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? 'body'),
    ).toBe('Settings');
    const frames = await samplePaintedFrames<{ gap: number; end: number } | null>(
      page,
      `(() => {
        const surface = document.querySelector('[data-level]');
        if (!surface) return null;
        const s = surface.getBoundingClientRect();
        const t = document.querySelector('[aria-label="Settings"][aria-haspopup]').getBoundingClientRect();
        return { gap: t.top - s.bottom, end: t.right - s.right };
      })()`,
      async () => release(),
      800,
    );
    // From its first frame it's placed on its trigger: 8px above it, its end edge on the trigger's.
    const shown = frames.filter((f): f is { gap: number; end: number } => f !== null);
    expect(shown.length).toBeGreaterThan(0);
    for (const f of shown) {
      expect(Math.abs(f.gap - 8)).toBeLessThanOrEqual(1);
      expect(Math.abs(f.end)).toBeLessThanOrEqual(1);
    }
    await expect(page.getByRole('menuitem', { name: /^Quality/ })).toBeFocused();
  });
});

test.describe('Menu in place under reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const submenuTransition of ['fade', 'slide']) {
    test(`the height jumps and the page only fades · ${submenuTransition}`, async ({ page }) => {
      await openPlayer(page, {}, { submenuTransition });
      await page.getByRole('menuitem', { name: /^Quality/ }).focus();
      const result = await expectNoMovement(page, {
        parts: { surface: '[data-level]', page: '[data-submenu-panel]' },
        act: () => page.keyboard.press('ArrowRight'),
      });
      expect(faded(result, 'page')).toBe(true);
      await expect(page.getByRole('menuitemradio', { name: 'Auto' })).toBeFocused();
    });
  }
});
