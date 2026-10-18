import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ComponentTabs } from '../../../../components/component-tabs';
import { ImportLine } from '../../../../components/import-line';
import { PageChips } from '../../../../components/page-chips';
import { COMPONENT_PAGE_MAP } from '../../../../content/components/registry';
import { componentTabs } from '../../../../lib/component-page';
import { importEntry, importNames } from '../../../../lib/import-line';

/**
 * A component page's frame, shared by its tabs: the title, chips and summary, the import
 * line (with a note on Pro pages), then the tabs, whose selected panel holds the tab route. Being a layout, it stays mounted as the
 * tabs change, so the indicator slides from one tab to the next.
 */
export default async function ComponentLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = COMPONENT_PAGE_MAP[slug];
  if (!page) notFound();
  const tabs = await componentTabs(page);

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-headline-large text-on-surface">{page.title}</h1>
          <PageChips expressive={page.expressive} pro={page.pro} />
          {page.stability === 'preview' && (
            <span className="rounded-corner-full bg-tertiary-container px-3 py-1 text-label-medium text-on-tertiary-container">
              Preview
            </span>
          )}
        </div>
        <p className="text-body-large text-on-surface-variant">{page.summary}</p>
        <ImportLine names={importNames(page)} entry={importEntry(page)} />
        {page.pro && (
          <p className="text-body-medium text-on-surface-variant">
            Part of Windmorph Pro, the paid components built on the free core. See{' '}
            <a
              href="/pro"
              className="rounded-sm text-primary underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
            >
              the Pro guide
            </a>{' '}
            for what it includes and how to install it.
          </p>
        )}
      </header>
      <ComponentTabs slug={slug} title={page.title} tabs={tabs}>
        {children}
      </ComponentTabs>
    </article>
  );
}
