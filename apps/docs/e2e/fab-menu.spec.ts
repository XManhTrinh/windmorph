import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const width = (locator: Locator) =>
  locator.evaluate((el) => Math.round((el as HTMLElement).getBoundingClientRect().width));

test.describe('FabMenu visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`colours · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-fabmenu--colors', { theme, mode });
        await expect(page.getByTestId('colors')).toHaveScreenshot(`colors-${theme}-${mode}.png`);
      });
    }
  }

  test('sizes', async ({ page }) => {
    await openStory(page, 'components-fabmenu--sizes');
    await expect(page.getByTestId('sizes')).toHaveScreenshot('sizes.png');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`trailing edge · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-fabmenu--trailing-edge', { dir });
      await expect(page.getByTestId('trailing-edge')).toHaveScreenshot(`trailing-edge-${dir}.png`);
    });
  }

  test('menu presentation', async ({ page }) => {
    await openStory(page, 'components-fabmenu--menu-presentation');
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(page).toHaveScreenshot('menu-presentation.png');
  });
});

test.describe('FabMenu behaviour', () => {
  test('opens from the button upwards and shrinks a large FAB to the close button', async ({
    page,
  }) => {
    await openStory(page, 'components-fabmenu--playground', {}, { size: 'large', items: '3' });
    const button = page.getByRole('button', { name: 'Create' });
    expect(await width(button)).toBe(96);
    await expect(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    // The stagger shows the bottom item first; the top item is the last to appear.
    const items = page.locator('[data-fab-menu-item]');
    await expect(items.nth(2)).toHaveAttribute('data-visible', 'true');
    await expect(items.nth(0)).toHaveAttribute('data-visible', 'true');
    await expect.poll(() => width(button)).toBe(56);
    // Each item settles at its content's width.
    for (const name of ['Edit', 'Send', 'Star']) {
      const item = page.getByRole('button', { name });
      const content = item.locator(':scope > span');
      await expect.poll(async () => (await width(item)) === (await width(content))).toBe(true);
    }

    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: Send');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
    await expect.poll(() => width(button)).toBe(96);
    await expect(page.getByRole('button', { name: 'Send' })).toBeHidden();
  });

  test('keyboard: Tab and arrows reach the items, Escape closes', async ({ page }) => {
    await openStory(page, 'components-fabmenu--playground', {}, { items: '3' });
    const button = page.getByRole('button', { name: 'Create' });
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Send' })).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('ArrowUp');
    await expect(button).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(button).toBeFocused();
  });

  test('an outside press closes it', async ({ page }) => {
    await openStory(page, 'components-fabmenu--playground');
    const button = page.getByRole('button', { name: 'Create' });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await page.getByTestId('last').click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('FabMenu short windows and web menu', () => {
  test('items scroll behind the close button, which stays reachable', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 280 });
    await openStory(page, 'components-fabmenu--short-window');
    const button = page.getByRole('button', { name: 'Create' });
    const list = page.locator('[data-fab-menu-item]').first().locator('..');
    await expect(page.locator('[data-fab-menu-item]').last()).toHaveAttribute(
      'data-visible',
      'true',
    );
    const metrics = () =>
      list.evaluate((el) => ({
        scrolls: el.scrollHeight > el.clientHeight,
        atBottom: Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 2,
        top: el.getBoundingClientRect().top,
      }));
    // It opens showing the items nearest the button, and stays inside the window.
    expect(await metrics()).toMatchObject({ scrolls: true, atBottom: true });
    expect((await metrics()).top).toBeGreaterThanOrEqual(0);
    // The button paints above the list: hit-testing its centre finds the button.
    const box = (await button.boundingBox())!;
    const hit = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x!, y!)?.closest('button')?.getAttribute('aria-label'),
      [box.x + box.width / 2, box.y + box.height / 2],
    );
    expect(hit).toBe('Create');
    await list.evaluate((el) => el.scrollTo(0, 0));
    await expect(page.getByRole('button', { name: 'Edit' })).toBeInViewport();
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  test('presentation="menu" opens a standard menu 4px above the FAB', async ({ page }) => {
    await openStory(page, 'components-fabmenu--menu-presentation');
    const button = page.getByRole('button', { name: 'Create' });
    await button.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('menu', { name: 'Create' });
    await expect(menu).toBeVisible();
    await expect(menu.getByRole('menuitem').first()).toBeFocused();
    // Measure once the entry animation (a scale from 80%) has finished.
    await expect
      .poll(() => menu.evaluate((el) => getComputedStyle(el.parentElement!).scale))
      .toBe('none');
    const gap = await menu.evaluate(
      (el, buttonTop) => {
        const group = el.firstElementChild!.getBoundingClientRect();
        return Math.round(buttonTop - group.bottom);
      },
      (await button.boundingBox())!.y,
    );
    expect(gap).toBe(4);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('last')).toHaveText('Last action: Send');
    await expect(menu).toBeHidden();
    await expect(button).toBeFocused();
  });
});

test.describe('FabMenu layout safety', () => {
  layoutSafetySuite('components-fabmenu--layout-override', {
    height: 56,
    width: 56,
    radius: '0px',
    interactive: false,
    // The root only positions; its button keeps the state layer, press and focus ring.
    async check(page, target) {
      const button = target.getByRole('button', { name: 'Create' });
      expect(await button.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
        'linear-gradient',
      );
      await button.click();
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(target.locator('[data-fab-menu-item]').first()).toHaveAttribute(
        'data-visible',
        'true',
      );
      await page.keyboard.press('Escape');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(button).toHaveAttribute('data-focus-visible', 'true');
      expect(await button.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    },
  });
});
