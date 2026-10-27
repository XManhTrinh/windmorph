import type { Metadata } from 'next';
import { GUIDE_ENTRIES } from '../app/(docs)/search-index';

/** The library's name in titles, link previews and the browser's app name. */
export const SITE_NAME = 'Windmorph';

/**
 * The site's public origin: canonical URLs, link previews, the sitemap, `robots.txt` and the
 * `llms.txt` files all build their absolute URLs from it.
 */
export const SITE_URL = 'https://windmorph.dev';

/** The site's one-line pitch, after its name. */
export const SITE_TAGLINE = 'Material 3 Expressive for React';

/** The home page's title and description. */
export const SITE_TITLE = `${SITE_NAME}: ${SITE_TAGLINE}`;
export const SITE_DESCRIPTION =
  'Windmorph (@windmorph/react) is a React component library for Material Design 3 Expressive: accessible components, themes, springs and shapes, with docs and live examples.';

/** `path` on the public site, as an absolute URL. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

/** A page's link-preview image (`app/og/[...path]/route.tsx`); the home page's is `/og/index.png`. */
export function ogImagePath(path: string): string {
  return `/og${path === '/' ? '/index' : path}.png`;
}

/** A page's Markdown twin (`scripts/generate-llms.ts`): `/theming.md`; the home page's is `/index.md`. */
export function markdownPath(path: string): string {
  return path === '/' ? '/index.md' : `${path}.md`;
}

/** The link-preview image's size, the one Open Graph and X recommend. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/**
 * A page's title, description, canonical URL and link previews (Open Graph and X). The
 * root layout's title template adds " · Windmorph" to every page but the home page; the
 * previews carry the same full title.
 */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const isHome = path === '/';
  const fullTitle = isHome ? title : `${title} · ${SITE_NAME}`;
  const image = {
    url: ogImagePath(path),
    ...OG_IMAGE_SIZE,
    alt: isHome ? fullTitle : `${title}, in the ${SITE_NAME} documentation`,
  };
  return {
    title: isHome ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en',
      title: fullTitle,
      description,
      url: path,
      images: [image],
    },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image] },
  };
}

/** A guide page's metadata, from the same title and summary the search shows. */
export function guideMetadata(path: string): Metadata {
  const entry = GUIDE_ENTRIES.find((candidate) => candidate.href === path);
  if (!entry) throw new Error(`No guide entry for ${path}`);
  return pageMetadata(entry.title, entry.summary, path);
}
