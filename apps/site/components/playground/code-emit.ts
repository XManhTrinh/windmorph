import type { PropsRecord } from '../../lib/component-props';

export interface EmitInput {
  /** The public component name, e.g. 'Button'. */
  component: string;
  /** Current control values, keyed by prop name. */
  values: Record<string, unknown>;
  /** The props to consider for emission, in order. */
  surfacedProps: string[];
  /** Authoritative defaults — a value equal to its default is omitted. */
  defaultProps?: Record<string, unknown>;
  /** Normalised best-effort defaults from the generated JSON, used when `defaultProps` omits one. */
  propDefaults?: Record<string, string>;
  /** Extra member names imported from `@windmorph/react` alongside the component (e.g. 'Menu'). */
  importMembers?: string[];
  /** Extra import lines prepended verbatim (one per line), for non-`@windmorph/react` sources. */
  codeImports?: string[];
  /** Verbatim JSX per ReactNode-valued slot/prop, e.g. `{ icon: '<FavoriteIcon />' }`. */
  codeSlots?: Record<string, string>;
  /** Slots switched on and off by a boolean control: their JSX, written only while on. */
  toggledSlots?: Record<string, string>;
  /** Verbatim children JSX, e.g. label text. */
  codeChildren?: string;
  /**
   * JSX around the element, e.g. the trigger an overlay needs:
   * `{ before: '<DialogTrigger>\n  <Button>Open</Button>', after: '</DialogTrigger>' }`. The
   * element is indented one level inside it.
   */
  codeWrap?: { before: string; after: string };
  /** The entry the component is imported from. @default '@windmorph/react' */
  importFrom?: string;
}

/**
 * Normalises the generated JSON `defaultValue`, which `savePropValueAsString` can emit as a
 * quoted, newline-joined and/or duplicated string (e.g. `"\"filled\"\nfilled"`): strip
 * surrounding quotes from each whitespace-separated token and keep the first.
 */
export function normalizeDefault(raw: string): string {
  const tokens = raw
    .split(/\s+/)
    .map((token) => token.replace(/^["']|["']$/g, ''))
    .filter((token) => token.length > 0);
  return tokens[0] ?? '';
}

/** Builds a normalised default lookup from the generated props JSON. */
export function propDefaultsFrom(props: PropsRecord[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const prop of props) {
    if (prop.defaultValue != null) out[prop.name] = normalizeDefault(prop.defaultValue);
  }
  return out;
}

function isDefault(name: string, value: unknown, input: EmitInput): boolean {
  if (input.defaultProps && name in input.defaultProps) {
    return input.defaultProps[name] === value;
  }
  const fallback = input.propDefaults?.[name];
  if (fallback == null) return false;
  if (typeof value === 'boolean') return String(value) === fallback;
  if (typeof value === 'number') return String(value) === fallback;
  return value === fallback;
}

/** Formats one control-derived prop as a JSX attribute, or null to omit it. */
function attribute(name: string, value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value ? name : `${name}={false}`;
  if (typeof value === 'number') return `${name}={${value}}`;
  return `${name}="${value}"`;
}

/**
 * Composes a copy-ready TSX snippet from the current playground state: extra imports, the
 * `@windmorph/react` import, the element with only non-default control-derived props, then the
 * verbatim `codeSlots` and `codeChildren`. The emitted snippet is guaranteed to compile
 * against `@windmorph/react` with the shown imports.
 */
export function emitSnippet(input: EmitInput): string {
  const attrs: string[] = [];
  for (const name of input.surfacedProps) {
    const value = input.values[name];
    const slot = input.toggledSlots?.[name];
    if (slot !== undefined) {
      if (value === true) attrs.push(`${name}={${slot}}`);
      continue;
    }
    if (isDefault(name, value, input)) continue;
    const attr = attribute(name, value);
    if (attr) attrs.push(attr);
  }
  for (const [name, jsx] of Object.entries(input.codeSlots ?? {})) {
    attrs.push(`${name}={${jsx}}`);
  }

  const open =
    attrs.length > 0 ? `<${input.component}\n  ${attrs.join('\n  ')}\n` : `<${input.component}`;
  let element: string;
  if (input.codeChildren != null && input.codeChildren !== '') {
    element = `${open}>\n  ${input.codeChildren}\n</${input.component}>`;
  } else {
    element = attrs.length > 0 ? `${open}/>` : `${open} />`;
  }
  if (input.codeWrap) {
    const indented = element
      .split('\n')
      .map((line) => (line ? `  ${line}` : line))
      .join('\n');
    element = `${input.codeWrap.before}\n${indented}\n${input.codeWrap.after}`;
  }

  // Only what the snippet uses is imported: a member for a slot that's switched off isn't.
  const uses = (name: string) => new RegExp(`\\b${name}\\b`).test(element);
  const members = [
    input.component,
    ...(input.importMembers ?? []).filter((member) => uses(member)),
  ];
  const extraImports = (input.codeImports ?? []).filter((line) => {
    const named = /\{([^}]*)\}/.exec(line)?.[1];
    if (!named) return true;
    return named.split(',').some((name) => uses(name.trim()));
  });
  const importLines = [
    ...extraImports,
    `import { ${members.join(', ')} } from '${input.importFrom ?? '@windmorph/react'}';`,
  ];

  return `${importLines.join('\n')}\n\n${element}\n`;
}
