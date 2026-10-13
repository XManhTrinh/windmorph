import { readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * One data-driven smoke suite covering EVERY page of the static export: the home page, the six
 * guide pages, the component gallery, all component slugs under `/components/<slug>` and their
 * tabs under `/components/<slug>/<tab>`.
 *
 * The slug list is ENUMERATED from the static export output (`out/components`), which is produced
 * by the `[slug]` route's `generateStaticParams()` (i.e. the component registry) — never a stale
 * hardcoded list. The suite builds first via the `test:e2e` turbo task (`dependsOn: ["build"]`),
 * so `out/` exists at collection time.
 *
 * For each page it asserts: it renders (a `main` landmark + a visible level-1 heading), it emits
 * NO console errors / page errors, it passes an axe accessibility scan, and it works in RTL and
 * in dark mode. Tabs-based ExampleViewer panels (date-/time-picker) hydrate client-side and are
 * empty at SSR; Playwright always queries the hydrated DOM, so these pass legitimately.
 */
const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '../out');
const componentsOut = join(outDir, 'components');

/** Matches the port in `playwright.config.ts`; only used if the baseURL fixture is unset. */
const DEFAULT_BASE_URL = 'http://localhost:4317';

/** The six fixed guide routes (from `app/(docs)/sections.tsx`), plus home and the gallery. */
const GUIDE_ROUTES = [
  '/getting-started',
  '/theming',
  '/motion',
  '/customisation',
  '/accessibility',
  '/nextjs',
] as const;

/** Enumerate component slugs from the export output (the real `generateStaticParams` result). */
function enumerateSlugs(): string[] {
  if (!existsSync(outDir)) {
    throw new Error(
      `[smoke] no static export at ${outDir}. Build the site first ` +
        `(the \`test:e2e\` turbo task depends on \`build\`).`,
    );
  }
  const slugs = new Set<string>();
  for (const entry of readdirSync(componentsOut, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.html')) {
      slugs.add(entry.name.slice(0, -'.html'.length));
    } else if (entry.isDirectory() && existsSync(join(componentsOut, entry.name, 'index.html'))) {
      slugs.add(entry.name);
    }
  }
  return [...slugs].sort();
}

/** Each component page's other tabs (`/components/<slug>/<tab>`), from the export output. */
function enumerateTabRoutes(): string[] {
  const routes: string[] = [];
  for (const entry of readdirSync(componentsOut, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const file of readdirSync(join(componentsOut, entry.name))) {
      if (file.endsWith('.html')) routes.push(`/components/${entry.name}/${file.slice(0, -5)}`);
    }
  }
  return routes.sort();
}

const SLUGS = enumerateSlugs();
const COMPONENT_ROUTES = SLUGS.map((slug) => `/components/${slug}`);
const ALL_ROUTES = ['/', ...GUIDE_ROUTES, '/components', ...COMPONENT_ROUTES] as const;
const TAB_ROUTES = enumerateTabRoutes();

interface Variant {
  dir?: 'rtl';
  dark?: boolean;
  /** Open the search with a query before the scan: docked (1280px) or full screen (390px). */
  search?: 'docked' | 'full-screen';
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

  await page.goto(url);

  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();

  if (variant.dir === 'rtl') {
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  }
  if (variant.dark) {
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  }

  if (variant.search) {
    // The bar answers the shortcut once hydrated, when it advertises it.
    await expect(page.getByRole('combobox', { name: 'Search documentation' })).toHaveAttribute(
      'aria-keyshortcuts',
      /K/,
    );
    await page.keyboard.press('ControlOrMeta+K');
    const view = page.getByRole('dialog', { name: 'Search documentation' });
    await view.getByRole('searchbox').fill('button');
    await expect(view.getByRole('grid').first()).toBeVisible();
    // No sideways scrolling, even on a 390px phone.
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      page.viewportSize()!.width,
    );
  }

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
    `axe violations on ${url}: ${results.violations.map((v) => v.id).join(', ')}`,
  ).toEqual([]);

  await page.waitForLoadState('load');
  expect(errors, `console/page errors on ${url}:\n${errors.join('\n')}`).toEqual([]);
}

for (const url of ALL_ROUTES) {
  test.describe(url, () => {
    test('renders (LTR / default mode)', async ({ page, baseURL }) => {
      await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, {});
    });
    test('renders in dark mode', async ({ page, baseURL }) => {
      await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, { dark: true });
    });
    test('renders in RTL', async ({ page, baseURL }) => {
      await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, { dir: 'rtl' });
    });
  });
}

// The tab pages share one template, so dark mode and RTL are checked on one component's tabs;
// every tab page gets the default check.
for (const url of TAB_ROUTES) {
  test.describe(url, () => {
    test('renders (LTR / default mode)', async ({ page, baseURL }) => {
      await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, {});
    });
    if (url.startsWith('/components/button/')) {
      test('renders in dark mode', async ({ page, baseURL }) => {
        await assertPageHealthy(page, baseURL ?? DEFAULT_BASE_URL, url, { dark: true });
      });
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
