import type { PropsRecord } from './component-props';

/** How a prop's default is shown: as code (`"sm"`), or as a sentence with code spans in it. */
export type PropDefaultView = { kind: 'code'; text: string } | { kind: 'prose'; text: string };

/** One prop of a props list, ready to render. */
export interface PropItem {
  /** The anchor: `prop-<scope>-<name>`. */
  id: string;
  name: string;
  required: boolean;
  /**
   * The type's top-level union members (`"standard"`, `"connected"`), shown joined by `|`
   * and wrapping between members; a type that isn't a union is its only member.
   */
  typeMembers: string[];
  /** The type as TypeScript writes it, for the Markdown twin. */
  typeText: string;
  defaultValue?: PropDefaultView;
  /** The raw default, for the Markdown twin. */
  defaultText?: string;
  description?: string;
  /** An object prop's keys (`labels.close`), listed under it. */
  keys: PropItem[];
  /** Inherited from React Aria rather than declared by the component. */
  inherited?: boolean;
}

/** The groups a component's props are sorted into, in display order. */
export type PropGroupId = 'props' | 'events' | 'text' | 'styling' | 'inherited';

export interface PropGroup {
  id: PropGroupId;
  label: string;
  items: PropItem[];
}

export const PROP_GROUP_LABELS: Record<PropGroupId, string> = {
  props: 'Props',
  events: 'Events',
  text: 'Text',
  styling: 'Styling',
  inherited: 'Inherited from React Aria',
};

/**
 * The groups that start folded: styling hooks and the props React Aria passes through are
 * looked up, not read through.
 */
export const FOLDED_GROUPS: ReadonlySet<PropGroupId> = new Set(['styling', 'inherited']);

/** The ARIA attributes that name or describe an element: text a reader hears. */
const ARIA_TEXT = new Set([
  'aria-label',
  'aria-labelledby',
  'aria-describedby',
  'aria-description',
  'aria-details',
]);

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

/**
 * A prop's type as union members: an enum's members as written (`"sm"`, `1`), quoting the
 * Playground's `options` when the JSON predates `values`; any other type split at its
 * top-level `|`.
 */
export function propTypeMembers(prop: Pick<PropsRecord, 'type' | 'options' | 'values'>): string[] {
  const values = prop.values ?? prop.options?.map((option) => `"${option}"`);
  if (values && values.length > 0) return values;
  return splitTopLevelUnion(prop.type.replace(/\s*\n\s*/g, ' '));
}

/** How a default is shown (see {@link PropDefaultView}); `undefined` when there is none. */
export function propDefaultView(value: string | undefined): PropDefaultView | undefined {
  const text = value?.trim().replace(/\s*\n\s*/g, ' ');
  if (!text) return undefined;
  // A default written as a sentence names its code in backticks.
  return text.includes('`') ? { kind: 'prose', text } : { kind: 'code', text };
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
    const typeMembers = propTypeMembers(prop);
    const defaultValue = propDefaultView(prop.defaultValue);
    return {
      id: propAnchor(scope, prop.name),
      name: prop.name,
      required: prop.required,
      typeMembers,
      typeText: typeMembers.join(' | '),
      ...(defaultValue && { defaultValue, defaultText: defaultValue.text }),
      ...(prop.description && { description: prop.description }),
      keys: propListItems(scope, prop.keys ?? []),
      ...(prop.inherited && { inherited: true }),
    };
  });
}

/** The group a prop the component declares belongs to, from its name alone. */
export function propGroupOf(name: string): PropGroupId {
  if (name === 'className' || name === 'classNames' || name === 'style') return 'styling';
  if (/^on[A-Z]/.test(name)) return 'events';
  if (name === 'labels' || name === 'strings' || ARIA_TEXT.has(name)) return 'text';
  return 'props';
}

/**
 * A component's props sorted into groups (Props, Events, Text, Styling, Inherited), leaving out the
 * empty ones. Each group keeps the source order, except that required props lead Props.
 */
export function groupPropItems(items: readonly PropItem[]): PropGroup[] {
  const byGroup = new Map<PropGroupId, PropItem[]>();
  for (const item of items) {
    const id = item.inherited ? 'inherited' : propGroupOf(item.name);
    byGroup.set(id, [...(byGroup.get(id) ?? []), item]);
  }
  const core = byGroup.get('props');
  if (core) {
    byGroup.set('props', [
      ...core.filter((item) => item.required),
      ...core.filter((item) => !item.required),
    ]);
  }
  return (Object.keys(PROP_GROUP_LABELS) as PropGroupId[]).flatMap((id) => {
    const groupItems = byGroup.get(id);
    return groupItems ? [{ id, label: PROP_GROUP_LABELS[id], items: groupItems }] : [];
  });
}

/**
 * Whether a prop's text (its name and description) matches a filter query: every word of
 * the query appears in it, ignoring case. An empty query matches everything.
 */
export function matchesPropFilter(text: string, query: string): boolean {
  const haystack = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

/** React's name for the attributes of an element, as the props list's closing line says it. */
export function htmlAttributesNote(elements: readonly string[] | undefined): string | undefined {
  if (!elements || elements.length === 0) return undefined;
  if (elements.includes('element')) {
    return "Also accepts the root element's HTML attributes (`id`, `data-*`, event handlers).";
  }
  const tags = elements.map((element) => `\`<${element}>\``);
  const named = tags.length > 1 ? `${tags.slice(0, -1).join(', ')} or ${tags.at(-1)}` : tags[0];
  return `Also accepts every ${named} attribute.`;
}

/** A count of props in words: `1 prop`, `12 props`. */
export function propCount(count: number): string {
  return `${count} ${count === 1 ? 'prop' : 'props'}`;
}

/**
 * Where a filter query's words occur in a piece of text, ignoring case: `[start, end)`
 * offsets in order, with overlapping occurrences merged, for highlighting them.
 */
export function matchOffsets(text: string, query: string): [number, number][] {
  const haystack = text.toLowerCase();
  const found: [number, number][] = [];
  for (const word of query.toLowerCase().split(/\s+/).filter(Boolean)) {
    for (let at = haystack.indexOf(word); at >= 0; at = haystack.indexOf(word, at + 1)) {
      found.push([at, at + word.length]);
    }
  }
  found.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const [start, end] of found) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
