import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/site-metadata';
import { sitePages } from '../lib/site-pages';

export const dynamic = 'force-static';

/** `sitemap.xml`: every page of the site, from the same list as the link previews. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return (await sitePages()).map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: 'weekly',
    priority: page.kind === 'home' ? 1 : page.parent ? 0.5 : 0.8,
  }));
}
