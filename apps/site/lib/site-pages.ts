import { GUIDE_ENTRIES } from '../app/(docs)/search-index';
import { RAIL_GROUP_MAP } from '../content/components/catalog';
import { TAB_LABELS, componentTabHref } from '../content/components/doc';
import { COMPONENT_PAGES } from '../content/components/registry';
import { componentTabs } from './component-page';
import { SITE_DESCRIPTION, SITE_TAGLINE } from './site-metadata';

/** Where a page sits in the site, for its link preview and the `llms.txt` outline. */
export type SitePageKind = 'home' | 'guide' | 'component';

/** One page of the site, as the sitemap, the link previews and `llms.txt` list it. */
export interface SitePage {
  /** The page's path: `/`, `/theming`, `/components/button/api`. */
  path: string;
  title: string;
  description: string;
  kind: SitePageKind;
  /** The part of the site it belongs to, shown above the title in its link preview. */
  section: string;
  /** For a component page's tab: the component page's own path. */
  parent?: string;
}

/**
 * Every page of the site: the home page, the guides (with the components index), then each
 * component page followed by its tabs. Built from the same registry, catalog and guide
 * entries as the pages themselves, so it can't miss one. Server-only: the registry reads
 * the pages' content.
 */
export async function sitePages(): Promise<SitePage[]> {
  const home: SitePage = {
    path: '/',
    title: SITE_TAGLINE,
    description: SITE_DESCRIPTION,
    kind: 'home',
    section: 'React component library',
  };
  const guides = GUIDE_ENTRIES.map((entry): SitePage => ({
    path: entry.href,
    title: entry.title,
    description: entry.summary,
    kind: 'guide',
    section: entry.href === '/components' ? 'Components' : 'Guides',
  }));
  const components = await Promise.all(
    COMPONENT_PAGES.map(async (page) => {
      const section = `Components · ${RAIL_GROUP_MAP[page.railGroup].fullName}`;
      const path = componentTabHref(page.slug);
      const tabs = (await componentTabs(page)).filter((tab) => tab !== 'overview');
      return [
        { path, title: page.title, description: page.summary, kind: 'component', section },
        ...tabs.map((tab): SitePage => ({
          path: componentTabHref(page.slug, tab),
          title: `${page.title}: ${TAB_LABELS[tab]}`,
          description: page.summary,
          kind: 'component',
          section,
          parent: path,
        })),
      ] satisfies SitePage[];
    }),
  );
  return [home, ...guides, ...components.flat()];
}
