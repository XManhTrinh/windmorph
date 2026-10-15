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

/**
 * The computed value of a system colour (`GrayText`, `Highlight` …) in the page. The probe
 * opts out of forced colours, so it reads the same with them on or off.
 */
export function systemColor(page: Page, name: string): Promise<string> {
  return page.evaluate((value) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    probe.style.forcedColorAdjust = 'none';
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, name);
}

/** The `Canvas` system colour, the page background forced colours paint. */
export function canvas(page: Page): Promise<string> {
  return systemColor(page, 'Canvas');
}

/** One computed style property of `locator`'s element. */
export function computedStyle(locator: Locator, property: string): Promise<string> {
  return locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name), property);
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
