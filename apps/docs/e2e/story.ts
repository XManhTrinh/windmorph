import type { Page } from '@playwright/test';

export interface StoryGlobals {
  theme?: string;
  mode?: 'light' | 'dark';
  contrast?: 'standard' | 'medium' | 'high';
  motion?: 'expressive' | 'standard';
  dir?: 'ltr' | 'rtl';
  density?: '0' | '-1' | '-2' | '-3';
}

/** A story's isolated page, with toolbar globals and args. */
export function storyUrl(
  id: string,
  globals: StoryGlobals = {},
  args: Record<string, string | boolean> = {},
) {
  const encode = (entries: [string, unknown][]) =>
    entries.map(([key, value]) => `${key}:${String(value)}`).join(';');
  const params = new URLSearchParams({ id, viewMode: 'story' });
  if (Object.keys(globals).length) params.set('globals', encode(Object.entries(globals)));
  if (Object.keys(args).length) params.set('args', encode(Object.entries(args)));
  return `/iframe.html?${params.toString().replace(/%3A/g, ':').replace(/%3B/g, ';')}`;
}

/** Opens a story in isolation with toolbar globals and args, and waits for fonts. */
export async function openStory(
  page: Page,
  id: string,
  globals: StoryGlobals = {},
  args: Record<string, string | boolean> = {},
) {
  await page.goto(storyUrl(id, globals, args));
  await page.locator('#storybook-root > *').first().waitFor();
  await page.evaluate(async () => {
    await document.fonts.ready;
    // A part measured in the fallback font (an extended FAB's label) measures again once the
    // web font is in: its ResizeObserver and the render it causes land in the next frames, so
    // a reading straight after `fonts.ready` could still be the old size (2026-11-11: about 2px
    // wide, one run in six on a fast machine).
    // Only on the real clock: a test that installed Playwright's (`pauseClock`) runs its frames
    // itself, and a faked `requestAnimationFrame` never fires until it does.
    if (!String(requestAnimationFrame).includes('[native code]')) return;
    for (let frame = 0; frame < 3; frame += 1) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  });
}
