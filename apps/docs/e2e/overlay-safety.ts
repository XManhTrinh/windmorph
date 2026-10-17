import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Overrides that position the element themselves: a panel given one of these is placed
 * where the consumer asked, so it isn't expected to stay against its anchor.
 */
export const POSITIONING_OVERRIDES = ['fixed', 'absolute', 'transform'];

/** Waits out an overlay's enter motion. */
export const settle = (page: Page) => page.waitForTimeout(600);

/**
 * An open overlay panel's layout size and corners, whether it lies inside the window, and
 * whether it is what's on top at its own centre (nothing clips or covers it).
 */
export const panelLayout = (panel: Locator) =>
  panel.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
    return {
      width: (el as HTMLElement).offsetWidth,
      height: (el as HTMLElement).offsetHeight,
      radius: getComputedStyle(el).borderTopLeftRadius,
      inWindow:
        box.width > 0 &&
        box.top >= 0 &&
        box.left >= 0 &&
        box.bottom <= window.innerHeight &&
        box.right <= window.innerWidth,
      onTop: hit !== null && el.contains(hit),
    };
  });

/**
 * The panel sits `gap` px beside its anchor, above or below it (within 3px, the most a
 * 3° rotation adds to the anchor's box), and overlaps it along the other axis.
 */
export async function expectAnchored(panel: Locator, anchor: Locator, gap: number) {
  const p = (await panel.boundingBox())!;
  const a = (await anchor.boundingBox())!;
  const below = p.y - (a.y + a.height);
  const above = a.y - (p.y + p.height);
  expect(Math.min(Math.abs(below - gap), Math.abs(above - gap))).toBeLessThanOrEqual(3);
  expect(p.x < a.x + a.width && p.x + p.width > a.x).toBe(true);
}

/** Keyboard focus reaches the target and shows the outline focus ring. */
export async function expectKeyboardFocusRing(page: Page, target: Locator) {
  await target.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(target).toBeFocused();
  await expect(target).toHaveAttribute('data-focus-visible', 'true');
  expect(await target.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('solid');
}

/** The target paints its state layer as a background gradient (architecture §10 rule 2). */
export async function expectStateLayer(target: Locator) {
  expect(await target.evaluate((el) => getComputedStyle(el).backgroundImage)).toContain(
    'linear-gradient',
  );
}
