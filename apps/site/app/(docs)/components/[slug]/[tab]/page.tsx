import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SUB_TABS, TAB_LABELS, componentTabHref } from '../../../../../content/components/doc';
import { COMPONENT_PAGES, COMPONENT_PAGE_MAP } from '../../../../../content/components/registry';
import { ComponentTabContent, componentTabs } from '../../../../../lib/component-page';
import { pageMetadata } from '../../../../../lib/site-metadata';

type SubTab = (typeof SUB_TABS)[number];

interface PageParams {
  params: Promise<{ slug: string; tab: string }>;
}

function isSubTab(tab: string): tab is SubTab {
  return (SUB_TABS as readonly string[]).includes(tab);
}

/** One page per component tab that has content: `/components/<slug>/<api|accessibility|guidelines>`. */
export async function generateStaticParams() {
  const params = await Promise.all(
    COMPONENT_PAGES.map(async (page) =>
      (await componentTabs(page)).filter(isSubTab).map((tab) => ({ slug: page.slug, tab })),
    ),
  );
  return params.flat();
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { slug, tab } = await params;
  const page = COMPONENT_PAGE_MAP[slug];
  if (!page || !isSubTab(tab)) return { title: 'Components' };
  return pageMetadata(
    `${page.title}: ${TAB_LABELS[tab]}`,
    page.summary,
    componentTabHref(slug, tab),
  );
}

/** A component page's API, Accessibility or Guidelines tab. */
export default async function ComponentTabPage({ params }: PageParams) {
  const { slug, tab } = await params;
  if (!isSubTab(tab)) notFound();
  return <ComponentTabContent slug={slug} tab={tab} />;
}
