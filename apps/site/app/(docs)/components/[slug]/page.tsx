import type { Metadata } from 'next';
import { COMPONENT_PAGES, COMPONENT_PAGE_MAP } from '../../../../content/components/registry';
import { ComponentTabContent } from '../../../../lib/component-page';
import { pageMetadata } from '../../../../lib/site-metadata';

interface PageParams {
  params: Promise<{ slug: string }>;
}

/** Statically generates one page per registered component (required by `output: 'export'`). */
export function generateStaticParams() {
  return COMPONENT_PAGES.map((page) => ({ slug: page.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug } = await params;
  const page = COMPONENT_PAGE_MAP[slug];
  if (!page) return { title: 'Components' };
  return pageMetadata(page.title, page.summary, `/components/${slug}`);
}

/** A component page's Overview tab: the playground and the live examples. */
export default async function ComponentOverviewPage({ params }: PageParams) {
  const { slug } = await params;
  return <ComponentTabContent slug={slug} tab="overview" />;
}
