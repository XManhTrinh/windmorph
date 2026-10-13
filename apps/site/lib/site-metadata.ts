import type { Metadata } from 'next';
import { GUIDE_ENTRIES } from '../app/(docs)/search-index';

/** The library's name in titles, link previews and the browser's app name. */
export const SITE_NAME = 'Windmorph';

/**
 * The site's public origin, for canonical URLs and link previews: `NEXT_PUBLIC_SITE_URL`
 * when set, then Vercel's production domain, then localhost in development.
 */
export function siteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL('http://localhost:3000');
}

/**
 * A page's title, description, canonical URL and link preview. The root layout's title
 * template adds " · Windmorph".
 */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${SITE_NAME}`, description, url: path },
  };
}

/** A guide page's metadata, from the same title and summary the search shows. */
export function guideMetadata(path: string): Metadata {
  const entry = GUIDE_ENTRIES.find((candidate) => candidate.href === path);
  if (!entry) throw new Error(`No guide entry for ${path}`);
  return pageMetadata(entry.title, entry.summary, path);
}
