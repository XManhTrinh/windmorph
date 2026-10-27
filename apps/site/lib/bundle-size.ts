import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The size report `@windmorph/react`'s build writes (`packages/react/scripts/bundle-size.ts`):
 * each component module's gzipped size with the library modules it imports. Read from the
 * workspace package at build time, like the props generator reads its source.
 */
const here = dirname(fileURLToPath(import.meta.url));
const reportFile = resolve(here, '../../../packages/react/dist/bundle-size.json');

interface EntrySize {
  exports: string[];
  gzip: number;
}

/** One component module's size, under the names a page documents. */
export interface ComponentSize {
  /** The page's components that the module exports, e.g. `Dialog`, `DialogTrigger`. */
  names: string[];
  gzip: number;
}

let report: Promise<Record<string, EntrySize>> | null = null;

function readReport(): Promise<Record<string, EntrySize>> {
  report ??= readFile(reportFile, 'utf8').then(
    (json) => JSON.parse(json) as Record<string, EntrySize>,
  );
  return report;
}

/**
 * The sizes of the modules that export `components` (a page's documented components), in
 * the page's order. Windmorph Pro's components aren't measured, so a Pro page gets none.
 */
export async function componentSizes(components: string[]): Promise<ComponentSize[]> {
  const entries = Object.values(await readReport());
  const sizes: ComponentSize[] = [];
  for (const name of components) {
    const entry = entries.find((candidate) => candidate.exports.includes(name));
    if (!entry || sizes.some((size) => size.names.includes(name))) continue;
    sizes.push({
      names: components.filter((other) => entry.exports.includes(other)),
      gzip: entry.gzip,
    });
  }
  return sizes;
}

/** Bytes as kilobytes, one decimal: `11.2 kB`. */
export function formatKilobytes(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} kB`;
}
