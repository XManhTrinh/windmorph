import { expect, test } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { underForcedColors } from './forced-colors';
import { openStory } from './story';

test.describe('SplitButton visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants and sizes · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-splitbutton--variants-and-sizes', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  test('icon only', async ({ page }) => {
    await openStory(page, 'components-splitbutton--icon-only');
    await expect(page.getByTestId('icon-only')).toHaveScreenshot('icon-only.png');
  });

  test('disabled', async ({ page }) => {
    await openStory(page, 'components-splitbutton--disabled');
    await expect(page.getByTestId('disabled')).toHaveScreenshot('disabled.png');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    for (const variant of ['filled', 'outlined'] as const) {
      test(`open · ${variant} · ${dir}`, async ({ page }) => {
        await openStory(page, 'components-splitbutton--playground', { dir }, { variant });
        await page.getByRole('button', { name: 'More send options' }).click();
        await expect(page.getByRole('menu')).toBeVisible();
        await page.mouse.move(0, 0);
        await shotWithMargin(page, page.getByTestId('split'), `open-${variant}-${dir}.png`);
      });
    }
  }
});

test.describe('SplitButton behaviour', () => {
  test('the leading button acts, the trailing one opens the menu', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: send');
    await expect(page.getByRole('menu')).toHaveCount(0);

    const trigger = page.getByRole('button', { name: 'More send options' });
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(trigger).toHaveAttribute('data-open', 'true');
    // Round while open: both start corners match the end ones.
    await expect
      .poll(() =>
        trigger.evaluate((el) => {
          const s = getComputedStyle(el);
          return s.borderStartStartRadius === s.borderStartEndRadius;
        }),
      )
      .toBe(true);
    await page.getByRole('menuitem', { name: 'Send later' }).click();
    await expect(page.getByTestId('last')).toHaveText('Last action: later');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  });

  test('keyboard opens and closes the menu', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    const trigger = page.getByRole('button', { name: 'More send options' });
    await expect(trigger).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Send later' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});

test.describe('SplitButton spec geometry', () => {
  test('the menu opens 4px below, aligned with the trailing button end edge', async ({ page }) => {
    for (const dir of ['ltr', 'rtl'] as const) {
      await openStory(page, 'components-splitbutton--playground', { dir });
      const trigger = page.getByRole('button', { name: 'More send options' });
      await trigger.click();
      const menu = page.getByRole('menu');
      await expect(menu).toBeVisible();
      await page.waitForTimeout(500);
      const button = (await trigger.boundingBox())!;
      // In the divider layout (the default) the list is the surface; a gap-layout list
      // extends 8px past its groups (room for their shadows), so inset it.
      const list = (await menu.boundingBox())!;
      const inset = (await menu.getAttribute('data-layout')) === 'gap' ? 8 : 0;
      const surface = {
        top: list.y + inset,
        left: list.x + inset,
        right: list.x + list.width - inset,
      };
      expect(Math.round(surface.top - (button.y + button.height))).toBe(4);
      if (dir === 'ltr')
        expect(Math.abs(surface.right - (button.x + button.width))).toBeLessThan(1);
      else expect(Math.abs(surface.left - button.x)).toBeLessThan(1);
      await page.keyboard.press('Escape');
    }
  });

  test('inner corners change on hover and keyboard focus', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground');
    const send = page.getByRole('button', { name: 'Send', exact: true });
    const trigger = page.getByRole('button', { name: 'More send options' });
    const endRadius = () => send.evaluate((el) => getComputedStyle(el).borderTopRightRadius);
    expect(await endRadius()).toBe('4px');
    await send.hover();
    await expect.poll(endRadius).toBe('12px');
    await page.mouse.move(0, 0);
    await expect.poll(endRadius).toBe('4px');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(trigger).toBeFocused();
    await expect
      .poll(() => trigger.evaluate((el) => getComputedStyle(el).borderTopLeftRadius))
      .toBe('12px');
  });

  test('small halves have 48px touch targets', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground', {}, { size: 'xs' });
    for (const name of ['Send', 'More send options']) {
      const button = page.getByRole('button', { name, exact: true });
      const target = button.locator('[data-touch-target]');
      const box = (await target.boundingBox())!;
      expect(box.height).toBe(48);
      expect(box.width).toBeGreaterThanOrEqual(48);
    }
  });
});

test.describe('SplitButton layout safety', () => {
  layoutSafetySuite('components-splitbutton--layout-override', {
    height: 40,
    radius: '0px',
    interactive: false,
    // The wrapper only positions; its halves keep the state layer, press and focus ring.
    async check(page, target) {
      const send = target.getByRole('button', { name: 'Send', exact: true });
      expect(await send.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
        'linear-gradient',
      );
      await send.click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(send).toHaveAttribute('data-focus-visible', 'true');
      expect(await send.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    },
  });
});

test.describe('SplitButton spec fixes (2026-10-13)', () => {
  test('outlined halves keep their outline inside the padding', async ({ page }) => {
    for (const [size, trailing, leadingStart] of [
      ['xs', 48, 12],
      ['sm', 48, 16],
      ['md', 56, 24],
      ['lg', 96, 48],
      ['xl', 136, 64],
    ] as const) {
      await openStory(
        page,
        'components-splitbutton--playground',
        {},
        { size, variant: 'outlined' },
      );
      const leading = page.getByRole('button', { name: 'Send', exact: true });
      const more = page.getByRole('button', { name: 'More send options' });
      expect((await more.boundingBox())!.width).toBe(trailing);
      const inset = await leading.evaluate(
        (el) =>
          el.querySelector('span')!.getBoundingClientRect().left - el.getBoundingClientRect().left,
      );
      expect(inset).toBe(leadingStart);
    }
  });

  test('a pressed half takes the pressed elevation', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground', {}, { variant: 'elevated' });
    const leading = page.getByRole('button', { name: 'Send', exact: true });
    const rest = await leading.evaluate((el) => getComputedStyle(el).boxShadow);
    const box = (await leading.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await expect
      .poll(() => leading.evaluate((el) => getComputedStyle(el).boxShadow))
      .not.toBe(rest);
    await page.mouse.down();
    await expect.poll(() => leading.evaluate((el) => getComputedStyle(el).boxShadow)).toBe(rest);
    await page.mouse.up();
  });
});

test.describe('SplitButton menu behaviour (2026-10-13)', () => {
  test('at the window edge the menu lines up with the trailing button', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await openStory(page, 'components-splitbutton--at-the-edge');
    const trigger = page.getByRole('button', { name: 'More send options' });
    await trigger.click();
    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();
    await page.waitForTimeout(500);
    const button = (await trigger.boundingBox())!;
    const list = (await menu.boundingBox())!;
    expect(Math.round(button.x + button.width)).toBe(360);
    expect(Math.abs(list.x + list.width - (button.x + button.width))).toBeLessThan(1);
  });

  test('a mouse press shows the pressed shape and opens the menu on release', async ({ page }) => {
    await openStory(page, 'components-splitbutton--playground');
    const trigger = page.getByRole('button', { name: 'More send options' });
    const box = (await trigger.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await expect(trigger).toHaveAttribute('data-pressed', 'true');
    await page.waitForTimeout(500);
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    // Pressed inner corner (S: 12px), not the open circle.
    expect(await trigger.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)).toBe('12px');
    await page.mouse.up();
    await expect(page.getByRole('menu')).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Pressing the trigger again closes the menu.
    await page.mouse.down();
    await page.mouse.up();
    await expect(page.getByRole('menu')).toBeHidden();
  });

  test('under reduced motion the chevron turns without animating', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-splitbutton--playground');
    const trigger = page.getByRole('button', { name: 'More send options' });
    const icon = trigger.locator('[data-motion]');
    expect(await icon.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe('none');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu')).toBeVisible();
    expect(await icon.evaluate((el) => getComputedStyle(el).rotate)).toBe('180deg');
  });
});

// Re-audit 2026-10-15: under forced colours neither half had a boundary.
test.describe('SplitButton forced colours', () => {
  test('both halves keep a boundary and their size', async ({ page }) => {
    await openStory(page, 'components-splitbutton--variants-and-sizes');
    const halves = page.getByTestId('variants').getByRole('button');
    const { before, after } = await underForcedColors(page, halves);
    after.forEach((look, index) => {
      expect(look.borderStyle, `half #${index}`).toBe('solid');
      expect(look.borderWidth, `half #${index}`).toBeGreaterThanOrEqual(1);
      expect(look.width, `half #${index}`).toBe(before[index]!.width);
      expect(look.height, `half #${index}`).toBe(before[index]!.height);
    });
  });
});
