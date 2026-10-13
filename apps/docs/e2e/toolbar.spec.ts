import { expect, test, type Locator, type Page } from '@playwright/test';
import { iconTransitionSuite } from './icon-faces';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

const box = (locator: Locator) =>
  locator.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };
  });

test.describe('Toolbar visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`floating · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-toolbar--floating', { theme, mode });
        await expect(page.getByTestId('floating')).toHaveScreenshot(
          `floating-${theme}-${mode}.png`,
        );
      });
    }
  }

  for (const mode of MODES) {
    test(`with FAB · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-toolbar--with-fab', { mode });
      await expect(page.getByTestId('with-fab')).toHaveScreenshot(`with-fab-${mode}.png`);
    });
    test(`docked · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-toolbar--docked', { mode });
      await expect(page.getByTestId('docked')).toHaveScreenshot(`docked-${mode}.png`);
    });
  }

  for (const mode of MODES) {
    test(`button colours · ${mode}`, async ({ page }) => {
      await openStory(page, 'components-toolbar--button-colors', { mode });
      await expect(page.getByTestId('button-colors')).toHaveScreenshot(`button-colors-${mode}.png`);
    });
  }

  test('with FAB · rtl', async ({ page }) => {
    await openStory(page, 'components-toolbar--with-fab', { dir: 'rtl' });
    await expect(page.getByTestId('with-fab')).toHaveScreenshot('with-fab-rtl.png');
  });
});

test.describe('Toolbar geometry', () => {
  test('floating toolbar spacing reproduces Compose for 40px icon buttons', async ({ page }) => {
    await openStory(page, 'components-toolbar--collapse');
    const toolbar = page.getByTestId('toolbar');
    // 8px padding + 4px each end of every group + 8px between items:
    // leading 48 + main 3×40 + 2×8 + 8 + trailing 48 + 16 = 256.
    expect(await box(toolbar)).toMatchObject({ width: 256, height: 64 });
    const edit = await box(page.getByRole('button', { name: 'Edit' }));
    const bold = await box(page.getByRole('button', { name: 'Bold' }));
    const start = (await box(toolbar)).x;
    expect(edit.x - start).toBe(12);
    expect(bold.x - (edit.x + edit.width)).toBe(8);
  });

  test('collapsing clips leading and trailing content; focusing it expands the toolbar', async ({
    page,
  }) => {
    await openStory(page, 'components-toolbar--collapse');
    const toolbar = page.getByTestId('toolbar');
    await page.getByRole('button', { name: 'Collapse' }).click();
    await expect.poll(async () => (await box(toolbar)).width).toBe(160);
    // Clipped to nothing once the track has closed, but still in the accessibility tree.
    const clip = () =>
      page
        .getByRole('button', { name: 'Edit' })
        .evaluate((el) => getComputedStyle(el.parentElement!.parentElement!).clipPath);
    await expect.poll(clip).toBe('inset(50%)');

    // Focus reaching the collapsed controls expands the toolbar.
    await page.getByRole('button', { name: 'Expand' }).focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Edit' })).toBeFocused();
    await expect(toolbar).toHaveAttribute('data-expanded', 'true');
    await expect.poll(clip).not.toBe('inset(50%)');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('button', { name: 'Bold' })).toBeFocused();
    // Tab moves on through the controls (M3), keeping it expanded, then out, collapsing it.
    for (const name of ['Italic', 'Underline', 'Delete']) {
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name })).toBeFocused();
      await expect(toolbar).toHaveAttribute('data-expanded', 'true');
    }
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'After' })).toBeFocused();
    await expect(toolbar).toHaveAttribute('data-expanded', 'false');
  });

  test('vertical collapse shrinks the height', async ({ page }) => {
    await openStory(page, 'components-toolbar--collapse', {}, { vertical: true });
    const toolbar = page.getByTestId('toolbar');
    expect(await box(toolbar)).toMatchObject({ width: 64, height: 256 });
    await page.getByRole('button', { name: 'Collapse' }).click();
    await expect.poll(async () => (await box(toolbar)).height).toBe(160);
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`with a FAB, collapsing keeps the size and grows the FAB · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-toolbar--collapse', { dir }, { withFab: true });
      const toolbar = page.getByTestId('toolbar');
      const fab = page.getByTestId('fab');
      const expanded = await box(toolbar);
      // Toolbar 12 + 3×40 + 2×8 + 12 = 160, gap 8, FAB 56; 80px tall for the grown FAB.
      expect(expanded).toMatchObject({ width: 224, height: 80 });
      expect(await box(fab)).toMatchObject({ width: 56, height: 56 });

      await page.getByRole('button', { name: 'Collapse' }).click();
      // Polled until the springs settle: the FAB grows to 80px, the toolbar keeps its size, and
      // the FAB stays at the end edge, growing towards the toolbar.
      await expect
        .poll(async () => {
          const [toolbarBox, fabBox] = await Promise.all([box(toolbar), box(fab)]);
          return {
            toolbar: toolbarBox,
            fab: { width: fabBox.width, height: fabBox.height },
            fabEndEdge: dir === 'ltr' ? fabBox.x + fabBox.width : fabBox.x,
          };
        })
        .toEqual({
          toolbar: expanded,
          fab: { width: 80, height: 80 },
          fabEndEdge: dir === 'ltr' ? expanded.x + expanded.width : expanded.x,
        });
      // The toolbar has faded to nothing; its controls stay reachable by focus.
      const surface = page.getByRole('button', { name: 'Bold' }).locator('../..');
      await expect.poll(() => surface.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
      await page.getByRole('button', { name: 'Expand' }).focus();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Bold' })).toBeFocused();
      await expect(toolbar).toHaveAttribute('data-expanded', 'true');
    });
  }

  test('scrolling collapses and expands the toolbar', async ({ page }) => {
    await openStory(page, 'components-toolbar--scroll-expansion');
    const toolbar = page.getByTestId('toolbar');
    const scroller = page.getByTestId('scroller');
    await scroller.evaluate((el) => el.scrollTo(0, 200));
    await expect(toolbar).toHaveAttribute('data-expanded', 'false');
    await scroller.evaluate((el) => el.scrollTo(0, 100));
    await expect(toolbar).toHaveAttribute('data-expanded', 'true');
  });
});

test.describe('Toolbar keyboard (M3: Tab or arrows)', () => {
  const focusedName = (page: Page) =>
    page.evaluate(
      () =>
        document.activeElement?.getAttribute('aria-label') ??
        document.activeElement?.textContent?.trim(),
    );
  async function tabs(page: Page, count: number, shift = false) {
    const names: (string | undefined)[] = [];
    for (let i = 0; i < count; i++) {
      await page.keyboard.press(shift ? 'Shift+Tab' : 'Tab');
      names.push(await focusedName(page));
    }
    return names;
  }

  for (const [label, args, controls] of [
    ['floating', {}, ['Edit', 'Bold', 'Italic', 'Underline', 'Delete']],
    ['vertical', { vertical: '!true' }, ['Edit', 'Bold', 'Italic', 'Underline', 'Delete']],
    ['with a FAB', { withFab: '!true' }, ['Bold', 'Italic', 'Underline', 'New']],
  ] as const) {
    test(`Tab and Shift+Tab go through every control, then out · ${label}`, async ({ page }) => {
      await openStory(page, 'components-toolbar--collapse', {}, args);
      await page.getByRole('button', { name: 'Collapse' }).focus();
      expect(await tabs(page, controls.length + 1)).toEqual([...controls, 'After']);
      expect(await tabs(page, controls.length + 1, true)).toEqual([
        ...[...controls].reverse(),
        'Collapse',
      ]);
      await expect(page.getByRole('toolbar', { name: 'Formatting' })).toBeVisible();
    });
  }

  test('Tab goes through a docked toolbar and on to the next one', async ({ page }) => {
    await openStory(page, 'components-toolbar--docked');
    const first = ['Search', 'Starred', 'Sent', 'Compose'];
    expect(await tabs(page, 5)).toEqual([...first, 'Search']);
    expect(await tabs(page, 4, true)).toEqual(['Compose', 'Sent', 'Starred', 'Search']);
  });

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`arrows still move between controls · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-toolbar--docked', { dir });
      await page.keyboard.press('Tab');
      expect(await focusedName(page)).toBe('Search');
      // The next control is to the right in LTR and to the left in RTL.
      await page.keyboard.press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight');
      expect(await focusedName(page)).toBe('Starred');
      await page.keyboard.press(dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft');
      expect(await focusedName(page)).toBe('Search');
    });
  }

  test('a vertical toolbar uses the up and down arrows', async ({ page }) => {
    await openStory(page, 'components-toolbar--collapse', {}, { vertical: '!true' });
    await page.getByRole('button', { name: 'Collapse' }).focus();
    await page.keyboard.press('Tab');
    expect(await focusedName(page)).toBe('Edit');
    await page.keyboard.press('ArrowDown');
    expect(await focusedName(page)).toBe('Bold');
    await page.keyboard.press('ArrowUp');
    expect(await focusedName(page)).toBe('Edit');
  });
});

test.describe('ToolbarFab elevation', () => {
  test('pressing keeps level 2, not the hover level 3', async ({ page }) => {
    await openStory(page, 'components-toolbar--with-fab');
    const fab = page.getByRole('button', { name: 'New' }).first();
    const shadow = () => fab.evaluate((el) => getComputedStyle(el).boxShadow);
    const rest = await shadow();
    await fab.hover();
    await expect(fab).toHaveAttribute('data-hovered', 'true');
    await expect.poll(shadow).not.toBe(rest);
    await page.mouse.down();
    await expect(fab).toHaveAttribute('data-pressed', 'true');
    await expect.poll(shadow).toBe(rest);
    await page.mouse.up();
  });
});

test.describe('ToolbarFab icon transition', () => {
  iconTransitionSuite('components-toolbar--fab-icons', (page) => page.getByTestId('fab'));
});

test.describe('Toolbar scroll exit', () => {
  test('scrolling slides both toolbars off the screen and back', async ({ page }) => {
    await openStory(page, 'components-toolbar--scroll-exit');
    const scroller = page.getByTestId('scroller');
    const docked = page.getByTestId('docked');
    const floating = page.getByTestId('floating');
    const transform = (locator: Locator) =>
      locator.evaluate((el) => getComputedStyle(el).transform);
    expect(await transform(docked)).toBe('none');
    // A floating toolbar is elevated by default.
    expect(await floating.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe('none');

    await scroller.evaluate((el) => el.scrollTo(0, 200));
    await expect(docked).toHaveAttribute('data-hidden', 'true');
    await expect(docked).toHaveAttribute('inert');
    // Off the bottom edge (64px), and the vertical toolbar off the end edge.
    await expect.poll(() => transform(docked)).toBe('matrix(1, 0, 0, 1, 0, 64)');
    await expect
      .poll(() => docked.evaluate((el) => getComputedStyle(el).visibility))
      .toBe('hidden');
    await expect.poll(() => transform(floating)).toBe('matrix(1, 0, 0, 1, 88, 0)');

    await scroller.evaluate((el) => el.scrollTo(0, 100));
    await expect(docked).not.toHaveAttribute('data-hidden');
    await expect.poll(() => transform(docked)).toBe('none');
    await expect.poll(() => transform(floating)).toBe('none');
  });
});

test.describe('Toolbar layout safety', () => {
  layoutSafetySuite('components-toolbar--layout-override', {
    height: 64,
    width: 160,
    radius: '9999px',
    interactive: false,
    async check(page, target) {
      await target.getByRole('button', { name: 'Bold' }).click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
    },
  });
});
