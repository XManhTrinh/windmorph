import type { Page } from '@playwright/test';

export interface StoryGlobals {
  theme?: string;
  mode?: 'light' | 'dark';
  contrast?: 'standard' | 'medium' | 'high';
  motion?: 'expressive' | 'standard';
  dir?: 'ltr' | 'rtl';
}

/** Opens a story in isolation with toolbar globals and args, and waits for fonts. */
export async function openStory(
  page: Page,
  id: string,
  globals: StoryGlobals = {},
  args: Record<string, string | boolean> = {},
) {
  const encode = (entries: [string, unknown][]) =>
    entries.map(([key, value]) => `${key}:${String(value)}`).join(';');
  const params = new URLSearchParams({ id, viewMode: 'story' });
  if (Object.keys(globals).length) params.set('globals', encode(Object.entries(globals)));
  if (Object.keys(args).length) params.set('args', encode(Object.entries(args)));
  await page.goto(`/iframe.html?${params.toString().replace(/%3A/g, ':').replace(/%3B/g, ';')}`);
  await page.locator('#storybook-root > *').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}
