/**
 * Splits `data-*` attributes from the rest of a component's props. Components that
 * pass their remaining props to a React Aria hook (which forwards only what it knows to
 * the input) use this to put `data-*` attributes on their root, next to `className`.
 */
export function splitDataAttributes<T extends object>(props: T) {
  const data: Record<`data-${string}`, unknown> = {};
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('data-')) data[key as `data-${string}`] = value;
    else rest[key] = value;
  }
  return { data, rest: rest as Omit<T, `data-${string}`> };
}

/**
 * A component's `data-tokens` value with the token sets an app or a library passed on
 * `data-tokens` appended: the component's own set first, then the incoming ones, each once.
 * Component token rules match with `[data-tokens~="<set>"]`, so a root can carry several
 * sets and keep its own styles, e.g. `"md-comp-assist-chip app-reaction"`.
 *
 * @param own - The component's own set (or sets), e.g. `md-comp-assist-chip`.
 * @param props - The props spread on the same element; their `data-tokens`, if a string, is
 *   appended. Anything else is ignored.
 */
export function mergeDataTokens(own: string, props?: object | null): string {
  const incoming = (props as { 'data-tokens'?: unknown } | null | undefined)?.['data-tokens'];
  if (typeof incoming !== 'string' || incoming.trim() === '') return own;
  const sets = new Set(`${own} ${incoming}`.split(/\s+/).filter(Boolean));
  return [...sets].join(' ');
}
