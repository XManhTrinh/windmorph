import { expect, test, type Locator, type Page } from '@playwright/test';
import { openStory } from './story';

/**
 * Focus, keyboard and touch-target behaviour that needs a real browser: `inert`, Tab order,
 * hit testing. Each test names the finding it covers (2026-10-15).
 */

async function frames(page: Page) {
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

async function scrollTo(page: Page, y: number) {
  await page.getByTestId('scroller').evaluate((el, top) => el.scrollTo(0, top), y);
  await frames(page);
}

/** Whether the focused element is inside `locator`. */
const focusInside = (locator: Locator) =>
  locator.evaluate((el) => el.contains(document.activeElement));

/**
 * The element hit at a point, as the selector of the closest ancestor matching `match`, or
 * null; the probe for touch targets.
 */
const hitAt = (page: Page, x: number, y: number, match: string) =>
  page.evaluate(
    ({ x, y, match }) => {
      const hit = document.elementFromPoint(x, y)?.closest(match);
      return hit ? (hit.getAttribute('data-probe') ?? hit.outerHTML.slice(0, 80)) : null;
    },
    { x, y, match },
  );

const box = async (locator: Locator) => (await locator.boundingBox())!;

test.describe('scroll-hidden bars leave the Tab order', () => {
  test('a hidden top app bar is inert; keyboard focus keeps it on screen', async ({ page }) => {
    await openStory(
      page,
      'components-topappbar--scrolling',
      {},
      { variant: 'small', scrollBehavior: 'enter-always' },
    );
    const bar = page.getByTestId('bar');
    await scrollTo(page, 400);
    await expect(bar).toHaveAttribute('inert');
    await page.keyboard.press('Tab');
    expect(await focusInside(bar)).toBe(false);
    // Scrolling up brings it back into the Tab order.
    await scrollTo(page, 360);
    await expect(bar).not.toHaveAttribute('inert');
    await page.locator('body').focus();
    await page.keyboard.press('Tab');
    await expect(bar.getByRole('button', { name: 'Back' })).toBeFocused();
    // Focused, it stays fully shown while the page scrolls down.
    await scrollTo(page, 800);
    await expect(bar).not.toHaveAttribute('inert');
    const scroller = await box(page.getByTestId('scroller'));
    expect(Math.round((await box(bar)).y)).toBe(Math.round(scroller.y) + 1);
  });

  test('a hidden navigation bar is inert; keyboard focus keeps it on screen', async ({ page }) => {
    await openStory(page, 'components-navigation--hide-on-scroll');
    const bar = page.getByTestId('bar');
    await scrollTo(page, 400);
    await expect(bar).toHaveAttribute('inert');
    await page.keyboard.press('Tab');
    expect(await focusInside(bar)).toBe(false);
    await scrollTo(page, 350);
    await expect(bar).not.toHaveAttribute('inert');
    await page.locator('body').focus();
    await page.keyboard.press('Tab');
    expect(await focusInside(bar)).toBe(true);
    await scrollTo(page, 900);
    await expect(bar).not.toHaveAttribute('inert');
    expect(await bar.evaluate((el) => el.style.getPropertyValue('--m3-nav-bar-offset'))).toBe(
      '0px',
    );
  });
});

test.describe('sheets', () => {
  test('a modal bottom sheet focuses its drag handle first, not the panel', async ({ page }) => {
    await openStory(page, 'components-sheet--bottom');
    await page.getByRole('button', { name: 'Open sheet' }).click();
    const sheet = page.getByRole('dialog', { name: 'Options' });
    await expect(sheet.getByRole('button', { name: 'Close sheet' })).toBeFocused();
  });

  test('a modal side sheet focuses its first icon button', async ({ page }) => {
    await openStory(page, 'components-sheet--side');
    await page.getByRole('button', { name: /Open/ }).first().click();
    await expect(page.getByRole('dialog').getByRole('button', { name: 'Close' })).toBeFocused();
  });

  test('a collapsed standard sheet’s hidden content is out of the Tab order', async ({ page }) => {
    await openStory(page, 'components-sheet--bottom-standard');
    const sheet = page.getByTestId('sheet');
    await expect(sheet).toHaveAttribute('data-detent', 'collapsed');
    await page.getByRole('button', { name: 'Pressed 0' }).focus();
    await page.keyboard.press('Tab');
    const handle = sheet.getByRole('button', { name: 'Expand sheet' });
    await expect(handle).toBeFocused();
    await page.keyboard.press('Tab');
    expect(await focusInside(sheet)).toBe(false);
    // Expanded, the content is reachable again.
    await handle.focus();
    await page.keyboard.press('Enter');
    await expect(sheet).toHaveAttribute('data-detent', 'expanded');
    await page.keyboard.press('Tab');
    expect(await focusInside(sheet.getByRole('grid', { name: 'Options' }))).toBe(true);
  });
});

test.describe('APG radio groups and toolbars', () => {
  test('a single-select chip set selects on the arrow keys', async ({ page }) => {
    await openStory(page, 'components-chips--single-select');
    await page.getByRole('radio', { name: 'Relevance' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('radio', { name: 'Distance' })).toBeFocused();
    await expect(page.getByRole('radio', { name: 'Distance' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('radio', { name: 'Newest' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  test('a single-select button group selects on the arrow keys; Tab enters at the selection', async ({
    page,
  }) => {
    await openStory(page, 'composites-buttongroup--connected-single-selection');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('radio', { name: 'Week' })).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('selection')).toHaveText('month');
    await page.keyboard.press('End');
    await expect(page.getByTestId('selection')).toHaveText('year');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByTestId('selection')).toHaveText('day');
    await expect(page.getByRole('radio', { name: 'Day' })).toBeFocused();
  });

  test('toolbar arrows wrap, and Home and End reach the ends', async ({ page }) => {
    await openStory(page, 'components-toolbar--floating');
    const toolbar = page.getByRole('toolbar', { name: 'standard expanded' });
    const controls = toolbar.locator('button:not([tabindex="-1"])');
    await controls.first().focus();
    await page.keyboard.press('ArrowLeft');
    await expect(controls.last()).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(controls.first()).toBeFocused();
    await page.keyboard.press('End');
    await expect(controls.last()).toBeFocused();
    await page.keyboard.press('Home');
    await expect(controls.first()).toBeFocused();
  });

  test('Enter in a collapsed search bar opens the search view', async ({ page }) => {
    await openStory(page, 'components-search--collapsed');
    // A plain locator: once open, the collapsed input leaves the accessibility tree.
    const bar = page.locator('input[role="combobox"]').first();
    await bar.focus();
    await page.keyboard.press('Enter');
    await expect(bar).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('searchbox')).toBeFocused();
  });

  test('a FAB’s tooltip doesn’t describe it with its own name', async ({ page }) => {
    await openStory(page, 'components-fab--playground');
    const fab = page.getByRole('button').first();
    await fab.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(fab).not.toHaveAttribute('aria-describedby');
  });
});

test.describe('48px touch targets', () => {
  test('xs and sm sliders take presses 24px either side of their centre line', async ({ page }) => {
    await openStory(page, 'components-slider--sizes');
    for (const size of ['xs', 'sm']) {
      const slider = page.getByRole('group', { name: `Volume ${size}` });
      await slider.evaluate((el) => el.setAttribute('data-probe', 'slider'));
      const r = await box(slider);
      expect(r.height).toBe(44);
      const x = r.x + r.width / 2;
      const middle = r.y + r.height / 2;
      expect(await hitAt(page, x, middle - 23.5, '[data-probe]')).toBe('slider');
      expect(await hitAt(page, x, middle + 23.5, '[data-probe]')).toBe('slider');
      // Not past the 48px.
      expect(await hitAt(page, x, middle - 25, '[data-probe]')).not.toBe('slider');
      expect(await hitAt(page, x, middle + 25, '[data-probe]')).not.toBe('slider');
      await slider.evaluate((el) => el.removeAttribute('data-probe'));
    }
  });

  async function probePeriod(page: Page, layout: 'vertical' | 'horizontal') {
    const options = page
      .getByTestId('picker')
      .first()
      .getByRole('radio', { name: /^(AM|PM)$/ });
    await options.nth(0).evaluate((el) => el.setAttribute('data-probe', 'am'));
    await options.nth(1).evaluate((el) => el.setAttribute('data-probe', 'pm'));
    const am = await box(options.nth(0));
    const pm = await box(options.nth(1));
    expect(Math.min(am.height, pm.height)).toBeLessThan(48);
    if (layout === 'vertical') {
      // Each reaches 48px away from the other: AM upward, PM downward.
      const x = am.x + am.width / 2;
      expect(await hitAt(page, x, am.y + am.height - 47.5, '[data-probe]')).toBe('am');
      expect(await hitAt(page, x, pm.y + 47.5, '[data-probe]')).toBe('pm');
      // They still meet where they did.
      expect(await hitAt(page, x, am.y + am.height - 2, '[data-probe]')).toBe('am');
      expect(await hitAt(page, x, pm.y + 2, '[data-probe]')).toBe('pm');
    } else {
      for (const [name, r] of [
        ['am', am],
        ['pm', pm],
      ] as const) {
        const middle = r.y + r.height / 2;
        expect(await hitAt(page, r.x + r.width / 2, middle - 23.5, '[data-probe]')).toBe(name);
        expect(await hitAt(page, r.x + r.width / 2, middle + 23.5, '[data-probe]')).toBe(name);
      }
    }
  }

  test('the time picker’s AM and PM take 48px-tall presses (dial)', async ({ page }) => {
    await openStory(page, 'components-pickers--time-12');
    await probePeriod(page, 'vertical');
  });

  test('the time picker’s AM and PM take 48px-tall presses (input)', async ({ page }) => {
    await openStory(page, 'components-pickers--time-input');
    await probePeriod(page, 'vertical');
  });

  test('the time picker’s AM and PM take 48px-tall presses (horizontal)', async ({ page }) => {
    await openStory(page, 'components-pickers--time-horizontal');
    await probePeriod(page, 'horizontal');
  });

  test('a small carousel item takes presses 48px wide, never on its neighbours', async ({
    page,
  }) => {
    await openStory(page, 'components-carousel--actionable');
    const slots = page.getByTestId('carousel').locator('[data-slot="item"]');
    await slots.evaluateAll((items) =>
      items.forEach((item) => item.setAttribute('data-probe', item.getAttribute('data-index')!)),
    );
    // The first item whose visible part is narrower than 48px, and its neighbour before it.
    const small = await slots.evaluateAll((items) => {
      const visible = (item: Element) => {
        const mask = item.querySelector<HTMLElement>('[data-slot="hit-area"] + div')!;
        const size = Number.parseFloat(mask.style.getPropertyValue('--m3-carousel-item-size'));
        const r = mask.getBoundingClientRect();
        const inset = (r.width - size) / 2;
        return { size, left: r.left + inset, right: r.right - inset, middle: r.top + r.height / 2 };
      };
      const index = items.findIndex((item) => visible(item).size < 48);
      if (index < 1) return null;
      return {
        index: String(index),
        previous: String(index - 1),
        ...visible(items[index]!),
        previousRight: visible(items[index - 1]!).right,
      };
    });
    expect(small).not.toBeNull();
    const { index, previous, left, right, middle, previousRight } = small!;
    expect(right - left).toBeLessThan(48);
    // Probe every pixel column around it: the run that presses it is 48px wide.
    const hits: number[] = [];
    for (let x = Math.floor(left) - 12; x <= Math.ceil(right) + 12; x++) {
      if ((await hitAt(page, x + 0.5, middle, '[data-probe]')) === index) hits.push(x);
    }
    expect(hits.length).toBeGreaterThanOrEqual(48);
    expect(hits.at(-1)! - hits[0]! + 1).toBe(hits.length);
    // The neighbour's own visible part still presses the neighbour.
    expect(await hitAt(page, previousRight - 1, middle, '[data-probe]')).toBe(previous);
  });
});
