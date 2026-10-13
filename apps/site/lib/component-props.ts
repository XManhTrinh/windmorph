import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ComponentPropsFile } from '../scripts/generate-props';

/**
 * Resolves against this file's own directory (like `lib/example-source.ts` and
 * `scripts/generate-props.ts` do with `fileURLToPath(import.meta.url)`), so the lookup is
 * stable regardless of the build cwd.
 */
const here = dirname(fileURLToPath(import.meta.url));
const propsRoot = resolve(here, '../.generated/props');

// Re-export the shape the generator writes, so a component page can feed `json.props`
// straight into `PropsTable` (its rows are `PropsTableRow`).
export type { ComponentPropsFile, PropsRecord } from '../scripts/generate-props';

/**
 * Reads the generated props JSON for a component `displayName` from the gitignored
 * `apps/site/.generated/props/` directory. Runs only at build time (`output: 'export'`),
 * consistent with the props generator and `readExampleSource`.
 *
 * @example
 * const json = await readComponentProps('Button');
 * <PropsTable caption="Button props" rows={json.props} />
 */
export async function readComponentProps(displayName: string): Promise<ComponentPropsFile> {
  const source = await readFile(join(propsRoot, `${displayName}.json`), 'utf8');
  return JSON.parse(source) as ComponentPropsFile;
}

/**
 * Like {@link readComponentProps}, but returns `null` when the file is absent, so a page
 * can skip a missing sub-component table without failing the build. Other read errors
 * (e.g. malformed JSON) still throw.
 */
export async function readComponentPropsSafe(
  displayName: string,
): Promise<ComponentPropsFile | null> {
  try {
    return await readComponentProps(displayName);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
