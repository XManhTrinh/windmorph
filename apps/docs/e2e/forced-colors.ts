import type { Locator, Page } from '@playwright/test';

/** What forced colours (Windows high contrast) leave of a control. */
export interface ForcedLook {
  width: number;
  height: number;
  borderStyle: string;
  borderWidth: number;
  borderColor: string;
  background: string;
  color: string;
}

/** Reads every element matching `locator`: its size, border and colours. */
export function readLooks(locator: Locator): Promise<ForcedLook[]> {
  return locator.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return {
        width: Math.round(box.width * 100) / 100,
        height: Math.round(box.height * 100) / 100,
        borderStyle: style.borderTopStyle,
        borderWidth: parseFloat(style.borderTopWidth),
        borderColor: style.borderTopColor,
        background: style.backgroundColor,
        color: style.color,
      };
    }),
  );
}

/** The computed value of a system colour (`GrayText`, `Highlight` …) in the page. */
export function systemColor(page: Page, name: string): Promise<string> {
  return page.evaluate((value) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, name);
}

/**
 * Reads `locator`'s elements, turns forced colours on and reads them again: the sizes from
 * before (forced colours must not move anything) and the looks after.
 */
export async function underForcedColors(page: Page, locator: Locator) {
  const before = await readLooks(locator);
  await page.emulateMedia({ forcedColors: 'active' });
  // Colours transition into their forced values; read them where they end.
  await page.evaluate(() =>
    Promise.all(document.getAnimations().map((animation) => animation.finished)),
  );
  const after = await readLooks(locator);
  return { before, after };
}
