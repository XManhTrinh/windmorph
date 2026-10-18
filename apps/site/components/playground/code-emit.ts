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
  codeSlots?: Record<string, string | ((values: Record<string, unknown>) => string | null)>;
  /** Slots switched on and off by a boolean control: their JSX, written only while on. */
  toggledSlots?: Record<string, string | ((values: Record<string, unknown>) => string)>;
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
  /**
   * The component's prop names, from its generated props JSON. A controlled prop (one with an
   * `on<Prop>Change` handler) is written with a `useState` pair, so a pasted snippet is never
   * stuck (see {@link controlledForm}).
   */
  propNames?: readonly string[];
  /** The component's prop types, from its generated props JSON, to type a `useState` pair. */
  propTypes?: Record<string, { type: string; values?: string[] }>;
  /**
   * State the snippet's own JSX reads, as `useState` pairs, each name mapped to its hook call
   * (`{ current: "useState('home')" }` → `const [current, setCurrent] = useState('home');`),
   * e.g. the destination a navigation item's `onPress` selects. With state, the element
   * becomes the body of an `Example` component.
   */
  codeState?: Record<string, string>;
}

/** `open` → `Open`. */
const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/**
 * How a control's prop is written so the pasted snippet still responds: `as-is` for an
 * uncontrolled prop or one whose handler the snippet already writes; `state` for a controlled
 * prop (`open={open} onOpenChange={setOpen}` and a `useState` line), the controlled form docs
 * sites show (React Aria's among them), rather than a bare value nothing can change.
 */
export function controlledForm(
  name: string,
  propNames: readonly string[] | undefined,
  written: ReadonlySet<string>,
): 'as-is' | 'state' {
  if (!propNames) return 'as-is';
  const handler = changeHandlerOf(name, propNames);
  return handler && !written.has(handler) ? 'state' : 'as-is';
}

/** Handlers React Aria names after something other than the prop (`value` → `onChange`). */
const HANDLER_NAMES: Record<string, string[]> = {
  value: ['onValueChange', 'onChange'],
  selectedKey: ['onSelectionChange'],
  selectedKeys: ['onSelectionChange'],
  inputValue: ['onInputChange'],
};

/**
 * The handler that reports a controlled prop's changes (`open` → `onOpenChange`, `value` →
 * `onChange`), when the component declares one; `undefined` for an uncontrolled prop.
 */
export function changeHandlerOf(name: string, propNames: readonly string[]): string | undefined {
  const candidates = HANDLER_NAMES[name] ?? [`on${capitalize(name)}Change`];
  return candidates.find((handler) => propNames.includes(handler));
}

/** A short union stays readable as the state's type; a longer one is read off the component. */
const UNION_MAX = 8;

/**
 * The type argument a `useState` pair for a prop needs, so a string state is as narrow as the
 * prop (`useState<'dial' | 'input'>('input')`): the prop's short union, a type of primitives
 * as written (`string | null`), or the prop's type read from the component
 * (`ComponentProps<typeof PhoneField>['country']`). Nothing for a boolean, a number or a
 * plain string.
 */
export function stateTypeArgument(
  component: string,
  name: string,
  value: unknown,
  record: { type: string; values?: string[] } | undefined,
): string {
  if (typeof value !== 'string' || !record || record.type === 'string') return '';
  if (record.values && record.values.length <= UNION_MAX) {
    const members = record.values.map((member) => member.replace(/^"([^"'\\]*)"$/, "'$1'"));
    return `<${members.join(' | ')}>`;
  }
  if (
    !record.values &&
    /^(?:string|number|null|undefined)(?:\s*\|\s*(?:string|number|null|undefined))*$/.test(
      record.type,
    )
  ) {
    return `<${record.type}>`;
  }
  return `<ComponentProps<typeof ${component}>['${name}']>`;
}

/** A value as a JavaScript literal, for a `useState` line. */
const literal = (value: unknown) =>
  typeof value === 'string' ? `'${value.replace(/[\\']/g, '\\$&')}'` : JSON.stringify(value);

/**
 * Where a snippet's icons come from: the reader's own icon components (Material Symbols SVGs
 * as React components, as the getting-started guide and the site's examples use them).
 */
export const ICONS_MODULE = './icons';

/** The line above the icons' import, since `./icons` is the reader's own module. */
export const ICONS_COMMENT = '// Use your own icon components.';

/** The icon components a snippet's JSX uses (`<SendIcon />`), in order of first use. */
export function iconsUsed(jsx: string): string[] {
  return [...new Set([...jsx.matchAll(/<([A-Z][A-Za-z0-9]*Icon)\b/g)].map((match) => match[1]!))];
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

/** A slot's JSX as an attribute; a plain string literal as an attribute string: `origin="trigger"`. */
function slotAttribute(name: string, jsx: string): string {
  return /^"[^"\\{}]*"$/.test(jsx) ? `${name}=${jsx}` : `${name}={${jsx}}`;
}

/**
 * Composes a copy-ready TSX snippet from the current playground state: extra imports, the
 * `@windmorph/react` import, the element with only non-default control-derived props, then the
 * verbatim `codeSlots` and `codeChildren`. Icons are named components (`<SendIcon />`)
 * imported from {@link ICONS_MODULE}, never inline SVG. The emitted snippet is guaranteed to
 * compile against `@windmorph/react` with the shown imports (`scripts/check-snippets.ts`).
 */
export function emitSnippet(input: EmitInput): string {
  const attrs: string[] = [];
  // State the snippet keeps itself, for a controlled prop with no uncontrolled twin.
  const state: { name: string; hook: string }[] = Object.entries(input.codeState ?? {}).map(
    ([name, hook]) => ({ name, hook }),
  );
  const written = new Set(
    [...Object.keys(input.codeSlots ?? {}), ...Object.keys(input.toggledSlots ?? {})].filter(
      (name) => {
        const slot = input.codeSlots?.[name];
        return typeof slot !== 'function' || slot(input.values) !== null;
      },
    ),
  );
  for (const name of input.surfacedProps) {
    // A `slot.prop` control is written inside its slot's JSX, not on the element, and a prop
    // the descriptor writes itself (`open={open}`) isn't written again from its control.
    if (name.includes('.') || name in (input.codeSlots ?? {})) continue;
    const value = input.values[name];
    const slot = input.toggledSlots?.[name];
    if (slot !== undefined) {
      if (value === true) {
        attrs.push(slotAttribute(name, typeof slot === 'function' ? slot(input.values) : slot));
      }
      continue;
    }
    if (isDefault(name, value, input)) continue;
    const form = controlledForm(name, input.propNames, written);
    if (form === 'state' && value !== undefined && value !== null && value !== '') {
      const typeArgument = stateTypeArgument(input.component, name, value, input.propTypes?.[name]);
      state.push({ name, hook: `useState${typeArgument}(${literal(value)})` });
      const handler = changeHandlerOf(name, input.propNames ?? [])!;
      // `onChange` hands over the new value as `onValueChange` does (React Aria's fields).
      attrs.push(`${name}={${name}}`, `${handler}={set${capitalize(name)}}`);
      continue;
    }
    const attr = attribute(name, value);
    if (attr) attrs.push(attr);
  }
  for (const [name, slot] of Object.entries(input.codeSlots ?? {})) {
    // A function writes the prop only when the values call for it (null leaves it out).
    const jsx = typeof slot === 'function' ? slot(input.values) : slot;
    if (jsx !== null) attrs.push(slotAttribute(name, jsx));
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
  // A named import keeps only the names the snippet uses, and goes when it uses none.
  const extraImports = (input.codeImports ?? []).flatMap((line) => {
    const named = /\{([^}]*)\}/.exec(line);
    if (!named) return [line];
    const used = named[1]!
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name && uses(name));
    return used.length > 0 ? [line.replace(named[0], `{ ${used.join(', ')} }`)] : [];
  });
  // Icons come from the reader's icon module, unless another import already names them.
  const imported = new Set([
    ...members,
    ...extraImports.flatMap((line) =>
      (/\{([^}]*)\}/.exec(line)?.[1] ?? '').split(',').map((name) => name.trim()),
    ),
  ]);
  const icons = iconsUsed(element).filter((name) => !imported.has(name));
  if (state.length > 0) {
    const body = element
      .split('\n')
      .map((line) => (line ? `    ${line}` : line))
      .join('\n');
    const hooks = state
      .map(({ name, hook }) => `  const [${name}, set${capitalize(name)}] = ${hook};`)
      .join('\n');
    element = `export function Example() {\n${hooks}\n\n  return (\n${body}\n  );\n}`;
  }
  const importLines = [
    ...(state.length > 0
      ? [
          state.some(({ hook }) => hook.includes('ComponentProps<'))
            ? "import { useState, type ComponentProps } from 'react';"
            : "import { useState } from 'react';",
        ]
      : []),
    ...extraImports,
    ...(icons.length > 0
      ? [ICONS_COMMENT, `import { ${icons.sort().join(', ')} } from '${ICONS_MODULE}';`]
      : []),
    `import { ${members.join(', ')} } from '${input.importFrom ?? '@windmorph/react'}';`,
  ];

  return `${importLines.join('\n')}\n\n${element}\n`;
}
