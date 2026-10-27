/**
 * A field's `aria-describedby` without the ids of the parts it doesn't render (2026-10-24).
 * React Aria's field hooks name the description and error ids through `useSlotId`, which drops
 * an id whose element isn't in the page only after it mounts: on the server it can't tell, so
 * the server's HTML pointed at a supporting text or error that wasn't there until hydration.
 * `unrendered` lists the ids of the parts this render leaves out (falsy entries are ignored).
 */
export function renderedDescription(
  describedBy: string | undefined,
  unrendered: readonly (string | false | null | undefined)[],
): string | undefined {
  if (!describedBy) return undefined;
  const missing = new Set(unrendered.filter(Boolean));
  return (
    describedBy
      .split(/\s+/)
      .filter((id) => id && !missing.has(id))
      .join(' ') || undefined
  );
}
