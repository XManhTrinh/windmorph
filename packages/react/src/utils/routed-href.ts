/**
 * The address a link renders, read from the props React Aria's `useLink` returns: the hook
 * passes the `href` through the `RouterProvider`'s `useHref` (which can add a base path, say)
 * and puts the result there, though the props' type (`DOMAttributes`) leaves `href` out. A link
 * that wrote its own `href` after them showed the raw address, so a new tab, a copied link or a
 * crawler went to the wrong place, while a plain click, which the router takes with the raw
 * `href`, still worked (2026-11-16).
 */
export function routedHref(linkProps: object): string | undefined {
  const { href } = linkProps as { href?: unknown };
  return typeof href === 'string' ? href : undefined;
}
