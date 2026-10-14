/**
 * Generates one props JSON per public component for the site's props lists, from the library's
 * TypeScript public API, using `react-docgen-typescript`, plus the hooks' docs. It is the
 * site's `generate` task, which Turborepo runs once before `build`, `typecheck`, `lint` and
 * `test` (and `dev` runs first), writing to the gitignored `apps/site/.generated/props/`
 * directory, so the tables can never drift from the code.
 *
 * Each prop is a {@link PropsRecord} (name, type, required, default, description, an enum's
 * members, an object prop's keys), which `components/props-list.tsx` renders as is.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { argv } from 'node:process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { withCustomConfig } from 'react-docgen-typescript';
import ts from 'typescript';
import { compilerOptionsOf, documentHooks, objectFields, type HookDocFile } from './hook-docs';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, '..');
const uiRoot = resolve(siteRoot, '../../packages/react');
/** Windmorph Pro is installed, not in this repo: its props come from its type declarations. */
const proRoot = dirname(
  createRequire(import.meta.url).resolve('@windmorph/react-pro/package.json'),
);
const entryPaths = [
  join(uiRoot, 'src/index.ts'),
  join(proRoot, 'dist/index.d.ts'),
  join(proRoot, 'dist/rich-text.d.ts'),
];
/** The entries whose `use*` exports are documented as hooks, per package. */
const hookEntries = [
  {
    tsconfigPath: join(uiRoot, 'tsconfig.json'),
    entries: [join(uiRoot, 'src/index.ts'), join(uiRoot, 'src/primitives.ts')],
  },
  {
    tsconfigPath: join(siteRoot, 'tsconfig.json'),
    entries: [join(proRoot, 'dist/index.d.ts'), join(proRoot, 'dist/rich-text.d.ts')],
  },
];
/** Each package's component files: the core's sources, and Pro's declarations. */
const packages = [
  {
    source: 'core' as const,
    entries: [join(uiRoot, 'src/index.ts')],
    tsconfigPath: join(uiRoot, 'tsconfig.json'),
    sourceRoots: [
      join(uiRoot, 'src/components'),
      join(uiRoot, 'src/composites'),
      join(uiRoot, 'src/theme'),
    ],
    extension: '.tsx' as const,
  },
  {
    source: 'pro' as const,
    entries: [join(proRoot, 'dist/index.d.ts'), join(proRoot, 'dist/rich-text.d.ts')],
    tsconfigPath: join(siteRoot, 'tsconfig.json'),
    sourceRoots: [join(proRoot, 'dist/components'), join(proRoot, 'dist/rich-text')],
    extension: '.d.ts' as const,
  },
];
const outDir = join(siteRoot, '.generated/props');

type Parser = ReturnType<typeof withCustomConfig>;

export interface PropsRecord {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
  /** For enum (string-literal union) props: the member values, used by the Playground. */
  options?: string[];
  /**
   * For enum props: the members as TypeScript literals (`"filled"`, `1`), so the props list
   * and the Markdown twins can tell a string member from a number one.
   */
  values?: string[];
  /**
   * For an object prop listed in {@link OBJECT_KEY_PROPS}: one row per key (`labels.close`),
   * with the key's own description and default, so the table lists what can be overridden.
   */
  keys?: PropsRecord[];
}

export interface ComponentPropsFile {
  displayName: string;
  description: string;
  /** The package that exports the component: the core, or the installed Windmorph Pro. */
  source: 'core' | 'pro';
  props: PropsRecord[];
}

/** The object props whose keys the tables list one by one. */
export const OBJECT_KEY_PROPS = ['strings', 'labels', 'classNames'] as const;

/**
 * Reads the core's and Pro's entries and collects their capitalised value exports: the core's
 * re-exports from components and composites, and every name in Pro's declaration entries'
 * export lists (only components produce props, so the rest never match).
 */
async function resolveAllowlist(): Promise<Set<string>> {
  const source = (await Promise.all(entryPaths.map((path) => readFile(path, 'utf8')))).join('\n');
  const allow = new Set<string>();
  const block =
    /export\s*\{([^}]*)\}\s*(?:from\s*['"]\.\/(?:components|composites|theme)\/[^'"]+['"]|;)/g;
  for (const match of source.matchAll(block)) {
    for (const raw of match[1]!.split(',')) {
      const part = raw.trim();
      if (!part || part.startsWith('type ')) continue;
      const name = part
        .split(/\s+as\s+/)
        .pop()!
        .trim();
      // PascalCase only: components, not constants such as `AVATAR_TONE_SLOTS`.
      if (/^[A-Z][a-z]/.test(name)) allow.add(name);
    }
  }
  return allow;
}

/**
 * The files that may define components: `.tsx` sources, or a package's `.d.ts` declarations,
 * where only PascalCase files (`Avatar.d.ts`) hold components.
 */
async function collectSources(dirs: string[], extension: '.tsx' | '.d.ts'): Promise<string[]> {
  const files: string[] = [];
  for (const dir of dirs) {
    const entries = await readdir(dir, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(extension)) continue;
      if (extension === '.d.ts' && !/^[A-Z]/.test(entry.name)) continue;
      if (/\.test\.tsx$/.test(entry.name)) continue;
      if (/Context\.(?:tsx|d\.ts)$/.test(entry.name)) continue;
      files.push(join(entry.parentPath, entry.name));
    }
  }
  return files;
}

/** A react-docgen prop `type` as far as we read it (name + optional enum member values). */
export interface DocgenPropType {
  name?: string;
  value?: unknown;
}

/**
 * Pure core: extracts the enum member list from a docgen prop `type`. Returns the string
 * members (surrounding quotes stripped, `undefined` dropped) for a string-literal union, or
 * `undefined` for a non-enum type or an empty list. Testable in isolation.
 */
export function enumOptionsFromType(type: DocgenPropType | undefined): string[] | undefined {
  if (!type || type.name !== 'enum' || !Array.isArray(type.value)) return undefined;
  const options = (type.value as { value?: unknown }[])
    .map((member) => String(member.value).replace(/^"|"$/g, ''))
    .filter((value) => value !== 'undefined');
  return options.length > 0 ? options : undefined;
}

/**
 * Pure core: the enum members from a docgen prop `type` as written in TypeScript (`"filled"`,
 * `1`, `false`), `undefined` dropped. `undefined` for a non-enum type or an empty list.
 */
export function enumValuesFromType(type: DocgenPropType | undefined): string[] | undefined {
  if (!type || type.name !== 'enum' || !Array.isArray(type.value)) return undefined;
  const values = (type.value as { value?: unknown }[])
    .map((member) => String(member.value))
    .filter((value) => value !== 'undefined');
  return values.length > 0 ? values : undefined;
}

/**
 * Pure core: tidies a docgen default. A prop declared in several members of a union (Button's
 * `variant`, in its action, link and toggle forms) comes back as each member's default joined
 * by newlines, so identical lines collapse to one; a genuinely multi-line default is kept.
 */
export function normalizeDefaultValue(raw: string): string {
  const lines = raw.split('\n');
  return lines.every((line) => line.trim() === lines[0]!.trim()) ? lines[0]!.trim() : raw;
}

/** Pure core: parse each file and keep the docgen entries in the allowlist. Testable. */
export function extractProps(
  files: string[],
  parser: Parser,
  allow: Set<string>,
  source: ComponentPropsFile['source'] = 'core',
): ComponentPropsFile[] {
  const records: ComponentPropsFile[] = [];
  for (const file of files) {
    try {
      for (const doc of parser.parse(file)) {
        if (!allow.has(doc.displayName)) continue;
        const props: PropsRecord[] = Object.values(doc.props).map((prop) => {
          // Enum (string-literal union) props carry their members in `type.value`; emit them
          // as `options` (quotes stripped) so the Playground can build a segmented control.
          const options = enumOptionsFromType(prop.type);
          const values = enumValuesFromType(prop.type);
          return {
            name: prop.name,
            type: prop.type?.name ?? 'unknown',
            required: prop.required,
            ...(prop.defaultValue?.value != null
              ? { defaultValue: normalizeDefaultValue(String(prop.defaultValue.value)) }
              : {}),
            ...(prop.description ? { description: prop.description } : {}),
            ...(options && options.length > 0 ? { options } : {}),
            ...(values ? { values } : {}),
          };
        });
        records.push({
          displayName: doc.displayName,
          description: doc.description ?? '',
          source,
          props,
        });
      }
    } catch (error) {
      console.warn(`[generate-props] skipped ${file}: ${(error as Error).message}`);
    }
  }
  return records;
}

/** A component's props type: the type of its function's first parameter. */
function propsTypeOf(symbol: ts.Symbol, checker: ts.TypeChecker): ts.Type | undefined {
  const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
  if (!declaration) return undefined;
  const [signature] = checker.getTypeOfSymbolAtLocation(symbol, declaration).getCallSignatures();
  const [parameter] = signature?.getParameters() ?? [];
  return parameter ? checker.getTypeOfSymbol(parameter) : undefined;
}

/** A prop of a props type that may be a union (Button's action, link and toggle forms). */
function propertyOf(type: ts.Type, name: string, checker: ts.TypeChecker): ts.Symbol | undefined {
  const direct = checker.getPropertyOfType(type, name);
  if (direct) return direct;
  if (!type.isUnion()) return undefined;
  for (const member of type.types) {
    const found = checker.getPropertyOfType(member, name);
    if (found) return found;
  }
  return undefined;
}

/**
 * An object prop's fields. `Partial<Labels>` is a library mapped type, so it is read through
 * to the interface it wraps, with every field optional.
 */
function keysOf(type: ts.Type, checker: ts.TypeChecker): PropsRecord[] {
  const [wrapped] = type.aliasTypeArguments ?? [];
  if (type.aliasSymbol?.getName() === 'Partial' && wrapped) {
    return objectFields(wrapped, checker, '').map((key) => ({ ...key, required: false }));
  }
  return objectFields(type, checker, '');
}

/**
 * Adds `keys` to each record's {@link OBJECT_KEY_PROPS}: the object's fields, with their JSDoc
 * description and `@default`, read with the TypeScript checker from the package's entries.
 */
export function addObjectKeys(
  records: ComponentPropsFile[],
  entries: string[],
  options: ts.CompilerOptions,
): void {
  const program = ts.createProgram({ rootNames: entries, options });
  const checker = program.getTypeChecker();
  const exported = new Map<string, ts.Symbol>();
  for (const entry of entries) {
    const source = program.getSourceFile(entry);
    const moduleSymbol = source && checker.getSymbolAtLocation(source);
    if (!moduleSymbol) throw new Error(`cannot read the exports of ${entry}`);
    for (const symbol of checker.getExportsOfModule(moduleSymbol)) {
      exported.set(
        symbol.getName(),
        symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol,
      );
    }
  }
  for (const record of records) {
    const symbol = exported.get(record.displayName);
    const propsType = symbol && propsTypeOf(symbol, checker);
    if (!propsType) continue;
    for (const prop of record.props) {
      if (!(OBJECT_KEY_PROPS as readonly string[]).includes(prop.name)) continue;
      const property = propertyOf(propsType, prop.name, checker);
      if (!property) continue;
      const keys = keysOf(checker.getNonNullableType(checker.getTypeOfSymbol(property)), checker);
      if (keys.length > 0)
        prop.keys = keys.map((key) => ({ ...key, name: `${prop.name}.${key.name}` }));
    }
  }
}

async function main(): Promise<void> {
  let allow: Set<string>;
  try {
    allow = await resolveAllowlist();
    if (allow.size === 0) throw new Error("no public components found in the packages' entries");
  } catch (error) {
    console.error(
      `[generate-props] cannot resolve the public component allowlist: ${(error as Error).message}`,
    );
    process.exit(1);
  }

  const records: ComponentPropsFile[] = [];
  for (const { source, entries, tsconfigPath, sourceRoots, extension } of packages) {
    const parser = withCustomConfig(tsconfigPath, {
      savePropValueAsString: true,
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      // Skip props inherited from React and other libraries, but keep the installed Pro's own.
      propFilter: (prop) =>
        !prop.parent ||
        !/node_modules/.test(prop.parent.fileName) ||
        /@windmorph\/react-pro\//.test(prop.parent.fileName),
    });
    const found = extractProps(await collectSources(sourceRoots, extension), parser, allow, source);
    try {
      addObjectKeys(found, entries, compilerOptionsOf(tsconfigPath));
    } catch (error) {
      console.error(
        `[generate-props] cannot list the object props' keys: ${(error as Error).message}`,
      );
      process.exit(1);
    }
    records.push(...found);
  }

  const hooks: HookDocFile[] = [];
  try {
    for (const { tsconfigPath, entries } of hookEntries) {
      hooks.push(...documentHooks(tsconfigPath, entries));
    }
  } catch (error) {
    console.error(`[generate-props] cannot document the hooks: ${(error as Error).message}`);
    process.exit(1);
  }

  try {
    await rm(outDir, { recursive: true, force: true });
    await mkdir(outDir, { recursive: true });
    await Promise.all(
      [...records, ...hooks].map((record) =>
        writeFile(
          join(outDir, `${record.displayName}.json`),
          `${JSON.stringify(record, null, 2)}\n`,
        ),
      ),
    );
  } catch (error) {
    console.error(`[generate-props] cannot write ${outDir}: ${(error as Error).message}`);
    process.exit(1);
  }

  console.log(
    `[generate-props] wrote ${records.length} components and ${hooks.length} hooks to ${outDir}`,
  );
}

// Run only when invoked directly as a script, not when imported (e.g. by a unit test).
if (argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  await main();
}
