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

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`badges and alignment · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-tabs--badges', { dir });
      await expect(page.getByTestId('badges')).toHaveScreenshot(`badges-${dir}.png`);
    });
  }
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

      // Arrow keys follow the laid-out direction and move focus; Enter selects (M3).
      await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      const drafts = page.getByRole('tab', { name: 'Drafts' });
      await expect(drafts).toBeFocused();
      await expect(drafts).toHaveAttribute('aria-selected', 'false');
      await page.keyboard.press('Enter');
      await expect(drafts).toHaveAttribute('aria-selected', 'true');
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

  test('indicators: primary 3px with rounded top corners, secondary 2px', async ({ page }) => {
    await openStory(page, 'components-tabs--variants');
    const bar = (name: string) =>
      indicator(page, page.getByRole('tablist', { name })).evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          height: Math.round(el.getBoundingClientRect().height),
          top: style.borderTopLeftRadius,
          bottom: style.borderBottomLeftRadius,
        };
      });
    expect(await bar('primary text')).toEqual({ height: 3, top: '3px', bottom: '0px' });
    expect((await bar('secondary text')).height).toBe(2);
  });

  test('centred fixed tabs are as wide as the widest', async ({ page }) => {
    await openStory(page, 'components-tabs--badges');
    const list = page.getByRole('tablist', { name: 'Updates' });
    const widths = await list
      .getByRole('tab')
      .evaluateAll((tabs) => tabs.map((tab) => Math.round(tab.getBoundingClientRect().width)));
    expect(widths[0]).toBe(widths[1]);
    expect((await box(list)).width).toBeLessThan(560);
    await expect(page.getByRole('tab', { name: 'New' })).toHaveAccessibleDescription('999+');
  });

  test('a swipe on a swipeable panel changes tab', async ({ page }) => {
    await openStory(page, 'components-tabs--playground', {}, { swipeable: true });
    const panel = page.getByRole('tabpanel');
    const swipe = (from: number, to: number) =>
      panel.evaluate(
        (el, [start, end]) => {
          const init = { pointerId: 7, pointerType: 'touch', bubbles: true, clientY: 10 };
          el.dispatchEvent(new PointerEvent('pointerdown', { ...init, clientX: start }));
          el.dispatchEvent(new PointerEvent('pointerup', { ...init, clientX: end }));
        },
        [from, to],
      );
    await swipe(300, 100);
    await expect(page.getByRole('tabpanel')).toHaveText('Messages you sent.');
    await swipe(100, 300);
    await expect(page.getByRole('tabpanel')).toHaveText('Everything in one place.');
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

test.describe('Tabs selection colour, page scroll and forced colours', () => {
  test('the first selection after mount fades the colours', async ({ page }) => {
    await openStory(page, 'components-tabs--playground');
    await page.waitForTimeout(300);
    const tab = page.getByRole('tab', { name: 'Drafts' });
    // Sample the newly selected tab's colour on every frame from the press.
    await tab.evaluate((el) => {
      const colours: string[] = [];
      (window as unknown as { __colours: string[] }).__colours = colours;
      const start = performance.now();
      const tick = () => {
        colours.push(getComputedStyle(el).color);
        if (performance.now() - start < 400) requestAnimationFrame(tick);
      };
      el.addEventListener('pointerdown', () => requestAnimationFrame(tick), { once: true });
    });
    await tab.click();
    await page.waitForTimeout(600);
    const colours = await page.evaluate(
      () => (window as unknown as { __colours: string[] }).__colours,
    );
    // A fade passes through colours between the two ends; a jump shows only the two.
    expect(new Set(colours).size, colours.join(' ')).toBeGreaterThan(3);
  });

  test('arrow keys in a scrollable row on screen never scroll the page', async ({ page }) => {
    await openStory(page, 'components-tabs--scrollable');
    const list = page.getByRole('tablist');
    await list.evaluate((el) => {
      document.body.style.padding = '1500px 0 2500px';
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 200);
    });
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(1000);
    await page.getByRole('tab').first().focus();
    const scroller = list.locator('..');
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('ArrowRight');
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(null))));
      expect(await page.evaluate(() => window.scrollY)).toBe(before);
    }
    // The row itself still reveals the focused tab.
    expect(await scroller.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    const focused = await box(page.locator('[role="tab"]:focus'));
    const frame = await box(scroller);
    expect(focused.x + focused.width).toBeLessThanOrEqual(frame.x + frame.width + 1);
  });

  test('an unselected primary tab hovers with an on-surface state layer', async ({ page }) => {
    await openStory(page, 'components-tabs--playground');
    const layer = (name: string) =>
      page.getByRole('tab', { name }).evaluate((el) => {
        const probe = document.createElement('div');
        probe.style.color = 'var(--m3-state-layer-color)';
        el.append(probe);
        const colour = getComputedStyle(probe).color;
        probe.remove();
        return colour;
      });
    const roles = await page.evaluate(() => {
      const probe = document.createElement('div');
      document.body.append(probe);
      probe.style.color = 'var(--md-sys-color-on-surface)';
      const onSurface = getComputedStyle(probe).color;
      probe.style.color = 'var(--md-sys-color-primary)';
      const primary = getComputedStyle(probe).color;
      probe.remove();
      return { onSurface, primary };
    });
    const selected = await page.getByRole('tab', { selected: true }).textContent();
    expect(await layer('Drafts')).toBe(roles.onSurface);
    expect(await layer(selected!.trim())).toBe(roles.primary);
  });

  test('forced colours keep the indicator, the divider and the selected label', async ({
    page,
  }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openStory(page, 'components-tabs--playground');
    const list = page.getByRole('tablist');
    const styles = await list.evaluate((el) => {
      const probe = document.createElement('div');
      probe.style.color = 'Highlight';
      document.body.append(probe);
      const highlight = getComputedStyle(probe).color;
      probe.remove();
      const indicator = el.querySelector('[data-ready]')!;
      const selected = el.querySelector('[role="tab"][aria-selected="true"]')!;
      const other = el.querySelector('[role="tab"][aria-selected="false"]')!;
      return {
        highlight,
        indicator: getComputedStyle(indicator).backgroundColor,
        divider: getComputedStyle(el).borderBottomWidth,
        selected: getComputedStyle(selected).color,
        other: getComputedStyle(other).color,
      };
    });
    expect(styles.indicator).toBe(styles.highlight);
    expect(styles.divider).toBe('1px');
    expect(styles.selected).toBe(styles.highlight);
    expect(styles.other).not.toBe(styles.highlight);
  });
});

test.describe('Tabs first paint and resizing', () => {
  test('the indicator and selected colour appear in place, with no slide or fade', async ({
    page,
  }) => {
    // Sample from the very first frame: the indicator's box and the selected tab's colour.
    await page.addInitScript(() => {
      const samples: { x: number; width: number; color: string }[] = [];
      (window as unknown as { __tabs: typeof samples }).__tabs = samples;
      const tick = () => {
        const indicator = document.querySelector<HTMLElement>('[role="tablist"] > [data-ready]');
        const tab = document.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
        if (indicator && tab) {
          const { x, width } = indicator.getBoundingClientRect();
          samples.push({ x, width, color: getComputedStyle(tab).color });
        }
        if (samples.length < 40) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await openStory(page, 'components-tabs--playground');
    await page.waitForTimeout(800);
    const samples = await page.evaluate(
      () => (window as unknown as { __tabs: { x: number; width: number; color: string }[] }).__tabs,
    );
    expect(samples.length).toBeGreaterThan(5);
    // It never slides: each frame shows it where it was first placed (before the page's
    // styles finished loading, the row may still have had another width) or where it ends.
    const [first, last] = [samples[0]!, samples.at(-1)!];
    const at = (a: { x: number; width: number }, b: { x: number; width: number }) =>
      Math.abs(a.x - b.x) < 0.5 && Math.abs(a.width - b.width) < 0.5;
    for (const sample of samples) {
      expect(at(sample, first) || at(sample, last)).toBe(true);
      expect(sample.color).toBe(last.color);
    }
    // Later selections still slide.
    await page.getByRole('tab', { name: 'Drafts' }).click();
    const list = page.getByRole('tablist');
    expect(
      await indicator(page, list).evaluate((el) => getComputedStyle(el).transitionProperty),
    ).toBe('translate, width');
  });

  test("the indicator follows the selected tab's content when only that resizes", async ({
    page,
  }) => {
    await openStory(page, 'components-tabs--playground');
    const list = page.getByRole('tablist');
    const tab = page.getByRole('tab', { name: 'All' });
    const rowWidth = (await box(list)).width;
    // As when a web font loads after mount: the label widens, the row doesn't.
    await tab
      .locator('[data-tab-part]')
      .last()
      .evaluate((el) => {
        (el as HTMLElement).style.letterSpacing = '6px';
      });
    expect((await box(list)).width).toBe(rowWidth);
    await expect
      .poll(async () => {
        const parts = await tab.locator('[data-tab-part]').evaluateAll((els) => {
          const rects = els.map((el) => el.getBoundingClientRect());
          return Math.max(...rects.map((r) => r.right)) - Math.min(...rects.map((r) => r.left));
        });
        const bar = (await indicator(page, list).boundingBox())!;
        return Math.abs(bar.width - parts);
      })
      .toBeLessThan(1);
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
