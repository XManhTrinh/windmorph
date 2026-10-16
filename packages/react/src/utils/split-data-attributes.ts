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
