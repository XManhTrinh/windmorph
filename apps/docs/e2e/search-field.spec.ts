import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const VARIANTS = 'components-searchfield--variants';
const PLAYGROUND = 'components-searchfield--playground';
const PAIR = 'components-searchfield--beside-search-bar';
const LONG = 'components-searchfield--long-text';

/** A colour role resolved where `locator` is (inside its theme scope), as `rgb()`. */
const roleColor = (locator: Locator, role: string) =>
  locator.evaluate((el, name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(--md-sys-color-${name})`;
    el.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, role);

const style = (locator: Locator, property: string) =>
  locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);

const pill = (root: Locator) => root.locator('[data-tokens="md-comp-search-bar"]');

test.describe('SearchField visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, VARIANTS, { theme, mode });
        await expect(page.getByTestId('variants')).toHaveScreenshot(
          `variants-${theme}-${mode}.png`,
        );
      });
    }
  }
  for (const contrast of ['medium', 'high'] as const) {
    test(`variants · contrast ${contrast}`, async ({ page }) => {
      await openStory(page, VARIANTS, { contrast });
      await expect(page.getByTestId('variants')).toHaveScreenshot(`variants-${contrast}.png`);
    });
  }
  test('variants · right-to-left', async ({ page }) => {
    await openStory(page, VARIANTS, { dir: 'rtl' });
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-rtl.png');
  });
  test('variants · forced colours', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await openStory(page, VARIANTS);
    await expect(page.getByTestId('variants')).toHaveScreenshot('variants-forced-colors.png');
  });
  for (const dir of ['ltr', 'rtl'] as const) {
    test(`a long hint and query end in an ellipsis · ${dir}`, async ({ page }) => {
      await openStory(page, LONG, { dir });
      await expect(page.getByTestId('long')).toHaveScreenshot(`long-text-${dir}.png`);
    });
  }
});

test('a hint or query longer than the field ends in an ellipsis, not mid-letter', async ({
  page,
}) => {
  await openStory(page, LONG);
  // The hint's own rule (`::placeholder`) isn't reported by `getComputedStyle`; the screenshots
  // above show its ellipsis.
  for (const id of ['hint', 'query', 'bar']) {
    const input = page.getByTestId(id).locator('input');
    expect(await style(input, 'text-overflow'), id).toBe('ellipsis');
  }
  // The query really is longer than its field.
  const query = page.getByTestId('query').locator('input');
  expect(await query.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
});

test.describe('SearchField geometry and colours', () => {
  for (const mode of MODES) {
    test(`paints the search bar tokens' defaults · ${mode}`, async ({ page }) => {
      await openStory(page, VARIANTS, { mode });
      const root = page.getByTestId('with-text');
      const field = pill(root);
      expect(await style(field, 'background-color')).toBe(
        await roleColor(field, 'surface-container-high'),
      );
      const box = (await field.boundingBox())!;
      expect(box.height).toBe(56);
      expect(box.width).toBe(360);
      // Full corners: at least half the height.
      expect(parseFloat(await style(field, 'border-top-left-radius'))).toBeGreaterThanOrEqual(28);
      expect(await style(root.getByRole('searchbox'), 'color')).toBe(
        await roleColor(field, 'on-surface'),
      );
      expect(await style(root.locator('[data-slot="leading"]'), 'color')).toBe(
        await roleColor(field, 'on-surface'),
      );
      expect(await style(root.locator('[data-slot="trailing"]'), 'color')).toBe(
        await roleColor(field, 'on-surface-variant'),
      );
    });
  }

  test('disabled: the content at 38% and the container at 12% of on-surface', async ({ page }) => {
    await openStory(page, VARIANTS);
    const root = page.getByTestId('disabled');
    // `on-surface` at an opacity, mixed as Tailwind's opacity modifier mixes it.
    const faded = (percent: number) =>
      root.evaluate((el, amount) => {
        const probe = document.createElement('span');
        probe.style.color = `color-mix(in oklab, var(--md-sys-color-on-surface) ${amount}%, transparent)`;
        el.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      }, percent);
    expect(await style(pill(root), 'background-color')).toBe(await faded(12));
    expect(await style(root.getByRole('searchbox'), 'color')).toBe(await faded(38));
    await expect(root.getByRole('button')).toHaveCount(0);
  });

  test('a scoped override of the search bar tokens restyles it and the search bar together', async ({
    page,
  }) => {
    await openStory(page, PAIR);
    await page.getByTestId('pair').evaluate((el) => {
      el.style.setProperty('--md-comp-search-bar-container-color', 'rgb(10, 20, 30)');
      el.style.setProperty('--md-comp-search-bar-container-shape', '8px');
    });
    for (const id of ['field', 'bar']) {
      const field = pill(page.getByTestId(id));
      expect(await style(field, 'background-color')).toBe('rgb(10, 20, 30)');
      expect(await style(field, 'border-top-left-radius')).toBe('8px');
    }
  });

  test('draws the same pill as the search bar', async ({ page }) => {
    await openStory(page, PAIR);
    const read = (id: string) =>
      pill(page.getByTestId(id)).evaluate((el) => {
        const s = getComputedStyle(el);
        const input = getComputedStyle(el.querySelector('input')!);
        return [
          s.backgroundColor,
          s.borderRadius,
          el.getBoundingClientRect().height,
          input.font,
          input.paddingInlineStart,
          input.paddingInlineEnd,
        ];
      });
    expect(await read('field')).toEqual(await read('bar'));
  });

  test('right to left: the leading icon at the start, the text after it', async ({ page }) => {
    await openStory(page, VARIANTS, { dir: 'rtl' });
    const root = page.getByTestId('with-text');
    const leading = (await root.locator('[data-slot="leading"]').boundingBox())!;
    const trailing = (await root.locator('[data-slot="trailing"]').boundingBox())!;
    const field = (await pill(root).boundingBox())!;
    expect(field.x + field.width - (leading.x + leading.width)).toBe(4);
    expect(trailing.x - field.x).toBe(4);
  });

  test('keyboard focus draws the inset focus ring around the pill', async ({ page }) => {
    await openStory(page, VARIANTS);
    const field = pill(page.getByTestId('empty'));
    await page.keyboard.press('Tab');
    await expect(page.getByTestId('empty').getByRole('searchbox')).toBeFocused();
    await expect(field).toHaveAttribute('data-focus-visible', 'true');
    expect(await style(field, 'outline-style')).not.toBe('none');
  });

  test("the clear button's touch target is 48px", async ({ page }) => {
    await openStory(page, VARIANTS);
    const clear = page.getByTestId('with-text').getByRole('button', { name: 'Clear search' });
    const box = (await clear.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const hits = await page.evaluate(
      ({ x, y }) =>
        [
          // 23px out each way: a neighbour's target starts at 24px (they meet edge to edge).
          [x - 23, y],
          [x + 23, y],
          [x, y - 23],
          [x, y + 23],
        ].map(([px, py]) =>
          document.elementFromPoint(px!, py!)?.closest('button')?.getAttribute('aria-label'),
        ),
      { x: cx, y: cy },
    );
    expect(hits).toEqual(['Clear search', 'Clear search', 'Clear search', 'Clear search']);
  });
});

test.describe('SearchField behaviour', () => {
  test('filters in place: nothing opens on typing, a press or ↓', async ({ page }) => {
    await openStory(page, PLAYGROUND);
    const input = page.getByRole('searchbox', { name: 'Search settings' });
    await input.click();
    await page.keyboard.type('bat');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('combobox')).toHaveCount(0);
    await expect(page.getByRole('listitem')).toHaveText(['Battery']);
    await expect(input).toBeFocused();
  });

  test('Escape clears, and the clear button clears and keeps focus', async ({ page }) => {
    await openStory(page, PLAYGROUND);
    const input = page.getByRole('searchbox', { name: 'Search settings' });
    await input.fill('blue');
    await page.keyboard.press('Escape');
    await expect(input).toHaveValue('');
    await input.fill('wi');
    await page.getByRole('button', { name: 'Clear search' }).click();
    await expect(input).toHaveValue('');
    await expect(input).toBeFocused();
    await expect(page.getByRole('button', { name: 'Clear search' })).toHaveCount(0);
    await expect(page.getByRole('listitem')).toHaveCount(8);
  });
});

test.describe('SearchField layout safety', () => {
  layoutSafetySuite('components-searchfield--layout-override', {
    // No width: it fills its container, so `fixed` and `absolute` make it the window's width.
    height: 56,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      await target.getByRole('button', { name: 'Voice search' }).click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
      expect(
        await target
          .locator('> div')
          .first()
          .evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
      ).not.toBe('0px');
    },
  });
});
