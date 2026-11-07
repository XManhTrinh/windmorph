import { expect, test, type Page } from '@playwright/test';

const COOKIE = 'windmorph-theme';
const LOADS = 10;
/** How long after the streamed page first shows each load is watched. */
const WATCH_MS = 2500;

/** The stream's delay for the page behind `loading.tsx`, so it is still pending as the root hydrates. */
const STREAM_DELAY_MS = 300;

declare global {
  interface Window {
    __streamWatch?: { most: number; server: Set<Element>; done: boolean };
  }
}

/**
 * From the first frame of the document, counts the visible copies of the streamed page on every
 * painted frame until `WATCH_MS` after it first shows (a copy React keeps hidden for its reveal
 * doesn't count), and remembers the copies that came in the server's streamed HTML.
 */
function watchStreamedContent(page: Page) {
  return page.addInitScript((watchMs) => {
    const selector = '[data-testid="streamed-content"]';
    const watch = { most: 0, server: new Set<Element>(), done: false };
    window.__streamWatch = watch;
    // The server streams the page into a hidden `S:` element, then moves it into place.
    new MutationObserver(() => {
      for (const element of document.querySelectorAll(`[id^="S:"] ${selector}`)) {
        watch.server.add(element);
      }
    }).observe(document, { childList: true, subtree: true });
    let firstSeen: number | undefined;
    const frame = (now: number) => {
      const visible = [...document.querySelectorAll(selector)].filter(
        (element) => !element.closest('[hidden]') && element.getClientRects().length > 0,
      ).length;
      watch.most = Math.max(watch.most, visible);
      if (visible > 0) firstSeen ??= now;
      if (firstSeen !== undefined && now - firstSeen >= watchMs) watch.done = true;
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, WATCH_MS);
}

/** One full load: the most copies shown at once, and whether the server's copy was kept. */
async function loadAndWatch(page: Page) {
  await page.goto(`/streaming?delay=${STREAM_DELAY_MS}`);
  await page.waitForFunction(() => window.__streamWatch?.done, undefined, { timeout: 15_000 });
  return page.evaluate(() => {
    const watch = window.__streamWatch!;
    const shown = document.querySelectorAll('[data-testid="streamed-content"]');
    return { most: watch.most, keptServerHtml: shown.length === 1 && watch.server.has(shown[0]!) };
  });
}

/** A slower device, so hydration takes as long as it does on a phone. */
async function throttleCpu(page: Page) {
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
}

/**
 * `ThemeProvider` resolves `mode="system"` to the device's mode only on the client. Applied
 * as an urgent update right after hydration, it reached Suspense boundaries that hadn't
 * hydrated yet, and React rendered them on the client instead of hydrating the server's
 * HTML: the page streamed behind `loading.tsx` was replaced on almost every load and showed
 * twice for a moment on some.
 */
test.describe('Streaming with a system colour mode', () => {
  test.describe.configure({ timeout: 90_000 });

  test('a dark device with no saved theme never shows the streamed page twice', async ({
    page,
  }) => {
    await throttleCpu(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await watchStreamedContent(page);
    const loads = [];
    for (let load = 0; load < LOADS; load += 1) loads.push(await loadAndWatch(page));
    expect(loads).toEqual(Array(LOADS).fill({ most: 1, keptServerHtml: true }));
    await expect(page.getByTestId('streaming-resolved-mode')).toHaveText(
      'Mode: system (resolved: dark)',
    );
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'system');
  });

  test('a light device shows the streamed page once', async ({ page }) => {
    await throttleCpu(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await watchStreamedContent(page);
    expect(await loadAndWatch(page)).toEqual({ most: 1, keptServerHtml: true });
    await expect(page.getByTestId('streaming-resolved-mode')).toHaveText(
      'Mode: system (resolved: light)',
    );
  });

  test('a saved dark theme shows the streamed page once', async ({ page, context, baseURL }) => {
    await context.addCookies([
      { name: COOKIE, value: encodeURIComponent('mode=dark'), url: baseURL! },
    ]);
    await throttleCpu(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await watchStreamedContent(page);
    expect(await loadAndWatch(page)).toEqual({ most: 1, keptServerHtml: true });
    await expect(page.getByTestId('streaming-resolved-mode')).toHaveText(
      'Mode: dark (resolved: dark)',
    );
  });

  test('the resolved mode follows a change on the device', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`/streaming?delay=${STREAM_DELAY_MS}`);
    const resolved = page.getByTestId('streaming-resolved-mode');
    await expect(resolved).toHaveText('Mode: system (resolved: dark)');
    await page.emulateMedia({ colorScheme: 'light' });
    await expect(resolved).toHaveText('Mode: system (resolved: light)');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(resolved).toHaveText('Mode: system (resolved: dark)');
  });
});
