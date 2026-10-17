import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, posix, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Internal link checker for the static export.
 *
 * Resolves against this file's own directory (like `lib/example-source.ts` does with
 * `fileURLToPath(import.meta.url)`), so the lookup is stable regardless of the build cwd.
 * It parses every emitted HTML file in `out/`, extracts internal `href`s, and confirms each
 * resolves to a generated page/asset on disk (and, for `#fragment` links, that the target
 * page actually contains that element id). Exits non-zero if any internal link is broken.
 */
const here = dirname(fileURLToPath(import.meta.url));

/** Same-page fragments the examples use as placeholders (`href="#demo-terms"`). */
const DEMO_FRAGMENT_PREFIX = 'demo-';
const outDir = resolve(here, '../out');

interface BrokenLink {
  sourceFile: string;
  href: string;
  reason: string;
}

/** Recursively collects every `*.html` file under `root`, as absolute paths. */
function collectHtmlFiles(root: string): string[] {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(full);
    }
  };
  walk(root);
  return files;
}

/** Maps an absolute HTML file path to the route(s) it serves (always POSIX, leading `/`). */
function routesForFile(file: string): string[] {
  const rel = relative(outDir, file).split(/[\\/]/).join('/'); // posix-ify
  if (rel === 'index.html') return ['/'];
  if (rel.endsWith('/index.html')) {
    const base = '/' + rel.slice(0, -'/index.html'.length);
    return [base, base + '/'];
  }
  // `foo/bar.html` -> `/foo/bar`
  return ['/' + rel.slice(0, -'.html'.length)];
}

/** Extracts element id attributes (anchors) from HTML markup. */
function extractIds(html: string): Set<string> {
  const ids = new Set<string>();
  const re = /\sid=["']([^"']+)["']/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (match[1] !== undefined) ids.add(match[1]);
  }
  return ids;
}

/**
 * Extracts the `href` of every real `<a>` anchor in the markup. Scoped to `<a …>` tags on
 * purpose: a plain `href="…"` substring also appears inside highlighted code samples (shiki
 * renders source such as `<Button href="/pricing">` as literal text), which are not navigable
 * links and must not be reported as broken.
 */
function extractHrefs(html: string): string[] {
  const hrefs: string[] = [];
  const re = /<a\s+[^>]*?href=["']([^"']*)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    if (match[1] !== undefined) hrefs.push(match[1]);
  }
  return hrefs;
}

/** True for links that point outside the site (skip them). */
function isExternal(href: string): boolean {
  return (
    /^[a-z][a-z0-9+.-]*:/i.test(href) || // scheme: http:, https:, mailto:, tel:, data:, …
    href.startsWith('//') // protocol-relative
  );
}

/** Does a file exist at the given absolute path (as a file)? */
function fileExists(path: string): boolean {
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

function main(): void {
  if (!fileExists(join(outDir, 'index.html'))) {
    console.error(
      `[check-links] no static export found at ${outDir}. Build the site first ` +
        `(e.g. \`pnpm turbo run build --filter=site\`).`,
    );
    process.exit(1);
  }

  const htmlFiles = collectHtmlFiles(outDir);

  // Build the set of known routes and, per route, the anchor ids on that page.
  const idsByRoute = new Map<string, Set<string>>();
  for (const file of htmlFiles) {
    const ids = extractIds(readFileSync(file, 'utf8'));
    for (const route of routesForFile(file)) idsByRoute.set(route, ids);
  }

  const broken: BrokenLink[] = [];

  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    const route = routesForFile(file)[0] ?? '/';
    const sourceFile = relative(outDir, file).split(/[\\/]/).join('/');

    for (const rawHref of extractHrefs(html)) {
      const href = rawHref.trim();
      if (href === '' || isExternal(href)) continue;
      if (href.startsWith('#')) {
        // Same-page fragment.
        const id = decodeURIComponent(href.slice(1));
        if (id === '' || id === 'top') continue; // `#` / `#top` are always valid.
        // Placeholder links in the live examples ("Terms of service", a list row) point at
        // `#demo-…` on purpose: they show a link, not a page on this site.
        if (id.startsWith(DEMO_FRAGMENT_PREFIX)) continue;
        const ids = idsByRoute.get(route);
        if (!ids || !ids.has(id)) {
          broken.push({ sourceFile, href, reason: `no element with id "${id}" on this page` });
        }
        continue;
      }

      // Resolve relative to the current route, drop query, split off fragment.
      const noQuery = href.split('?')[0] ?? '';
      const [pathPart = '', fragment] = noQuery.split('#');
      const resolvedPath = pathPart.startsWith('/')
        ? pathPart
        : posix.resolve(posix.dirname(route === '/' ? '/index' : route), pathPart);

      // Try, in order: exact file, `+.html`, `/index.html` — covers pages and assets.
      const candidates = [
        join(outDir, resolvedPath),
        join(outDir, resolvedPath + '.html'),
        join(outDir, resolvedPath, 'index.html'),
      ];
      const targetFile = candidates.find((candidate) => fileExists(candidate));

      if (!targetFile) {
        broken.push({ sourceFile, href, reason: `no page/asset for "${resolvedPath}"` });
        continue;
      }

      // If there's a fragment and the target is an HTML page, the anchor must exist.
      if (fragment && targetFile.endsWith('.html')) {
        const targetRoutes = routesForFile(targetFile);
        const ids =
          targetRoutes.map((route) => idsByRoute.get(route)).find((set) => set) ??
          extractIds(readFileSync(targetFile, 'utf8'));
        const id = decodeURIComponent(fragment);
        if (id !== '' && id !== 'top' && !ids.has(id)) {
          broken.push({
            sourceFile,
            href,
            reason: `target page has no element with id "${id}"`,
          });
        }
      }
    }
  }

  if (broken.length > 0) {
    console.error(`[check-links] found ${broken.length} broken internal link(s):\n`);
    for (const { sourceFile, href, reason } of broken) {
      console.error(`  ${sourceFile}  →  ${href}\n      ${reason}`);
    }
    process.exit(1);
  }

  console.log(
    `[check-links] OK — checked ${htmlFiles.length} page(s); all internal links resolve.`,
  );
}

main();
