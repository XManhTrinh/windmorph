import { GUIDE_API } from '../app/(docs)/guide-api-data';
import { COMPONENT_META } from '../content/components/catalog';
import { componentTabHref } from '../content/components/doc';

/**
 * Each documented component and hook, by its code name, to its page's API tab, or to the guide
 * that documents it (`ThemeProvider` → `/theming#api-reference`).
 */
const API_HREFS = new Map([
  ...Object.entries(GUIDE_API).flatMap(([path, api]) =>
    [...api.components, ...api.hooks].map(
      (name) => [name, `${path}#${api.anchor ?? 'api-reference'}`] as const,
    ),
  ),
  ...COMPONENT_META.flatMap((meta) =>
    [...meta.propsComponents, ...(meta.hooks ?? [])].map(
      (name) => [name, componentTabHref(meta.slug, 'api')] as const,
    ),
  ),
]);

/**
 * The API tab or guide documenting a component or hook (`Badge` → `/components/badges/api`),
 * for a `{@link Badge}` in a description; `undefined` for a name no page documents.
 */
export function codeNameHref(name: string): string | undefined {
  return API_HREFS.get(name);
}
