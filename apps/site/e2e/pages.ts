import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The static export the suites run against (`test:e2e` builds it first). */
export const OUT_DIR = resolve(here, '../out');

/**
 * Every page of the static export, as its path (`/`, `/theming`, `/components/button/api`),
 * sorted. Read from the export's HTML files, so a page added later is covered without being
 * listed anywhere; the 404 page and Next's own files are left out.
 */
export function exportedPages(): string[] {
  if (!existsSync(OUT_DIR)) {
    throw new Error(
      `No static export at ${OUT_DIR}. Build the site first (the test:e2e turbo task depends on build).`,
    );
  }
  const paths: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '_next' && entry.name !== 'og') walk(full);
      } else if (entry.name.endsWith('.html')) {
        const file = relative(OUT_DIR, full).split(/[\\/]/).join('/');
        if (file === '404.html' || file.startsWith('_')) continue;
        paths.push(file === 'index.html' ? '/' : `/${file.slice(0, -'.html'.length)}`);
      }
    }
  };
  walk(OUT_DIR);
  return paths.sort();
}

/** Whether a path is a component page's tab (`/components/button/api`). */
export function isTabPage(path: string): boolean {
  return /^\/components\/[^/]+\/[^/]+$/.test(path);
}
