import { expect, test, type Locator } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES, shotWithMargin } from './shots';
import { openStory } from './story';

const size = (locator: Locator) =>
  locator.evaluate((el) => {
    const rect = (el as HTMLElement).getBoundingClientRect();
    return { width: Math.round(rect.width * 10) / 10, height: rect.height };
  });

test.describe('FAB visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`colours and sizes · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-fab--colors-and-sizes', { theme, mode });
        await expect(page.getByTestId('fabs')).toHaveScreenshot(`fabs-${theme}-${mode}.png`);
      });
    }
  }

  for (const dir of ['ltr', 'rtl'] as const) {
    test(`extended · ${dir}`, async ({ page }) => {
      await openStory(page, 'components-fab--extended', { dir });
      await expect(page.getByTestId('extended')).toHaveScreenshot(`extended-${dir}.png`);
    });
  }
});

test.describe('FAB interaction', () => {
  test('hovering shows its label in a tooltip', async ({ page }) => {
    await openStory(page, 'components-fab--playground');
    const fab = page.getByRole('button', { name: 'Compose' });
    // React Aria counts hovers once a pointer move has set the interaction modality.
    await page.mouse.move(5, 5);
    await fab.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Compose');
    await expect(fab).toHaveAttribute('aria-describedby', /.+/);
  });

  test('a flat FAB has no shadow at rest or on hover', async ({ page }) => {
    await openStory(page, 'components-fab--playground', {}, { elevation: 'flat' });
    const fab = page.getByRole('button', { name: 'Compose' });
    const shadow = () => fab.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(await shadow()).toBe('none');
    await fab.hover();
    await expect(fab).toHaveAttribute('data-hovered', 'true');
    expect(await shadow()).toBe('none');
  });

  test('disappears towards its centre and reappears', async ({ page }) => {
    await openStory(page, 'components-fab--visibility');
    const fab = page.getByTestId('fab');
    const style = () =>
      fab.evaluate((el) => {
        const s = getComputedStyle(el);
        return { transform: s.transform, opacity: s.opacity, visibility: s.visibility };
      });
    expect(await style()).toEqual({ transform: 'none', opacity: '1', visibility: 'visible' });

    await page.getByRole('button', { name: 'Hide' }).click();
    // Scale 0.2 around the centre, faded and hidden once settled; out of the tab order.
    await expect
      .poll(style)
      .toEqual({ transform: 'matrix(0.2, 0, 0, 0.2, 0, 0)', opacity: '0', visibility: 'hidden' });
    await expect(fab).toHaveAttribute('inert');
    await expect(page.getByTestId('extended-fab')).toHaveAttribute('data-hidden', 'true');

    await page.getByRole('button', { name: 'Show' }).click();
    await expect.poll(style).toEqual({ transform: 'none', opacity: '1', visibility: 'visible' });
    await expect(fab).not.toHaveAttribute('inert');
  });

  test('reduced motion only fades', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await openStory(page, 'components-fab--visibility');
    const fab = page.getByTestId('fab');
    await page.getByRole('button', { name: 'Hide' }).click();
    await expect.poll(() => fab.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
    expect(await fab.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
  });

  test('a new key with appear replays the entrance', async ({ page }) => {
    await openStory(page, 'components-fab--visibility');
    // Record the transitions the new FAB starts, so the entrance is seen to run however fast
    // the machine is.
    await page.evaluate(() => {
      const record = window as unknown as { entrance: string[] };
      record.entrance = [];
      document.addEventListener('transitionrun', (event) => {
        const target = event.target as HTMLElement;
        if (target.getAttribute('aria-label') === 'Tab 2 action') {
          record.entrance.push(event.propertyName);
        }
      });
    });
    await page.getByRole('button', { name: 'Next tab' }).click();
    const fab = page.getByRole('button', { name: 'Tab 2 action' });
    // It grows from its centre and fades in…
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { entrance: string[] }).entrance))
      .toEqual(expect.arrayContaining(['transform', 'opacity']));
    // …then settles. Both are polled together: the fade's spring ends before the scale's.
    await expect
      .poll(() =>
        fab.evaluate((el) => {
          const style = getComputedStyle(el);
          return { opacity: style.opacity, transform: style.transform };
        }),
      )
      .toEqual({ opacity: '1', transform: 'none' });
  });

  test('hover raises the elevation and focus shows the ring', async ({ page }) => {
    await openStory(page, 'components-fab--playground', {}, { size: 'medium' });
    const fab = page.getByRole('button', { name: 'Compose' });
    await fab.hover();
    await expect(fab).toHaveAttribute('data-hovered', 'true');
    await shotWithMargin(page, fab, 'state-hover.png', 16);
    await page.mouse.move(0, 0);
    await page.keyboard.press('Tab');
    await expect(fab).toHaveAttribute('data-focus-visible', 'true');
    await shotWithMargin(page, fab, 'state-focus.png', 16);
  });

  for (const [fabSize, height] of [
    ['sm', 56],
    ['md', 80],
    ['lg', 96],
  ] as const) {
    test(`extended ${fabSize} collapses to a square and expands back`, async ({ page }) => {
      await openStory(page, 'components-fab--extended-collapse', {}, { size: fabSize });
      const fab = page.getByTestId('extended-fab');
      const expanded = await size(fab);
      expect(expanded.height).toBe(height);
      expect(expanded.width).toBeGreaterThan(height + 40);

      await page.getByRole('button', { name: 'Collapse' }).click();
      await expect(fab).toHaveAttribute('data-expanded', 'false');
      await expect.poll(() => size(fab)).toEqual({ width: height, height });
      // The label still names the FAB.
      await expect(page.getByRole('button', { name: 'Compose' })).toBeVisible();

      await page.getByRole('button', { name: 'Expand' }).click();
      await expect.poll(async () => (await size(fab)).width).toBe(expanded.width);
    });
  }
});

test.describe('FAB layout safety', () => {
  layoutSafetySuite('components-fab--layout-override', { height: 56, width: 56, radius: '16px' });
});
