import { expect, test, type Locator, type Page } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const rect = (locator: Locator) =>
  locator.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      bottom: Math.round(r.bottom),
    };
  });

/** Scrolls the story's scroller and waits for the bar's frame update. */
async function scrollTo(page: Page, y: number) {
  await page.getByTestId('scroller').evaluate((el, top) => el.scrollTo(0, top), y);
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
}

/** How much of the bar shows below the scroller's top edge. */
async function visibleHeight(page: Page) {
  const scroller = await rect(page.getByTestId('scroller'));
  const bar = await rect(page.getByTestId('bar'));
  // The scroller has a 1px border.
  return Math.max(0, bar.bottom - (scroller.y + 1));
}

/**
 * The bar's fill named by the colour role it matches in the bar's own theme scope (canvas
 * pixels, since its `color-mix` computes to `oklab(…)`), its luminance (0–255), and the top
 * row's own background.
 */
const barColours = (bar: Locator) =>
  bar.evaluate((el) => {
    const context = document.createElement('canvas').getContext('2d')!;
    const pixel = (css: string) => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = css;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data];
    };
    const role = (name: string) => {
      const probe = document.createElement('div');
      probe.style.backgroundColor = `var(--md-sys-color-${name})`;
      el.append(probe);
      const css = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return pixel(css).join();
    };
    const rgba = pixel(getComputedStyle(el).backgroundColor);
    const fill = rgba.join();
    return {
      fill:
        fill === role('surface')
          ? 'surface'
          : fill === role('surface-container')
            ? 'surface-container'
            : fill,
      luminance: Math.round(0.2126 * rgba[0]! + 0.7152 * rgba[1]! + 0.0722 * rgba[2]!),
      row: getComputedStyle(el.firstElementChild!).backgroundColor,
    };
  });

test.describe('TopAppBar visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`variants · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-topappbar--variants', { theme, mode });
        await expect(page.getByTestId('bars')).toHaveScreenshot(`variants-${theme}-${mode}.png`);
      });
    }
  }

  test('variants · rtl', async ({ page }) => {
    await openStory(page, 'components-topappbar--variants', { dir: 'rtl' });
    await expect(page.getByTestId('bars')).toHaveScreenshot('variants-rtl.png');
  });

  test('collapsed large bar over content', async ({ page }) => {
    await openStory(page, 'components-topappbar--scrolling', {}, { variant: 'large' });
    await scrollTo(page, 300);
    await expect(page.getByTestId('scroller')).toHaveScreenshot('large-collapsed.png');
  });
});

test.describe('TopAppBar geometry and scrolling', () => {
  test('places the navigation icon, title and actions like Compose', async ({ page }) => {
    await openStory(page, 'components-topappbar--variants');
    const bar = page.getByTestId('bars').locator('header').first();
    const barBox = await rect(bar);
    const back = await rect(bar.getByRole('button', { name: 'Back' }));
    const title = await rect(bar.getByText('Small'));
    const more = await rect(bar.getByRole('button', { name: 'More' }));
    const favourite = await rect(bar.getByRole('button', { name: 'Favourite' }));
    expect(back.x - barBox.x).toBe(8);
    expect(title.x - barBox.x).toBe(56);
    expect(barBox.x + barBox.width - (more.x + more.width)).toBe(8);
    expect(more.x - (favourite.x + favourite.width)).toBe(8);
  });

  for (const [variant, subtitle, height] of [
    ['small', false, 64],
    ['medium', false, 112],
    ['medium', true, 136],
    ['large', false, 120],
    ['large', true, 152],
  ] as const) {
    test(`${variant}${subtitle ? ' with subtitle' : ''} is ${height}px`, async ({ page }) => {
      await openStory(page, 'components-topappbar--scrolling', {}, { variant, subtitle });
      expect(await visibleHeight(page)).toBe(height);
    });
  }

  test('exit-until-collapsed collapses to 64px and expands only near the top', async ({ page }) => {
    await openStory(page, 'components-topappbar--scrolling', {}, { variant: 'medium' });
    const bar = page.getByTestId('bar');
    await scrollTo(page, 24);
    expect(await visibleHeight(page)).toBe(88);
    await scrollTo(page, 400);
    expect(await visibleHeight(page)).toBe(64);
    await expect(bar).toHaveAttribute('data-collapsed', 'true');
    // The content follows the bar: the first visible message sits right under it.
    await scrollTo(page, 300);
    expect(await visibleHeight(page)).toBe(64);
    await scrollTo(page, 0);
    expect(await visibleHeight(page)).toBe(112);
    await expect(bar).not.toHaveAttribute('data-collapsed');
  });

  test('enter-always hides the bar and any scroll up brings it back', async ({ page }) => {
    await openStory(
      page,
      'components-topappbar--scrolling',
      {},
      {
        variant: 'small',
        scrollBehavior: 'enter-always',
      },
    );
    await scrollTo(page, 400);
    expect(await visibleHeight(page)).toBe(0);
    await scrollTo(page, 370);
    expect(await visibleHeight(page)).toBe(30);
    await scrollTo(page, 200);
    expect(await visibleHeight(page)).toBe(64);
  });

  test('an enter-always medium bar stays small on scroll up until back at the top', async ({
    page,
  }) => {
    await openStory(
      page,
      'components-topappbar--scrolling',
      {},
      { variant: 'medium', scrollBehavior: 'enter-always' },
    );
    await scrollTo(page, 24);
    expect(await visibleHeight(page)).toBe(88);
    await scrollTo(page, 400);
    expect(await visibleHeight(page)).toBe(0);
    // Scrolling up brings back the 64px top row only (M3: they remain small until the
    // page is scrolled back to the top).
    await scrollTo(page, 300);
    expect(await visibleHeight(page)).toBe(64);
    await expect(page.getByTestId('bar')).toHaveAttribute('data-collapsed', 'true');
    await scrollTo(page, 24);
    expect(await visibleHeight(page)).toBe(88);
    await scrollTo(page, 0);
    expect(await visibleHeight(page)).toBe(112);
  });

  test('a long expanded title wraps to two lines at most', async ({ page }) => {
    await openStory(page, 'components-topappbar--long-title');
    const title = page.getByTestId('bar').locator('> div').nth(1).locator('> div').first();
    const lineHeight = await title.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
    const height = await title.evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(height)).toBe(Math.round(lineHeight * 2));
  });

  test('a pinned small bar turns surface-container once content is under it', async ({ page }) => {
    await openStory(
      page,
      'components-topappbar--scrolling',
      {},
      {
        variant: 'small',
        scrollBehavior: 'pinned',
      },
    );
    const bar = page.getByTestId('bar');
    const colour = () => bar.evaluate((el) => getComputedStyle(el).backgroundColor);
    const surface = await colour();
    await scrollTo(page, 200);
    await expect(bar).toHaveAttribute('data-scrolled', 'true');
    await expect.poll(colour).not.toBe(surface);
    expect(await visibleHeight(page)).toBe(64);
  });

  for (const [variant, height] of [
    ['medium', 112],
    ['large', 120],
  ] as const) {
    test(`a pinned ${variant} bar fills with surface-container once content is under it`, async ({
      page,
    }) => {
      await openStory(
        page,
        'components-topappbar--scrolling',
        {},
        { variant, scrollBehavior: 'pinned' },
      );
      const bar = page.getByTestId('bar');
      const colours = () => barColours(bar);
      expect((await colours()).fill).toBe('surface');
      await scrollTo(page, 200);
      await expect(bar).toHaveAttribute('data-scrolled', 'true');
      // M3: app bars "fill with a contrasting color on scroll"; pinned, it never collapses.
      await expect.poll(async () => (await colours()).fill).toBe('surface-container');
      expect((await colours()).row).toBe('rgba(0, 0, 0, 0)');
      expect(await visibleHeight(page)).toBe(height);
      await scrollTo(page, 0);
      await expect.poll(async () => (await colours()).fill).toBe('surface');
    });
  }
});

test.describe('TopAppBar theming', () => {
  for (const variant of ['small', 'medium'] as const) {
    test(`a ${variant} bar takes the surface roles of a dark theme scope`, async ({ page }) => {
      // Storybook renders each story in a ThemeScope driven by the toolbar.
      await openStory(
        page,
        'components-topappbar--scrolling',
        { mode: 'dark' },
        { variant, scrollBehavior: 'pinned' },
      );
      const bar = page.getByTestId('bar');
      const before = await barColours(bar);
      expect(before.fill).toBe('surface');
      expect(before.luminance).toBeLessThan(64);
      await scrollTo(page, 200);
      await expect.poll(async () => (await barColours(bar)).fill).toBe('surface-container');
      expect((await barColours(bar)).luminance).toBeLessThan(64);
    });
  }
});

test.describe('TopAppBar bottom slot and scrolled colour', () => {
  test('the bottom row stays below the collapsed top row and takes the bar colour', async ({
    page,
  }) => {
    await openStory(page, 'components-topappbar--scrolling', {}, { bottom: true });
    const chips = page.getByTestId('chips');
    const rows = (await rect(chips)).bottom - (await rect(chips)).y;
    expect(await visibleHeight(page)).toBe(112 + rows);
    await scrollTo(page, 500);
    // Collapsed: the 64px top row with the chips right below it.
    expect(await visibleHeight(page)).toBe(64 + rows);
    const scroller = await rect(page.getByTestId('scroller'));
    expect((await rect(chips)).y).toBe(scroller.y + 1 + 64);
    await expect
      .poll(async () => (await barColours(page.getByTestId('bar'))).fill)
      .toBe('surface-container');
  });

  test('the bottom row hides and comes back with an enter-always bar', async ({ page }) => {
    await openStory(
      page,
      'components-topappbar--scrolling',
      {},
      { variant: 'small', scrollBehavior: 'enter-always', bottom: true },
    );
    await scrollTo(page, 600);
    expect(await visibleHeight(page)).toBe(0);
    await scrollTo(page, 560);
    expect(await visibleHeight(page)).toBe(40);
  });

  test('scrolledColor="transparent" fades the bar to see-through', async ({ page }) => {
    await openStory(
      page,
      'components-topappbar--scrolling',
      {},
      { variant: 'small', scrollBehavior: 'pinned', scrolledColor: 'transparent' },
    );
    const bar = page.getByTestId('bar');
    expect((await barColours(bar)).fill).toBe('surface');
    await scrollTo(page, 200);
    await expect.poll(async () => (await barColours(bar)).fill).toBe('0,0,0,0');
    await scrollTo(page, 0);
    await expect.poll(async () => (await barColours(bar)).fill).toBe('surface');
  });
});

test.describe('A see-through two-row bar while collapsing (2026-10-15)', () => {
  // The expanded title slides up under the top row; with `scrolledColor="transparent"` the
  // top row doesn't hide it, so it's clipped to the part below the row, as Compose clips it.
  for (const variant of ['medium', 'large'] as const) {
    test(`the expanded title never shows under the top row · ${variant}`, async ({ page }) => {
      await openStory(
        page,
        'components-topappbar--scrolling',
        {},
        { variant, scrollBehavior: 'exit-until-collapsed', scrolledColor: 'transparent' },
      );
      const bar = page.getByTestId('bar');
      for (const y of [12, 28, 40]) {
        await scrollTo(page, y);
        const shown = await bar.evaluate((el) => {
          const row = el.children[0]!.getBoundingClientRect();
          const expanded = el.children[1] as HTMLElement;
          const box = expanded.getBoundingClientRect();
          const inset = /inset\(([\d.]+)px/.exec(getComputedStyle(expanded).clipPath);
          return { visibleTop: box.top + Number(inset?.[1] ?? 0), rowBottom: row.bottom };
        });
        expect(shown.visibleTop).toBeGreaterThanOrEqual(shown.rowBottom - 0.5);
      }
    });
  }
});

test.describe('TopAppBar layout safety', () => {
  layoutSafetySuite('components-topappbar--layout-override', {
    height: 64,
    radius: '0px',
    interactive: false,
    async check(page, target) {
      await target.getByRole('button', { name: 'Back' }).click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
    },
  });
});
