import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ComponentPropsFile } from '../scripts/generate-props';
import type { HookDocFile } from '../scripts/hook-docs';

/**
 * Resolves against this file's own directory (like `lib/example-source.ts` and
 * `scripts/generate-props.ts` do with `fileURLToPath(import.meta.url)`), so the lookup is
 * stable regardless of the build cwd.
 */
const here = dirname(fileURLToPath(import.meta.url));
const propsRoot = resolve(here, '../.generated/props');

// Re-export the shape the generator writes, so a component page can feed `json.props`
// straight into `PropsList`.
export type { ComponentPropsFile, PropsRecord } from '../scripts/generate-props';
export type { HookDocFile } from '../scripts/hook-docs';

/**
 * Reads the generated props JSON for a component `displayName` from the gitignored
 * `apps/site/.generated/props/` directory. Runs only at build time (`output: 'export'`),
 * consistent with the props generator and `readExampleSource`.
 *
 * @example
 * const json = await readComponentProps('Button');
 * <PropsList caption="Button props" scope="Button" props={json.props} />
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

/**
 * A hook's generated docs (its signature, parameters and return value), written beside the
 * components' props JSON. `null` when the file is absent, like {@link readComponentPropsSafe}.
 */
export async function readHookDocSafe(name: string): Promise<HookDocFile | null> {
  try {
    const source = await readFile(join(propsRoot, `${name}.json`), 'utf8');
    return JSON.parse(source) as HookDocFile;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
}
