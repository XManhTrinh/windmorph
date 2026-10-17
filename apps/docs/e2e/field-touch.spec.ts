import { expect, test, type CDPSession, type Page } from '@playwright/test';
import { openStory } from './story';

/*
 * Chrome's touch adjustment can split a tap near a field's own control: `pointerdown` goes
 * to the control while `pointerup`, the emulated mouse events or the click land on the
 * padding beside it (2026-10-17). Every field acts on such a tap as on any other, and the
 * mouse behaves as before. Taps are raw CDP touches (held 80ms, with a 0 or 12px finger
 * radius) and Playwright's instant tap.
 */

type Tap = 'instant' | 'finger 0px' | 'finger 12px';
const TAPS: Tap[] = ['instant', 'finger 0px', 'finger 12px'];

async function tapAt(page: Page, cdp: CDPSession, tap: Tap, x: number, y: number) {
  if (tap === 'instant') return page.touchscreen.tap(x, y);
  const radius = tap === 'finger 0px' ? 0 : 12;
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y, radiusX: radius, radiusY: radius, force: 1, id: 1 }],
  });
  await page.waitForTimeout(80);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

const fieldBox = async (page: Page) => {
  const box = await page.locator('#storybook-root [data-slot=container]').first().boundingBox();
  if (!box) throw new Error('No field container');
  return box;
};

test.describe('Fields under touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  for (const tap of TAPS) {
    test(`Select opens from the bands above and below its value · ${tap}`, async ({ page }) => {
      const cdp = await page.context().newCDPSession(page);
      for (const y of [19, 51]) {
        await openStory(page, 'components-select--variants');
        const box = await fieldBox(page);
        await tapAt(page, cdp, tap, box.x + 30, box.y + y);
        await expect(page.getByRole('option').first()).toBeVisible();
      }
    });

    test(`Autocomplete's arrow opens the list with focus in the input · ${tap}`, async ({
      page,
    }) => {
      const cdp = await page.context().newCDPSession(page);
      await openStory(page, 'components-autocomplete--variants');
      const box = await page.getByRole('button', { name: 'Show options' }).first().boundingBox();
      await tapAt(page, cdp, tap, box!.x + box!.width / 2, box!.y + box!.height / 2);
      await expect(page.getByRole('option').first()).toBeVisible();
      await expect(page.getByRole('combobox').first()).toBeFocused();
    });

    test(`TextField's padding focuses its input · ${tap}`, async ({ page }) => {
      const cdp = await page.context().newCDPSession(page);
      for (const y of [19, 51]) {
        await openStory(page, 'components-textfield--variants');
        const box = await fieldBox(page);
        await tapAt(page, cdp, tap, box.x + 30, box.y + y);
        await expect(page.locator('#storybook-root input').first()).toBeFocused();
      }
    });
  }
});

test.describe('Fields under the mouse', () => {
  test('Select opens and the arrow opens Autocomplete with one press, as before', async ({
    page,
  }) => {
    await openStory(page, 'components-select--variants');
    const box = await fieldBox(page);
    for (const y of [4, 19, 28, 51]) {
      await page.mouse.click(box.x + 30, box.y + y);
      await expect(page.getByRole('option').first()).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('option')).toHaveCount(0);
    }
    await openStory(page, 'components-autocomplete--variants');
    await page.getByRole('button', { name: 'Show options' }).first().click();
    await expect(page.getByRole('option').first()).toBeVisible();
    await expect(page.getByRole('combobox').first()).toBeFocused();
  });
});
