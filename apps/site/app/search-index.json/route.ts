import { COMPONENT_PAGES } from '../../content/components/registry';
import { componentTabs } from '../../lib/component-page';
import { componentSearchEntry, GUIDE_ENTRIES, type SearchEntry } from '../(docs)/search-index';

export const dynamic = 'force-static';

/**
 * The documentation search's index, as a static JSON file the search loads when it first
 * opens. It is built here rather than passed down from the root layout: the component
 * registry imports every page's examples, and a layout that imported it would put all of
 * them into every page's bundle and the index into every page's HTML.
 */
export async function GET() {
  const components = await Promise.all(
    COMPONENT_PAGES.map(async (page) => componentSearchEntry(page, await componentTabs(page))),
  );
  const entries: SearchEntry[] = [...GUIDE_ENTRIES, ...components];
  return Response.json(entries);
}
