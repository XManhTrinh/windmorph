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
