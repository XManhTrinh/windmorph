import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ICONS_COMMENT, ICONS_MODULE } from '../components/playground/code-emit';

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
  return asAppSource(source.replace(/\n$/, ''));
}

/** The comment above a sample's data import, which is the reader's own module. */
export const SAMPLE_DATA_COMMENT = '// Use your own data.';

/**
 * An example's source as an app would write it, so shown and copied code match the
 * playground's: the site's icons come from the reader's own icon module (`./icons`, with the
 * playground's comment above), and the sample photos from the reader's own data module
 * beside it. The files themselves keep their site paths, so the demos still build.
 */
export function asAppSource(source: string): string {
  return source
    .replace(
      /^(import\s[^;]*?from\s+)'\.\.\/\.\.\/components\/icons';/gm,
      `${ICONS_COMMENT}\n$1'${ICONS_MODULE}';`,
    )
    .replace(
      /^(import\s[^;]*?from\s+)'(?:\.\.\/[a-z-]+\/|\.\/)(sample-photos?)';/gm,
      `${SAMPLE_DATA_COMMENT}\n$1'./$2';`,
    );
}
