import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { gotoReady } from './navigate';
import { exportedPages, isTabPage } from './pages';

/**
 * One data-driven smoke suite covering EVERY page of the static export: the home page, the
 * guides, the component gallery, every component page and every one of its tabs. The pages
 * are enumerated from the export's HTML (`exportedPages`), never a hand-kept list; the suite
 * builds first via the `test:e2e` turbo task (`dependsOn: ["build"]`), so `out/` exists at
 * collection time.
 *
 * For each page it asserts, in light and in dark mode: it renders (a `main` landmark + a
 * visible level-1 heading), it emits NO console errors / page errors, and it passes an axe
 * accessibility scan. Every page but the component tabs is also checked right to left; the
 * tabs share one template, so RTL is checked on the Button page's tabs, and a tab's dark
 * scan switches the loaded page to dark rather than loading it again.
 */

/** Matches the port in `playwright.config.ts`; only used if the baseURL fixture is unset. */
const DEFAULT_BASE_URL = 'http://localhost:4317';

const PAGES = exportedPages();
const TAB_ROUTES = PAGES.filter(isTabPage);
const SLUGS = PAGES.filter((path) => /^\/components\/[^/]+$/.test(path)).map((path) =>
  path.slice('/components/'.length),
);

interface Variant {
  dir?: 'rtl';
  dark?: boolean;
  /** Open the search with a query before the scan: docked (1280px) or full screen (390px). */
  search?: 'docked' | 'full-screen';
  /**
   * After the light-mode scan, switches the loaded page to dark mode (`data-mode`, which the
   * theme CSS keys on) and scans again: the dark check without a second page load, for the
   * component tabs, which share one template. Other pages load in dark mode (`dark`).
   */
  thenDark?: boolean;
}

/** Waits until nothing is mid-animation, then expects an axe scan to find no violations. */
async function expectNoAxeViolations(page: Page, label: string): Promise<void> {
  // Anything that still animates under reduced motion finishes before the scan. Looping
  // animations, such as a loading indicator, never finish, so they're left out.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
        .map((animation) => animation.finished.catch(() => undefined)),
    ),
  );
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations,
    `axe violations on ${label}: ${results.violations.map((v) => v.id).join(', ')}`,
  ).toEqual([]);
}

/**
 * Navigates to `url` under the given variant and asserts the page is healthy: it renders a
 * `main` landmark and a visible H1, emits no console/page errors, passes an axe scan, and — for
 * the RTL/dark variants — carries the expected `dir` / `data-mode` on `<html>`.
 */
async function assertPageHealthy(
  page: Page,
  baseURL: string,
  url: string,
  variant: Variant,
): Promise<void> {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  // axe must measure colours at rest. Entrance motion (an alert fades in through
  // `@starting-style`) blends an element with the page while it runs, so a pair that is
  // 4.58:1 at rest reads 4.4–4.49:1 mid-fade. Waiting for running animations alone is racy:
  // one that starts after the wait (a late hydration, a client-only subtree) is still
  // mid-fade when axe runs. Under reduced motion every component skips its entrance motion,
  // so nothing is blended, whatever the timing.
  await page.emulateMedia({ reducedMotion: 'reduce' });

  if (variant.dir === 'rtl') {
    // The site's direction switch keeps the choice in local storage and applies it on load.
    // (An init script can't set `dir`: it runs before the page's own <html> is parsed.)
    await page.addInitScript(() => localStorage.setItem('windmorph-site-dir', 'rtl'));
  }
  if (variant.dark) {
    // ThemeScript (pre-paint) and ThemeProvider (hydration) both read this cookie (storage
    // defaults to 'cookie', key 'windmorph-theme') and resolve dark, writing data-mode="dark".
    await page.context().addCookies([
      {
        name: 'windmorph-theme',
        value: encodeURIComponent('mode=dark'),
        url: baseURL,
      },
    ]);
  }

  if (variant.search) {
    await page.setViewportSize(
      variant.search === 'docked' ? { width: 1280, height: 900 } : { width: 390, height: 844 },
    );
  }

  await gotoReady(page, url);

  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

  if (variant.dir === 'rtl') {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  }
  if (variant.dark) {
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  }

  if (variant.search) {
    // The bar answers the shortcut once hydrated, when it's marked ready.
    await expect(
      page
        .locator('[data-ready]')
        .filter({ has: page.getByRole('combobox', { name: 'Search documentation' }) }),
    ).toHaveCount(1);
    await page.keyboard.press('ControlOrMeta+K');
    const view = page.getByRole('dialog', { name: 'Search documentation' });
    await view.getByRole('searchbox').fill('button');
    await expect(view.getByRole('row').first()).toBeVisible();
    // No sideways scrolling, even on a 390px phone.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
  }

  await expectNoAxeViolations(page, url);
  if (variant.thenDark) {
    await page.evaluate(() => document.documentElement.setAttribute('data-mode', 'dark'));
    await expectNoAxeViolations(page, `${url} (dark)`);
  }

  await page.waitForLoadState('load');
  expect(errors, `console/page errors on ${url}:\n${errors.join('\n')}`).toEqual([]);
}

for (const url of PAGES) {
  test.describe(url, () => {
    if (isTabPage(url)) {
      test('renders in light and dark mode', async ({ page, baseURL }) => {
        await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, { thenDark: true });
      });
    } else {
      test('renders (LTR / default mode)', async ({ page, baseURL }) => {
        await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, {});
      });
      test('renders in dark mode', async ({ page, baseURL }) => {
        await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, { dark: true });
      });
    }
    if (!isTabPage(url) || url.startsWith('/components/button/')) {
      test('renders in RTL', async ({ page, baseURL }) => {
        await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, { dir: 'rtl' });
      });
    }
  });
}

// The search view, open with results, in each layout, mode and direction.
for (const search of ['docked', 'full-screen'] as const) {
  test.describe(`search (${search})`, () => {
    test('is healthy (LTR / default mode)', async ({ page, baseURL }) => {
      await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, '/getting-started', { search });
    });
    test('is healthy in dark mode', async ({ page, baseURL }) => {
      await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, '/getting-started', {
        search,
        dark: true,
      });
    });
    test('is healthy in RTL', async ({ page, baseURL }) => {
      await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, '/getting-started', {
        search,
        dir: 'rtl',
      });
    });
  });
}

test('every component has its API and Accessibility tabs', () => {
  for (const slug of SLUGS) {
    expect(TAB_ROUTES, slug).toContain(`/components/${slug}/api`);
    expect(TAB_ROUTES, slug).toContain(`/components/${slug}/accessibility`);
  }
});

test('component gallery lists exactly the generated slugs', async ({ page }) => {
  await page.goto('/components');
  await expect(page.getByRole('heading', { level: 1, name: 'Components' })).toBeVisible();

  // Scope to the gallery article so the rail's group-trigger links (which also point at
  // /components/<slug>) don't count — the gallery is the browse surface under test.
  const hrefs = await page
    .getByRole('article')
    .locator('a[href^="/components/"]')
    .evaluateAll((anchors) =>
      anchors.map((a) => (a as HTMLAnchorElement).getAttribute('href') ?? ''),
    );
  const linkedSlugs = new Set(
    hrefs
      .map((href) => href.replace(/[?#].*$/, '').replace(/\/$/, ''))
      .filter((href) => href.startsWith('/components/'))
      .map((href) => href.slice('/components/'.length))
      .filter((slug) => slug !== '' && !slug.includes('/')),
  );
  // The gallery browses component families only; the Primitives reference page is reachable
  // from the rail, not listed as a gallery card, so the hero stat equals the card count.
  expect([...linkedSlugs].sort()).toEqual(SLUGS.filter((slug) => slug !== 'primitives'));
});

test('theming page has a live theme switcher', async ({ page }) => {
  await page.goto('/theming');
  // The live demo (ThemeSwitcherDemo) renders inside the page article; scope to it so the
  // app-bar's own ThemeControls (also a "Theme: baseline" button) doesn't match.
  const demo = page.getByRole('article');
  await expect(demo.getByRole('button', { name: /Theme: baseline/ })).toBeVisible();
});

test('motion page has a live spring demo', async ({ page }) => {
  await page.goto('/motion');
  await expect(page.getByRole('button', { name: /Animate spatial \/ fast/ })).toBeVisible();
});
