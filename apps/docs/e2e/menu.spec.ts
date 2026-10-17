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
import { MODES, THEMES } from './shots';
import { openStory } from './story';

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
    // Read at once, while the fade is still running, and again while it fades out.
    const clip = () => reveal.evaluate((el) => getComputedStyle(el).clipPath);
    expect(await clip()).toBe('inset(-24px)');
    await page.keyboard.press('Escape');
    expect(await clip()).toBe('inset(-24px)');
    await expect(page.getByRole('menu')).toHaveCount(0);
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
