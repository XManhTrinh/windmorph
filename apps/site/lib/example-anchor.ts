/**
 * The anchor of a live example on a component's Overview tab, from its file name
 * (`button-variants.tsx`) or its example id (`button/button-variants`): `example-button-variants`.
 * The example viewer sets it, and the spec status links to it.
 */
export function exampleAnchor(fileOrId: string): string {
  const base = fileOrId
    .split('/')
    .pop()!
    .replace(/\.tsx$/, '');
  return `example-${base}`;
}
