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

/** A component the forced-colours guard lets go without a boundary, and why. */
export interface ForcedColorsException {
  /** A story id, or `*` for every story. */
  story: string;
  /** The component root's key (`<data-tokens>/<data-variant or data-layout>`), or its start. */
  component: string;
  reason: string;
}

/**
 * Components drawn without a container in M3, so forced colours leave nothing to outline.
 * Each is still identified by its content (an icon, a label, an image) and shows its
 * selection with `Highlight`; the guard checks selected states separately.
 */
export const FORCED_COLORS_EXCEPTIONS: ForcedColorsException[] = [
  {
    story: '*',
    component: 'md-comp-icon-button/standard',
    reason: 'a standard icon button has no container in M3: its icon is the control',
  },
  {
    story: '*',
    component: 'md-comp-list',
    reason:
      'list rows are identified by their text; M3 rows and lists have no outline, and selection shows a check or Highlight',
  },
  {
    story: '*',
    component: 'md-comp-tabs',
    reason: 'tabs have no container in M3; the current tab keeps a Highlight indicator',
  },
  {
    story: '*',
    component: 'md-comp-nav-bar/bar-',
    reason: 'navigation items have no container in M3; the current one keeps a Highlight pill',
  },
  {
    story: '*',
    component: 'md-comp-nav-rail/rail-',
    reason: 'navigation items have no container in M3; the current one keeps a Highlight pill',
  },
  {
    story: '*',
    component: 'md-comp-carousel',
    reason: 'a carousel region has no container; its items are their own content (images)',
  },
  {
    story: '*',
    component: 'md-comp-app-bar',
    reason: "at rest a top app bar is the page's own surface colour, with no edge in M3",
  },
];
