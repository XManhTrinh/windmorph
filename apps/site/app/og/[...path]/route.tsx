import { ogImage } from '../../../lib/og-image';
import { ogImagePath } from '../../../lib/site-metadata';
import { sitePages } from '../../../lib/site-pages';

export const dynamic = 'force-static';
export const dynamicParams = false;

/** The image's path segments under `/og/`: `/og/components/button.png` → `components`, `button.png`. */
function segments(path: string): string[] {
  return ogImagePath(path).slice('/og/'.length).split('/');
}

/** One link-preview image per page of the site, written to `out/og/` at build time. */
export async function generateStaticParams() {
  return (await sitePages()).map((page) => ({ path: segments(page.path) }));
}

export async function GET(_request: Request, { params }: RouteContext<'/og/[...path]'>) {
  const { path } = await params;
  const key = path.join('/');
  const page = (await sitePages()).find((candidate) => segments(candidate.path).join('/') === key);
  if (!page) return new Response('Not found', { status: 404 });
  return ogImage(page);
}
