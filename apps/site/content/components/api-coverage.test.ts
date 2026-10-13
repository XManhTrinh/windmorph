import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GUIDE_API } from '../../app/(docs)/guide-api-data';
import { COMPONENT_META } from './catalog';

/**
 * Every component and hook the core exports has a generated table on some page: a component
 * page's API tab (its `propsComponents` and `hooks`) or a guide's API reference.
 */

const coreEntry = resolve(process.cwd(), '../../packages/react/src/index.ts');
const propsDir = resolve(process.cwd(), '.generated/props');

/** The value exports of an entry file (type-only exports left out). */
function valueExports(file: string): string[] {
  const source = readFileSync(file, 'utf8');
  const names: string[] = [];
  for (const match of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const raw of match[1]!.split(',')) {
      const part = raw.trim();
      if (!part || part.startsWith('type ')) continue;
      names.push(
        part
          .split(/\s+as\s+/)
          .pop()!
          .trim(),
      );
    }
  }
  return names;
}

/**
 * Capitalised value exports that aren't components, so they have no props table, each with
 * where it's documented instead.
 */
const NOT_COMPONENTS: Record<string, string> = {
  ButtonContext:
    'A React context for building on top: the button group and the toolbars provide it.',
  ToggleGroupStateContext:
    "A React context for building on top: a button group's selection state, read by its buttons.",
  SnackbarHostState:
    "A class, not a component: its members are listed under `useSnackbarHostState`'s return value.",
};

describe('API coverage', () => {
  const documented = new Set([
    ...COMPONENT_META.flatMap((meta) => [...meta.propsComponents, ...(meta.hooks ?? [])]),
    ...Object.values(GUIDE_API).flatMap((api) => [...api.components, ...api.hooks]),
  ]);
  const exported = valueExports(coreEntry).filter(
    (name) => /^[A-Z][a-z]/.test(name) || /^use[A-Z]/.test(name),
  );

  it('finds the core exports', () => {
    expect(exported).toContain('Button');
    expect(exported).toContain('useToolbarScrollExit');
  });

  it('documents every exported component and hook in a props table', () => {
    const missing = exported.filter((name) => !documented.has(name) && !(name in NOT_COMPONENTS));
    expect(
      missing,
      "exports with no props table: add each to a page's `propsComponents` or `hooks`",
    ).toEqual([]);
  });

  it('lists only exports that are not documented in a table', () => {
    for (const name of Object.keys(NOT_COMPONENTS)) {
      expect(exported, `${name} is no longer exported`).toContain(name);
      expect(documented.has(name), `${name} has a table now`).toBe(false);
    }
  });

  it('has a generated table for every documented name', () => {
    const absent = [...documented].filter((name) => !existsSync(resolve(propsDir, `${name}.json`)));
    expect(
      absent,
      'documented names with no generated JSON (run `pnpm --filter site generate`)',
    ).toEqual([]);
  });
});
