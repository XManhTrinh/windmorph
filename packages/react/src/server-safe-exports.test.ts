import { existsSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * A `"use client"` module's exports all reach a React Server Component as client
 * references, which it can render but not call. So every export a server component may
 * call (a function, a class or a constant) must come from a module without the directive;
 * components, contexts and hooks may come from either.
 */
const src = dirname(fileURLToPath(import.meta.url));

/** Exports in PascalCase that are classes or constants, not components or contexts. */
const PASCAL_CASE_VALUES = new Set([
  'CornerRounding',
  'Cubic',
  'MaterialShapes',
  'Morph',
  'RoundedPolygon',
  'SnackbarHostState',
]);

const isServerCallable = (name: string) =>
  /^[A-Z][A-Z0-9_]+$/.test(name) ||
  PASCAL_CASE_VALUES.has(name) ||
  (/^[a-z]/.test(name) && !/^use[A-Z]/.test(name));

function resolveModule(from: string, specifier: string): string {
  const base = resolve(dirname(from), specifier);
  const file = ['.ts', '.tsx', '/index.ts'].map((ext) => base + ext).find(existsSync);
  if (!file) throw new Error(`Cannot resolve ${specifier} from ${from}`);
  return file;
}

const RE_EXPORT = /export\s*\{([^}]*)\}\s*from\s*'([^']+)'/g;

/** The value names a re-export list names, as [exported name, name in the source module]. */
function names(list: string): [string, string][] {
  return list
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '' && !item.startsWith('type '))
    .map((item) => {
      const [original = item, alias] = item.split(/\s+as\s+/);
      return [alias ?? original, original];
    });
}

/** The module that declares `name`, following re-exports from `file`. */
function origin(file: string, name: string): string {
  for (const [, list = '', specifier = ''] of readFileSync(file, 'utf8').matchAll(RE_EXPORT)) {
    const match = names(list).find(([exported]) => exported === name);
    if (match) return origin(resolveModule(file, specifier), match[1]);
  }
  return file;
}

/** Every value export of a module, mapped to the module that declares it. */
function valueExports(file: string): Map<string, string> {
  const code = readFileSync(file, 'utf8');
  const exports = new Map<string, string>();
  for (const [, typeOnly, list = '', specifier = ''] of code.matchAll(
    /export\s*(type\s*)?\{([^}]*)\}\s*from\s*'([^']+)'/g,
  )) {
    if (typeOnly) continue;
    const target = resolveModule(file, specifier);
    for (const [exported, original] of names(list)) exports.set(exported, origin(target, original));
  }
  for (const [, specifier = ''] of code.matchAll(/export\s*\*\s*from\s*'([^']+)'/g)) {
    for (const [name, declared] of valueExports(resolveModule(file, specifier))) {
      exports.set(name, declared);
    }
  }
  for (const [, name = ''] of code.matchAll(
    /export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/g,
  )) {
    exports.set(name, file);
  }
  return exports;
}

const isClientModule = (file: string) => /^['"]use client['"];/.test(readFileSync(file, 'utf8'));

describe.each(['index.ts', 'primitives.ts', 'next.ts'])('%s', (entry) => {
  const exports = valueExports(resolve(src, entry));

  it('finds the entry exports', () => {
    expect(exports.size).toBeGreaterThan(entry === 'next.ts' ? 3 : 30);
  });

  it('exports every function, class and constant from a module without "use client"', () => {
    const clientOnly = [...exports]
      .filter(([name, file]) => isServerCallable(name) && isClientModule(file))
      .map(([name, file]) => `${name} (${relative(src, file)})`);
    expect(clientOnly).toEqual([]);
  });
});
