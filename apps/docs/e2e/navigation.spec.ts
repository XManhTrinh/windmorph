import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const width = (locator: Locator) =>
  locator.evaluate((el) => Math.round(el.getBoundingClientRect().width));

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
