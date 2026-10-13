import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { SITE_URL, markdownPath, ogImagePath } from '../lib/site-metadata';
import { OUT_DIR, exportedPages, isTabPage } from './pages';

/**
 * The files the static export carries beside its pages: each page's Markdown twin and
 * link-preview image, `llms.txt`, `llms-full.txt`, `sitemap.xml` and `robots.txt`. Pages are
 * enumerated from the export's HTML, so a page added later is checked without listing it.
 */
function read(path: string): string {
  return readFileSync(join(OUT_DIR, path), 'utf8');
}

const PAGES = exportedPages();

test('the export has pages to check', () => {
  expect(PAGES).toContain('/');
  expect(PAGES).toContain('/components/button/api');
  expect(PAGES).toContain('/whats-new');
});

test('every page has its Markdown twin', () => {
  for (const path of PAGES) {
    const file = markdownPath(path);
    expect(existsSync(join(OUT_DIR, file)), `${file} is missing`).toBe(true);
    expect(read(file), `${file} has no title`).toMatch(/^# \S/);
  }
});

test("a component page's twin has its examples' source and its props", () => {
  const button = read('/components/button.md');
  expect(button).toContain('## Overview');
  expect(button).toContain('`button-variants.tsx`:');
  expect(button).toContain('<Button variant="filled">Filled</Button>');
  expect(button).toContain('## API');
  expect(button).toMatch(/\| `variant` \| `"text" \\\| "filled"/);
  expect(button).toContain('## Accessibility');
  expect(button).not.toContain('Show code');
});

test('llms.txt links every guide and component twin', () => {
  const llms = read('/llms.txt');
  expect(llms).toMatch(/^# Windmorph\n\n> /);
  const linked = new Set(
    [...llms.matchAll(/\]\((https:[^)]+)\)/g)].map(([, url]) => new URL(url!).pathname),
  );
  for (const path of PAGES) {
    // Tab pages are part of their component page's twin; the home page's twin is llms.txt.
    if (path === '/' || isTabPage(path)) continue;
    expect(linked, `llms.txt doesn't link ${path}`).toContain(markdownPath(path));
  }
  for (const path of linked) expect(existsSync(join(OUT_DIR, path)), path).toBe(true);
});

test('llms-full.txt holds the guides and component pages in full', () => {
  const full = read('/llms-full.txt');
  expect(full).toContain('# Getting started');
  expect(full).toContain('# Button\n');
  expect(full).toContain('`button-variants.tsx`:');
});

test('every page has a canonical URL and a link-preview image that exists', () => {
  const content = (html: string, pattern: RegExp) => pattern.exec(html)?.[1] ?? null;
  for (const path of PAGES) {
    const html = read(path === '/' ? 'index.html' : `${path.slice(1)}.html`);
    // Next writes the home page's canonical URL without its trailing slash.
    const canonical = path === '/' ? SITE_URL : `${SITE_URL}${path}`;
    expect(content(html, /<link rel="canonical" href="([^"]+)"/), path).toBe(canonical);
    const image = ogImagePath(path);
    expect(content(html, /<meta property="og:image" content="([^"]+)"/), path).toBe(
      `${SITE_URL}${image}`,
    );
    expect(content(html, /<meta name="twitter:card" content="([^"]+)"/), path).toBe(
      'summary_large_image',
    );
    expect(existsSync(join(OUT_DIR, image)), `${image} is missing`).toBe(true);
  }
});

test('the sitemap lists every page and robots.txt points to it', () => {
  const sitemap = read('/sitemap.xml');
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, url]) => new URL(url!).pathname,
  );
  expect(listed.sort()).toEqual(PAGES);
  expect(read('/robots.txt')).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
});
