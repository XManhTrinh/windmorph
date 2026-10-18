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
import { Parser as DocgenParser, withCustomConfig } from 'react-docgen-typescript';
import ts from 'typescript';
import { compilerOptionsOf, documentHooks, objectFields, type HookDocFile } from './hook-docs';

/**
 * react-docgen-typescript caches a prop by its declaring file and name when that file is in
 * `node_modules`, meant for React's own types. Pro's declarations are installed there too, so
 * two components declared in one file (`AccordionHeader` and `AccordionPanel` beside
 * `AccordionItem`) would share each other's `className`, `classNames` and `ref` rows. Each
 * component starts with an empty cache instead.
 */
type CachedParser = { propertiesOfPropsCache: Map<string, unknown> };
const readPropsInfo = DocgenParser.prototype.getPropsInfo;
DocgenParser.prototype.getPropsInfo = function (this: CachedParser, ...args) {
  this.propertiesOfPropsCache.clear();
  return readPropsInfo.apply(this, args);
} as typeof readPropsInfo;

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
  /**
   * Inherited from React Aria (`react-aria`, `react-stately`, `@react-types/*`) rather than
   * declared by the component: the props list folds these into their own group.
   */
  inherited?: true;
}

export interface ComponentPropsFile {
  displayName: string;
  description: string;
  /** The package that exports the component: the core, or the installed Windmorph Pro. */
  source: 'core' | 'pro';
  props: PropsRecord[];
  /**
   * The element whose HTML attributes the component also accepts and passes on (`button`,
   * `a`, `input`), or `element` when the props extend the generic `HTMLAttributes`. The
   * table names it in one line instead of listing every DOM attribute.
   */
  htmlAttributes?: string[];
}

/** The object props whose keys the tables list one by one. */
export const OBJECT_KEY_PROPS = ['labels', 'classNames'] as const;

/** Where a prop is declared: by the package, by React Aria, by React's DOM types, or elsewhere. */
export type PropOrigin = 'own' | 'react-aria' | 'dom' | 'other';

const REACT_ARIA_FILE =
  /\/node_modules\/(?:react-aria|react-aria-components|react-stately|@react-aria|@react-stately|@react-types)\//;
const DOM_TYPES_FILE = /\/node_modules\/@types\/react\//;

/** The origin of one declaring file (the installed Windmorph Pro counts as the package's own). */
export function fileOrigin(fileName: string): PropOrigin {
  if (!/\/node_modules\//.test(fileName) || /@windmorph\/react-pro\//.test(fileName)) return 'own';
  if (REACT_ARIA_FILE.test(fileName)) return 'react-aria';
  if (DOM_TYPES_FILE.test(fileName)) return 'dom';
  return 'other';
}

const ORIGIN_RANK: PropOrigin[] = ['own', 'react-aria', 'dom', 'other'];

/**
 * A prop's origin from every file that declares it, the closest one winning: a prop the
 * component redeclares (`aria-label` in a naming union over `HTMLAttributes`) is its own, even
 * when docgen names React's DOM types as its parent.
 */
export function propOrigin(prop: {
  parent?: { fileName: string };
  declarations?: { fileName: string }[];
}): PropOrigin {
  const files = [...(prop.declarations ?? []), ...(prop.parent ? [prop.parent] : [])];
  if (files.length === 0) return 'own';
  const origins = new Set(files.map(({ fileName }) => fileOrigin(fileName)));
  return ORIGIN_RANK.find((origin) => origins.has(origin))!;
}

/**
 * React Aria props left out of the tables: deprecated or escape-hatch props, and the ARIA
 * plumbing a component sets itself. React Aria's `is*` names are left out too: the
 * components take the plain names (`disabled`, `required`), and an `is*` prop still passed
 * through is not part of the documented API.
 */
export const INHERITED_DENYLIST: ReadonlySet<string> = new Set([
  'validationState',
  'excludeFromTabOrder',
  'aria-activedescendant',
  'aria-autocomplete',
  'aria-haspopup',
  'aria-controls',
  // React Aria's own note: "Not recommended – use `onPress` instead."
  'onClick',
]);

/**
 * Props from React's DOM types the tables still list, the ones every component documents,
 * with the description React's types don't give them.
 */
const DOM_PROPS_KEPT: Readonly<Record<string, string>> = {
  ref: 'Ref to the root element.',
  className: "Classes for the root element, merged with the component's own (yours win).",
  style: 'Inline styles for the root element.',
};

/**
 * Whether a prop gets a row: the package's own props, React Aria's (minus
 * {@link INHERITED_DENYLIST}, `UNSAFE_*` and `is*`), and from React's DOM types only `ref`,
 * `className` and `style`. The rest of the DOM attributes are summed up in one line.
 */
export function keepProp(prop: {
  name: string;
  parent?: { fileName: string };
  declarations?: { fileName: string }[];
}): boolean {
  switch (propOrigin(prop)) {
    case 'own':
      return true;
    case 'react-aria':
      return (
        !INHERITED_DENYLIST.has(prop.name) &&
        !/^UNSAFE_/.test(prop.name) &&
        !/^is[A-Z]/.test(prop.name)
      );
    case 'dom':
      return Object.hasOwn(DOM_PROPS_KEPT, prop.name);
    default:
      return false;
  }
}

/** React's attribute interfaces and the element each one describes. */
const HTML_ATTRIBUTE_ELEMENTS: Record<string, string> = {
  AnchorHTMLAttributes: 'a',
  ButtonHTMLAttributes: 'button',
  FormHTMLAttributes: 'form',
  ImgHTMLAttributes: 'img',
  InputHTMLAttributes: 'input',
  LabelHTMLAttributes: 'label',
  LiHTMLAttributes: 'li',
  OlHTMLAttributes: 'ol',
  TextareaHTMLAttributes: 'textarea',
  VideoHTMLAttributes: 'video',
  DialogHTMLAttributes: 'dialog',
  TableHTMLAttributes: 'table',
};

/**
 * The elements whose attributes a component accepts, from the React interfaces its left-out
 * DOM props come from: the specific elements (`button`, `a`), else `element` for the generic
 * `HTMLAttributes`. `undefined` when it accepts none.
 */
export function htmlAttributeElements(interfaces: Iterable<string>): string[] | undefined {
  const names = [...interfaces];
  const specific = [
    ...new Set(names.flatMap((name) => HTML_ATTRIBUTE_ELEMENTS[name] ?? [])),
  ].sort();
  if (specific.length > 0) return specific;
  return names.some((name) => /HTMLAttributes$|^AllHTMLAttributes$/.test(name))
    ? ['element']
    : undefined;
}

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
  droppedInterfaces: ReadonlyMap<string, ReadonlySet<string>> = new Map(),
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
            // A DOM prop kept (`ref`, `className`, `style`) reads our words, not React's.
            ...(propOrigin(prop) === 'dom' && DOM_PROPS_KEPT[prop.name]
              ? { description: DOM_PROPS_KEPT[prop.name] }
              : prop.description
                ? { description: prop.description }
                : {}),
            ...(options && options.length > 0 ? { options } : {}),
            ...(values ? { values } : {}),
            ...(propOrigin(prop) === 'react-aria' ? { inherited: true as const } : {}),
          };
        });
        const htmlAttributes = htmlAttributeElements(droppedInterfaces.get(doc.displayName) ?? []);
        records.push({
          displayName: doc.displayName,
          description: doc.description ?? '',
          source,
          props,
          ...(htmlAttributes ? { htmlAttributes } : {}),
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

/** A union props type's members (Button's action, link and toggle forms); else the type itself. */
function membersOf(type: ts.Type): readonly ts.Type[] {
  return type.isUnion() ? type.types : [type];
}

/** A JSDoc comment's text as written, keeping `{@link Name}` for the props list to link. */
function declarationDoc(declaration: ts.Declaration): string {
  return ts
    .getJSDocCommentsAndTags(declaration)
    .filter(ts.isJSDoc)
    .map((doc) => ts.getTextOfJSDocComment(doc.comment) ?? '')
    .join('\n')
    .trim();
}

/**
 * A property's description, from the closest declaration that has one: the package's own,
 * then React Aria's, then React's. Docgen would join every declaration's text instead.
 */
function propertyDoc(property: ts.Symbol): string {
  const declarations = property.declarations ?? [];
  // `ref`, `className` and `style` read our own words rather than React's.
  const origins = Object.hasOwn(DOM_PROPS_KEPT, property.getName())
    ? ORIGIN_RANK.filter((origin) => origin !== 'dom')
    : ORIGIN_RANK;
  for (const origin of origins) {
    for (const declaration of declarations) {
      if (fileOrigin(declaration.getSourceFile().fileName) !== origin) continue;
      const text = declarationDoc(declaration);
      if (text) return text;
    }
  }
  return '';
}

/** Whether a property is typed `never` (`href?: never`), ruling the prop out of a form. */
function rulesOut(property: ts.Symbol, checker: ts.TypeChecker): boolean {
  const type = checker.getNonNullableType(checker.getTypeOfSymbol(property));
  return (type.flags & ts.TypeFlags.Never) !== 0;
}

/** Whether a member requires the property: declared, not optional and not `never`. */
function requires(member: ts.Type, name: string, checker: ts.TypeChecker): boolean {
  const property = checker.getPropertyOfType(member, name);
  if (!property || property.flags & ts.SymbolFlags.Optional) return false;
  return !rulesOut(property, checker);
}

/** Props that name an element; a union often requires exactly one of them. */
const NAMING_PROPS = ['title', 'label', 'aria-label', 'aria-labelledby'];

/**
 * Pure core: removes raw JSDoc block tags (`@see aria-labelledby.`) that docgen leaves in a
 * description read from React's types.
 */
export function stripDocTags(description: string): string {
  return description
    .split('\n')
    .filter((line) => !/^\s*@(?:see|link|remarks|example)\b/.test(line))
    .join('\n')
    .trim();
}

/**
 * Pure core: a bare default as the TypeScript it stands for. Docgen gives a destructured
 * default without its quotes (`presentation = 'popover'` → `popover`), so a default that is
 * one of the enum's members once quoted, or a plain word on a `string` prop with no `@default`
 * tag, is quoted like the `@default "sm"` ones.
 */
export function quoteDefault(
  value: string,
  prop: Pick<PropsRecord, 'type' | 'values'>,
  hasDefaultTag: boolean,
): string {
  if (/^["'`]/.test(value)) return value;
  if (prop.values?.includes(`"${value}"`)) return `"${value}"`;
  if (!hasDefaultTag && prop.type === 'string' && /^[\w-]+$/.test(value)) return `"${value}"`;
  return value;
}

/**
 * Pure core: one `ref` description for a component whose forms render different elements
 * (`Ref to the root <button> element.` and `Ref to the root <a> element.`): "Ref to the root
 * element: the `<button>`, or the `<a>` with `href`." `undefined` unless each form's text
 * names one element and the first form's differs from the rest.
 */
export function refByForm(docs: readonly string[]): string | undefined {
  const tags = docs.map((doc) => {
    const found = [...doc.matchAll(/`<([a-z]+)>`/g)].map((match) => match[1]!);
    return found.length === 1 ? found[0] : undefined;
  });
  if (tags.length < 2 || tags.some((tag) => tag === undefined)) return undefined;
  const [first, ...rest] = [...new Set(tags)] as string[];
  if (rest.length === 0) return undefined;
  const others = rest.map((tag) => (tag === 'a' ? '`<a>` with `href`' : `\`<${tag}>\``));
  return `Ref to the root element: the \`<${first}>\`, or the ${others.join(', or the ')}.`;
}

/** Joins names as prose code: `a`, `b` or `c`. */
function orList(names: readonly string[]): string {
  const code = names.map((name) => `\`${name}\``);
  return code.length <= 2
    ? code.join(' or ')
    : `${code.slice(0, -1).join(', ')} or ${code[code.length - 1]}`;
}

/**
 * Corrects what docgen reads wrong from a component's props type, with the TypeScript checker
 * over the package's entries:
 *
 * - **Required** only when every member of a union props type requires the prop (docgen marks
 *   it required when any does: SplitButton's `href`, required by its link forms only). When
 *   every member requires one of its naming props (`aria-label` or `aria-labelledby`), both
 *   rows say so.
 * - **One description:** a prop declared in several members, or redeclared over a library type,
 *   takes the first member's own text; docgen joins them all.
 * - **Defaults:** a `@default` tag wins over the destructured value, and a bare string default is
 *   quoted ({@link quoteDefault}).
 * - **Keys:** each {@link OBJECT_KEY_PROPS} prop lists its object's fields, with their JSDoc
 *   description and `@default`.
 */
export function refineWithChecker(
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
    const members = membersOf(propsType);
    const partlyRequired = new Set<string>();
    const domOnly = new Set<string>();
    for (const prop of record.props) {
      const declared = members
        .map((member) => checker.getPropertyOfType(member, prop.name))
        .filter((property): property is ts.Symbol => property !== undefined);
      if (declared.length > 0) {
        const requiredBy = members.filter((member) => requires(member, prop.name, checker));
        if (requiredBy.length < members.length) prop.required = false;
        if (requiredBy.length > 0 && requiredBy.length < members.length) {
          partlyRequired.add(prop.name);
        }
        // A form that rules the prop out (`href?: never` on the button form) doesn't describe it.
        const usable = declared.filter((property) => !rulesOut(property, checker));
        // A prop only ruled out by the package (`target?: never` on the button form) and
        // otherwise a DOM attribute (the link form's `target`) is one of the DOM attributes.
        const fromPackage = usable.some((property) =>
          (property.declarations ?? []).some((declaration) => {
            const origin = fileOrigin(declaration.getSourceFile().fileName);
            return origin === 'own' || origin === 'react-aria';
          }),
        );
        if (!fromPackage && !Object.hasOwn(DOM_PROPS_KEPT, prop.name)) {
          domOnly.add(prop.name);
          continue;
        }
        const docs = (usable.length > 0 ? usable : declared).map(propertyDoc).filter(Boolean);
        const own = (prop.name === 'ref' && refByForm(docs)) || docs[0];
        if (own && own !== prop.description) prop.description = own;
        const defaultTag = declared
          .flatMap((property) => property.getJsDocTags(checker))
          .find((tag) => tag.name === 'default');
        const tagText = defaultTag?.text ? ts.displayPartsToString(defaultTag.text).trim() : '';
        if (tagText) prop.defaultValue = tagText;
        if (prop.defaultValue)
          prop.defaultValue = quoteDefault(prop.defaultValue, prop, Boolean(tagText));
      }
      if (prop.description) prop.description = stripDocTags(prop.description);
      if (!(OBJECT_KEY_PROPS as readonly string[]).includes(prop.name)) continue;
      const property = propertyOf(propsType, prop.name, checker);
      if (!property) continue;
      const keys = keysOf(checker.getNonNullableType(checker.getTypeOfSymbol(property)), checker);
      if (keys.length > 0)
        prop.keys = keys.map((key) => ({ ...key, name: `${prop.name}.${key.name}` }));
    }
    record.props = record.props.filter((prop) => !domOnly.has(prop.name));
    // A naming choice: every form requires one of these props, none requires them all.
    const naming = NAMING_PROPS.filter((name) => partlyRequired.has(name));
    if (
      naming.length > 1 &&
      members.every((member) => naming.some((name) => requires(member, name, checker)))
    ) {
      const note = `One of ${orList(naming)} is required.`;
      for (const prop of record.props) {
        if (!naming.includes(prop.name)) continue;
        // A description that already names the alternative ("Required unless …") says it.
        const others = naming.filter((name) => name !== prop.name);
        if (others.some((name) => prop.description?.includes(`\`${name}\``))) continue;
        prop.description = prop.description ? `${prop.description}\n\n${note}` : note;
      }
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
    // The React interfaces each component's left-out DOM props come from, for its
    // "also accepts" line.
    const droppedInterfaces = new Map<string, Set<string>>();
    const parser = withCustomConfig(tsconfigPath, {
      savePropValueAsString: true,
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop, component) => {
        if (keepProp(prop)) return true;
        if (prop.parent && propOrigin(prop) === 'dom') {
          const names = droppedInterfaces.get(component.name) ?? new Set<string>();
          droppedInterfaces.set(component.name, names.add(prop.parent.name));
        }
        return false;
      },
    });
    const found = extractProps(
      await collectSources(sourceRoots, extension),
      parser,
      allow,
      source,
      droppedInterfaces,
    );
    try {
      refineWithChecker(found, entries, compilerOptionsOf(tsconfigPath));
    } catch (error) {
      console.error(`[generate-props] cannot read the props types: ${(error as Error).message}`);
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
