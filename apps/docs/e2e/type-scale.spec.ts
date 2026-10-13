import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './story';

/*
 * Type is in rem and layout in px (2026-10-13): text follows the reader's browser font size,
 * as Android's sp follows the system font scale, while containers keep their dp sizes. These
 * checks set a 32px root (a 200% font size) and expect every type role to double, and the
 * containers that used to have a fixed height to grow around their text instead of clipping it.
 */

/** A few roles of the M3 type scale at the default 16px root: size, line height, tracking. */
const ROLES = {
  'display-large': [57, 64, -0.2],
  'headline-small': [24, 32, 0],
  'title-large': [22, 28, 0],
  'title-medium': [16, 24, 0.2],
  'body-large': [16, 24, 0.5],
  'body-medium': [14, 20, 0.2],
  'label-large': [14, 20, 0.1],
  'label-small': [11, 16, 0.5],
} as const;

/** Sets the root font size, as a reader's browser font-size setting does. */
const setRootFontSize = (page: Page, px: number) =>
  page.addStyleTag({ content: `html { font-size: ${px}px; }` });

/** The computed size, line height and tracking of each role, read through its tokens. */
const measureRoles = (page: Page) =>
  page.evaluate((roles) => {
    const probe = document.createElement('span');
    document.body.append(probe);
    const result = Object.fromEntries(
      roles.map((role) => {
        const token = `--md-sys-typescale-${role}`;
        probe.style.fontSize = `var(${token}-size)`;
        probe.style.lineHeight = `var(${token}-line-height)`;
        probe.style.letterSpacing = `var(${token}-tracking)`;
        const style = getComputedStyle(probe);
        const px = (value: string) => (value === 'normal' ? 0 : Number.parseFloat(value));
        return [role, [px(style.fontSize), px(style.lineHeight), px(style.letterSpacing)]];
      }),
    );
    probe.remove();
    return result;
  }, Object.keys(ROLES));

/** How far the text inside `text` reaches above or below `container`, in px (0 when it fits). */
async function overflow(text: Locator, container: Locator) {
  const inner = await text.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const { top, bottom } = range.getBoundingClientRect();
    return { top, bottom };
  });
  const outer = (await container.boundingBox())!;
  return Math.max(0, outer.y - inner.top, inner.bottom - (outer.y + outer.height));
}

const fontSize = (locator: Locator) =>
  locator.evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));

test.describe('Type scale follows the root font size', () => {
  test('every role is the spec value at the default 16px root', async ({ page }) => {
    await openStory(page, 'components-button--variants');
    const measured = await measureRoles(page);
    for (const [role, [size, lineHeight, tracking]] of Object.entries(ROLES)) {
      expect(measured[role], role).toEqual([size, lineHeight, tracking]);
    }
  });

  test('every role doubles at a 32px root', async ({ page }) => {
    await openStory(page, 'components-button--variants');
    await setRootFontSize(page, 32);
    const measured = await measureRoles(page);
    for (const [role, [size, lineHeight, tracking]] of Object.entries(ROLES)) {
      expect(measured[role], role).toEqual([size * 2, lineHeight * 2, tracking * 2]);
    }
  });

  test("a component's text doubles while its layout keeps its px sizes", async ({ page }) => {
    await openStory(page, 'components-dialog--basic');
    await setRootFontSize(page, 32);
    const trigger = page.getByRole('button').first();
    await trigger.click();
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(600);
    // headline-small 24px and body-medium 14px, doubled.
    expect(await fontSize(dialog.getByRole('heading'))).toBe(48);
    expect(await fontSize(dialog.getByRole('button').first())).toBe(28);
    // Layout stays in px: the panel keeps its 24px padding and 28px corners.
    const panel = await dialog.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.paddingTop, style.borderTopLeftRadius];
    });
    expect(panel).toEqual(['24px', '28px']);
  });
});

test.describe('Containers grow around 200% text instead of clipping it', () => {
  test.beforeEach(({ page }) => page.setViewportSize({ width: 1280, height: 1400 }));

  test('the small top app bar grows to fit its title and subtitle', async ({ page }) => {
    await openStory(page, 'components-topappbar--variants');
    await setRootFontSize(page, 32);
    const subtitle = page.getByText('Subtitle', { exact: true }).first();
    const row = subtitle.locator('xpath=ancestor::div[contains(@class, "grid")][1]');
    expect(await overflow(subtitle, row)).toBe(0);
    expect((await row.boundingBox())!.height).toBeGreaterThan(64);
  });

  test('a tab with its icon on top grows to fit its label', async ({ page }) => {
    await openStory(page, 'components-tabs--variants');
    await setRootFontSize(page, 32);
    // The first "Search" tab has its icon on top: 24px icon, 2px gap, 40px label line.
    const tab = page.getByRole('tab', { name: 'Search' }).first();
    expect(await tab.evaluate((element) => getComputedStyle(element).flexDirection)).toBe('column');
    expect((await tab.boundingBox())!.height).toBeGreaterThanOrEqual(66);
    expect(await overflow(tab.getByText('Search'), tab)).toBe(0);
  });

  test("the time picker's period selector shows AM and PM in full", async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    await setRootFontSize(page, 32);
    const period = page
      .getByRole('radiogroup')
      .or(page.getByRole('group'))
      .filter({ hasText: 'PM' });
    for (const label of ['AM', 'PM']) {
      expect(await overflow(period.getByText(label, { exact: true }), period), label).toBe(0);
    }
  });

  test('a large badge grows around its label', async ({ page }) => {
    await openStory(page, 'components-badge--badges');
    await setRootFontSize(page, 32);
    const badge = page.getByTestId('badges').getByText('999+').first();
    const container = badge.locator(
      'xpath=ancestor-or-self::span[contains(@class, "bg-error")][1]',
    );
    expect(await overflow(badge, container)).toBe(0);
  });
});

/**
 * Each navigation label in `scope`: the words split across two lines (none may be), whether
 * its text is wider than the label, its `text-overflow`, and how many lines it takes.
 */
const navLabels = (scope: Locator) =>
  scope.locator('[data-nav-label]').evaluateAll((labels) =>
    labels.map((label) => {
      const tops = (rects: DOMRectList) =>
        new Set([...rects].filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top)));
      const split: string[] = [];
      const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (const match of (node.textContent ?? '').matchAll(/\S+/g)) {
          const range = document.createRange();
          range.setStart(node, match.index);
          range.setEnd(node, match.index + match[0].length);
          if (tops(range.getClientRects()).size > 1) split.push(match[0]);
        }
      }
      const whole = document.createRange();
      whole.selectNodeContents(label);
      const style = getComputedStyle(label);
      return {
        text: label.textContent ?? '',
        split,
        overflows: label.scrollWidth > label.clientWidth + 0.5,
        ellipsis: style.textOverflow === 'ellipsis' && style.overflowX === 'hidden',
        lines: tops(whole.getClientRects()).size,
      };
    }),
  );

test.describe('Navigation labels at a 32px root (2026-10-13)', () => {
  test.beforeEach(({ page }) => page.setViewportSize({ width: 1280, height: 1400 }));

  /** No label breaks inside a word; one too wide for its item ends with an ellipsis. */
  const expectWordBreaks = (labels: Awaited<ReturnType<typeof navLabels>>) => {
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.split, `${label.text}: split inside a word`).toEqual([]);
      expect(label.ellipsis, `${label.text}: ellipsis`).toBe(true);
    }
  };

  test('bar labels, stacked and inline, wrap only between words', async ({ page }) => {
    await openStory(page, 'components-navigation--bar');
    await setRootFontSize(page, 32);
    const bars = page.getByTestId('bars').getByRole('navigation');
    await expect(bars).toHaveCount(3);
    for (const bar of await bars.all()) expectWordBreaks(await navLabels(bar));
    // The narrow bar's "Recently shared files": "Recently" alone is wider than its item, so
    // it ends with an ellipsis on its own line, and the other words wrap below it.
    const narrow = await navLabels(bars.nth(2));
    const long = narrow.find((label) => label.text === 'Recently shared files')!;
    expect(long.overflows).toBe(true);
    expect(long.lines).toBeGreaterThan(1);
  });

  test('a one-word label too wide for its item stays on one line with an ellipsis', async ({
    page,
  }) => {
    await openStory(page, 'components-navigation--bar');
    await setRootFontSize(page, 48);
    const stacked = await navLabels(page.getByTestId('bars').getByRole('navigation').first());
    expectWordBreaks(stacked);
    const word = stacked.find((label) => !/\s/.test(label.text) && label.overflows);
    expect(word, 'a one-word label wider than its item').toBeDefined();
    expect(word!.lines).toBe(1);
  });

  for (const expanded of [false, true]) {
    test(`${expanded ? 'expanded' : 'collapsed'} rail labels wrap only between words`, async ({
      page,
    }) => {
      await openStory(page, 'components-navigation--rail', {}, { defaultExpanded: expanded });
      await setRootFontSize(page, 32);
      const rail = page.getByTestId('rail');
      await page.waitForTimeout(600);
      expectWordBreaks(await navLabels(rail));
    });
  }
});
