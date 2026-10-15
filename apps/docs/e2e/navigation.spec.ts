import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const width = (locator: Locator) =>
  locator.evaluate((el) => Math.round(el.getBoundingClientRect().width));

/** An item's pill (the indicator: the first layer in its pill area). */
const indicator = (item: Locator) => item.locator(':scope > span > span').first();

type Box = { x: number; y: number; width: number };

/**
 * Records `target`'s box every frame from just before `act` until it has been still for a
 * while (or 1.5s), so a test can see where it was mid-transition.
 */
async function sampleWhile(page: Page, target: Locator, act: () => Promise<void>) {
  const handle = await target.elementHandle();
  await page.evaluate((el) => {
    const samples: Box[] = [];
    (window as unknown as { __samples: Box[] }).__samples = samples;
    const start = performance.now();
    const tick = () => {
      const { x, y, width } = el!.getBoundingClientRect();
      samples.push({ x, y, width });
      if (performance.now() - start < 1500) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, handle);
  await act();
  await page.waitForTimeout(1600);
  return page.evaluate(() => (window as unknown as { __samples: Box[] }).__samples);
}

test.describe('Navigation visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`rails · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-navigation--rail-states', { theme, mode });
        await expect(page.getByTestId('rails')).toHaveScreenshot(`rails-${theme}-${mode}.png`);
      });
    }
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`bars · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-navigation--bar', { dir });
      await expect(page.getByTestId('bars')).toHaveScreenshot(`bars-${dir}.png`);
    });
  }
});

test.describe('NavigationRail behaviour', () => {
  test('springs open to fit its widest item and back', async ({ page }) => {
    await openStory(page, 'components-navigation--rail');
    const rail = page.getByTestId('rail');
    expect(await width(rail)).toBe(96);
    await page.getByRole('button', { name: 'Expand navigation' }).click();
    await expect(rail).toHaveAttribute('data-expanded', 'true');
    // "Sent mail" is the widest label: its width + 104px of chrome, at least 220px.
    const label = await width(page.getByText('Sent mail'));
    await expect.poll(() => width(rail)).toBe(Math.max(220, Math.round(label + 104)));
    await page.getByRole('button', { name: 'Starred' }).click();
    await expect(page.getByRole('button', { name: 'Starred' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await page.getByRole('button', { name: 'Collapse navigation' }).click();
    await expect.poll(() => width(rail)).toBe(96);
  });

  test('the modal rail opens over the page and closes on Escape or navigation', async ({
    page,
  }) => {
    await openStory(page, 'components-navigation--modal-rail');
    await page.getByRole('button', { name: 'Expand navigation' }).click();
    const sheet = page.getByRole('dialog', { name: 'Main' });
    await expect(sheet).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page).toHaveScreenshot('modal-rail.png');
    await page.keyboard.press('Escape');
    await expect(sheet).toHaveCount(0);

    await page.getByRole('button', { name: 'Expand navigation' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId('page')).toContainText('Current: search');
  });

  test('the modal rail focuses its first interactive element', async ({ page }) => {
    await openStory(page, 'components-navigation--modal-rail');
    await page.getByRole('button', { name: 'Expand navigation' }).click();
    const sheet = page.getByRole('dialog', { name: 'Main' });
    await expect(sheet.getByRole('button', { name: 'Collapse navigation' })).toBeFocused();
  });

  test('arrow keys move focus between items without choosing one', async ({ page }) => {
    await openStory(page, 'components-navigation--rail');
    const home = page.getByRole('button', { name: 'Home' });
    await home.focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('button', { name: /^Search/ })).toBeFocused();
    await page.keyboard.press('End');
    await expect(page.getByRole('button', { name: 'Sent mail' })).toBeFocused();
    await expect(page.getByTestId('page')).toContainText('Current: home');
  });

  test('the expanded pill expands from the centre of the icon', async ({ page }) => {
    await openStory(page, 'components-navigation--rail', {}, { defaultExpanded: true });
    const starred = page.getByRole('button', { name: /^Starred/ });
    const pill = starred.locator(':scope > span > span').first();
    expect(await pill.evaluate((el) => getComputedStyle(el).clipPath)).toContain('28px');
    await starred.click();
    await expect.poll(() => pill.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`indicatorMotion="slide" slides the expanded pill to the chosen item · ${dir}`, async ({
      page,
    }) => {
      await openStory(page, 'components-navigation--sliding-rail', { dir });
      const home = page.getByRole('button', { name: 'Home' });
      const sent = page.getByRole('button', { name: 'Sent mail' });
      await expect(page.getByTestId('rail')).toHaveAttribute('data-expanded', 'true');
      // Let the rail's width settle before measuring.
      await page.waitForTimeout(800);
      const from = (await indicator(home).boundingBox())!;
      const samples = await sampleWhile(page, indicator(sent), () => sent.click());
      await expect(sent).toHaveAttribute('aria-current', 'page');
      const to = (await indicator(sent).boundingBox())!;
      // It ends on Sent mail's row, wider for the longer label, and passed between the two.
      expect(to.y).toBeGreaterThan(from.y + 100);
      expect(to.width).toBeGreaterThan(from.width);
      const between = samples.filter((box) => box.y > from.y + 20 && box.y < to.y - 20);
      expect(between.length).toBeGreaterThan(0);
      // Its start edge never moves (left in LTR, right in RTL); only its width changes.
      for (const box of samples) {
        if (dir === 'ltr') expect(Math.abs(box.x - to.x)).toBeLessThan(1);
        else expect(Math.abs(box.x + box.width - (to.x + to.width))).toBeLessThan(1);
      }
      // The old pill goes at once.
      expect(await indicator(home).evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
      await page.mouse.move(0, 0);
      await expect(sent.locator(':scope > span').first()).toHaveScreenshot(
        `rail-slide-settled-${dir}.png`,
      );
    });
  }

  test('by default the expanded pill expands in place', async ({ page }) => {
    await openStory(page, 'components-navigation--rail', {}, { defaultExpanded: true });
    const sent = page.getByRole('button', { name: 'Sent mail' });
    await page.waitForTimeout(800);
    const samples = await sampleWhile(page, indicator(sent), () => sent.click());
    const to = (await indicator(sent).boundingBox())!;
    expect(samples.length).toBeGreaterThan(0);
    for (const box of samples) expect(Math.abs(box.y - to.y)).toBeLessThan(1);
  });

  test('indicatorMotion="slide" still expands in place in the collapsed rail', async ({ page }) => {
    await openStory(page, 'components-navigation--sliding-rail', {}, { defaultExpanded: false });
    const sent = page.getByRole('button', { name: 'Sent mail' });
    const samples = await sampleWhile(page, indicator(sent), () => sent.click());
    const to = (await indicator(sent).boundingBox())!;
    for (const box of samples) expect(Math.abs(box.y - to.y)).toBeLessThan(1);
    expect(await indicator(sent).evaluate((el) => getComputedStyle(el).transitionProperty)).toBe(
      'clip-path, opacity',
    );
  });

  test('indicatorMotion="slide" fades in place under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-navigation--sliding-rail');
    const sent = page.getByRole('button', { name: 'Sent mail' });
    await page.waitForTimeout(800);
    const samples = await sampleWhile(page, indicator(sent), () => sent.click());
    const to = (await indicator(sent).boundingBox())!;
    for (const box of samples) expect(Math.abs(box.y - to.y)).toBeLessThan(1);
    expect(await indicator(sent).evaluate((el) => getComputedStyle(el).transitionProperty)).toBe(
      'opacity',
    );
  });

  test('centred items sit in the middle of the space below the header', async ({ page }) => {
    await openStory(page, 'components-navigation--centered-rail');
    const rail = await page.getByTestId('rail').boundingBox();
    const items = await page.getByRole('button', { name: 'Home' }).locator('..').boundingBox();
    const header = await page
      .getByRole('button', { name: 'Expand navigation' })
      .locator('..')
      .boundingBox();
    const below = rail!.y + rail!.height - items!.y - items!.height;
    const above = items!.y - (header!.y + header!.height);
    expect(Math.abs(below - above)).toBeLessThan(2);
  });

  test('items are keyboard reachable with a pill focus ring', async ({ page }) => {
    await openStory(page, 'components-navigation--rail-states');
    const home = page.getByRole('navigation', { name: 'Collapsed' }).getByRole('button', {
      name: 'Home',
    });
    await home.focus();
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(home).toHaveAttribute('data-focus-visible', 'true');
    const pill = home.locator(':scope > span').first();
    expect(await pill.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
  });
});

test.describe('NavigationBar behaviour', () => {
  test('hides on scroll down and returns on scroll up', async ({ page }) => {
    await openStory(page, 'components-navigation--hide-on-scroll');
    const scroller = page.getByTestId('scroller');
    const bar = page.getByTestId('bar');
    const offset = () =>
      bar.evaluate((el) => (el as HTMLElement).style.getPropertyValue('--m3-nav-bar-offset'));
    const height = await bar.evaluate((el) => (el as HTMLElement).offsetHeight);
    await scroller.evaluate((el) => el.scrollBy(0, 300));
    await expect.poll(offset).toBe(`-${height}px`);
    await scroller.evaluate((el) => el.scrollBy(0, -20));
    await expect.poll(offset).toBe(`-${height - 20}px`);
  });

  test('inline items are centred with the extra space at the ends', async ({ page }) => {
    await openStory(page, 'components-navigation--bar');
    const bar = page.getByRole('navigation', { name: 'Bar start' });
    const box = (await bar.boundingBox())!;
    const first = (await bar.getByRole('button', { name: 'Home' }).boundingBox())!;
    const last = (await bar.getByRole('button', { name: 'Sent mail' }).boundingBox())!;
    expect(first.x - box.x).toBeGreaterThan(16);
    expect(Math.abs(first.x - box.x - (box.x + box.width - last.x - last.width))).toBeLessThan(2);
  });
});

test.describe('NavigationBar measurements', () => {
  test('items stretch to the 64px bar; inline pills sit in its middle', async ({ page }) => {
    await openStory(page, 'components-navigation--bar');
    for (const name of ['Bar top', 'Bar start']) {
      const bar = page.getByRole('navigation', { name }).first();
      const barBox = (await bar.boundingBox())!;
      expect(barBox.height).toBe(64);
      for (const item of await bar.getByRole('button').all()) {
        const itemBox = (await item.boundingBox())!;
        // The whole height is the touch target (at least 48px).
        expect(itemBox.y).toBe(barBox.y);
        expect(itemBox.height).toBe(64);
        if (name === 'Bar start') {
          const pill = (await item.locator(':scope > span').first().boundingBox())!;
          expect(pill.height).toBe(40);
          expect(pill.y + pill.height / 2).toBeCloseTo(barBox.y + 32, 0);
        }
      }
    }
  });
});

test.describe('Navigation item ripple', () => {
  /** The pill's state layer (its second layer, after the indicator). */
  const stateLayer = (item: Locator) => item.locator(':scope > span > span').nth(1);

  for (const story of ['bar', 'rail'] as const) {
    test(`a press ripples through the pill from the press point · ${story}`, async ({ page }) => {
      await openStory(page, `components-navigation--${story}`);
      const item = page.getByRole('button', { name: /^Search/ }).first();
      const layer = stateLayer(item);
      const pill = (await layer.boundingBox())!;
      await page.mouse.move(pill.x + 8, pill.y + 8);
      await page.mouse.down();
      await expect(layer).toHaveAttribute('data-rippling', 'true');
      // The origin is the press point in the pill's own box, and the ripple shows.
      expect(await layer.evaluate((el) => el.style.getPropertyValue('--m3-ripple-origin-x'))).toBe(
        '8px',
      );
      await expect
        .poll(() =>
          layer.evaluate((el) =>
            Number(getComputedStyle(el).getPropertyValue('--m3-ripple-opacity')),
          ),
        )
        .toBeGreaterThan(0.05);
      expect(await layer.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
        'radial-gradient',
      );
      expect(await layer.evaluate((el) => getComputedStyle(el).borderRadius)).not.toBe('0px');
      await page.mouse.up();
      await expect(layer).not.toHaveAttribute('data-rippling');
    });
  }
});

test.describe('NavigationRail width motion', () => {
  /** Every item's height and icon top, sampled each frame for `ms` after `act`. */
  async function sampleItems(page: Page, scope: string, act: () => Promise<void>, ms = 900) {
    await page.evaluate(
      ({ scope, ms }) => {
        const samples: { heights: number[]; icons: number[] }[] = [];
        (window as unknown as { __items: typeof samples }).__items = samples;
        const start = performance.now();
        const tick = () => {
          const items = [...document.querySelectorAll<HTMLElement>(`${scope} [data-nav-item]`)];
          if (items.length)
            samples.push({
              heights: items.map((item) => Math.round(item.getBoundingClientRect().height)),
              icons: items.map((item) =>
                Math.round(item.querySelector('svg')!.getBoundingClientRect().top),
              ),
            });
          if (performance.now() - start < ms) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { scope, ms },
    );
    await act();
    await page.waitForTimeout(ms + 100);
    return page.evaluate(
      () => (window as unknown as { __items: { heights: number[]; icons: number[] }[] }).__items,
    );
  }

  test('labels stay on one line while the rail widens, so no icon moves', async ({ page }) => {
    await openStory(page, 'components-navigation--rail');
    const rail = page.getByTestId('rail');
    const samples = await sampleItems(page, '[data-testid="rail"]', () =>
      page.getByRole('button', { name: 'Expand navigation' }).click(),
    );
    await expect(rail).not.toHaveAttribute('data-widening');
    const last = samples.at(-1)!;
    expect(samples.length).toBeGreaterThan(10);
    // From the first expanded frame on (collapsed items are 64px, expanded ones 56px).
    const expanded = samples.findIndex((sample) => sample.heights[0] !== samples[0]!.heights[0]);
    expect(expanded).toBeGreaterThan(0);
    for (const sample of samples.slice(expanded)) {
      // Expanded items are 56px; none grows taller mid-transition.
      expect(Math.max(...sample.heights)).toBeLessThanOrEqual(Math.max(...last.heights));
      sample.icons.forEach((top, index) =>
        expect(Math.abs(top - last.icons[index]!)).toBeLessThan(2),
      );
    }
  });

  test('the modal rail grows without its labels wrapping', async ({ page }) => {
    await openStory(page, 'components-navigation--modal-rail');
    const samples = await sampleItems(page, '[role="dialog"]', () =>
      page.getByRole('button', { name: 'Expand navigation' }).click(),
    );
    const last = samples.at(-1)!;
    expect(samples.length).toBeGreaterThan(10);
    for (const sample of samples) {
      expect(Math.max(...sample.heights)).toBeLessThanOrEqual(Math.max(...last.heights));
      sample.icons.forEach((top, index) =>
        expect(Math.abs(top - last.icons[index]!)).toBeLessThan(2),
      );
    }
  });
});

test.describe('NavigationBar layout safety', () => {
  layoutSafetySuite('components-navigation--layout-override', {
    height: 64,
    width: 360,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      const search = target.getByRole('button', { name: 'Search' });
      await search.click();
      await expect(page.getByTestId('count')).toHaveText('Current search');
      await expect(search).toHaveAttribute('aria-current', 'page');
    },
  });
});

test.describe('NavigationRail layout safety', () => {
  layoutSafetySuite('components-navigation--rail-layout-override', {
    height: 360,
    width: 96,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      const search = target.getByRole('button', { name: 'Search' });
      await search.click();
      await expect(page.getByTestId('count')).toHaveText('Current search');
      await expect(search).toHaveAttribute('aria-current', 'page');
    },
  });
});

test.describe('Navigation motion edges and forced colours', () => {
  /** Records the dialog's box on every frame while `act` runs, until it has gone. */
  async function sampleSheet(page: Page, act: () => Promise<void>) {
    await page.evaluate(() => {
      const samples: { x: number; width: number }[] = [];
      (window as unknown as { __sheet: typeof samples }).__sheet = samples;
      const start = performance.now();
      const tick = () => {
        const sheet = document.querySelector('[role="dialog"]');
        if (sheet) {
          const { x, width } = sheet.getBoundingClientRect();
          samples.push({ x, width });
        }
        if (performance.now() - start < 1500) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await act();
    await page.waitForTimeout(1600);
    return page.evaluate(
      () => (window as unknown as { __sheet: { x: number; width: number }[] }).__sheet,
    );
  }

  // The hidden rail's sheet slides in on the default spatial spring (Compose): the fast one
  // overshot 21px off the window edge (2026-10-15).
  test('the modal sheet of a hidden rail never leaves a gap at the window edge', async ({
    page,
  }) => {
    await openStory(page, 'components-navigation--modal-rail', {}, { hideOnCollapse: true });
    const samples = await sampleSheet(page, () =>
      page.getByRole('button', { name: 'Open navigation' }).click(),
    );
    expect(samples.length).toBeGreaterThan(5);
    expect(Math.max(...samples.map((sample) => sample.x))).toBeLessThan(6);
  });

  // The sheet stays until its own width spring ends, not the scrim's shorter fade.
  test('the modal sheet shrinks back to the collapsed rail before it goes', async ({ page }) => {
    await openStory(page, 'components-navigation--modal-rail');
    await page.getByRole('button', { name: 'Expand navigation' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.waitForTimeout(800);
    const samples = await sampleSheet(page, () => page.keyboard.press('Escape'));
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(
      Math.abs(samples.at(-1)!.width - 96),
      samples.map((s) => s.width).join(' '),
    ).toBeLessThan(2);
  });

  test('forced colours keep the current pill', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    const system = (colour: string) =>
      page.evaluate((value) => {
        const probe = document.createElement('div');
        probe.style.color = value;
        document.body.append(probe);
        const resolved = getComputedStyle(probe).color;
        probe.remove();
        return resolved;
      }, colour);
    for (const story of ['bar', 'rail']) {
      await openStory(page, `components-navigation--${story}`);
      const highlight = await system('Highlight');
      const highlightText = await system('HighlightText');
      const current = page.locator('[aria-current="page"]').first();
      expect(await indicator(current).evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
        highlight,
      );
      expect(
        await current
          .locator('svg')
          .first()
          .evaluate((el) => getComputedStyle(el).color),
      ).toBe(highlightText);
    }
  });
});
