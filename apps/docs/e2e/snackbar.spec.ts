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
