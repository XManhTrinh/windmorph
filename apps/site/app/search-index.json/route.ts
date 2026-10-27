import { COMPONENT_PAGES } from '../../content/components/registry';
import { componentTabs } from '../../lib/component-page';
import { readComponentPropsSafe } from '../../lib/component-props';
import {
  componentSearchEntry,
  GUIDE_ENTRIES,
  propScopes,
  searchablePropNames,
  type SearchEntry,
} from '../(docs)/search-index';

export const dynamic = 'force-static';

/**
 * The documentation search's index, as a static JSON file the search loads when it first
 * opens. It is built here rather than passed down from the root layout: the component
 * registry imports every page's examples, and a layout that imported it would put all of
 * them into every page's bundle and the index into every page's HTML.
 */
export async function GET() {
  const propsByComponent = new Map<string, string[]>();
  for (const name of new Set(COMPONENT_PAGES.flatMap((page) => page.propsComponents))) {
    const json = await readComponentPropsSafe(name);
    propsByComponent.set(name, json?.props.map((prop) => prop.name) ?? []);
  }
  const propsOf = (name: string) => propsByComponent.get(name) ?? [];
  const propNames = searchablePropNames(
    COMPONENT_PAGES.map((page) => ({
      slug: page.slug,
      props: page.propsComponents.flatMap(propsOf),
    })),
  );
  const components = await Promise.all(
    COMPONENT_PAGES.map(async (page) => {
      const names = propNames.get(page.slug) ?? [];
      return componentSearchEntry(
        page,
        await componentTabs(page),
        names,
        propScopes(page.propsComponents, propsOf, names),
      );
    }),
  );
  const entries: SearchEntry[] = [...GUIDE_ENTRIES, ...components];
  return Response.json(entries);
}
