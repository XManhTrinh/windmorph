import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const box = async (locator: Locator) => {
  const b = (await locator.boundingBox())!;
  return { x: Math.round(b.x), width: Math.round(b.width), bottom: Math.round(b.y + b.height) };
};

const indicator = (page: Page, list: Locator) => list.locator('[aria-hidden="true"]').last();

test.describe('Tabs visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-tabs--variants', { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }

  test('variants · rtl', async ({ page }) => {
    await openStory(page, 'components-tabs--variants', { dir: 'rtl' });
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-rtl.png');
  });
});

test.describe('Tabs behaviour', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`the indicator follows the selection · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-tabs--playground', { dir }, { iconPlacement: 'start' });
      const list = page.getByRole('tablist');
      const sent = page.getByRole('tab', { name: 'Sent' });
      await sent.click();
      await expect(sent).toHaveAttribute('aria-selected', 'true');
      await expect(page.getByRole('tabpanel')).toHaveText('Messages you sent.');
      // Primary: as wide as the icon + label, centred under them, on the row's bottom edge.
      const label = await box(sent.locator('[data-tab-part]').last());
      const icon = await box(sent.locator('[data-tab-part]').first());
      const content = {
        x: Math.min(icon.x, label.x),
        width: Math.max(icon.x + icon.width, label.x + label.width) - Math.min(icon.x, label.x),
      };
      const listBottom = (await box(list)).bottom;
      // Within 1px: the boxes are rounded from sub-pixel widths.
      await expect
        .poll(async () => {
          const bar = await box(indicator(page, list));
          return (
            Math.abs(bar.x - content.x) <= 1 &&
            Math.abs(bar.width - content.width) <= 1 &&
            bar.bottom === listBottom
          );
        })
        .toBe(true);

      // Arrow keys follow the laid-out direction.
      await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      await expect(page.getByRole('tab', { name: 'Drafts' })).toBeFocused();
      await expect(page.getByRole('tab', { name: 'Drafts' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });
  }

  test('tabs are 48px, or 64px with the icon above the label (M3 token)', async ({ page }) => {
    await openStory(page, 'components-tabs--variants');
    const height = (name: string) =>
      page
        .getByRole('tablist', { name })
        .getByRole('tab')
        .first()
        .evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(await height('primary text')).toBe(48);
    expect(await height('primary icons')).toBe(64);
    expect(await height('primary inline icons')).toBe(48);
    expect(await height('secondary icons')).toBe(64);
    // The icon, a 2px gap and the 20px label line are centred: 9px above and below.
    const layout = await page
      .getByRole('tablist', { name: 'primary icons' })
      .getByRole('tab')
      .first()
      .evaluate((tab) => {
        const box = tab.getBoundingClientRect();
        const icon = tab.querySelector('svg')!.getBoundingClientRect();
        return {
          iconTop: Math.round(icon.top - box.top),
          iconBottom: Math.round(icon.bottom - box.top),
        };
      });
    expect(layout).toEqual({ iconTop: 9, iconBottom: 33 });
  });

  test('secondary indicators span the tab', async ({ page }) => {
    await openStory(page, 'components-tabs--playground', {}, { variant: 'secondary' });
    const list = page.getByRole('tablist');
    const drafts = page.getByRole('tab', { name: 'Drafts' });
    await drafts.click();
    const tab = await box(drafts);
    await expect
      .poll(async () => {
        const bar = await box(indicator(page, list));
        return Math.abs(bar.x - tab.x) <= 1 && Math.abs(bar.width - tab.width) <= 1;
      })
      .toBe(true);
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`scrollable indicators sit under the selected label (${dir})`, async ({ page }) => {
      await openStory(page, 'components-tabs--scrollable', { dir });
      const list = page.getByRole('tablist');
      for (const name of ['Overview', 'Reviews', 'Accessories']) {
        const tab = page.getByRole('tab', { name });
        await tab.click();
        await expect
          .poll(async () => {
            const label = await box(tab.locator('[data-tab-part]').first());
            const bar = await box(indicator(page, list));
            return Math.abs(bar.x + bar.width / 2 - (label.x + label.width / 2));
          })
          .toBeLessThan(2);
      }
    });
  }

  test('scrollable rows centre the selected tab', async ({ page }) => {
    await openStory(page, 'components-tabs--scrollable');
    const scroller = page.getByRole('tablist').locator('..');
    expect(await scroller.evaluate((el) => el.scrollLeft)).toBe(0);
    await page.getByRole('tab', { name: 'Reviews' }).click();
    await page.getByRole('tab', { name: 'Accessories' }).click();
    await expect
      .poll(async () => {
        const tab = await box(page.getByRole('tab', { name: 'Accessories' }));
        const frame = await box(scroller);
        return Math.abs(tab.x + tab.width / 2 - (frame.x + frame.width / 2));
      })
      .toBeLessThan(2);
  });
});

test.describe('Tabs layout safety', () => {
  layoutSafetySuite('components-tabs--layout-override', {
    height: 48,
    width: 320,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      const two = target.getByRole('tab', { name: 'Two' });
      expect(await two.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
        'linear-gradient',
      );
      await two.click();
      await expect(two).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await expect(two).toHaveAttribute('data-focus-visible', 'true');
      expect(await two.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
    },
  });
});
