import type { MetadataRoute } from 'next';
import { absoluteUrl } from '../lib/site-metadata';

export const dynamic = 'force-static';

/** `robots.txt`: the whole site may be crawled; the sitemap lists every page. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
