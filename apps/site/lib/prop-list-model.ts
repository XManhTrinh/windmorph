import type { PropsRecord } from './component-props';

/**
 * How a prop's type is shown: a union of short members as one chip each, a short type as one
 * chip on the prop's header line, or a long one (a function, an object, a long generic) as a
 * wrapping monospace block under it, so it never squeezes the row.
 */
export type PropTypeView =
  | { kind: 'union'; values: string[] }
  | { kind: 'inline'; text: string }
  | { kind: 'block'; text: string };

/** How a prop's default is shown: a chip, a wrapping code block, or prose with code in it. */
export type PropDefaultView =
  | { kind: 'inline'; text: string }
  | { kind: 'block'; text: string }
  | { kind: 'prose'; text: string };

/** One prop of a props list, ready to render. */
export interface PropItem {
  /** The anchor: `prop-<scope>-<name>`. */
  id: string;
  name: string;
  required: boolean;
  type: PropTypeView;
  /** The type as TypeScript writes it, for the Markdown twin. */
  typeText: string;
  defaultValue?: PropDefaultView;
  /** The raw default, for the Markdown twin. */
  defaultText?: string;
  description?: string;
  /** An object prop's keys (`labels.close`), listed under it. */
  keys: PropItem[];
}

/** Longest type, in characters, that still sits on the header line as one chip. */
export const INLINE_TYPE_MAX = 40;

/** Longest default, in characters, that still sits on the header line as one chip. */
export const INLINE_DEFAULT_MAX = 32;

/** A union member short enough to be its own chip: a literal or a plain type name. */
const SIMPLE_MEMBER = /^(?:"[^"]*"|'[^']*'|-?\d+(?:\.\d+)?|[A-Za-z_$][\w$.]*(?:\[\])?)$/;

/** The opening bracket each closing one pairs with. */
const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{', '>': '<' };

/**
 * A type's top-level union members (`"a" | "b" | number` → three), leaving unions nested in
 * brackets, generics, function types and string literals whole. A type that isn't a union is
 * its only member.
 */
export function splitTopLevelUnion(type: string): string[] {
  const members: string[] = [];
  const stack: string[] = [];
  let quote: string | null = null;
  let start = 0;
  for (let index = 0; index < type.length; index++) {
    const char = type[index]!;
    if (quote) {
      if (char === '\\') index++;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === '`') quote = char;
    else if (char === '(' || char === '[' || char === '{' || char === '<') stack.push(char);
    else if (char === '>' && type[index - 1] === '=') continue;
    else if (char in PAIRS && stack[stack.length - 1] === PAIRS[char]) stack.pop();
    else if (char === '|' && stack.length === 0) {
      members.push(type.slice(start, index).trim());
      start = index + 1;
    }
  }
  members.push(type.slice(start).trim());
  return members.filter((member) => member !== '');
}

/** How a prop's type is shown (see {@link PropTypeView}). */
export function propTypeView(prop: Pick<PropsRecord, 'type' | 'options' | 'values'>): PropTypeView {
  const values = prop.values ?? prop.options?.map((option) => `"${option}"`);
  if (values && values.length > 0) return { kind: 'union', values };
  const members = splitTopLevelUnion(prop.type);
  if (members.length > 1 && members.every((member) => SIMPLE_MEMBER.test(member))) {
    return { kind: 'union', values: members };
  }
  return prop.type.length <= INLINE_TYPE_MAX && !prop.type.includes('\n')
    ? { kind: 'inline', text: prop.type }
    : { kind: 'block', text: prop.type };
}

/** A type view as TypeScript writes it: a union's members joined, any other type as is. */
export function propTypeText(view: PropTypeView): string {
  return view.kind === 'union' ? view.values.join(' | ') : view.text;
}

/** How a default is shown (see {@link PropDefaultView}); `undefined` when there is none. */
export function propDefaultView(value: string | undefined): PropDefaultView | undefined {
  const text = value?.trim();
  if (!text) return undefined;
  // A default written as a sentence names its code in backticks.
  if (text.includes('`')) return { kind: 'prose', text };
  return text.length <= INLINE_DEFAULT_MAX && !text.includes('\n')
    ? { kind: 'inline', text }
    : { kind: 'block', text };
}

/**
 * A prop's anchor within its list: `prop-<scope>-<name>` (`prop-BottomSheet-labels.close`).
 * The scope (the component or hook) keeps two lists on one page apart; characters an id or
 * a URL fragment would trip on become `-`.
 */
export function propAnchor(scope: string, name: string): string {
  return `prop-${scope}-${name}`.replace(/[^A-Za-z0-9._-]+/g, '-');
}

/**
 * A props list's items: each prop with its type and default worked out, and the keys of an
 * object prop (`labels`, `classNames`, `strings`) nested under it with their own anchors.
 */
export function propListItems(scope: string, props: readonly PropsRecord[]): PropItem[] {
  return props.map((prop) => {
    const type = propTypeView(prop);
    const defaultValue = propDefaultView(prop.defaultValue);
    return {
      id: propAnchor(scope, prop.name),
      name: prop.name,
      required: prop.required,
      type,
      typeText: propTypeText(type),
      ...(defaultValue && { defaultValue, defaultText: prop.defaultValue!.trim() }),
      ...(prop.description && { description: prop.description }),
      keys: propListItems(scope, prop.keys ?? []),
    };
  });
}
