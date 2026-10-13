import { expect, test } from '@playwright/test';
import { MODES, THEMES } from './shots';
import { openStory } from './story';

test.describe('Tooltip visual regression', () => {
  for (const theme of THEMES) {
    for (const mode of MODES) {
      test(`plain · ${theme} · ${mode}`, async ({ page }) => {
        await openStory(page, 'components-tooltip--open', { theme, mode });
        await expect(page.getByRole('tooltip')).toHaveCount(2);
        // The padded container holds both tooltips; the screenshot includes the overlays.
        await expect(page.getByTestId('open')).toHaveScreenshot(`open-${theme}-${mode}.png`);
      });
    }
  }

  test('rich with caret', async ({ page }) => {
    await openStory(page, 'components-tooltip--rich', {}, { caret: true, placement: 'bottom' });
    await page.getByRole('button', { name: 'What are grouped tabs?' }).click();
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    await expect(dialog).toBeVisible();
    await page.mouse.move(0, 0);
    // Measure once the entry animation (a scale from 80%) has finished, or the clip moves.
    await page.evaluate(() =>
      Promise.allSettled(document.getAnimations().map((animation) => animation.finished)),
    );
    const box = (await dialog.boundingBox())!;
    await expect(page).toHaveScreenshot('rich-caret.png', {
      clip: {
        x: Math.round(box.x) - 24,
        y: Math.round(box.y) - 72,
        width: Math.round(box.width) + 48,
        height: Math.round(box.height) + 96,
      },
    });
  });
});

test.describe('Tooltip behaviour', () => {
  test('a plain tooltip shows on hover 4px above its anchor and hides on leave', async ({
    page,
  }) => {
    await openStory(page, 'components-tooltip--plain');
    const trigger = page.getByRole('button', { name: 'Edit' });
    // React Aria counts hovers once a pointer move has set the interaction modality, as any
    // real approach to the button does.
    await page.mouse.move(5, 5);
    await trigger.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('Edit message');
    await expect(trigger).toHaveAttribute('aria-describedby', (await tooltip.getAttribute('id'))!);
    const anchor = (await trigger.boundingBox())!;
    await expect
      .poll(async () => {
        const tip = (await tooltip.boundingBox())!;
        return Math.round(anchor.y - (tip.y + tip.height));
      })
      .toBe(4);
    // Hoverable: moving onto the tooltip keeps it open (WCAG 1.4.13).
    await tooltip.hover();
    await expect(tooltip).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
  });

  test('keyboard focus shows it and Escape hides it', async ({ page }) => {
    await openStory(page, 'components-tooltip--plain');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('tooltip')).toHaveText('Add to favourites');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('a menu button keeps its tooltip, and opening the menu hides it', async ({ page }) => {
    await openStory(page, 'components-tooltip--on-overlay-triggers');
    const more = page.getByRole('button', { name: 'More' });
    await page.mouse.move(5, 5);
    await more.hover();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toHaveText('More options');
    await expect(more).toHaveAttribute('aria-describedby', (await tooltip.getAttribute('id'))!);
    await more.click();
    await expect(page.getByRole('menu', { name: 'More' })).toBeVisible();
    await expect(tooltip).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);

    // From the keyboard: focus shows it, Enter / ArrowDown open the menu and hide it.
    await page.mouse.move(0, 0);
    await page.locator('body').click({ position: { x: 1, y: 1 } });
    await page.keyboard.press('Tab');
    await expect(more).toBeFocused();
    await expect(tooltip).toHaveText('More options');
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('menuitem', { name: 'Edit' })).toBeFocused();
    await expect(tooltip).toHaveCount(0);
    // Escape closes the menu; back on the button, the tooltip behaves as usual.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);
    await expect(more).toBeFocused();
    await expect(tooltip).toHaveText('More options');
    await page.keyboard.press('Escape');
    await expect(tooltip).toHaveCount(0);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('menu', { name: 'More' })).toBeVisible();
  });

  test('a dialog button keeps its tooltip', async ({ page }) => {
    await openStory(page, 'components-tooltip--on-overlay-triggers');
    const remove = page.getByRole('button', { name: 'Delete' });
    await page.mouse.move(5, 5);
    await remove.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Delete message');
    await remove.click();
    await expect(page.getByRole('dialog', { name: 'Delete message?' })).toBeVisible();
    await expect(page.getByRole('tooltip')).toHaveCount(0);
  });

  test('a rich tooltip opens on press and its action is reachable', async ({ page }) => {
    await openStory(page, 'components-tooltip--rich');
    const trigger = page.getByRole('button', { name: 'What are grouped tabs?' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Grouped tabs' });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(dialog.getByRole('button', { name: 'Learn more' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });
});
