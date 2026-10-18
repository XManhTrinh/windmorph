import { expect, type Locator, type Page } from '@playwright/test';

/** Screenshot of an element plus a margin, so the outline focus ring is included. */
export async function shotWithMargin(page: Page, locator: Locator, name: string, margin = 8) {
  const box = (await locator.boundingBox())!;
  await expect(page).toHaveScreenshot(name, {
    clip: {
      x: box.x - margin,
      y: box.y - margin,
      width: box.width + margin * 2,
      height: box.height + margin * 2,
    },
  });
}

export const THEMES = ['baseline', 'ocean', 'forest', 'sunset', 'rose', 'slate'];
export const MODES = ['light', 'dark'] as const;
