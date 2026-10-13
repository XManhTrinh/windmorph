import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolves against this file's own directory (like `scripts/generate-props.ts` does with
 * `fileURLToPath(import.meta.url)`), so the lookup is stable regardless of the build cwd.
 */
const here = dirname(fileURLToPath(import.meta.url));
const examplesRoot = resolve(here, '../examples');

/**
 * Reads the raw source of a live-example file under `apps/site/examples/`, so a Server
 * Component can show a demo's exact source beside the rendered component. Runs only at
 * build time (`output: 'export'`), consistent with the fs-based props generator.
 *
 * @example
 * const src = await readExampleSource('theming/theme-switcher-demo.tsx');
 * const html = await highlightSource(src, 'tsx');
 * <CodeBlock code={src} html={html} lang="tsx" title="theme-switcher-demo.tsx" />
 */
export async function readExampleSource(relativePath: string): Promise<string> {
  const source = await readFile(join(examplesRoot, relativePath), 'utf8');
  return source.replace(/\n$/, '');
}
