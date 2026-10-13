import { expect, test } from '@playwright/test';
import { layoutSafetySuite } from './layout-safety';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

test.describe('Snackbar visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`layouts · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-snackbar--layouts', { theme, mode });
        await expect(page.getByTestId('layouts')).toHaveScreenshot(`layouts-${theme}-${mode}.png`);
      });
    }
  }

  test('layouts · rtl', async ({ page }) => {
    await openStory(page, 'components-snackbar--layouts', { dir: 'rtl' });
    await expect(page.getByTestId('layouts')).toHaveScreenshot('layouts-rtl.png');
  });
});

test.describe('SnackbarHost behaviour', () => {
  test('queues snackbars and resolves the action', async ({ page }) => {
    await openStory(page, 'components-snackbar--host');
    const host = page.getByTestId('host');
    await page.getByRole('button', { name: 'With action' }).click();
    await page.getByRole('button', { name: 'Dismissible' }).click();
    await expect(host.getByText('Message archived')).toBeVisible();
    await expect(host.getByText('Draft discarded')).toHaveCount(0);

    await host.getByRole('button', { name: 'Undo' }).click();
    await expect(page.getByTestId('result')).toHaveText('Result: action-performed');
    await expect(host.getByText('Draft discarded')).toBeVisible();
    await expect(host.getByText('Message archived')).toHaveCount(0);

    await host.getByRole('button', { name: 'Dismiss' }).click();
    await expect(host.getByText('Draft discarded')).toHaveCount(0);
  });

  test('Alt+G reaches an actionable snackbar, Escape dismisses it and focus returns', async ({
    page,
  }) => {
    await openStory(page, 'components-snackbar--host');
    const trigger = page.getByRole('button', { name: 'With action' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const host = page.getByTestId('host');
    await expect(host.getByText('Message archived')).toBeVisible();
    await page.keyboard.press('Alt+KeyG');
    await expect(host.getByRole('button', { name: 'Undo' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('result')).toHaveText('Result: dismissed');
    await expect(trigger).toBeFocused();
  });

  test('a replacing snackbar takes over at once', async ({ page }) => {
    await openStory(page, 'components-snackbar--host');
    const host = page.getByTestId('host');
    await page.getByRole('button', { name: 'With action' }).click();
    await page.getByRole('button', { name: 'Replace' }).click();
    await expect(page.getByTestId('result')).toHaveText('Result: dismissed');
    await expect(host.getByText('Photos uploaded')).toBeVisible();
  });

  test('a snackbar expands upward from its bottom edge', async ({ page }) => {
    await openStory(page, 'components-snackbar--host');
    await page.getByRole('button', { name: 'Short' }).click();
    const item = page.getByTestId('host').locator('[data-snackbar-id]');
    const clip = await item.evaluate((el) => getComputedStyle(el).clipPath);
    const scale = await item.evaluate((el) => getComputedStyle(el).scale);
    expect(scale).toBe('none');
    expect(clip).toContain('inset(');
  });

  test('short snackbars leave by themselves', async ({ page }) => {
    await page.clock.install();
    await openStory(page, 'components-snackbar--host');
    await page.getByRole('button', { name: 'Short' }).click();
    const message = page.getByTestId('host').getByText('Photo saved');
    await expect(message).toBeVisible();
    await page.mouse.move(0, 0);
    await page.clock.runFor(4500);
    await expect(message).toHaveCount(0);
  });
  test('a snackbar shown at launch goes into the live region after the region is on the page', async ({
    page,
  }) => {
    // Record what the host's live region held when it was inserted, and when the snackbar came.
    await page.addInitScript(() => {
      const log: { regionChildren?: number; regionAt?: number; snackbarAt?: number } = {};
      (window as unknown as { liveLog: typeof log }).liveLog = log;
      new MutationObserver(() => {
        const host = document.querySelector('[data-testid="host"]');
        if (host && log.regionAt === undefined) {
          log.regionAt = performance.now();
          log.regionChildren = host.childElementCount;
        }
        if (host?.querySelector('[data-snackbar-id]') && log.snackbarAt === undefined) {
          log.snackbarAt = performance.now();
        }
      }).observe(document, { childList: true, subtree: true });
    });
    await openStory(page, 'components-snackbar--at-launch');
    const host = page.getByTestId('host');
    await expect(host).toHaveAttribute('aria-live', 'polite');
    await expect(host).toContainText('Welcome back, Priya');
    const log = await page.evaluate(
      () => (window as unknown as { liveLog: Record<string, number> }).liveLog,
    );
    expect(log.regionChildren).toBe(0);
    expect(log.snackbarAt! - log.regionAt!).toBeGreaterThanOrEqual(90);
  });

  test('a snackbar without a host announces its message politely', async ({ page }) => {
    await openStory(page, 'components-snackbar--playground');
    const region = page.locator('[data-windmorph-announcer]');
    await expect(region).toHaveAttribute('aria-live', 'polite');
    await expect(region).toHaveText('Message archived');
    // Visually hidden.
    expect((await region.boundingBox())!.width).toBeLessThanOrEqual(1);
  });
});

test.describe('Snackbar layout safety', () => {
  layoutSafetySuite('components-snackbar--layout-override', {
    height: 48,
    width: 360,
    radius: '4px',
    interactive: false,
    async check(page, target) {
      await target.getByRole('button', { name: 'Undo' }).click();
      await expect(page.getByTestId('count')).toHaveText('Pressed 1');
    },
  });
});
